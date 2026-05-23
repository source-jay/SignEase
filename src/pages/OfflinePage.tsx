import { WifiOff } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/utils/constants'

export function OfflinePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <WifiOff className="size-16 text-amber-500" aria-hidden />
      <div>
        <h1 className="text-3xl font-bold">You&apos;re offline</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Check your connection and try again. Cached translations will appear
          here in a future update.
        </p>
      </div>
      <Button
        type="button"
        className="h-11"
        onClick={() => window.location.reload()}
      >
        Retry connection
      </Button>
      <Link
        to={ROUTES.dashboard}
        className="text-sm font-medium text-primary hover:underline"
      >
        Go to dashboard
      </Link>
    </div>
  )
}
