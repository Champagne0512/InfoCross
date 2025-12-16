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
