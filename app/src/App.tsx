import { Navigate, Route, Routes } from 'react-router-dom'

import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireNotOnboarded } from '@/components/auth/RequireNotOnboarded'
import { RequireOnboarded } from '@/components/auth/RequireOnboarded'
import { useSessionExpiryRedirect } from '@/hooks/useSessionExpiryRedirect'
import { AppShell } from '@/layouts/AppShell'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { BrowsePage } from '@/pages/BrowsePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { SettingsPage } from '@/pages/SettingsPage'

function App() {
  useSessionExpiryRedirect()

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route element={<AppShell />}>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<RequireNotOnboarded />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Route>
          <Route element={<RequireOnboarded />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
