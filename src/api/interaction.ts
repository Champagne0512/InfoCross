import type { Interaction } from '@/types/models'
import type { Database } from '@/types/supabase'
import { supabase } from './client'

type InteractionRow = Database['public']['Tables']['interactions']['Row']

function mapInteraction(row: InteractionRow): Interaction {
  return {
    id: row.id,
    articleId: row.article_id,
    type: row.type,
    createdAt: row.created_at,
  }
}

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('请先登录，再进行互动')
  return user.id
}

export async function recordInteraction(payload: {
  articleId: number
  type: Interaction['type']
}): Promise<Interaction> {
  try {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('interactions')
      .upsert(
        {
          user_id: userId,
          article_id: payload.articleId,
          type: payload.type,
        },
        { onConflict: 'user_id,article_id,type' },
      )
      .select('*')
      .single()
    if (error) throw error
    return mapInteraction(data as InteractionRow)
  } catch (error) {
    console.error('[recordInteraction] failed', error)
    throw error
  }
}

export async function fetchInteractions(): Promise<Interaction[]> {
  try {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    const rows = (data as InteractionRow[] | null) ?? []
    return rows.map(mapInteraction)
  } catch (error) {
    console.error('[fetchInteractions] supabase query failed', error)
    return []
  }
}
