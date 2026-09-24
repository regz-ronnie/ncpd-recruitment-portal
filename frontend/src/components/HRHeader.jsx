import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

export function HRHeader({ onRunAIMatching, onAutoShortlist, onRefresh }) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)
  const mobileDropdownRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/hr/vacancies', label: 'Vacancies', icon: Briefcase },
    { path: '/hr/applications', label: 'Applications', icon: FileText },
    { path: '/hr/interviews', label: 'Interviews', icon: Calendar },
    { path: '/hr/candidates', label: 'Candidates', icon: Users },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleMobileMenuOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-menu-container') && !event.target.closest('[aria-label="Toggle menu"]')) {
        setMobileMenuOpen(false)
        setProfileDropdownOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleMobileMenuOutside)
      return () => {
        document.removeEventListener('mousedown', handleMobileMenuOutside)
      }
    }
  }, [mobileMenuOpen])

  return (
    <header className="bg-ncpd-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link to="/hr/dashboard" className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full border-3 border-white bg-white p-1 shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src="/logo.png"
                alt="NCPD logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm uppercase tracking-[0.32em] font-semibold">NCPD E-Recruitment Portal</p>
              <p className="text-xs opacity-90">National Council for Population and Development</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen)
                if (!mobileMenuOpen) {
                  setProfileDropdownOpen(false)
                }
              }}
              className="md:hidden inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 p-3 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 transition-transform duration-300" />
              ) : (
                <Menu className="h-6 w-6 transition-transform duration-300" />
              )}
            </button>

            {/* Profile Dropdown - Desktop Only */}
            {isAuthenticated && (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all duration-200 hover:bg-white/20"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-900 font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                  <span className="hidden sm:inline font-medium">{user?.firstName}</span>
                  <svg className={`h-4 w-4 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl z-50 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
                      <p className="font-semibold text-white text-lg">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-white/90">{user?.email}</p>
                      <p className="text-xs text-white/80 mt-1 font-medium">HR Staff</p>
                    </div>
                    <div className="space-y-1 px-2 py-3">
                      <Link
                        to="/hr/register"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                      >
                        <Users className="w-4 h-4" />
                        Register HR/Staff
                      </Link>
                      <Link
                        to="/hr/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={() => {
                          handleLogout()
                          setProfileDropdownOpen(false)
                        }}
                        className="flex items-center gap-3 w-full rounded-lg px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu - Horizontal Navigation Below Logo */}
        <div
          className={`md:hidden mobile-menu-container overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-white/20 bg-gradient-to-b from-ncpd-primary to-ncpd-secondary">
            <div className="px-4 py-4">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                {/* Navigation Items */}
                {navItems.map((item, index) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setProfileDropdownOpen(false)
                      }}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white shadow-lg'
                          : 'text-white/90 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                
                {/* Profile Dropdown in Mobile Menu */}
                {isAuthenticated && (
                  <div className="relative flex-shrink-0" ref={mobileDropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2 py-1.5 text-[10px] text-white transition-all duration-200 hover:bg-white/20"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-900 font-semibold text-[9px]">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                      <span className="font-medium truncate max-w-[60px]">{user?.firstName}</span>
                      <svg className={`h-2.5 w-2.5 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl z-[100] overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2">
                          <p className="font-semibold text-white text-xs">{user?.firstName} {user?.lastName}</p>
                          <p className="text-[10px] text-white/90 truncate">{user?.email}</p>
                          <p className="text-[10px] text-white/80 mt-0.5 font-medium">HR Staff</p>
                        </div>
                        <div className="space-y-1 px-2 py-2">
                          <Link
                            to="/hr/register"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                          >
                            <Users className="w-3 h-3" />
                            Register HR/Staff
                          </Link>
                          <Link
                            to="/hr/settings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                          >
                            <Settings className="w-3 h-3" />
                            Settings
                          </Link>
                          <div className="border-t border-gray-200 my-2"></div>
                          <button
                            onClick={() => {
                              handleLogout()
                              setProfileDropdownOpen(false)
                            }}
                            className="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-left text-[10px] text-red-600 hover:bg-red-50 transition-all duration-200"
                          >
                            <LogOut className="w-3 h-3" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
