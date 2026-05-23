import { Hand } from 'lucide-react'
import { Link } from 'react-router-dom'

import { NavLink } from '@/components/layout/NavLink'
import {
  aboutNavItem,
  logoutNavItem,
  primaryNavItems,
  secondaryNavItems,
} from '@/config/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME, ROUTES } from '@/utils/constants'

interface AppSidebarProps {
  onNavigate?: () => void
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { signOut } = useAuth()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <Link
          to={ROUTES.dashboard}
          className="flex items-center gap-2 text-primary"
          onClick={onNavigate}
        >
          <Hand className="size-7" aria-hidden />
          <span className="text-lg font-bold">{APP_NAME}</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4" aria-label="Main">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Main
          </p>
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              label={item.label}
              icon={item.icon}
              end={item.end}
              onClick={onNavigate}
            />
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            More
          </p>
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              label={item.label}
              icon={item.icon}
              onClick={onNavigate}
            />
          ))}
          <NavLink
            to={aboutNavItem.href}
            label={aboutNavItem.label}
            icon={aboutNavItem.icon}
            onClick={onNavigate}
          />
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-start gap-3"
          onClick={() => {
            onNavigate?.()
            void signOut()
          }}
        >
          <logoutNavItem.icon className="size-5" />
          {logoutNavItem.label}
        </Button>
      </div>
    </aside>
  )
}
