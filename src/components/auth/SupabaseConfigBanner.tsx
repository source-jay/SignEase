import { AlertCircle } from 'lucide-react'

import { isSupabaseConfigured } from '@/services/supabase'

export function SupabaseConfigBanner() {
  if (isSupabaseConfigured) return null

  return (
    <div
      className="flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm"
      role="alert"
    >
      <AlertCircle className="size-5 shrink-0 text-amber-600" aria-hidden />
      <p>
        Supabase is not configured. Copy <code>.env.example</code> to{' '}
        <code>.env</code> and add your project URL and anon key to enable
        authentication.
      </p>
    </div>
  )
}
