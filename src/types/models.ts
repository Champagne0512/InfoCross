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
