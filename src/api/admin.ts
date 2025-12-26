import { supabase } from './client'

export interface AdminStats {
  totalArticles: number
  activeTeams: number
  pendingApplications: number
  newUsers7d: number
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
  if (!row) {
    throw new Error('未能获取后台统计数据')
  }
  return {
    totalArticles: Number(row.total_articles ?? 0),
    activeTeams: Number(row.active_teams ?? 0),
    pendingApplications: Number(row.pending_applications ?? 0),
    newUsers7d: Number(row.new_users_7d ?? 0),
  }
}

export async function fetchAdminApplications(limit = 8): Promise<AdminApplicationItem[]> {
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
