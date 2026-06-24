import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ScanPage from './pages/ScanPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import { ScanProvider } from './context/ScanContext'
import { loadPersistedUser, saveSession, clearSession } from './authStorage'

function App() {
  const [user, setUser] = useState(() => loadPersistedUser())

  const handleSignIn = (userData, rememberMe = false) => {
    saveSession(userData, rememberMe)
    setUser(userData)
  }

  const handleLogout = () => {
    clearSession()
    setUser(null)
  }

  return (
    <ScanProvider>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard/home" replace />
            ) : (
              <SignInPage onSignIn={handleSignIn} />
            )
          }
        />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected Routes inside Layout */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<Navigate to="/dashboard/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="scan" element={<ScanPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ScanProvider>
  )
}

export default App
