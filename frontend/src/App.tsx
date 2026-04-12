import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from '@/lib/apollo'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'

import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'

import { ClientExamListPage } from '@/pages/client/ExamListPage'
import { ProfilePage } from '@/pages/client/ProfilePage'

import { AdminDashboardPage } from '@/pages/admin/DashboardPage'
import { AdminExamListPage } from '@/pages/admin/ExamListPage'
import { UploadExamPage } from '@/pages/admin/UploadExamPage'
import { AdminClientsPage } from '@/pages/admin/ClientsPage'
import { AdminHospitalsPage } from '@/pages/admin/HospitalsPage'

import { HospitalExamListPage } from '@/pages/hospital/ExamListPage'
import { HospitalClientListPage } from '@/pages/hospital/ClientListPage'

function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Client */}
      <Route path="/client/exams" element={
        <RequireAuth roles={['client', 'admin']}>
          <AppLayout><ClientExamListPage /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/client/profile" element={
        <RequireAuth><AppLayout><ProfilePage /></AppLayout></RequireAuth>
      } />

      {/* Admin */}
      <Route path="/admin/dashboard" element={
        <RequireAuth roles={['admin']}>
          <AppLayout><AdminDashboardPage /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/admin/exams" element={
        <RequireAuth roles={['admin']}>
          <AppLayout><AdminExamListPage /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/admin/upload" element={
        <RequireAuth roles={['admin']}>
          <AppLayout><UploadExamPage /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/admin/clients" element={
        <RequireAuth roles={['admin']}>
          <AppLayout><AdminClientsPage /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/admin/hospitals" element={
        <RequireAuth roles={['admin']}>
          <AppLayout><AdminHospitalsPage /></AppLayout>
        </RequireAuth>
      } />

      {/* Hospital */}
      <Route path="/hospital/exams" element={
        <RequireAuth roles={['hospital']}>
          <AppLayout><HospitalExamListPage /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/hospital/clients" element={
        <RequireAuth roles={['hospital']}>
          <AppLayout><HospitalClientListPage /></AppLayout>
        </RequireAuth>
      } />

      {/* Default redirect */}
      <Route path="/" element={
        user ? (
          user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
          user.role === 'hospital' ? <Navigate to="/hospital/exams" replace /> :
          <Navigate to="/client/exams" replace />
        ) : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  )
}
