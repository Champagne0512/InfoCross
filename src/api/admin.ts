import { supabase } from './client'

export interface AdminStats {
  totalArticles: number
  activeTeams: number
  pendingApplications: number
  newUsers7d: number
  totalUsers: number
  totalForumPosts: number
}

export interface AdminApplicationItem {
  id: number
  createdAt: string
  teamId: number
  teamName: string
  mode: 'focus' | 'vibe'
  status: 'pending' | 'approved' | 'rejected'
  applicantId: string
  applicantName: string
  applicantCollege?: string
  message?: string
}

export interface AdminUserItem {
  id: string
  email: string
  username: string
  college?: string
  major?: string
  isAdmin: boolean
  createdAt: string
}

export interface AdminTeamItem {
  id: number
  name: string
  mode: 'focus' | 'vibe'
  status: string
  memberCount: number
  creatorName: string
  createdAt: string
}

export interface AdminForumItem {
  id: number
  type: 'signal' | 'depth'
  title?: string
  contentText: string
  authorName: string
  likeCount: number
  commentCount: number
  createdAt: string
}

type AdminStatsRow = {
  total_articles: number
  active_teams: number
  pending_applications: number
  new_users_7d: number
}

type AdminApplicationRow = {
  application_id: number
  created_at: string
  team_id: number
  team_name: string
  mode: 'focus' | 'vibe'
  status: 'pending' | 'approved' | 'rejected'
  applicant_id: string
  applicant_name: string | null
  applicant_college: string | null
  message: string | null
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('admin_dashboard_stats')
  if (error) throw error
  const row = ((data as AdminStatsRow[] | null) ?? [])[0]
  
  // 获取额外统计数据
  const [usersRes, forumRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('forum_threads').select('id', { count: 'exact', head: true }),
  ])
  
  return {
    totalArticles: Number(row?.total_articles ?? 0),
    activeTeams: Number(row?.active_teams ?? 0),
    pendingApplications: Number(row?.pending_applications ?? 0),
    newUsers7d: Number(row?.new_users_7d ?? 0),
    totalUsers: usersRes.count ?? 0,
    totalForumPosts: forumRes.count ?? 0,
  }
}

export async function fetchAdminApplications(limit = 20): Promise<AdminApplicationItem[]> {
  const { data, error } = await supabase.rpc('admin_recent_applications', {
    limit_count: limit,
  })
  if (error) throw error
  const rows = (data as AdminApplicationRow[] | null) ?? []
  return rows.map((row) => ({
    id: row.application_id,
    createdAt: row.created_at,
    teamId: row.team_id,
    teamName: row.team_name,
    mode: row.mode,
    status: row.status,
    applicantId: row.applicant_id,
    applicantName: row.applicant_name ?? '未命名成员',
    applicantCollege: row.applicant_college ?? undefined,
    message: row.message ?? undefined,
  }))
}

export async function fetchAdminUsers(limit = 50): Promise<AdminUserItem[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, username, college, major, is_admin, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email ?? '',
    username: row.username ?? '未命名用户',
    college: row.college ?? undefined,
    major: row.major ?? undefined,
    isAdmin: row.is_admin ?? false,
    createdAt: row.created_at,
  }))
}

export async function fetchAdminTeams(limit = 50): Promise<AdminTeamItem[]> {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      id, name, is_vibe, status, created_at,
      owner:profiles!teams_owner_id_fkey(username),
      members:team_members(count)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    mode: row.is_vibe ? 'vibe' : 'focus',
    status: row.status,
    memberCount: row.members?.[0]?.count ?? 0,
    creatorName: row.owner?.username ?? '未知',
    createdAt: row.created_at,
  }))
}

export async function fetchAdminForumPosts(limit = 50): Promise<AdminForumItem[]> {
  const { data, error } = await supabase
    .from('forum_threads')
    .select(`
      id, type, title, content_text, like_count, comment_count, created_at, author_id
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  
  // 获取作者信息
  const authorIds = [...new Set((data ?? []).map(r => r.author_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', authorIds)
  
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p.username]))
  
  return (data ?? []).map((row: any) => ({
    id: row.id,
    type: row.type,
    title: row.title ?? undefined,
    contentText: row.content_text ?? '',
    authorName: profileMap.get(row.author_id) ?? '匿名',
    likeCount: row.like_count ?? 0,
    commentCount: row.comment_count ?? 0,
    createdAt: row.created_at,
  }))
}

// 审批申请
export async function approveApplication(applicationId: number): Promise<void> {
  const { error } = await supabase
    .from('team_applications')
    .update({ status: 'approved' })
    .eq('id', applicationId)
  if (error) throw error
}

export async function rejectApplication(applicationId: number): Promise<void> {
  const { error } = await supabase
    .from('team_applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)
  if (error) throw error
}

// 用户管理
export async function toggleUserAdmin(userId: string, isAdmin: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: isAdmin })
    .eq('id', userId)
  if (error) throw error
}

// 删除帖子
export async function deleteForumPost(postId: number): Promise<void> {
  const { error } = await supabase
    .from('forum_threads')
    .delete()
    .eq('id', postId)
  if (error) throw error
}
