import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/utils/constants'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <FileQuestion className="size-16 text-muted-foreground" aria-hidden />
      <div>
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link to={ROUTES.dashboard}>
        <Button className="h-11">Back to dashboard</Button>
      </Link>
    </div>
  )
}
