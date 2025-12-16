import { hasSupabase, supabase } from './client'
import type { UserProfile } from '@/types/models'

const mockUser: UserProfile = {
  id: 'mock-user',
  email: 'student@infocross.edu',
  username: 'InfoCross 体验官',
  college: '计算机学院',
  major: '人工智能',
  tags: ['AI', '产品', '跨学科'],
}

export async function signInWithEmail(email: string, password: string): Promise<UserProfile> {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return {
      id: data.user.id,
      email: data.user.email ?? email,
      username: data.user.user_metadata?.username ?? data.user.email ?? '同学',
      college: data.user.user_metadata?.college ?? '未知学院',
      major: data.user.user_metadata?.major ?? '未填写专业',
      tags: data.user.user_metadata?.tags ?? [],
      avatarUrl: data.user.user_metadata?.avatar_url,
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 600))
  return { ...mockUser, email }
}

export async function signOut(): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase.auth.signOut()
  }
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (hasSupabase && supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null
    return {
      id: user.id,
      email: user.email ?? '',
      username: user.user_metadata?.username ?? '同学',
      college: user.user_metadata?.college ?? '未知学院',
      major: user.user_metadata?.major ?? '未填写专业',
      tags: user.user_metadata?.tags ?? [],
      avatarUrl: user.user_metadata?.avatar_url,
    }
  }

  return null
}
