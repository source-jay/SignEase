import type { User } from '@supabase/supabase-js'

import { supabase, isSupabaseConfigured } from '@/services/supabase'
import {
  DEFAULT_USER_PREFERENCES,
  type Profile,
  type UserPreferences,
} from '@/types'

function assertSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
    )
  }
  return supabase
}

export function getAuthRedirectUrl(path = '/dashboard'): string {
  return `${window.location.origin}${path}`
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const client = assertSupabase()
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export function parsePreferences(raw: Profile['preferences']): UserPreferences {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_USER_PREFERENCES }
  }
  return {
    ...DEFAULT_USER_PREFERENCES,
    ...(raw as unknown as UserPreferences),
  }
}

export function isProfileSetupComplete(profile: Profile | null): boolean {
  if (!profile) return false
  const prefs = parsePreferences(profile.preferences)
  return prefs.profileSetupComplete === true
}

export async function signInWithEmail(email: string, password: string) {
  const client = assertSupabase()
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) throw error
  return data
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
) {
  const client = assertSupabase()
  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { full_name: fullName.trim() },
      emailRedirectTo: getAuthRedirectUrl('/profile-setup'),
    },
  })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const client = assertSupabase()
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthRedirectUrl('/dashboard'),
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
  if (error) throw error
  return data
}

export async function sendPasswordReset(email: string) {
  const client = assertSupabase()
  const { data, error } = await client.auth.resetPasswordForEmail(
    email.trim(),
    { redirectTo: getAuthRedirectUrl('/reset-password') },
  )
  if (error) throw error
  return data
}

export async function signOut() {
  const client = assertSupabase()
  const { error } = await client.auth.signOut()
  if (error) throw error
}

export async function updateProfile(
  userId: string,
  updates: {
    full_name?: string
    preferences?: UserPreferences
  },
) {
  const client = assertSupabase()
  const { data, error } = await client
    .from('profiles')
    .update({
      ...updates,
      preferences: updates.preferences as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function ensureProfile(user: User): Promise<Profile> {
  const existing = await fetchProfile(user.id)
  if (existing) return existing

  const client = assertSupabase()
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split('@')[0] ??
    'User'

  const { data, error } = await client
    .from('profiles')
    .insert({
      id: user.id,
      full_name: fullName,
      preferences: DEFAULT_USER_PREFERENCES as unknown as Record<string, unknown>,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
