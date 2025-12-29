import { supabase } from './client'

export interface DirectMessage {
  id: number
  senderId: string
  senderName?: string
  senderAvatar?: string
  receiverId: string
  receiverName?: string
  teamId?: number
  teamName?: string
  content: string
  isRead: boolean
  createdAt: string
  isMine: boolean
}

export interface DMConversation {
  partnerId: string
  partnerName: string
  partnerAvatar?: string
  teamId?: number
  teamName?: string
  lastMessage: string
  lastMessageAt: string
  hasUnread: boolean
}

async function requireUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('请先登录')
  return user.id
}

// 获取私聊会话列表
export async function fetchDMConversations(): Promise<DMConversation[]> {
  const userId = await requireUserId()
  
  // 获取所有相关消息
  const { data, error } = await supabase
    .from('direct_messages')
    .select(`
      id, sender_id, receiver_id, team_id, content, is_read, created_at
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  // 按对话伙伴分组
  const conversationMap = new Map<string, {
    partnerId: string
    teamId?: number
    lastMessage: string
    lastMessageAt: string
    hasUnread: boolean
  }>()
  
  for (const msg of data ?? []) {
    const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
    
    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        partnerId,
        teamId: msg.team_id ?? undefined,
        lastMessage: msg.content,
        lastMessageAt: msg.created_at,
        hasUnread: msg.receiver_id === userId && !msg.is_read,
      })
    } else {
      // 更新未读状态
      const conv = conversationMap.get(partnerId)!
      if (msg.receiver_id === userId && !msg.is_read) {
        conv.hasUnread = true
      }
    }
  }
  
  // 获取对话伙伴的用户信息
  const partnerIds = Array.from(conversationMap.keys())
  if (partnerIds.length === 0) return []
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', partnerIds)
  
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))
  
  // 获取小组名称
  const teamIds = Array.from(conversationMap.values())
    .map(c => c.teamId)
    .filter((id): id is number => id !== undefined)
  
  let teamMap = new Map<number, string>()
  if (teamIds.length > 0) {
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name')
      .in('id', teamIds)
    teamMap = new Map((teams ?? []).map(t => [t.id, t.name]))
  }
  
  return Array.from(conversationMap.values()).map(conv => {
    const profile = profileMap.get(conv.partnerId)
    return {
      partnerId: conv.partnerId,
      partnerName: profile?.username ?? '用户',
      partnerAvatar: profile?.avatar_url ?? undefined,
      teamId: conv.teamId,
      teamName: conv.teamId ? teamMap.get(conv.teamId) : undefined,
      lastMessage: conv.lastMessage,
      lastMessageAt: conv.lastMessageAt,
      hasUnread: conv.hasUnread,
    }
  }).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
}

// 获取与某人的私聊消息
export async function fetchDMMessages(partnerId: string, limit = 50): Promise<DirectMessage[]> {
  const userId = await requireUserId()
  
  const { data, error } = await supabase
    .from('direct_messages')
    .select(`
      id, sender_id, receiver_id, team_id, content, is_read, created_at
    `)
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })
    .limit(limit)
  
  if (error) throw error
  
  // 获取用户信息
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', [userId, partnerId])
  
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))
  
  return (data ?? []).map(msg => ({
    id: msg.id,
    senderId: msg.sender_id,
    senderName: profileMap.get(msg.sender_id)?.username ?? '用户',
    senderAvatar: profileMap.get(msg.sender_id)?.avatar_url ?? undefined,
    receiverId: msg.receiver_id,
    receiverName: profileMap.get(msg.receiver_id)?.username ?? '用户',
    teamId: msg.team_id ?? undefined,
    content: msg.content,
    isRead: msg.is_read,
    createdAt: msg.created_at,
    isMine: msg.sender_id === userId,
  }))
}

// 发送私聊消息
export async function sendDMMessage(receiverId: string, content: string, teamId?: number): Promise<DirectMessage> {
  const userId = await requireUserId()
  
  const { data, error } = await supabase
    .from('direct_messages')
    .insert({
      sender_id: userId,
      receiver_id: receiverId,
      team_id: teamId ?? null,
      content,
    })
    .select()
    .single()
  
  if (error) throw error
  
  return {
    id: data.id,
    senderId: data.sender_id,
    receiverId: data.receiver_id,
    teamId: data.team_id ?? undefined,
    content: data.content,
    isRead: data.is_read,
    createdAt: data.created_at,
    isMine: true,
  }
}

// 标记消息为已读
export async function markDMAsRead(partnerId: string): Promise<void> {
  const userId = await requireUserId()
  
  const { error } = await supabase
    .from('direct_messages')
    .update({ is_read: true })
    .eq('sender_id', partnerId)
    .eq('receiver_id', userId)
    .eq('is_read', false)
  
  if (error) throw error
}

// 订阅私聊消息
export function subscribeDM(handler: (msg: DirectMessage) => void) {
  const channel = supabase
    .channel('dm-messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'direct_messages' },
      async (payload) => {
        const msg = payload.new as any
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        // 只处理发给当前用户的消息
        if (msg.receiver_id !== user.id) return
        
        handler({
          id: msg.id,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          teamId: msg.team_id ?? undefined,
          content: msg.content,
          isRead: msg.is_read,
          createdAt: msg.created_at,
          isMine: false,
        })
      }
    )
    .subscribe()
  
  return channel
}
