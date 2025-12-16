import type { Interaction } from '@/types/models'
import { hasSupabase } from './client'

let mockInteractions: Interaction[] = [
  {
    id: 1,
    articleId: 2,
    type: 'bookmark',
    createdAt: new Date('2025-12-12T14:00:00').toISOString(),
  },
]

export async function recordInteraction(payload: {
  articleId: number
  type: Interaction['type']
}): Promise<Interaction> {
  if (hasSupabase) {
    console.info('[Supabase] 可记录互动行为。当前保存到前端 mock。')
  }

  const next: Interaction = {
    id: mockInteractions.length + 1,
    articleId: payload.articleId,
    type: payload.type,
    createdAt: new Date().toISOString(),
  }

  mockInteractions = [next, ...mockInteractions]
  return next
}

export async function fetchInteractions(): Promise<Interaction[]> {
  if (hasSupabase) {
    console.info('[Supabase] 可在此处读取真实互动数据。')
  }

  return mockInteractions
}
