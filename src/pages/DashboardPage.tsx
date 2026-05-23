import { Camera, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/utils/constants'

export function DashboardPage() {
  const { profile } = useAuth()
  const displayName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${displayName}`}
        description="Your sign language translation hub"
        action={
          <Link to={ROUTES.translate}>
            <Button className="h-11 gap-2">
              <Camera className="size-5" />
              Quick translate
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="size-5 text-primary" />
              Start translating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Open the camera to convert ASL into text and speech.
            </p>
            <Link to={ROUTES.translate} className="mt-4 inline-block">
              <Button variant="secondary" className="h-11">
                Go to Translate
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-accent" />
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your last translations will appear here in Phase 8.
            </p>
            <Link to={ROUTES.history} className="mt-4 inline-block">
              <Button variant="outline" className="h-11">
                View history
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
