import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { updateProfile } from '@/services/auth'
import type { UserPreferences } from '@/types'
import { applyPreferences } from '@/utils/preferences'

interface PreferencesContextValue {
  preferences: UserPreferences
  updatePreferences: (patch: Partial<UserPreferences>) => Promise<void>
  isSaving: boolean
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(
  undefined,
)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user, preferences, refreshProfile } = useAuth()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    applyPreferences(preferences)
  }, [preferences])

  useEffect(() => {
    if (preferences.theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyPreferences(preferences)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [preferences])

  const updatePreferences = useCallback(
    async (patch: Partial<UserPreferences>) => {
      if (!user) return

      const next: UserPreferences = { ...preferences, ...patch }
      applyPreferences(next)
      setIsSaving(true)

      try {
        await updateProfile(user.id, { preferences: next })
        await refreshProfile()
      } finally {
        setIsSaving(false)
      }
    },
    [user, preferences, refreshProfile],
  )

  const value = useMemo(
    () => ({
      preferences,
      updatePreferences,
      isSaving,
    }),
    [preferences, updatePreferences, isSaving],
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return context
}
