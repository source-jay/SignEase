import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { SupabaseConfigBanner } from '@/components/auth/SupabaseConfigBanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  signInWithGoogle,
  signUpWithEmail,
} from '@/services/auth'
import { isSupabaseConfigured } from '@/services/supabase'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/lib/utils'
import {
  getPasswordStrength,
  isValidEmail,
  passwordsMatch,
} from '@/utils/validation'

const strengthColors: Record<string, string> = {
  weak: 'bg-destructive',
  fair: 'bg-amber-500',
  good: 'bg-primary',
  strong: 'bg-secondary',
}

export function SignUpPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const strength = useMemo(() => getPasswordStrength(password), [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!passwordsMatch(password, confirmPassword)) {
      setError('Passwords do not match')
      return
    }
    if (!termsAccepted) {
      setError('You must accept the terms of service')
      return
    }
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.')
      return
    }

    setLoading(true)
    try {
      const { session } = await signUpWithEmail(email, password, fullName)
      if (session) {
        navigate(ROUTES.dashboard, { replace: true })
      } else {
        setSuccess(
          'Check your email to confirm your account, then sign in.',
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.')
      return
    }
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-up failed')
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout title="Create account" description="Join SignEase today">
      <SupabaseConfigBanner />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                placeholder="Jane Doe"
              />
            </div>

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

            <div className="space-y-2">
              <PasswordInput
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />
              {password && (
                <div className="space-y-1">
                  <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full transition-all',
                        strengthColors[strength],
                      )}
                      style={{
                        width:
                          strength === 'weak'
                            ? '25%'
                            : strength === 'fair'
                              ? '50%'
                              : strength === 'good'
                                ? '75%'
                                : '100%',
                      }}
                    />
                  </div>
                  <p className="text-xs capitalize text-muted-foreground">
                    Strength: {strength}
                  </p>
                </div>
              )}
            </div>

            <PasswordInput
              id="confirmPassword"
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              error={
                confirmPassword && !passwordsMatch(password, confirmPassword)
                  ? 'Passwords do not match'
                  : undefined
              }
            />

            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(checked === true)
                }
                className="mt-0.5"
              />
              <span>
                I agree to the{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() =>
                    window.alert(
                      'Terms of service will be available in a future update.',
                    )
                  }
                >
                  Terms of Service
                </button>
              </span>
            </label>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-secondary" role="status">
                {success}
              </p>
            )}

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={loading || !isSupabaseConfigured}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Create account
            </Button>
          </form>

          <div className="relative py-2">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </span>
            <span className="relative flex justify-center text-xs uppercase text-muted-foreground">
              or
            </span>
          </div>

          <GoogleSignInButton
            onClick={handleGoogle}
            loading={googleLoading}
            label="Sign up with Google"
          />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to={ROUTES.login}
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
