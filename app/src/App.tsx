import { Route, Routes } from 'react-router-dom'

import { AppShell } from '@/layouts/AppShell'
import { BrowsePage } from '@/pages/BrowsePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HomePage } from '@/pages/HomePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/browse" element={<BrowsePage />} />
      </Route>
    </Routes>
  )
}

export default App
