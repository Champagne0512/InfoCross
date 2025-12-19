type ProfileRow = {
  id: string
  email: string
  username: string | null
  college: string | null
  major: string | null
  tags: string[] | null
  avatar_url: string | null
  bio: string | null
  created_at: string | null
}

type ArticleRow = {
  id: number
  created_at: string
  author_id: string | null
  title: string
  content: string | null
  summary: string | null
  poster_url: string | null
  category: string
  event_time: string | null
  location: string | null
  tags: string[] | null
  college: string | null
  embedding: number[] | null
  ai_score: number | null
}

type InteractionRow = {
  id: number
  user_id: string
  article_id: number
  type: 'like' | 'bookmark' | 'join'
  created_at: string
}

type TeamRow = {
  id: number
  created_at: string
  updated_at: string
  owner_id: string
  name: string
  description: string | null
  type: string
  college: string | null
  tags: string[] | null
  required_skills: string[] | null
  current_members: number | null
  max_members: number
  status: 'recruiting' | 'full' | 'completed'
  deadline: string | null
  is_vibe: boolean | null
}

type TeamMemberRow = {
  id: number
  team_id: number
  member_id: string
  role: string | null
  skills: string[] | null
  status: 'applied' | 'approved' | 'rejected'
  is_owner: boolean | null
  joined_at: string
}

type ForumThreadRow = {
  id: number
  created_at: string
  updated_at: string
  author_id: string
  is_anonymous: boolean | null
  type: 'signal' | 'depth'
  category: 'review' | 'guide' | 'discussion' | 'debate' | 'question' | null
  title: string | null
  content_text: string
  content_delta: Record<string, unknown> | null
  summary: string | null
  cover_url: string | null
  linked_entities: Record<string, unknown>[] | null
  ai_tags: string[] | null
  sentiment_score: number | null
  read_time_minutes: number | null
  embedding: number[] | null
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
  source_college: string | null
}

type ForumCommentRow = {
  id: number
  created_at: string
  thread_id: number
  author_id: string
  is_anonymous: boolean | null
  content: string
  parent_id: number | null
  like_count: number
}

type ForumInteractionRow = {
  id: number
  created_at: string
  user_id: string
  thread_id: number | null
  comment_id: number | null
  type: 'like' | 'bookmark' | 'share'
}

type ForumHotTopicRow = {
  id: number
  created_at: string
  title: string
  thread_ids: number[] | null
  heat_score: number | null
  expires_at: string | null
}

export type Database = {
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
      teams: {
        Row: TeamRow
        Insert: Partial<TeamRow>
        Update: Partial<TeamRow>
      }
      team_members: {
        Row: TeamMemberRow
        Insert: Partial<TeamMemberRow>
        Update: Partial<TeamMemberRow>
      }
      forum_threads: {
        Row: ForumThreadRow
        Insert: Partial<ForumThreadRow>
        Update: Partial<ForumThreadRow>
      }
      forum_comments: {
        Row: ForumCommentRow
        Insert: Partial<ForumCommentRow>
        Update: Partial<ForumCommentRow>
      }
      forum_interactions: {
        Row: ForumInteractionRow
        Insert: Partial<ForumInteractionRow>
        Update: Partial<ForumInteractionRow>
      }
      forum_hot_topics: {
        Row: ForumHotTopicRow
        Insert: Partial<ForumHotTopicRow>
        Update: Partial<ForumHotTopicRow>
      }
    }
    Views: Record<string, never>
    Functions: {
      recommend_articles: {
        Args: { user_id: string | null; limit_count?: number }
        Returns: ArticleRow[]
      }
      increment_view_count: {
        Args: { thread_id: number }
        Returns: void
      }
      toggle_thread_like: {
        Args: { p_thread_id: number; p_user_id: string }
        Returns: { liked: boolean; likeCount: number }
      }
      toggle_comment_like: {
        Args: { p_comment_id: number; p_user_id: string }
        Returns: { liked: boolean; likeCount: number }
      }
      toggle_thread_bookmark: {
        Args: { p_thread_id: number; p_user_id: string }
        Returns: { bookmarked: boolean }
      }
      increment_share_count: {
        Args: { p_thread_id: number; p_user_id: string }
        Returns: number
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
