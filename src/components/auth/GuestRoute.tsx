import { Navigate, Outlet } from 'react-router-dom'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/utils/constants'

export function GuestRoute() {
  const { user, isLoading, isConfigured } = useAuth()

  if (!isConfigured) {
    return <Outlet />
  }

  if (isLoading) {
    return <LoadingSpinner className="min-h-svh" size="lg" />
  }

  if (user) {
    return (
      <Navigate
        to={ROUTES.dashboard}
        replace
      />
    )
  }

  return <Outlet />
}
