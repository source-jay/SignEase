import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { GuestRoute } from '@/components/auth/GuestRoute'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { AuthProvider } from '@/contexts/AuthContext'
import { PreferencesProvider } from '@/contexts/PreferencesContext'
import { ChatPage } from '@/pages/ChatPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HelpPage } from '@/pages/HelpPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OfflinePage } from '@/pages/OfflinePage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { SplashPage } from '@/pages/SplashPage'
import { TrainingPage } from '@/pages/TrainingPage'
import { TranslatePage } from '@/pages/TranslatePage'
import { ROUTES } from '@/utils/constants'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PreferencesProvider>
          <Routes>
            <Route path={ROUTES.home} element={<SplashPage />} />
            <Route path={ROUTES.onboarding} element={<OnboardingPage />} />
            <Route path={ROUTES.offline} element={<OfflinePage />} />

            <Route element={<GuestRoute />}>
              <Route path={ROUTES.login} element={<LoginPage />} />
              <Route path={ROUTES.signup} element={<SignUpPage />} />
              <Route
                path={ROUTES.resetPassword}
                element={<ResetPasswordPage />}
              />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path={ROUTES.dashboard} element={<DashboardPage />} />
                <Route path={ROUTES.translate} element={<TranslatePage />} />
                <Route path={ROUTES.history} element={<HistoryPage />} />
                <Route path={ROUTES.profile} element={<ProfilePage />} />
                <Route path={ROUTES.settings} element={<SettingsPage />} />
                <Route path={ROUTES.train} element={<TrainingPage />} />
                <Route path={ROUTES.chat} element={<ChatPage />} />
                <Route path={ROUTES.help} element={<HelpPage />} />
              </Route>
            </Route>

            <Route path={ROUTES.notFound} element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to={ROUTES.notFound} replace />} />
          </Routes>
        </PreferencesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
