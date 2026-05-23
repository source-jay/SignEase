import {
  Camera,
  Clock,
  HelpCircle,
  Home,
  Info,
  LogOut,
  MessageCircle,
  Settings,
  User,
  Brain,
  type LucideIcon,
} from 'lucide-react'

import { ROUTES } from '@/utils/constants'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  end?: boolean
}

export const primaryNavItems: NavItem[] = [
  { label: 'Home', href: ROUTES.dashboard, icon: Home, end: true },
  { label: 'Translate', href: ROUTES.translate, icon: Camera },
  { label: 'History', href: ROUTES.history, icon: Clock },
  { label: 'Train AI', href: ROUTES.train, icon: Brain },
  { label: 'Profile', href: ROUTES.profile, icon: User, end: true },
]

export const secondaryNavItems: NavItem[] = [
  { label: 'AI Assistant', href: ROUTES.chat, icon: MessageCircle },
  { label: 'Help & Support', href: ROUTES.help, icon: HelpCircle },
  { label: 'Settings', href: ROUTES.settings, icon: Settings },
]

export const aboutNavItem: NavItem = {
  label: 'About',
  href: ROUTES.help,
  icon: Info,
}

export const logoutNavItem = {
  label: 'Log out',
  icon: LogOut,
} as const
