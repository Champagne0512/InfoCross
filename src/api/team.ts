import type { Team, TeamMember } from '@/types/models'
import type { Database } from '@/types/supabase'
import { supabase } from './client'

type TeamRow = Database['public']['Tables']['teams']['Row']
type TeamMemberRow = Database['public']['Tables']['team_members']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'] | null
}

function mapTeamMember(row: TeamMemberRow): TeamMember {
  return {
    id: row.member_id,
    name: row.profiles?.username ?? '成员',
    avatar: row.profiles?.avatar_url ?? undefined,
    skills: row.skills ?? undefined,
    role: row.role ?? undefined,
    isAdmin: Boolean(row.is_admin),
  }
}

function mapTeam(row: TeamRow, members: TeamMemberRow[]): Team {
  const sortedMembers = [...members].sort((a, b) => Number(b.is_owner ?? false) - Number(a.is_owner ?? false))
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    type: (row.type as Team['type']) ?? 'project',
    college: row.college ?? '未标注学院',
    currentMembers: row.current_members ?? members.length,
    maxMembers: row.max_members,
    requiredSkills: row.required_skills ?? [],
    members: sortedMembers.map(mapTeamMember),
    tags: row.tags ?? [],
    createdAt: row.created_at,
    deadline: row.deadline ?? undefined,
    status: (row.status as Team['status']) ?? 'recruiting',
    isVibe: Boolean(row.is_vibe),
    ownerId: row.owner_id,
  }
}

async function fetchTeamMembers(teamIds: number[]): Promise<Record<number, TeamMemberRow[]>> {
  if (!teamIds.length) return {}
  const { data, error } = await supabase
    .from('team_members')
    .select(
      '*,' +
        'profiles:profiles!team_members_member_id_fkey(id, username, avatar_url)',
    )
    .in('team_id', teamIds)
  if (error) throw error
  const rows = (data as unknown as TeamMemberRow[] | null) ?? []
  return rows.reduce<Record<number, TeamMemberRow[]>>((acc, row) => {
    const list = acc[row.team_id] ?? []
    list.push(row)
    acc[row.team_id] = list
    return acc
  }, {})
}

export async function fetchTeams(params?: {
  type?: string
  college?: string
  skill?: string
  status?: string
  limit?: number
  mode?: 'focus' | 'vibe'
}): Promise<Team[]> {
  try {
    let query = supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false })

    if (params?.mode) {
      query = query.eq('is_vibe', params.mode === 'vibe')
    }

    if (params?.type && params.type !== 'all') {
      query = query.eq('type', params.type)
    }

    if (params?.college && params.college !== 'all') {
      query = query.eq('college', params.college)
    }

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status)
    }

    if (params?.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query
    if (error) throw error
    const teamRows = (data as unknown as TeamRow[] | null) ?? []
    const membersByTeam = await fetchTeamMembers(teamRows.map((team) => team.id))

    let teams = teamRows.map((row) => mapTeam(row, membersByTeam[row.id] ?? []))

    if (params?.skill && params.skill !== 'all') {
      teams = teams.filter((team) =>
        team.requiredSkills?.includes(params.skill!) ||
        team.members.some((member) => member.skills?.includes(params.skill!)),
      )
    }

    return teams
  } catch (error) {
    console.error('[fetchTeams] failed', error)
    throw error
  }
}

export async function fetchTeamById(id: number): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const row = data as unknown as TeamRow
  const members = await fetchTeamMembers([row.id])
  return mapTeam(row, members[row.id] ?? [])
}

export async function updateTeamInfo(
  teamId: number,
  payload: Partial<Pick<Team, 'name' | 'description' | 'maxMembers' | 'tags' | 'status' | 'college'>>,
): Promise<Team> {
  const updatePayload: Database['public']['Tables']['teams']['Update'] = { updated_at: new Date().toISOString() }

  if (payload.name !== undefined) updatePayload.name = payload.name
  if (payload.description !== undefined) updatePayload.description = payload.description
  if (payload.maxMembers !== undefined) updatePayload.max_members = payload.maxMembers
  if (payload.tags !== undefined) updatePayload.tags = payload.tags
  if (payload.status !== undefined) updatePayload.status = payload.status
  if (payload.college !== undefined) updatePayload.college = payload.college

  const { data, error } = await supabase
    .from('teams')
    .update(updatePayload)
    .eq('id', teamId)
    .select('*')
    .single()
  if (error) throw error
  const row = data as unknown as TeamRow
  const members = await fetchTeamMembers([teamId])
  return mapTeam(row, members[teamId] ?? [])
}

export async function deleteTeam(teamId: number): Promise<void> {
  const { error } = await supabase.from('teams').delete().eq('id', teamId)
  if (error) throw error
}

export async function setTeamMemberAdmin(teamId: number, memberId: string, isAdmin: boolean): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .update({ is_admin: isAdmin })
    .eq('team_id', teamId)
    .eq('member_id', memberId)
  if (error) throw error
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

export async function createTeam(team: Partial<Team>): Promise<Team> {
  const userId = await requireUserId()
  const payload: Database['public']['Tables']['teams']['Insert'] = {
    owner_id: userId,
    name: team.name ?? '未命名团队',
    description: team.description ?? '',
    type: team.type ?? 'project',
    college: team.college ?? null,
    required_skills: team.requiredSkills ?? [],
    tags: team.tags ?? [],
    max_members: team.maxMembers ?? 5,
    deadline: team.deadline ?? null,
    status: team.status ?? 'recruiting',
    is_vibe: team.isVibe ?? false,
  }

  const { data, error } = await supabase
    .from('teams')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw error

  const row = data as unknown as TeamRow
  const members = await fetchTeamMembers([row.id])
  return mapTeam(row, members[row.id] ?? [])
}

export async function joinTeam(teamId: number): Promise<boolean> {
  const userId = await requireUserId()
  const { data, error: teamError } = await supabase
    .from('teams')
    .select('id,current_members,max_members,status')
    .eq('id', teamId)
    .maybeSingle()
  if (teamError) throw teamError
  const team = data as unknown as { id: number; current_members: number | null; max_members: number; status: string } | null
  if (!team) throw new Error('团队不存在')

  if (team.status === 'full' || (team.current_members ?? 0) >= team.max_members) {
    throw new Error('团队已满员')
  }

  const { error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      member_id: userId,
      status: 'approved',
    })
  if (error && error.code !== '23505') {
    throw error
  }

  return true
}

export async function fetchUserTeams(): Promise<Team[]> {
  const userId = await requireUserId()
  
  // 获取用户作为成员加入的小组
  const { data: memberData, error: memberError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('member_id', userId)
  if (memberError) throw memberError
  
  // 获取用户作为创建者的小组
  const { data: ownerData, error: ownerError } = await supabase
    .from('teams')
    .select('id')
    .eq('owner_id', userId)
  if (ownerError) throw ownerError
  
  const memberTeamIds = (memberData ?? []).map(row => row.team_id)
  const ownerTeamIds = (ownerData ?? []).map(row => row.id)
  const allTeamIds = [...new Set([...memberTeamIds, ...ownerTeamIds])]
  
  if (allTeamIds.length === 0) return []
  
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .in('id', allTeamIds)
    .order('created_at', { ascending: false })
  if (error) throw error
  
  const teamRows = (data as unknown as TeamRow[] | null) ?? []
  const membersByTeam = await fetchTeamMembers(teamRows.map(team => team.id))
  
  return teamRows.map(row => mapTeam(row, membersByTeam[row.id] ?? []))
}
