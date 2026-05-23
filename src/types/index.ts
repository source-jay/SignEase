export type { Database, Json } from './database'
import type { Database } from './database'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  highContrast: boolean
  fontScale: number
  voiceRate: number
  voicePitch: number
  preferredVoice?: string
  profileSetupComplete?: boolean
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  highContrast: false,
  fontScale: 1,
  voiceRate: 1,
  voicePitch: 1,
  profileSetupComplete: false,
}

export type Profile = Database['public']['Tables']['profiles']['Row']
