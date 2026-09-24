import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export function ProtectedRoute({ children, requiredRole = [] }) {
  const { isAuthenticated, user, isLoading } = useAuth()

  console.log('🛡️ ProtectedRoute state:', { isAuthenticated, isLoading, hasUser: !!user })

  // Show loading state while authentication is being restored from localStorage
  if (isLoading) {
    console.log('⏳ ProtectedRoute: Showing loading state...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ncpd-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if tokens exist in localStorage as a fallback
  const hasToken = localStorage.getItem('access_token') && localStorage.getItem('refresh_token')
  
  if (!isAuthenticated && !hasToken) {
    console.log('🚫 ProtectedRoute: Not authenticated and no tokens, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  if (!isAuthenticated && hasToken) {
    console.log('⚠️ ProtectedRoute: Has tokens but not authenticated yet, showing loading...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ncpd-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Restoring session...</p>
        </div>
      </div>
    )
  }

  // Fix role detection to properly handle Django user_type field
  const role = (user?.user_type && String(user.user_type).toLowerCase())
    || (user?.role && String(user.role).toLowerCase())
    || (user?.is_superuser ? 'admin' : undefined)
    || (user?.is_staff ? 'staff' : undefined)
    || (user?.is_hr ? 'hr' : undefined)
    || 'applicant'

  if (requiredRole && requiredRole.length > 0) {
    const allowed = requiredRole.includes(role) || (role === 'staff' && requiredRole.includes('hr')) || (role === 'admin' && requiredRole.some((r) => ['hr', 'staff', 'admin'].includes(r)))
    if (!allowed) {
      const redirectPath = role === 'admin' ? '/admin/dashboard' : role === 'hr' || role === 'staff' ? '/hr/dashboard' : '/dashboard'
      return <Navigate to={redirectPath} replace />
    }
    return children
  }

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (role === 'hr' || role === 'staff') {
    return <Navigate to="/hr/dashboard" replace />
  }

  return children
}
