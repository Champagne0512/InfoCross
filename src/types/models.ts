export type ArticleCategory = 'lecture' | 'competition' | 'notice' | 'research'

export interface Article {
  id: number
  title: string
  summary: string
  content: string
  category: ArticleCategory
  posterUrl?: string
  eventTime?: string
  location?: string
  tags: string[]
  college: string
  createdAt: string
  aiScore: number
}

export interface UserProfile {
  id: string
  email: string
  username: string
  college: string
  major: string
  tags: string[]
  avatarUrl?: string
}

export interface Interaction {
  id: number
  articleId: number
  type: 'like' | 'bookmark' | 'join'
  createdAt: string
}

export interface AiInsight {
  headline: string
  description: string
  confidence: number
  tags: string[]
}

export type TeamType = 'project' | 'competition' | 'research' | 'study'

export interface TeamMember {
  id: string
  name: string
  avatar?: string
  skills?: string[]
  role?: string
}

export interface Team {
  id: number
  name: string
  description: string
  type: TeamType
  college: string
  currentMembers: number
  maxMembers: number
  requiredSkills?: string[]
  members: TeamMember[]
  tags?: string[]
  createdAt: string
  deadline?: string
  status: 'recruiting' | 'full' | 'completed'
}

export type ForumThreadType = 'signal' | 'depth'
export type DepthCategory = 'review' | 'guide' | 'discussion' | 'debate' | 'question'

export interface ForumThread {
  id: number
  createdAt: string
  updatedAt: string
  authorId: string
  authorName?: string
  authorAvatar?: string
  authorCollege?: string
  isAnonymous: boolean
  type: ForumThreadType
  category?: DepthCategory
  title?: string
  contentText: string
  contentDelta?: Record<string, unknown>
  summary?: string
  coverUrl?: string
  linkedEntities?: Array<{ type: 'event' | 'team'; id: number }>
  aiTags: string[]
  sentimentScore: number
  readTimeMinutes: number
  viewCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  sourceCollege?: string
}

export interface ForumComment {
  id: number
  createdAt: string
  threadId: number
  authorId: string
  authorName?: string
  authorAvatar?: string
  isAnonymous: boolean
  content: string
  parentId?: number
  likeCount: number
  replies?: ForumComment[]
}

export interface ForumHotTopic {
  id: number
  title: string
  threadIds: number[]
  heatScore: number
  threadCount: number
}
