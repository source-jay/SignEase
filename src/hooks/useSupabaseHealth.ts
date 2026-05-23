import { useEffect, useState } from 'react'

import { isSupabaseConfigured, supabase } from '@/services/supabase'

export type SupabaseHealthStatus =
  | 'not_configured'
  | 'checking'
  | 'connected'
  | 'error'

export function useSupabaseHealth() {
  const [status, setStatus] = useState<SupabaseHealthStatus>(
    isSupabaseConfigured ? 'checking' : 'not_configured',
  )
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setStatus('not_configured')
      setMessage('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env')
      return
    }

    let cancelled = false

    async function checkConnection() {
      setStatus('checking')
      const client = supabase!
      const { error } = await client.auth.getSession()

      if (cancelled) return

      if (error) {
        setStatus('error')
        setMessage(error.message)
        return
      }

      setStatus('connected')
      setMessage('Supabase client is ready')
    }

    void checkConnection()

    return () => {
      cancelled = true
    }
  }, [])

  return { status, message, isConfigured: isSupabaseConfigured }
}
