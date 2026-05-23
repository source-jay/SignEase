import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

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
  signInWithEmail,
  signInWithGoogle,
} from '@/services/auth'
import { isSupabaseConfigured } from '@/services/supabase'
import { ROUTES } from '@/utils/constants'
import { isValidEmail } from '@/utils/validation'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? null

  const redirectAfterAuth = () => {
    navigate(from ?? ROUTES.dashboard, { replace: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address')
      return
    }
    setEmailError(null)

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.')
      return
    }

    setLoading(true)
    try {
      await signInWithEmail(email, password)
      if (rememberMe) {
        localStorage.setItem('signease_remember_me', 'true')
      } else {
        localStorage.removeItem('signease_remember_me')
      }
      redirectAfterAuth()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
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
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" description="Sign in to your account">
      <SupabaseConfigBanner />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(emailError)}
                placeholder="you@example.com"
              />
              {emailError && (
                <p className="text-sm text-destructive" role="alert">
                  {emailError}
                </p>
              )}
            </div>

            <PasswordInput
              id="password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked === true)
                  }
                />
                Remember me
              </label>
              <Link
                to={ROUTES.resetPassword}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={loading || !isSupabaseConfigured}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Sign in
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

          <GoogleSignInButton onClick={handleGoogle} loading={googleLoading} />

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              to={ROUTES.signup}
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
