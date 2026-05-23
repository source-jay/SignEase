import { Hand } from 'lucide-react'
import { Link } from 'react-router-dom'

import { APP_NAME, APP_TAGLINE, ROUTES } from '@/utils/constants'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border px-6 py-4">
        <Link
          to={ROUTES.home}
          className="inline-flex items-center gap-2 text-primary"
        >
          <Hand className="size-7" aria-hidden />
          <span className="text-xl font-bold">{APP_NAME}</span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
            {description && (
              <p className="mt-2 text-muted-foreground">{description}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">{APP_TAGLINE}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
