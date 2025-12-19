import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface AnalyzePayload {
  title: string
  content?: string
  tags?: string[]
}

const QWEN_API_KEY = Deno.env.get('QWEN_API_KEY') ?? ''
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? ''

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  try {
    const payload = (await req.json()) as AnalyzePayload

    if (!payload.title) {
      return new Response(JSON.stringify({ error: 'title is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const fullText = `${payload.title}\n${payload.content ?? ''}`

    // 尝试调用AI API生成摘要和标签
    let aiSummary: string | null = null
    let aiTags: string[] = []
    let embedding: number[] = []

    try {
      if (QWEN_API_KEY) {
        const result = await callQwenAPI(fullText)
        aiSummary = result.summary
        aiTags = result.tags
        embedding = result.embedding
      } else if (OPENAI_API_KEY) {
        const result = await callOpenAIAPI(fullText)
        aiSummary = result.summary
        aiTags = result.tags
        embedding = result.embedding
      }
    } catch (aiError) {
      console.warn('AI API调用失败，使用回退方案:', aiError)
    }

    // 回退方案：本地处理
    const summary = aiSummary || generateLocalSummary(fullText)
    const tags = aiTags.length ? aiTags : extractSmartKeywords(fullText)
    const finalEmbedding = embedding.length ? embedding : generateSimpleEmbedding(summary)

    const body = {
      summary,
      tags,
      embedding: finalEmbedding,
    }

    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'failed to analyze article' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function callQwenAPI(text: string) {
  const prompt = `请分析以下校园活动信息，生成50字以内的摘要和3-5个相关标签：

${text}

请以JSON格式返回：
{
  "summary": "50字摘要",
  "tags": ["标签1", "标签2", "标签3"],
  "embedding": [1536维向量数组，基于文本语义]
}`

  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${QWEN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen-turbo',
      input: { messages: [{ role: 'user', content: prompt }] },
      parameters: {
        result_format: 'message',
        temperature: 0.3,
      }
    }),
  })

  if (!response.ok) throw new Error('Qwen API调用失败')
  
  const data = await response.json()
  const content = data.output?.choices?.[0]?.message?.content
  
  if (!content) throw new Error('Qwen返回内容为空')
  
  try {
    return JSON.parse(content)
  } catch {
    // 如果解析失败，返回基础处理结果
    return {
      summary: generateLocalSummary(text),
      tags: extractSmartKeywords(text),
      embedding: generateSimpleEmbedding(text),
    }
  }
}

async function callOpenAIAPI(text: string) {
  const prompt = `分析以下校园活动信息，生成50字摘要和3-5个标签：

${text}

返回JSON格式：
{
  "summary": "50字摘要",
  "tags": ["标签1", "标签2", "标签3"],
  "embedding": [1536维向量]
}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  })

  if (!response.ok) throw new Error('OpenAI API调用失败')
  
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  
  if (!content) throw new Error('OpenAI返回内容为空')
  
  try {
    return JSON.parse(content)
  } catch {
    return {
      summary: generateLocalSummary(text),
      tags: extractSmartKeywords(text),
      embedding: generateSimpleEmbedding(text),
    }
  }
}

function generateLocalSummary(text: string): string {
  const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0)
  const firstSentence = sentences[0]?.trim() || text.slice(0, 50)
  return firstSentence.length > 50 ? firstSentence.slice(0, 50) + '...' : firstSentence
}

function extractSmartKeywords(text: string): string[] {
  // 校园相关关键词库
  const campusKeywords = [
    '讲座', '比赛', '竞赛', '活动', '会议', '研讨会', '工作坊',
    'AI', '人工智能', '机器学习', '数据科学', '计算机', '编程',
    '设计', '艺术', '音乐', '文学', '历史', '哲学',
    '创业', '创新', '投资', '金融', '经济', '管理',
    '体育', '运动', '篮球', '足球', '羽毛球', '游泳',
    '社团', '学生会', '志愿者', '实习', '招聘', '就业',
    '图书馆', '实验室', '教学楼', '食堂', '宿舍'
  ]

  const words = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ').split(/\s+/)
  
  // 找出匹配的关键词
  const matchedKeywords = words.filter(word => 
    campusKeywords.some(keyword => 
      word.includes(keyword) || keyword.includes(word)
    )
  ).slice(0, 3)

  // 如果没有匹配到，使用通用关键词提取
  if (matchedKeywords.length === 0) {
    return words
      .filter(word => word.length > 1 && word.length < 10)
      .slice(0, 4)
  }

  return Array.from(new Set(matchedKeywords))
}

function generateSimpleEmbedding(text: string): number[] {
  // 生成1536维的简单向量（基于字符编码）
  const targetLength = 1536
  const chars = text.replace(/\s/g, '').split('')
  const embedding: number[] = []
  
  for (let i = 0; i < targetLength; i++) {
    const charIndex = i % chars.length
    const charCode = chars[charIndex].charCodeAt(0)
    const normalized = (charCode / 65536) * 2 - 1 // 归一化到[-1, 1]
    embedding.push(normalized)
  }
  
  return embedding
}
