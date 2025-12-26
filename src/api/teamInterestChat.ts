import type { TeamChatMessage } from '@/types/models'
import type { Database } from '@/types/supabase'
import { supabase } from './client'

type TeamInterestMessageRow = Database['public']['Tables']['team_interest_messages']['Row'] & {
  sender?: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'username' | 'avatar_url'> | null
}

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('请先登录')
  return user.id
}

function mapInterestMessage(row: TeamInterestMessageRow, ownerId?: string): TeamChatMessage {
  return {
    id: row.id,
    teamId: row.team_id,
    senderId: row.sender_id,
    senderName: row.sender?.username ?? '访客',
    senderAvatar: row.sender?.avatar_url ?? undefined,
    content: row.content,
    createdAt: row.created_at,
    isOwner: ownerId ? row.sender_id === ownerId : undefined,
  }
}

export async function fetchTeamInterestMessages(
  teamId: number,
  limit = 30,
  ownerId?: string,
): Promise<TeamChatMessage[]> {
  const { data, error } = await supabase
    .from('team_interest_messages')
    .select('*,sender:profiles!team_interest_messages_sender_id_fkey(id,username,avatar_url)')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true })
    .limit(limit)
  if (error) throw error
  const rows = (data as unknown as TeamInterestMessageRow[] | null) ?? []
  return rows.map((row) => mapInterestMessage(row, ownerId))
}

export async function sendTeamInterestMessage(
  teamId: number,
  content: string,
  ownerId?: string,
): Promise<TeamChatMessage> {
  const trimmed = content.trim()
  if (!trimmed) {
    throw new Error('消息不能为空')
  }
  const senderId = await requireUserId()
  const payload: Database['public']['Tables']['team_interest_messages']['Insert'] = {
    team_id: teamId,
    sender_id: senderId,
    content: trimmed,
    status: 'delivered',
  }
  const { data, error } = await supabase
    .from('team_interest_messages')
    .insert(payload)
    .select('*,sender:profiles!team_interest_messages_sender_id_fkey(id,username,avatar_url)')
    .single()
  if (error) throw error
  return mapInterestMessage(data as unknown as TeamInterestMessageRow, ownerId)
}
