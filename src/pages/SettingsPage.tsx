import { AccessibilitySettings } from '@/components/settings/AccessibilitySettings'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Customize appearance and accessibility"
      />
      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
        </CardHeader>
        <CardContent>
          <AccessibilitySettings />
        </CardContent>
      </Card>
    </div>
  )
}
