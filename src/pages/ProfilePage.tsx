import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/utils/constants'

export function ProfilePage() {
  const { user, profile, preferences } = useAuth()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your account and preferences"
        action={
          <Link to={ROUTES.settings}>
            <Button variant="outline" className="h-11">
              Settings
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="font-medium text-foreground">Name: </span>
            {profile?.full_name ?? '—'}
          </p>
          <p>
            <span className="font-medium text-foreground">Email: </span>
            {user?.email ?? '—'}
          </p>
          <p>
            <span className="font-medium text-foreground">Role: </span>
            {profile?.role ?? 'user'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Theme: {preferences.theme}</p>
          <p>High contrast: {preferences.highContrast ? 'On' : 'Off'}</p>
          <p>Text scale: {preferences.fontScale}×</p>
          <Link
            to={ROUTES.settings}
            className="inline-block font-medium text-primary hover:underline"
          >
            Edit in Settings →
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
