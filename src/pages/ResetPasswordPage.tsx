import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { SupabaseConfigBanner } from '@/components/auth/SupabaseConfigBanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendPasswordReset } from '@/services/auth'
import { isSupabaseConfigured, supabase } from '@/services/supabase'
import { ROUTES } from '@/utils/constants'
import { isValidEmail, passwordsMatch } from '@/utils/validation'

type Mode = 'request' | 'update'

export function ResetPasswordPage() {
  const [mode, setMode] = useState<Mode>('request')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setMode('update')
        }
      },
    )

    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setMode('update')
    }

    return () => subscription.unsubscribe()
  }, [])

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!isValidEmail(email)) {
      setError('Enter a valid email address')
      return
    }
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.')
      return
    }

    setLoading(true)
    try {
      await sendPasswordReset(email)
      setMessage(
        'If an account exists for this email, you will receive a reset link shortly.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset link')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!passwordsMatch(password, confirmPassword)) {
      setError('Passwords do not match')
      return
    }
    if (!supabase) {
      setError('Supabase is not configured.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })
      if (updateError) throw updateError
      setMessage('Password updated. You can now sign in with your new password.')
      setMode('request')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={mode === 'request' ? 'Reset password' : 'Set new password'}
      description={
        mode === 'request'
          ? 'We will email you a link to reset your password'
          : 'Choose a strong new password for your account'
      }
    >
      <SupabaseConfigBanner />
      <Card>
        <CardContent className="space-y-4 pt-6">
          {mode === 'request' ? (
            <form onSubmit={handleSendLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className="text-sm text-secondary" role="status">
                  {message}
                </p>
              )}
              <Button
                type="submit"
                className="h-11 w-full"
                disabled={loading || !isSupabaseConfigured}
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                Send reset link
              </Button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <PasswordInput
                id="new-password"
                label="New password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />
              <PasswordInput
                id="confirm-new-password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className="text-sm text-secondary" role="status">
                  {message}
                </p>
              )}
              <Button type="submit" className="h-11 w-full" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Update password
              </Button>
            </form>
          )}

          <p className="text-center text-sm">
            <Link
              to={ROUTES.login}
              className="font-medium text-primary hover:underline"
            >
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
