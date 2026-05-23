import type { Session, User } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  ensureProfile,
  fetchProfile,
  isProfileSetupComplete,
  parsePreferences,
  signOut as authSignOut,
} from '@/services/auth'
import { isSupabaseConfigured, supabase } from '@/services/supabase'
import type { Profile, UserPreferences } from '@/types'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  preferences: UserPreferences
  isLoading: boolean
  isConfigured: boolean
  profileSetupComplete: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async (activeUser: User) => {
    try {
      let nextProfile = await fetchProfile(activeUser.id)
      if (!nextProfile) {
        nextProfile = await ensureProfile(activeUser)
      }
      setProfile(nextProfile)
    } catch {
      setProfile(null)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    await loadProfile(user)
  }, [loadProfile, user])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false)
      return
    }

    let mounted = true

    // Failsafe: if Supabase hangs for more than 5 seconds, force loading to stop
    const failsafeTimer = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('Auth initialization timed out after 5 seconds. Forcing load to stop.')
        setIsLoading(false)
      }
    }, 5000)

    async function init() {
      try {
        const { data, error } = await supabase!.auth.getSession()
        if (error) {
          console.error('Supabase getSession error:', error)
        }
        if (!mounted) return

        setSession(data?.session ?? null)
        setUser(data?.session?.user ?? null)

        if (data?.session?.user) {
          await loadProfile(data.session.user)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return

      setSession(nextSession)
      setUser(nextSession?.user ?? null)

      if (nextSession?.user) {
        await loadProfile(nextSession.user)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => {
      mounted = false
      clearTimeout(failsafeTimer)
      subscription.unsubscribe()
    }
  }, [loadProfile, isLoading])

  const signOut = useCallback(async () => {
    await authSignOut()
    setSession(null)
    setUser(null)
    setProfile(null)
  }, [])

  const preferences = useMemo(
    () => parsePreferences(profile?.preferences ?? null),
    [profile],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      preferences,
      isLoading,
      isConfigured: isSupabaseConfigured,
      profileSetupComplete: isProfileSetupComplete(profile),
      refreshProfile,
      signOut,
    }),
    [
      session,
      user,
      profile,
      preferences,
      isLoading,
      refreshProfile,
      signOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
