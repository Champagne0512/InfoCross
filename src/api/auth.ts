import type { UserProfile } from '@/types/models'
import type { Database } from '@/types/supabase'
import { supabase } from './client'

export interface RegisterPayload {
  email: string
  password: string
  username: string
  college: string
  major: string
  tags: string[]
}

export interface UpdateProfilePayload {
  username: string
  college: string
  major: string
  tags: string[]
  avatarUrl?: string
  bio?: string
}

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    username: row.username ?? 'InfoCross 学员',
    college: row.college ?? '未知学院',
    major: row.major ?? '未填写专业',
    tags: row.tags ?? [],
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
  }
}

async function selectProfileRow(userId: string): Promise<ProfileRow | null> {
  const { data, error } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()) as { data: ProfileRow | null; error: any }
  if (error) throw error
  return data ?? null
}

async function requireProfile(userId: string): Promise<UserProfile> {
  const row = await selectProfileRow(userId)
  if (!row) {
    throw new Error('Profile 尚未初始化，请稍后重试。')
  }
  return mapProfile(row)
}

async function waitProfileRow(userId: string): Promise<void> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const row = await selectProfileRow(userId)
    if (row) return
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error('Profile 初始化超时，请稍后重试。')
}

export async function signInWithEmail(email: string, password: string): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return requireProfile(data.user.id)
}

export async function registerUser(payload: RegisterPayload): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        username: payload.username,
      },
    },
  })
  if (error) throw error
  const user = data.user
  if (!user) {
    throw new Error('注册成功但未返回用户信息，请检查邮箱验证设置')
  }
  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    })
    if (signInError) throw signInError
  }

  await waitProfileRow(user.id)

  const profilesTable = supabase.from('profiles') as any
  const { error: updateError } = await profilesTable
    .update({
      username: payload.username,
      college: payload.college,
      major: payload.major,
      tags: payload.tags,
    } as ProfileUpdate)
    .eq('id', user.id)

  if (updateError) throw updateError

  return requireProfile(user.id)
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return requireProfile(user.id)
}

export async function updateProfile(userId: string, payload: UpdateProfilePayload): Promise<UserProfile> {
  const updates: ProfileUpdate = {
    username: payload.username,
    college: payload.college,
    major: payload.major,
    tags: payload.tags,
    avatar_url: payload.avatarUrl,
    bio: payload.bio,
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (updateError) throw updateError

  return requireProfile(userId)
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}` // 每位用户在 bucket 中一个独立文件夹，匹配 RLS 策略

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return publicUrl
}
