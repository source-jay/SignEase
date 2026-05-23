import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { OfflineBanner } from '@/components/layout/OfflineBanner'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { primaryNavItems, secondaryNavItems } from '@/config/navigation'

const routeTitles: Record<string, string> = {
  ...Object.fromEntries(primaryNavItems.map((i) => [i.href, i.label])),
  ...Object.fromEntries(secondaryNavItems.map((i) => [i.href, i.label])),
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const title = routeTitles[pathname]

  return (
    <div className="flex min-h-svh bg-background">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex">
        <AppSidebar />
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-h-svh flex-1 flex-col lg:pl-64">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <OfflineBanner />
        <AppHeader onMenuOpen={() => setMenuOpen(true)} title={title} />

        <main
          id="main-content"
          className="flex-1 px-4 py-6 pb-24 md:px-8 lg:pb-8"
          tabIndex={-1}
        >
          <div className="mx-auto max-w-5xl animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
