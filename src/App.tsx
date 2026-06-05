import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import { useEffect } from 'react'
import Layout from './components/layout/Layout'
import LandingPage from './pages/Landing'
import OnboardingPage from './pages/Onboarding'
import DashboardPage from './pages/Dashboard'
import TodayPage from './pages/Today'
import PlanPage from './pages/Plan'
import InterviewsPage from './pages/Interviews'
import LeadsPage from './pages/Leads'
import CoachPage from './pages/Coach'
import ReviewPage from './pages/Review'
import AdminPage from './pages/Admin'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'

function App() {
  const { initUser, isOnboarded } = useStore()

  useEffect(() => {
    initUser()
  }, [initUser])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isOnboarded ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/onboarding" element={isOnboarded ? <Navigate to="/dashboard" replace /> : <OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/interviews" element={<InterviewsPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
