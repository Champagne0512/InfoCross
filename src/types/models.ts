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
  bio?: string
}

export type NotificationCategory = 'forum' | 'team' | 'task' | 'system'

export interface NotificationItem {
  id: string
  category: NotificationCategory
  title: string
  description: string
  createdAt: string
  read: boolean
  source?: {
    type: 'thread' | 'comment' | 'team' | 'task' | 'system'
    id?: number | string
    label?: string
  }
  action?: {
    label: string
    route: string
  }
}

export type InboxCategory = 'chats' | 'applications' | 'activity' | 'system'

export interface InboxPreview {
  id: string
  category: InboxCategory
  title: string
  preview: string
  timestamp: string
  unread: boolean
  avatarUrl?: string
  icon?: 'heart' | 'file' | 'bell'
}

export interface InboxChatMessage {
  id: string
  author: string
  content: string
  timestamp: string
  isMine: boolean
}

export interface InboxChatThread {
  id: string
  name: string
  onlineCount: number
  messages: InboxChatMessage[]
}

export interface InboxApplicationDetail {
  id: string
  projectName: string
  role: string
  applicant: {
    name: string
    college: string
    avatarUrl?: string
    skills: string[]
  }
  matchScore: number
  message: string
}

export interface InboxActivityDetail {
  id: string
  title: string
  origin: {
    title: string
    excerpt: string
  }
  participants: string[]
  comment?: string
}

export interface InboxSystemDetail {
  id: string
  title: string
  body: string
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

export type TeamType =
  | 'project'
  | 'competition'
  | 'research'
  | 'study'
  | 'meal'
  | 'sports'
  | 'carpool'
  | 'gaming'

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
  isVibe?: boolean
  ownerId?: string
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
