import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)

  const role = (user?.user_type && String(user.user_type).toLowerCase())
    || (user?.role && String(user.role).toLowerCase())
    || (user?.is_staff ? 'staff' : undefined)
    || (user?.is_hr ? 'hr' : undefined)

  const isHRUser = role === 'hr' || role === 'staff'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = []

  // For HR/staff users, only show Login when not authenticated
  if (isHRUser) {
    if (!isAuthenticated) {
      navItems.push({ path: '/login', label: 'Login' })
    }
  } else {
    // For regular applicants, show full navigation
    navItems.push({ path: '/', label: 'Home' })
    navItems.push({ path: '/vacancies', label: 'Vacancies' })
    navItems.push({ path: '/help', label: 'User Guide' })
    navItems.push({ path: '/faq', label: 'How to Apply' })
    
    if (!isAuthenticated) {
      navItems.push({ path: '/login', label: 'Login' })
      navItems.push({ path: '/register', label: 'Register' })
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-ncpd-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full border-3 border-white bg-white p-1 shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src="/logo.png"
                alt="NCPD logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="block">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.32em] font-semibold">NCPD E-Recruitment Portal</p>
              <p className="text-[8px] sm:text-[10px] opacity-90">National Council for Population and Development</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-white border-b-2 border-white'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-ncpd-primary">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </span>
                  <span>{user?.firstName}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/20 bg-white text-gray-900 shadow-2xl z-50">
                    <div className="px-4 py-4 border-b border-gray-200">
                      <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="space-y-1 px-2 py-2">
                        {!isHRUser && (
                        <>
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Dashboard
                          </Link>
                          <Link
                            to="/my-profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            My Profile
                          </Link>
                          <Link
                            to="/my-applications"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            My Applications
                          </Link>
                        </>
                      )}
                      {isHRUser && (
                        <>
                          <Link
                            to="/hr/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            HR Dashboard
                          </Link>
                          <Link
                            to="/hr/settings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Settings
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => {
                          handleLogout()
                          setProfileDropdownOpen(false)
                        }}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-ncpd-secondary bg-opacity-95">
          <div className="flex flex-row flex-wrap items-center justify-center gap-1 px-2 py-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white w-fit"
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 w-fit"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-ncpd-primary mr-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </span>
                  <span>{user?.firstName}</span>
                  <svg className="h-3 w-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/20 bg-white text-gray-900 shadow-2xl z-50">
                    <div className="px-4 py-4 border-b border-gray-200">
                      <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="space-y-1 px-2 py-2">
                      {!isHRUser && (
                        <>
                          <Link
                            to="/dashboard"
                            onClick={() => {
                              setProfileDropdownOpen(false)
                              setMobileMenuOpen(false)
                            }}
                            className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Dashboard
                          </Link>
                          <Link
                            to="/my-profile"
                            onClick={() => {
                              setProfileDropdownOpen(false)
                              setMobileMenuOpen(false)
                            }}
                            className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            My Profile
                          </Link>
                          <Link
                            to="/my-applications"
                            onClick={() => {
                              setProfileDropdownOpen(false)
                              setMobileMenuOpen(false)
                            }}
                            className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            My Applications
                          </Link>
                        </>
                      )}
                      {isHRUser && (
                        <>
                          <Link
                            to="/hr/dashboard"
                            onClick={() => {
                              setProfileDropdownOpen(false)
                              setMobileMenuOpen(false)
                            }}
                            className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            HR Dashboard
                          </Link>
                          <Link
                            to="/hr/settings"
                            onClick={() => {
                              setProfileDropdownOpen(false)
                              setMobileMenuOpen(false)
                            }}
                            className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Settings
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => {
                          handleLogout()
                          setProfileDropdownOpen(false)
                          setMobileMenuOpen(false)
                        }}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
