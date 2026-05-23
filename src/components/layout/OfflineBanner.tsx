import { WifiOff } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { ROUTES } from '@/utils/constants'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  if (isOnline) return null

  return (
    <div
      className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950"
      role="status"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden />
      <span>You&apos;re offline.</span>
      <Link to={ROUTES.offline} className="underline underline-offset-2">
        Learn more
      </Link>
    </div>
  )
}
