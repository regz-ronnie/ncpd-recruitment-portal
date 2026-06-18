import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export function ProtectedRoute({ children, requiredRole = [] }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && requiredRole.length > 0) {
    const role = user?.role || (user?.is_staff ? 'staff' : undefined) || (user?.is_hr ? 'hr' : undefined)
    const allowed = requiredRole.includes(role) || (role === 'staff' && requiredRole.includes('hr'))
    if (!allowed) {
      return <div className="p-8 text-red-600">Access denied</div>
    }
  }

  return children
}
