import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { updateProfile } from '@/services/auth'
import {
  DEFAULT_USER_PREFERENCES,
  type UserPreferences,
} from '@/types'
import { ROUTES } from '@/utils/constants'

export function ProfileSetupPage() {
  const navigate = useNavigate()
  const { user, profile, preferences, refreshProfile } = useAuth()

  const [fullName, setFullName] = useState('')
  const [theme, setTheme] = useState<UserPreferences['theme']>('system')
  const [highContrast, setHighContrast] = useState(false)
  const [fontScale, setFontScale] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name)
    setTheme(preferences.theme)
    setHighContrast(preferences.highContrast)
    setFontScale(preferences.fontScale)
  }, [profile, preferences])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!fullName.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    setError(null)

    const nextPreferences: UserPreferences = {
      ...DEFAULT_USER_PREFERENCES,
      ...preferences,
      theme,
      highContrast,
      fontScale,
      profileSetupComplete: true,
    }

    try {
      await updateProfile(user.id, {
        full_name: fullName.trim(),
        preferences: nextPreferences,
      })
      await refreshProfile()
      navigate(ROUTES.dashboard, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Set up your profile"
      description="Tell us a bit about yourself and your accessibility preferences"
    >
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Theme</legend>
              <div className="flex flex-wrap gap-2">
                {(['light', 'dark', 'system'] as const).map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={theme === value ? 'default' : 'outline'}
                    onClick={() => setTheme(value)}
                    className="capitalize"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </fieldset>

            <label className="flex cursor-pointer items-center gap-3">
              <Checkbox
                checked={highContrast}
                onCheckedChange={(checked) =>
                  setHighContrast(checked === true)
                }
              />
              <span className="text-sm">Enable high contrast mode</span>
            </label>

            <div className="space-y-2">
              <Label htmlFor="fontScale">Text size ({fontScale}x)</Label>
              <input
                id="fontScale"
                type="range"
                min={0.9}
                max={1.4}
                step={0.1}
                value={fontScale}
                onChange={(e) => setFontScale(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Continue to dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
