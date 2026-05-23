import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/utils/constants'

export function ProtectedRoute() {
  const { user, isLoading, isConfigured } = useAuth()
  const location = useLocation()

  if (!isConfigured) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  if (isLoading) {
    return <LoadingSpinner className="min-h-svh" size="lg" />
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return <Outlet />
}

