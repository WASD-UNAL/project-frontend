import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AuthFlowProvider } from './contexts/AuthFlowContext'
import { AuthModalHost } from './components/auth/AuthModalHost'
import { RequireAuth } from './components/auth/RequireAuth'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthFlowProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />
          </Routes>
          <AuthModalHost />
        </AuthFlowProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
