import { Hand, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'
import {
  APP_NAME,
  APP_TAGLINE,
  APP_VERSION,
  ROUTES,
} from '@/utils/constants'
import { isOnboardingComplete } from '@/utils/storage'

const SPLASH_DURATION_MS = 3000

export function SplashPage() {
  const navigate = useNavigate()
  const { user, isLoading, isConfigured } = useAuth()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min(100, (elapsed / SPLASH_DURATION_MS) * 100))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isConfigured && isLoading) return

    const timer = setTimeout(() => {
      if (!isOnboardingComplete()) {
        navigate(ROUTES.onboarding, { replace: true })
        return
      }

      if (user) {
        navigate(
          ROUTES.dashboard,
          { replace: true },
        )
        return
      }

      navigate(ROUTES.login, { replace: true })
    }, SPLASH_DURATION_MS)

    return () => clearTimeout(timer)
  }, [
    navigate,
    user,
    isLoading,
    isConfigured,
  ])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-primary px-6 text-primary-foreground">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex size-24 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
          <Hand className="size-12" aria-hidden />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="mt-3 max-w-sm text-lg text-primary-foreground/90">
            {APP_TAGLINE}
          </p>
        </div>
        <div className="flex items-center gap-2 text-primary-foreground/80">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          <span>Loading…</span>
        </div>
        <div
          className="h-2 w-56 overflow-hidden rounded-full bg-white/20"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <footer className="absolute bottom-6 text-sm text-primary-foreground/70">
        v{APP_VERSION}
      </footer>
    </div>
  )
}
