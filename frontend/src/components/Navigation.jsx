import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Navigation() {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  
  const role = (user?.user_type && String(user.user_type).toLowerCase())
    || (user?.role && String(user.role).toLowerCase())
    || (user?.is_superuser ? 'admin' : undefined)
    || (user?.is_staff ? 'staff' : undefined)
    || (user?.is_hr ? 'hr' : undefined)

  const isHRUser = role === 'hr' || role === 'staff'
  const isAdmin = role === 'admin'

  const navItems = []

  // For HR/staff users, only show Login when not authenticated
  if (isHRUser) {
    if (!isAuthenticated) {
      navItems.push({ path: '/login', label: 'Login' })
    }
  } else {
    // For regular applicants and admins, show global navigation
    navItems.push({ path: '/', label: 'Home' })
    navItems.push({ path: '/vacancies', label: 'Vacancies' })
    navItems.push({ path: '/help', label: 'User Guide' })
    navItems.push({ path: '/faq', label: 'How to Apply' })
    
    if (!isAuthenticated) {
      navItems.push({ path: '/login', label: 'Login' })
      navItems.push({ path: '/register', label: 'Register' })
    }
  }

  return (
    <nav className="bg-ncpd-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`py-3 px-4 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'text-white bg-ncpd-secondary border-l-4 border-white'
                  : 'text-white hover:bg-ncpd-secondary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
