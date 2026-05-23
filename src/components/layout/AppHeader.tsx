import { Hand, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { APP_NAME, ROUTES } from '@/utils/constants'

interface AppHeaderProps {
  onMenuOpen: () => void
  title?: string
}

export function AppHeader({ onMenuOpen, title }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuOpen}
        aria-label="Open menu"
      >
        <Menu className="size-6" />
      </Button>

      <Link
        to={ROUTES.dashboard}
        className="flex items-center gap-2 text-primary lg:hidden"
      >
        <Hand className="size-6" aria-hidden />
        <span className="font-bold">{APP_NAME}</span>
      </Link>

      {title && (
        <h1 className="hidden flex-1 truncate text-lg font-semibold lg:block">
          {title}
        </h1>
      )}

      <div className="flex-1 lg:hidden" />

      {title && (
        <h1 className="truncate text-lg font-semibold lg:hidden">{title}</h1>
      )}
    </header>
  )
}
