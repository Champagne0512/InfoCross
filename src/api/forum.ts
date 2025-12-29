import type {
  ForumThread,
  ForumThreadType,
  DepthCategory,
  ForumComment,
  ForumHotTopic,
} from '@/types/models'
import type { Database } from '@/types/supabase'
import { supabase } from './client'

// Mock 数据 - Signal 模式 (短情报)
const mockSignalThreads: ForumThread[] = [
  {
    id: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    authorId: 'user1',
    authorName: '某计算机学院同学',
    authorCollege: '计算机学院',
    isAnonymous: true,
    type: 'signal',
    contentText: '听说二食堂换承包商了，新的麻辣烫窗口味道还不错，推荐尝试',
    aiTags: ['食堂', '美食'],
    sentimentScore: 0.8,
    readTimeMinutes: 1,
    viewCount: 234,
    likeCount: 45,
    commentCount: 12,
    shareCount: 3,
    bookmarkCount: 18,
    sourceCollege: '计算机学院',
  },
  {
    id: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    authorId: 'user2',
    authorName: '建筑学院学生',
    authorCollege: '建筑学院',
    isAnonymous: false,
    type: 'signal',
    contentText: '图书馆4楼空调坏了，温度太低，建议带件外套或者去其他楼层',
    aiTags: ['图书馆', '设施'],
    sentimentScore: 0.3,
    readTimeMinutes: 1,
    viewCount: 567,
    likeCount: 89,
    commentCount: 23,
    shareCount: 15,
    bookmarkCount: 42,
    sourceCollege: '建筑学院',
  },
  {
    id: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    authorId: 'user3',
    authorName: '某商学院同学',
    authorCollege: '商学院',
    isAnonymous: true,
    type: 'signal',
    contentText: '教务处刚发的保研细则解读：今年 GPA 权重从 60% 提升到 70%，科研加分上限降低',
    aiTags: ['保研', '政策', '教务'],
    sentimentScore: 0.6,
    readTimeMinutes: 1,
    viewCount: 1234,
    likeCount: 256,
    commentCount: 78,
    shareCount: 45,
    bookmarkCount: 67,
    sourceCollege: '商学院',
  },
  {
    id: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    authorId: 'user4',
    authorName: '艺术学院同学',
    authorCollege: '艺术学院',
    isAnonymous: false,
    type: 'signal',
    contentText: '美术馆新展开幕了，主题是"数字艺术与人工智能"，免费参观到月底',
    aiTags: ['展览', '艺术', 'AI'],
    sentimentScore: 0.9,
    readTimeMinutes: 1,
    viewCount: 345,
    likeCount: 67,
    commentCount: 8,
    shareCount: 12,
    bookmarkCount: 25,
    sourceCollege: '艺术学院',
  },
]

// Mock 数据 - Depth 模式 (长文章)
const mockDepthThreads: ForumThread[] = [
  {
    id: 101,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    authorId: 'user5',
    authorName: '跨考先驱',
    authorAvatar: '',
    authorCollege: '计算机学院',
    isAnonymous: false,
    type: 'depth',
    category: 'guide',
    title: '计算机跨考金融的可行性分析与备考指南',
    contentText:
      '作为一个从计算机成功跨考金融的过来人，我想分享一下我的经验。首先要明确的是，跨考并不是一件容易的事情，但也绝非不可能...',
    summary: '详细分析计算机专业跨考金融的优劣势，提供完整的备考时间线和资料推荐',
    coverUrl: '/covers/cross-exam.jpg',
    aiTags: ['跨考', '金融', '计算机', '考研'],
    sentimentScore: 0.85,
    readTimeMinutes: 12,
    viewCount: 2345,
    likeCount: 456,
    commentCount: 89,
    shareCount: 123,
    bookmarkCount: 210,
    sourceCollege: '计算机学院',
  },
  {
    id: 102,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    authorId: 'user6',
    authorName: '哲学系小透明',
    authorCollege: '文学院',
    isAnonymous: false,
    type: 'depth',
    category: 'review',
    title: '张教授《西方哲学史》课程万字避雷指南',
    contentText:
      '选课季又到了，作为一个上过张教授三门课的老学姐，我觉得有必要写一篇详细的课程测评...',
    summary: '从给分、作业量、课堂体验等多维度分析这门课程，帮助你做出选课决策',
    aiTags: ['选课', '哲学', '课程测评'],
    sentimentScore: 0.6,
    readTimeMinutes: 8,
    viewCount: 1567,
    likeCount: 234,
    commentCount: 56,
    shareCount: 78,
    bookmarkCount: 156,
    sourceCollege: '文学院',
  },
  {
    id: 103,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    authorId: 'user7',
    authorName: '交换生小王',
    authorCollege: '商学院',
    isAnonymous: false,
    type: 'depth',
    category: 'guide',
    title: '如何申请出国交换：从准备到落地的完整攻略',
    contentText:
      '去年我成功申请到了新加坡国立大学的交换项目，整个过程虽然繁琐但非常值得...',
    summary: '涵盖申请材料准备、面试技巧、签证办理、行前准备等全流程指南',
    coverUrl: '/covers/exchange.jpg',
    aiTags: ['交换', '留学', '申请攻略'],
    sentimentScore: 0.9,
    readTimeMinutes: 15,
    viewCount: 3456,
    likeCount: 567,
    commentCount: 123,
    shareCount: 234,
    bookmarkCount: 320,
    sourceCollege: '商学院',
  },
  {
    id: 104,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    authorId: 'user8',
    authorName: '辩论队队长',
    authorCollege: '法学院',
    isAnonymous: false,
    type: 'depth',
    category: 'debate',
    title: 'AI 是否应该被赋予法律人格？一场跨学科的思辨',
    contentText:
      '随着 ChatGPT 等大语言模型的出现，AI 的能力边界不断被突破，这引发了一个根本性的法律问题...',
    summary: '从法学、哲学、计算机科学三个角度探讨 AI 法律人格问题',
    aiTags: ['AI', '法律', '辩论', '伦理'],
    sentimentScore: 0.75,
    readTimeMinutes: 10,
    viewCount: 890,
    likeCount: 123,
    commentCount: 67,
    shareCount: 45,
    bookmarkCount: 94,
    sourceCollege: '法学院',
  },
]

// Mock 热门话题
const mockHotTopics: ForumHotTopic[] = [
  {
    id: 1,
    title: '食堂吐槽大会',
    threadIds: [1, 5, 8, 12],
    heatScore: 0.95,
    threadCount: 23,
  },
  {
    id: 2,
    title: '保研政策解读',
    threadIds: [3, 15, 22],
    heatScore: 0.88,
    threadCount: 15,
  },
]

type ThreadRow = Database['public']['Tables']['forum_threads']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'] | null
}

type CommentRow = Database['public']['Tables']['forum_comments']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'] | null
}

type HotTopicRow = Database['public']['Tables']['forum_hot_topics']['Row']

async function getUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user?.id ?? null
}

function mapThread(row: ThreadRow): ForumThread {
  const profile = row.profiles ?? null
  const anonymous = Boolean(row.is_anonymous)
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    authorId: row.author_id,
    authorName: anonymous ? '匿名用户' : profile?.username ?? 'InfoCross 用户',
    authorAvatar: anonymous ? undefined : profile?.avatar_url ?? undefined,
    authorCollege: anonymous ? undefined : profile?.college ?? undefined,
    isAnonymous: anonymous,
    type: row.type,
    category: row.category ?? undefined,
    title: row.title ?? undefined,
    contentText: row.content_text,
    contentDelta: (row.content_delta as ForumThread['contentDelta']) ?? undefined,
    summary: row.summary ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    linkedEntities: (row.linked_entities as ForumThread['linkedEntities']) ?? undefined,
    aiTags: row.ai_tags ?? [],
    sentimentScore: row.sentiment_score ?? 0.5,
    readTimeMinutes: row.read_time_minutes ?? 1,
    viewCount: row.view_count,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    shareCount: row.share_count,
    bookmarkCount: row.bookmark_count ?? 0,
    sourceCollege: row.source_college ?? undefined,
  }
}

function mapComment(row: CommentRow): ForumComment {
  const profile = row.profiles ?? null
  return {
    id: row.id,
    createdAt: row.created_at,
    threadId: row.thread_id,
    authorId: row.author_id,
    authorName: row.is_anonymous ? '匿名用户' : profile?.username ?? 'InfoCross 用户',
    authorAvatar: row.is_anonymous ? undefined : profile?.avatar_url ?? undefined,
    isAnonymous: Boolean(row.is_anonymous),
    content: row.content,
    parentId: row.parent_id ?? undefined,
    likeCount: row.like_count,
  }
}

function mapHotTopic(row: HotTopicRow): ForumHotTopic {
  return {
    id: row.id,
    title: row.title,
    threadIds: row.thread_ids ?? [],
    heatScore: row.heat_score ?? 0,
    threadCount: (row.thread_ids ?? []).length,
  }
}

async function fetchThreadRows(params?: {
  type?: ForumThreadType
  category?: DepthCategory
  limit?: number
}): Promise<ThreadRow[]> {
  let query = supabase
    .from('forum_threads')
    .select(
      '*,' +
        'profiles:profiles!forum_threads_author_id_fkey(id, username, avatar_url, college)',
    )
    .order('created_at', { ascending: false })

  if (params?.type) {
    query = query.eq('type', params.type)
  }

  if (params?.category && params.type === 'depth') {
    query = query.eq('category', params.category)
  }

  if (params?.limit) {
    query = query.limit(params.limit)
  }

  const { data, error } = await query
  if (error) throw error
  return (data as unknown as ThreadRow[] | null) ?? []
}

// API 函数

export async function fetchForumThreads(params?: {
  type?: ForumThreadType
  category?: DepthCategory
  limit?: number
}): Promise<ForumThread[]> {
  try {
    const rows = await fetchThreadRows(params)
    return rows.map(mapThread)
  } catch (error) {
    console.error('[fetchForumThreads] supabase query failed, fallback to mock', error)
    const type = params?.type || 'signal'
    const threads = type === 'signal' ? mockSignalThreads : mockDepthThreads
    let result = [...threads]

    if (params?.category && type === 'depth') {
      result = result.filter((t) => t.category === params.category)
    }

    if (params?.limit) {
      result = result.slice(0, params.limit)
    }

    return result
  }
}

export async function fetchThreadById(id: number): Promise<ForumThread | null> {
  try {
    const { data, error } = await supabase
      .from('forum_threads')
      .select(
        '*,' +
          'profiles:profiles!forum_threads_author_id_fkey(id, username, avatar_url, college)',
      )
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    if (data) return mapThread(data as unknown as ThreadRow)
    return null
  } catch (error) {
    console.error('[fetchThreadById] supabase query failed, fallback to mock', error)
    const allThreads = [...mockSignalThreads, ...mockDepthThreads]
    return allThreads.find((t) => t.id === id) ?? null
  }
}

export async function fetchHotTopics(): Promise<ForumHotTopic[]> {
  try {
    const { data, error } = await supabase
      .from('forum_hot_topics')
      .select('*')
      .order('heat_score', { ascending: false })
      .limit(10)
    if (error) throw error
    const rows = (data as unknown as HotTopicRow[] | null) ?? []
    return rows.map(mapHotTopic)
  } catch (error) {
    console.error('[fetchHotTopics] supabase query failed, fallback to mock', error)
    return mockHotTopics
  }
}

export async function createThread(
  input: Partial<ForumThread>,
): Promise<ForumThread> {
  const userId = await getUserId()
  if (!userId) throw new Error('请先登录再发帖')

  const payload: Database['public']['Tables']['forum_threads']['Insert'] = {
    author_id: userId,
    is_anonymous: input.isAnonymous ?? false,
    type: input.type ?? 'signal',
    category: input.category ?? null,
    title: input.title ?? null,
    content_text: input.contentText ?? '',
    summary: input.summary ?? null,
    cover_url: input.coverUrl ?? null,
    linked_entities: input.linkedEntities ?? null,
    ai_tags: input.aiTags ?? [],
    sentiment_score: input.sentimentScore ?? 0.5,
    read_time_minutes: input.readTimeMinutes ?? Math.ceil((input.contentText?.length || 0) / 500),
    source_college: input.sourceCollege ?? null,
  }

  const { data, error } = await supabase
    .from('forum_threads')
    .insert(payload)
    .select(
      '*,' +
        'profiles:profiles!forum_threads_author_id_fkey(id, username, avatar_url, college)',
    )
    .single()
  if (error) throw error
  return mapThread(data as unknown as ThreadRow)
}

export async function fetchComments(threadId: number): Promise<ForumComment[]> {
  try {
    const { data, error } = await supabase
      .from('forum_comments')
      .select(
        '*,' +
          'profiles:profiles!forum_comments_author_id_fkey(id, username, avatar_url)',
      )
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
    if (error) throw error
    const rows = (data as unknown as CommentRow[] | null) ?? []
    return rows.map(mapComment)
  } catch (error) {
    console.error('[fetchComments] supabase query failed, return empty list', error)
  }
  return []
}

export async function likeThread(threadId: number): Promise<{ liked: boolean; likeCount: number }> {
  const userId = await getUserId()
  if (!userId) throw new Error('请先登录')
  
  const { data, error } = await supabase.rpc('toggle_thread_like', {
    p_thread_id: threadId,
    p_user_id: userId,
  })
  
  if (error) throw error
  return data as { liked: boolean; likeCount: number }
}

export async function likeComment(commentId: number): Promise<{ liked: boolean; likeCount: number }> {
  const userId = await getUserId()
  if (!userId) throw new Error('请先登录')
  
  const { data, error } = await supabase.rpc('toggle_comment_like', {
    p_comment_id: commentId,
    p_user_id: userId,
  })
  
  if (error) throw error
  return data as { liked: boolean; likeCount: number }
}

export async function fetchRelatedResources(
  threadId: number,
): Promise<Array<{ type: string; title: string; id: number }>> {
  void threadId
  // AI 自动关联的相关资源
  return [
    { type: 'team', title: '互联网+比赛组队招募', id: 1 },
    { type: 'event', title: '创新创业讲座', id: 2 },
    { type: 'team', title: '大创项目招人', id: 3 },
  ]
}

export async function createComment(
  threadId: number,
  content: string,
  isAnonymous: boolean = false,
  parentId?: number,
): Promise<ForumComment> {
  const userId = await getUserId()
  if (!userId) throw new Error('请先登录再评论')

  const payload: Database['public']['Tables']['forum_comments']['Insert'] = {
    thread_id: threadId,
    author_id: userId,
    content,
    is_anonymous: isAnonymous,
    parent_id: parentId ?? null,
  }

  const { data, error } = await supabase
    .from('forum_comments')
    .insert(payload)
    .select(
      '*,' +
        'profiles:profiles!forum_comments_author_id_fkey(id, username, avatar_url)',
    )
    .single()
  if (error) throw error
  return mapComment(data as unknown as CommentRow)
}

export async function bookmarkThread(
  threadId: number,
): Promise<{ bookmarked: boolean; bookmarkCount: number }> {
  const userId = await getUserId()
  if (!userId) throw new Error('请先登录')
  
  const { data, error } = await supabase.rpc('toggle_thread_bookmark', {
    p_thread_id: threadId,
    p_user_id: userId,
  })
  
  if (error) throw error
  return data as { bookmarked: boolean; bookmarkCount: number }
}

export async function shareThread(threadId: number): Promise<number> {
  const userId = await getUserId()
  if (!userId) throw new Error('请先登录')
  
  const { data, error } = await supabase.rpc('increment_share_count', {
    p_thread_id: threadId,
    p_user_id: userId,
  })
  
  if (error) throw error
  return data as number
}

export async function checkUserInteractions(
  threadId: number,
): Promise<{ liked: boolean; bookmarked: boolean }> {
  const userId = await getUserId()
  if (!userId) return { liked: false, bookmarked: false }

  try {
    const { data, error } = await supabase
      .from('forum_interactions')
      .select('type')
      .eq('user_id', userId)
      .eq('thread_id', threadId)
    if (error) throw error

    const types = (data ?? []).map((d) => d.type)
    return {
      liked: types.includes('like'),
      bookmarked: types.includes('bookmark'),
    }
  } catch {
    return { liked: false, bookmarked: false }
  }
}

export async function incrementViewCount(threadId: number): Promise<void> {
  try {
    await supabase.rpc('increment_view_count', { thread_id: threadId })
  } catch (error) {
    console.error('[incrementViewCount] failed', error)
  }
}

export async function checkUserCommentLikes(commentIds: number[]): Promise<Set<number>> {
  const userId = await getUserId()
  if (!userId || commentIds.length === 0) return new Set()

  try {
    const { data, error } = await supabase
      .from('forum_interactions')
      .select('comment_id')
      .eq('user_id', userId)
      .eq('type', 'like')
      .in('comment_id', commentIds)
    if (error) throw error

    return new Set((data ?? []).map((d) => d.comment_id).filter((id): id is number => id !== null))
  } catch {
    return new Set()
  }
}

export async function updateThread(
  threadId: number,
  input: Partial<Pick<ForumThread, 'title' | 'contentText' | 'summary' | 'category' | 'aiTags' | 'coverUrl'>>,
): Promise<ForumThread> {
  const userId = await getUserId()
  if (!userId) throw new Error('请先登录')

  // 验证是否是作者
  const { data: existing, error: fetchError } = await supabase
    .from('forum_threads')
    .select('author_id')
    .eq('id', threadId)
    .single()
  
  if (fetchError) throw fetchError
  if (existing.author_id !== userId) throw new Error('只能编辑自己的帖子')

  const payload: Partial<Database['public']['Tables']['forum_threads']['Update']> = {
    updated_at: new Date().toISOString(),
  }

  if (input.title !== undefined) payload.title = input.title
  if (input.contentText !== undefined) {
    payload.content_text = input.contentText
    payload.read_time_minutes = Math.ceil(input.contentText.length / 500)
  }
  if (input.summary !== undefined) payload.summary = input.summary
  if (input.category !== undefined) payload.category = input.category
  if (input.aiTags !== undefined) payload.ai_tags = input.aiTags
  if (input.coverUrl !== undefined) payload.cover_url = input.coverUrl

  const { data, error } = await supabase
    .from('forum_threads')
    .update(payload)
    .eq('id', threadId)
    .select(
      '*,' +
        'profiles:profiles!forum_threads_author_id_fkey(id, username, avatar_url, college)',
    )
    .single()
  
  if (error) throw error
  return mapThread(data as unknown as ThreadRow)
}

export async function deleteThread(threadId: number): Promise<void> {
  const userId = await getUserId()
  if (!userId) throw new Error('请先登录')

  const { error } = await supabase
    .from('forum_threads')
    .delete()
    .eq('id', threadId)
    .eq('author_id', userId)
  
  if (error) throw error
}

export async function fetchUserThreads(userId?: string): Promise<ForumThread[]> {
  const currentUserId = userId ?? await getUserId()
  if (!currentUserId) throw new Error('请先登录')

  try {
    const { data, error } = await supabase
      .from('forum_threads')
      .select(
        '*,' +
          'profiles:profiles!forum_threads_author_id_fkey(id, username, avatar_url, college)',
      )
      .eq('author_id', currentUserId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return (data as unknown as ThreadRow[] | null)?.map(mapThread) ?? []
  } catch (error) {
    console.error('[fetchUserThreads] supabase query failed', error)
    return []
  }
}
