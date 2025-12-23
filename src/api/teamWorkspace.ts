import type {
  TeamApplication,
  TeamApplicationStatus,
  TeamChatMessage,
  TeamTask,
  TeamTaskStatus,
  TeamTaskAssignee,
  TeamTaskAssigneeStatus,
  TeamFile,
} from '@/types/models'
import type { Database } from '@/types/supabase'
import { supabase } from './client'

type TeamApplicationRow = Database['public']['Tables']['team_applications']['Row'] & {
  team?: Pick<Database['public']['Tables']['teams']['Row'], 'id' | 'name' | 'is_vibe'> | null
  applicant?: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'username' | 'college'> | null
}

type TeamChatMessageRow = Database['public']['Tables']['team_chat_messages']['Row'] & {
  sender?: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'username' | 'avatar_url'> | null
}

type TeamTaskRow = Database['public']['Tables']['team_tasks']['Row']

type TeamTaskAssigneeRow = Database['public']['Tables']['team_task_assignees']['Row'] & {
  member?: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'username'> | null
}

type TeamFileRow = Database['public']['Tables']['team_files']['Row'] & {
  uploader?: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'username'> | null
}

const TEAM_FILE_BUCKET = 'team-files'

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('请先登录')
  return user.id
}

async function fetchTaskAssignees(taskIds: number[]): Promise<Record<number, TeamTaskAssigneeRow[]>> {
  if (!taskIds.length) return {}
  const { data, error } = await supabase
    .from('team_task_assignees')
    .select('*,' + 'member:profiles!team_task_assignees_member_id_fkey(id,username)')
    .in('task_id', taskIds)
  if (error) throw error
  const rows = (data as unknown as TeamTaskAssigneeRow[] | null) ?? []
  return rows.reduce<Record<number, TeamTaskAssigneeRow[]>>((acc, row) => {
    const list = acc[row.task_id] ?? []
    list.push(row)
    acc[row.task_id] = list
    return acc
  }, {})
}

function mapApplication(row: TeamApplicationRow): TeamApplication {
  const extra = (row.extra as { preferred_role?: string } | null) ?? null
  return {
    id: row.id,
    teamId: row.team_id,
    teamName: row.team?.name ?? '未命名小组',
    applicantId: row.applicant_id,
    applicantName: row.applicant?.username ?? undefined,
    applicantCollege: row.applicant?.college ?? undefined,
    status: row.status,
    mode: row.mode ?? 'focus',
    message: row.message ?? undefined,
    preferredRole: extra?.preferred_role ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapChatMessage(row: TeamChatMessageRow, ownerId?: string): TeamChatMessage {
  return {
    id: row.id,
    teamId: row.team_id,
    senderId: row.sender_id,
    senderName: row.sender?.username ?? '成员',
    senderAvatar: row.sender?.avatar_url ?? undefined,
    content: row.content,
    createdAt: row.created_at,
    isOwner: ownerId ? row.sender_id === ownerId : undefined,
    attachments: (row.attachments as TeamChatMessage['attachments']) ?? undefined,
  }
}

function mapTask(row: TeamTaskRow, assignees: TeamTaskAssigneeRow[]): TeamTask {
  return {
    id: row.id,
    teamId: row.team_id,
    title: row.title,
    status: row.status,
    dueDate: row.due_date ?? undefined,
    orderIndex: row.order_index ?? 0,
    createdAt: row.created_at,
    assignees: assignees.map((assignee) => ({
      memberId: assignee.member_id,
      name: assignee.member?.username ?? '成员',
      status: assignee.status,
    })),
  }
}

function mapFile(row: TeamFileRow): TeamFile {
  return {
    id: row.id,
    teamId: row.team_id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    fileSize: row.file_size ?? undefined,
    mimeType: row.mime_type ?? undefined,
    uploadedBy: row.uploader_id,
    uploaderName: row.uploader?.username ?? undefined,
    createdAt: row.created_at,
  }
}

export async function fetchTeamApplications(): Promise<TeamApplication[]> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('team_applications')
    .select(
      '*,' +
        'team:teams(id,name,is_vibe),' +
        'applicant:profiles!team_applications_applicant_id_fkey(id,username,college)',
    )
    .eq('applicant_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = (data as unknown as TeamApplicationRow[] | null) ?? []
  return rows.map(mapApplication)
}

export async function createTeamApplication(
  teamId: number,
  options?: { message?: string; preferredRole?: string; mode?: 'focus' | 'vibe' },
): Promise<TeamApplication> {
  const userId = await requireUserId()
  const payload: Database['public']['Tables']['team_applications']['Insert'] = {
    team_id: teamId,
    applicant_id: userId,
    message: options?.message ?? null,
    status: 'pending',
    mode: options?.mode ?? 'focus',
    extra: {
      preferred_role: options?.preferredRole ?? null,
    },
  }

  const { data, error } = await supabase
    .from('team_applications')
    .insert(payload)
    .select(
      '*,' +
        'team:teams(id,name,is_vibe),' +
        'applicant:profiles!team_applications_applicant_id_fkey(id,username,college)',
    )
    .single()
  if (error) throw error
  return mapApplication(data as unknown as TeamApplicationRow)
}

export async function fetchTeamApplicationQueue(teamId: number): Promise<TeamApplication[]> {
  const { data, error } = await supabase
    .from('team_applications')
    .select(
      '*,' +
        'team:teams(id,name,is_vibe),' +
        'applicant:profiles!team_applications_applicant_id_fkey(id,username,college)',
    )
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = (data as unknown as TeamApplicationRow[] | null) ?? []
  return rows.map(mapApplication)
}

export async function respondTeamApplication(
  applicationId: number,
  status: Extract<TeamApplicationStatus, 'approved' | 'rejected'>,
): Promise<TeamApplication> {
  const { data: existing, error: fetchError } = await supabase
    .from('team_applications')
    .select(
      '*,' +
        'team:teams(id,name,is_vibe),' +
        'applicant:profiles!team_applications_applicant_id_fkey(id,username,college)',
    )
    .eq('id', applicationId)
    .maybeSingle()
  if (fetchError) throw fetchError
  const existingRow = (existing as unknown as TeamApplicationRow | null)
  if (!existingRow) throw new Error('申请不存在')
  if (existingRow.status !== 'pending') {
    throw new Error('该申请已处理')
  }

  const { data, error } = await supabase
    .from('team_applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select(
      '*,' +
        'team:teams(id,name,is_vibe),' +
        'applicant:profiles!team_applications_applicant_id_fkey(id,username,college)',
    )
    .single()
  if (error) throw error

  if (status === 'approved') {
    const { error: memberError } = await supabase.from('team_members').insert({
      team_id: existingRow.team_id,
      member_id: existingRow.applicant_id,
      status: 'approved',
    })
    if (memberError && memberError.code !== '23505') {
      throw memberError
    }
  }

  return mapApplication(data as unknown as TeamApplicationRow)
}

export async function fetchTeamChatMessages(teamId: number, limit = 100, ownerId?: string): Promise<TeamChatMessage[]> {
  const { data, error } = await supabase
    .from('team_chat_messages')
    .select(
      '*,' +
        'sender:profiles!team_chat_messages_sender_id_fkey(id,username,avatar_url)',
    )
    .eq('team_id', teamId)
    .order('created_at', { ascending: true })
    .limit(limit)
  if (error) throw error
  const rows = (data as unknown as TeamChatMessageRow[] | null) ?? []
  return rows.map((row) => mapChatMessage(row, ownerId))
}

export async function sendTeamChatMessage(teamId: number, content: string, ownerId?: string): Promise<TeamChatMessage> {
  if (!content.trim()) throw new Error('消息不能为空')
  const userId = await requireUserId()
  const payload: Database['public']['Tables']['team_chat_messages']['Insert'] = {
    team_id: teamId,
    sender_id: userId,
    content,
    status: 'delivered',
  }
  const { data, error } = await supabase
    .from('team_chat_messages')
    .insert(payload)
    .select(
      '*,' +
        'sender:profiles!team_chat_messages_sender_id_fkey(id,username,avatar_url)',
    )
    .single()
  if (error) throw error
  return mapChatMessage(data as unknown as TeamChatMessageRow, ownerId)
}

export async function fetchTeamTasks(teamId: number): Promise<TeamTask[]> {
  const { data, error } = await supabase
    .from('team_tasks')
    .select('*')
    .eq('team_id', teamId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  const rows = (data as unknown as TeamTaskRow[] | null) ?? []
  const assignees = await fetchTaskAssignees(rows.map((row) => row.id))
  return rows.map((row) => mapTask(row, assignees[row.id] ?? []))
}

export async function createTeamTask(
  teamId: number,
  title: string,
  memberIds: string[] = [],
): Promise<TeamTask> {
  const userId = await requireUserId()
  const payload: Database['public']['Tables']['team_tasks']['Insert'] = {
    team_id: teamId,
    title,
    created_by: userId,
    status: 'todo',
  }
  const { data, error } = await supabase
    .from('team_tasks')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw error
  const row = data as unknown as TeamTaskRow
  if (memberIds.length) {
    await assignMembersToTask(row.id, memberIds)
  }
  const assignees = await fetchTaskAssignees([row.id])
  return mapTask(row, assignees[row.id] ?? [])
}

export async function updateTeamTaskStatus(taskId: number, status: TeamTaskStatus): Promise<TeamTask> {
  const { data, error } = await supabase
    .from('team_tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select('*')
    .single()
  if (error) throw error
  const row = data as unknown as TeamTaskRow
  const assignees = await fetchTaskAssignees([taskId])
  return mapTask(row, assignees[taskId] ?? [])
}

export async function assignMembersToTask(taskId: number, memberIds: string[]): Promise<TeamTaskAssignee[]> {
  const userId = await requireUserId()
  await supabase.from('team_task_assignees').delete().eq('task_id', taskId)

  const uniqueIds = Array.from(new Set(memberIds))
  if (uniqueIds.length) {
    const rows = uniqueIds.map((memberId) => ({
      task_id: taskId,
      member_id: memberId,
      assigned_by: userId,
    }))
    const { error: insertError } = await supabase
      .from('team_task_assignees')
      .insert(rows)
    if (insertError) throw insertError
  }

  const assignees = await fetchTaskAssignees([taskId])
  return assignees[taskId]?.map((row) => ({
    memberId: row.member_id,
    name: row.member?.username ?? '成员',
    status: row.status,
  })) ?? []
}

export async function updateTaskAssignmentStatus(
  taskId: number,
  memberId: string,
  status: TeamTaskAssigneeStatus,
): Promise<void> {
  const userId = await requireUserId()
  const { error } = await supabase
    .from('team_task_assignees')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('task_id', taskId)
    .eq('member_id', memberId)
  if (error) throw error

  // 如果所有人完成，顺便标记任务完成
  if (status === 'done') {
    const assignees = await fetchTaskAssignees([taskId])
    const list = assignees[taskId] ?? []
    if (list.length && list.every((item) => item.status === 'done')) {
      await supabase
        .from('team_tasks')
        .update({ status: 'done', updated_at: new Date().toISOString() })
        .eq('id', taskId)
    }
  } else if (userId === memberId && status === 'submitted') {
    await supabase
      .from('team_tasks')
      .update({ status: 'in-progress', updated_at: new Date().toISOString() })
      .eq('id', taskId)
  }
}

export async function fetchTeamFiles(teamId: number): Promise<TeamFile[]> {
  const { data, error } = await supabase
    .from('team_files')
    .select(
      '*,' +
        'uploader:profiles!team_files_uploader_id_fkey(id,username)',
    )
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = (data as unknown as TeamFileRow[] | null) ?? []
  return rows.map(mapFile)
}

export async function uploadTeamFile(teamId: number, file: File): Promise<TeamFile> {
  const userId = await requireUserId()
  const extension = file.name.split('.').pop()
  const path = `${teamId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension ?? 'dat'}`
  const { error: uploadError } = await supabase.storage.from(TEAM_FILE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { data: publicUrlData } = supabase.storage.from(TEAM_FILE_BUCKET).getPublicUrl(path)
  const payload: Database['public']['Tables']['team_files']['Insert'] = {
    team_id: teamId,
    uploader_id: userId,
    file_name: file.name,
    file_url: publicUrlData.publicUrl,
    file_size: file.size,
    mime_type: file.type,
  }

  const { data, error } = await supabase
    .from('team_files')
    .insert(payload)
    .select(
      '*,' +
        'uploader:profiles!team_files_uploader_id_fkey(id,username)',
    )
    .single()
  if (error) throw error
  return mapFile(data as unknown as TeamFileRow)
}

export function subscribeTeamChat(teamId: number, handler: (msg: TeamChatMessage) => void, ownerId?: string) {
  const channel = supabase
    .channel(`team-chat-${teamId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'team_chat_messages', filter: `team_id=eq.${teamId}` },
      (payload) => {
        const row = payload.new as TeamChatMessageRow
        handler(mapChatMessage(row, ownerId))
      },
    )
    .subscribe()

  return channel
}
