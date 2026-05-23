import type { LucideIcon } from 'lucide-react'
import { NavLink as RouterNavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

interface NavLinkProps {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  onClick?: () => void
  className?: string
}

export function NavLink({
  to,
  label,
  icon: Icon,
  end,
  onClick,
  className,
}: NavLinkProps) {
  return (
    <RouterNavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors',
          'hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground',
          className,
        )
      }
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      <span>{label}</span>
    </RouterNavLink>
  )
}
