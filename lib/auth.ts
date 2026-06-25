import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect('/admin/login')
  return session
}

export async function requireRole(allowedRoles: string[]) {
  const profile = await getProfile()
  if (!profile) redirect('/admin/login')
  if (!allowedRoles.includes(profile.rol)) redirect('/admin/dashboard')
  return profile
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
