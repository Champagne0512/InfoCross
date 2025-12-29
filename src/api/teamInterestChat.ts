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

// 临时聊天会话信息
export interface InterestChatConversation {
  partnerId: string
  partnerName: string
  partnerAvatar?: string
  teamId: number
  teamName: string
  lastMessage: string
  lastMessageAt: string
  isOwner: boolean // 当前用户是否是队长
}

// 获取当前用户的所有临时聊天会话（作为队长或申请者）
export async function fetchInterestChatConversations(): Promise<InterestChatConversation[]> {
  const userId = await requireUserId()

  // 获取用户拥有的小组
  const { data: ownedTeams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('owner_id', userId)

  const ownedTeamIds = (ownedTeams ?? []).map((t) => t.id)
  const teamNameMap = new Map((ownedTeams ?? []).map((t) => [t.id, t.name]))

  // 构建查询条件
  let query = supabase
    .from('team_interest_messages')
    .select('*, sender:profiles!team_interest_messages_sender_id_fkey(id,username,avatar_url), team:teams!team_interest_messages_team_id_fkey(id,name,owner_id)')
    .order('created_at', { ascending: false })

  // 根据是否有拥有的小组来构建不同的查询
  if (ownedTeamIds.length > 0) {
    query = query.or(`sender_id.eq.${userId},team_id.in.(${ownedTeamIds.join(',')})`)
  } else {
    query = query.eq('sender_id', userId)
  }

  const { data: messages, error } = await query

  if (error) throw error
  if (!messages || messages.length === 0) return []

  // 按会话分组（队长视角：按申请者分组；申请者视角：按小组分组）
  const conversationMap = new Map<string, InterestChatConversation>()

  for (const msg of messages as any[]) {
    const isOwner = ownedTeamIds.includes(msg.team_id)
    
    if (isOwner) {
      // 队长视角：与每个申请者的对话
      if (msg.sender_id === userId) continue // 跳过自己发的消息（用于确定最新消息）
      
      const key = `owner-${msg.team_id}-${msg.sender_id}`
      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          partnerId: msg.sender_id,
          partnerName: msg.sender?.username ?? '用户',
          partnerAvatar: msg.sender?.avatar_url ?? undefined,
          teamId: msg.team_id,
          teamName: msg.team?.name ?? teamNameMap.get(msg.team_id) ?? '小组',
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          isOwner: true,
        })
      }
    } else {
      // 申请者视角：与队长的对话
      const key = `applicant-${msg.team_id}`
      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          partnerId: msg.team?.owner_id ?? '',
          partnerName: msg.team?.name ?? '小组',
          partnerAvatar: undefined,
          teamId: msg.team_id,
          teamName: msg.team?.name ?? '小组',
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          isOwner: false,
        })
      }
    }
  }

  return Array.from(conversationMap.values()).sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  )
}

// 获取与特定用户在特定小组的临时聊天消息
export async function fetchInterestChatWithUser(
  teamId: number,
  partnerId: string,
  limit = 50,
): Promise<TeamChatMessage[]> {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('team_interest_messages')
    .select('*, sender:profiles!team_interest_messages_sender_id_fkey(id,username,avatar_url)')
    .eq('team_id', teamId)
    .or(`sender_id.eq.${userId},sender_id.eq.${partnerId}`)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data as unknown as TeamInterestMessageRow[] | null)?.map((row) => mapInterestMessage(row, userId)) ?? []
}
