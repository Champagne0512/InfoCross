import type {
  ForumThread,
  ForumThreadType,
  DepthCategory,
  ForumComment,
  ForumHotTopic,
} from '@/types/models'

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

// API 函数

export async function fetchForumThreads(params?: {
  type?: ForumThreadType
  category?: DepthCategory
  limit?: number
}): Promise<ForumThread[]> {
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

export async function fetchThreadById(id: number): Promise<ForumThread | null> {
  const allThreads = [...mockSignalThreads, ...mockDepthThreads]
  return allThreads.find((t) => t.id === id) ?? null
}

export async function fetchHotTopics(): Promise<ForumHotTopic[]> {
  return mockHotTopics
}

export async function createThread(
  input: Partial<ForumThread>,
): Promise<ForumThread> {
  const newThread: ForumThread = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: input.authorId || 'current-user',
    authorName: input.isAnonymous ? '匿名用户' : '当前用户',
    isAnonymous: input.isAnonymous || false,
    type: input.type || 'signal',
    category: input.category,
    title: input.title,
    contentText: input.contentText || '',
    aiTags: [],
    sentimentScore: 0.5,
    readTimeMinutes: Math.ceil((input.contentText?.length || 0) / 500),
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    sourceCollege: input.sourceCollege,
  }

  if (input.type === 'signal') {
    mockSignalThreads.unshift(newThread)
  } else {
    mockDepthThreads.unshift(newThread)
  }

  return newThread
}

export async function fetchComments(threadId: number): Promise<ForumComment[]> {
  // Mock 评论数据
  return [
    {
      id: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      threadId,
      authorId: 'commenter1',
      authorName: '热心网友',
      isAnonymous: false,
      content: '感谢分享，非常有帮助！',
      likeCount: 12,
    },
    {
      id: 2,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      threadId,
      authorId: 'commenter2',
      authorName: '某学院同学',
      isAnonymous: true,
      content: '请问具体是哪个窗口？',
      likeCount: 3,
    },
  ]
}

export async function likeThread(threadId: number): Promise<void> {
  const thread =
    mockSignalThreads.find((t) => t.id === threadId) ||
    mockDepthThreads.find((t) => t.id === threadId)
  if (thread) {
    thread.likeCount++
  }
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
