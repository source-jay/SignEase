import { NavLink } from 'react-router-dom'

import { primaryNavItems } from '@/config/navigation'
import { cn } from '@/lib/utils'

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Primary navigation"
    >
      <ul
        className="grid gap-1 px-2 py-2"
        style={{
          gridTemplateColumns: `repeat(${primaryNavItems.length}, minmax(0, 1fr))`,
        }}
      >
        {primaryNavItems.map((item) => (
          <li key={item.href}>
            <NavLink
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              <item.icon className="size-6" aria-hidden />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
