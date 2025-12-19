import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import type { Database } from '../../../src/types/supabase.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient<Database>(supabaseUrl, serviceKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, limit = 4, mode = 'focus' } = await req.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 获取用户信息和兴趣向量
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tags, college, major')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.warn('获取用户信息失败:', profileError)
    }

    // 生成用户兴趣向量
    const userVector = await generateUserVector(profile?.tags ?? [], profile?.college, profile?.major)

    // 尝试使用pgvector进行向量搜索
    let vectorResults = []
    try {
      vectorResults = await searchByVector(userVector, limit * 2, mode)
    } catch (vectorError) {
      console.warn('向量搜索失败，使用标签匹配:', vectorError)
    }

    // 如果向量搜索结果不足，补充标签匹配结果
    const tagResults = await searchByTags(profile?.tags ?? [], limit, mode, vectorResults.length)
    
    // 合并并去重
    const allResults = [...vectorResults, ...tagResults]
    const uniqueResults = removeDuplicates(allResults, 'id').slice(0, limit)

    // 计算推荐分数
    const enrichedResults = uniqueResults.map(article => ({
      ...article,
      score: calculateRecommendationScore(article, userVector, profile?.tags ?? []),
      reason: generateRecommendationReason(article, profile?.tags ?? [], profile?.college),
    }))

    // 按分数排序
    const sortedResults = enrichedResults.sort((a, b) => b.score - a.score)

    return new Response(
      JSON.stringify({
        userId,
        recommendations: sortedResults,
        userProfile: {
          tags: profile?.tags ?? [],
          college: profile?.college,
          major: profile?.major,
        },
        strategy: vectorResults.length > 0 ? 'vector' : 'tags',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'recommendation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function generateUserVector(tags: string[], college?: string, major?: string): Promise<number[]> {
  const text = [...tags, college || '', major || ''].filter(Boolean).join(' ')
  
  // 简单的文本向量化（实际项目中应该使用embedding模型）
  const targetLength = 1536
  const chars = text.replace(/\s/g, '').split('')
  const embedding: number[] = []
  
  for (let i = 0; i < targetLength; i++) {
    const charIndex = i % chars.length
    const charCode = chars[charIndex].charCodeAt(0)
    const normalized = (charCode / 65536) * 2 - 1
    embedding.push(normalized)
  }
  
  return embedding
}

async function searchByVector(userVector: number[], limit: number, mode: string): Promise<any[]> {
  // 使用pgvector进行相似度搜索
  const { data, error } = await supabase
    .rpc('vector_search_articles', {
      query_vector: userVector,
      match_count: limit,
      similarity_threshold: 0.3,
      mode_filter: mode,
    })

  if (error) {
    console.error('向量搜索RPC调用失败:', error)
    return []
  }

  return data || []
}

async function searchByTags(userTags: string[], limit: number, mode: string, excludeCount: number): Promise<any[]> {
  if (!userTags.length) return []

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .contains('tags', userTags)
    .eq('is_vibe', mode === 'vibe')
    .neq('embedding', null)
    .order('created_at', { ascending: false })
    .limit(limit + excludeCount)

  if (error) {
    console.error('标签搜索失败:', error)
    return []
  }

  return (data || []).slice(excludeCount)
}

function removeDuplicates(items: any[], key: string): any[] {
  const seen = new Set()
  return items.filter(item => {
    const value = item[key]
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

function calculateRecommendationScore(article: any, userVector: number[], userTags: string[]): number {
  let score = 0.5 // 基础分数

  // 标签匹配分数
  const tagMatches = article.tags?.filter((tag: string) => userTags.includes(tag)).length || 0
  score += tagMatches * 0.2

  // 向量相似度分数（如果有embedding）
  if (article.embedding && userVector.length === article.embedding.length) {
    const similarity = cosineSimilarity(userVector, article.embedding)
    score += similarity * 0.3
  }

  // 时间衰减（新内容权重更高）
  const daysSinceCreated = (Date.now() - new Date(article.created_at).getTime()) / (1000 * 60 * 60 * 24)
  const timeScore = Math.max(0, 1 - daysSinceCreated / 30) // 30天内线性衰减
  score += timeScore * 0.2

  return Math.min(1, score)
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)
  
  if (normA === 0 || normB === 0) return 0
  return dotProduct / (normA * normB)
}

function generateRecommendationReason(article: any, userTags: string[], userCollege?: string): string {
  const reasons = []

  // 标签匹配原因
  const matchedTags = article.tags?.filter((tag: string) => userTags.includes(tag)) || []
  if (matchedTags.length > 0) {
    reasons.push(`匹配你的兴趣标签：${matchedTags.join('、')}`)
  }

  // 学院匹配原因
  if (userCollege && article.college && article.college !== userCollege) {
    reasons.push(`跨学院推荐：${article.college}`)
  }

  // AI推荐原因
  if (article.ai_score && article.ai_score > 0.7) {
    reasons.push('AI高评分推荐')
  }

  return reasons.length > 0 ? reasons.join('；') : '基于你的兴趣推荐'
}
