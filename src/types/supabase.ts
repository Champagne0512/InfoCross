type ProfileRow = {
  id: string
  email: string
  username: string
  college: string
  major: string
  tags: string[]
  avatar_url: string | null
}

type ArticleRow = {
  id: number
  created_at: string
  author_id: string
  title: string
  content: string
  summary: string | null
  poster_url: string | null
  category: string
  event_time: string | null
  location: string | null
  tags: string[] | null
  college: string | null
  embedding: number[] | null
}

type InteractionRow = {
  id: number
  user_id: string
  article_id: number
  type: 'like' | 'bookmark' | 'join'
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Partial<ProfileRow> & { id: string }
        Update: Partial<ProfileRow>
      }
      articles: {
        Row: ArticleRow
        Insert: Partial<ArticleRow>
        Update: Partial<ArticleRow>
      }
      interactions: {
        Row: InteractionRow
        Insert: Partial<InteractionRow>
        Update: Partial<InteractionRow>
      }
    }
    Views: Record<string, never>
    Functions: {
      recommend_articles: {
        Args: { user_id: string; limit?: number }
        Returns: ArticleRow[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
