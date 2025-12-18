import type { Article } from '@/types/models'
import type { Database } from '@/types/supabase'
import { supabase } from './client'

const mockArticles: Article[] = [
  {
    id: 1,
    title: 'AI+文学：科幻叙事工作坊',
    summary: '通义千问与中文系教授共创的叙事实验课，三小时完成跨学科的故事原型。',
    content:
      '课程邀请计算机学院与中文系的同学现场共创故事设定，AI 工具将实时生成场景与角色。现场提供破壁配对机制。',
    category: 'lecture',
    eventTime: new Date('2025-12-20T14:00:00').toISOString(),
    location: '图书馆 B1 创意教室',
    tags: ['AI写作', '人文', '跨学科'],
    college: '中文与传媒学院',
    createdAt: new Date('2025-12-10T10:00:00').toISOString(),
    posterUrl: '/posters/prism-ai.png',
    aiScore: 0.93,
  },
  {
    id: 2,
    title: 'HNSW 索引黑客松',
    summary: 'Supabase pgvector + HNSW 索引搭建实战，36 小时完成落地 Demo。',
    content:
      '信息学院联合创业社。第一天完成架构设计，第二天打磨推荐模型，并展示 InfoCross 之类的用例。',
    category: 'competition',
    eventTime: new Date('2026-01-05T09:00:00').toISOString(),
    location: '创新工场 F3',
    tags: ['pgvector', 'Hackathon', '推荐系统'],
    college: '信息科学学院',
    createdAt: new Date('2025-12-12T09:00:00').toISOString(),
    posterUrl: '/posters/hnsw.png',
    aiScore: 0.88,
  },
  {
    id: 3,
    title: '可持续建筑与数据可视化联合工作营',
    summary: '建筑学院与数据科学学院合作，用数据驱动校园低碳方案。',
    content:
      '围绕校园水电使用、空间效率建立数据模型，使用 Vue + Supabase 构建监控面板。',
    category: 'research',
    eventTime: new Date('2025-12-28T13:30:00').toISOString(),
    location: '建筑馆 201',
    tags: ['低碳', '数据可视化', 'Vue'],
    college: '建筑学院',
    createdAt: new Date('2025-12-09T08:00:00').toISOString(),
    aiScore: 0.86,
  },
  {
    id: 4,
    title: 'InfoCross 平台体验官招募',
    summary: '需要 20 名体验官测试“破壁探索模式”，反馈 AI 推荐表现。',
    content:
      '体验任务包括：录入活动信息、体验 AI 摘要、评价跨领域推荐准确率。完成后颁发联合证书。',
    category: 'notice',
    eventTime: new Date('2025-12-18T16:00:00').toISOString(),
    location: '线上 + 线下混合',
    tags: ['产品运营', '体验官', 'AI推荐'],
    college: 'InfoCross 团队',
    createdAt: new Date('2025-12-11T13:00:00').toISOString(),
    aiScore: 0.9,
  },
]

let mockSequence = mockArticles.length + 1

type ArticleRow = Database['public']['Tables']['articles']['Row']

function mapArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? '',
    content: row.content ?? '',
    category: row.category as Article['category'],
    posterUrl: row.poster_url ?? undefined,
    eventTime: row.event_time ?? undefined,
    location: row.location ?? undefined,
    tags: row.tags ?? [],
    college: row.college ?? '未标注学院',
    createdAt: row.created_at,
    aiScore: Number(row.ai_score ?? 0),
  }
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user?.id ?? null
}

interface AnalyzeArticleResponse {
  summary?: string
  tags?: string[]
  embedding?: number[]
}

async function analyzeArticle(input: {
  title: string
  content?: string
  tags?: string[]
}): Promise<AnalyzeArticleResponse | null> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-article', {
      body: input,
    })
    if (error) throw error
    return data as AnalyzeArticleResponse
  } catch (err) {
    console.warn('[analyze-article] failed, fallback to raw form', err)
    return null
  }
}

export async function fetchArticles(params?: {
  category?: string
  limit?: number
}): Promise<Article[]> {
  try {
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category)
    }

    if (params?.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query
    if (error) throw error
    const rows = (data as ArticleRow[] | null) ?? []
    return rows.map(mapArticle)
  } catch (error) {
    console.error('[fetchArticles] fallback to mock', error)
  }

  let articles = [...mockArticles]

  if (params?.category) {
    articles = articles.filter((article) => article.category === params.category)
  }

  if (params?.limit) {
    articles = articles.slice(0, params.limit)
  }

  return articles
}

export async function fetchArticleById(id: number): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? mapArticle(data as ArticleRow) : null
  } catch (error) {
    console.error('[fetchArticleById] fallback to mock', error)
    return mockArticles.find((article) => article.id === id) ?? null
  }
}

export async function createArticle(input: Partial<Article>): Promise<Article> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('请先登录再发布内容')
    }

    const tags = input.tags?.length ? input.tags : []
    const analysis = await analyzeArticle({
      title: input.title ?? '未命名活动',
      content: input.content,
      tags,
    })

    const payload: Database['public']['Tables']['articles']['Insert'] = {
      author_id: userId,
      title: input.title ?? '未命名活动',
      content: input.content ?? '',
      summary: input.summary ?? analysis?.summary ?? null,
      category: input.category ?? 'lecture',
      event_time: input.eventTime ? new Date(input.eventTime).toISOString() : null,
      location: input.location ?? null,
      tags: (tags.length ? tags : analysis?.tags) ?? [],
      college: input.college ?? 'InfoCross 团队',
      poster_url: input.posterUrl ?? null,
      ai_score: input.aiScore ?? 0.75,
      embedding: analysis?.embedding ?? null,
    }

    const { data, error } = await supabase
      .from('articles')
      .insert(payload)
      .select('*')
      .single()
    if (error) throw error
    return mapArticle(data as ArticleRow)
  } catch (error) {
    console.error('[createArticle] supabase insert failed, fallback to mock', error)
    const newArticle: Article = {
      id: mockSequence++,
      title: input.title ?? '未命名活动',
      summary: input.summary ?? 'AI 正在生成摘要...',
      content: input.content ?? '',
      category: (input.category ?? 'lecture') as Article['category'],
      posterUrl: input.posterUrl,
      eventTime: input.eventTime,
      location: input.location,
      tags: input.tags ?? [],
      college: input.college ?? 'InfoCross 团队',
      createdAt: new Date().toISOString(),
      aiScore: 0.75,
    }
    mockArticles.unshift(newArticle)
    return newArticle
  }
}

export async function fetchRecommendedArticles(
  userTags: string[] = [],
  limit = 4,
): Promise<Article[]> {
  try {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase.rpc('recommend_articles', {
      user_id: userId,
      limit_count: limit,
    })
    if (error) throw error
    const rows = (data as ArticleRow[] | null) ?? []
    if (rows.length) {
      return rows.map(mapArticle)
    }
  } catch (error) {
    console.error('[fetchRecommendedArticles] rpc failed, fallback to local ranking', error)
  }

  const articles = await fetchArticles({ limit: limit * 2 })
  const ranked = [...articles].sort((a, b) => b.aiScore - a.aiScore)
  if (!userTags.length) return ranked.slice(0, limit)

  const tagMatched = ranked.filter((article) =>
    article.tags.some((tag) => userTags.includes(tag)),
  )
  return (tagMatched.length ? tagMatched : ranked).slice(0, limit)
}
