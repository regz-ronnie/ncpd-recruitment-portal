import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function AdminHeader() {
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Admin Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/recruitment', label: 'Recruitment' },
    { path: '/admin/workflow', label: 'Workflow' },
    { path: '/admin/system', label: 'System' },
  ]

  return (
    <div className="border-b border-slate-200 bg-ncpd-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.30em] text-cyan-300">Admin Console</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">NCPD Administration</h1>
            <p className="mt-1 text-sm text-slate-300">Manage recruitment, users, workflows, and system settings.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-2">
              {adminLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${location.pathname === item.path ? 'bg-cyan-500 text-slate-900' : 'text-slate-200 hover:bg-slate-700 hover:text-white'}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-100"
              >
                <span>{user?.first_name || user?.firstName || 'Admin'}</span>
                <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
                  <div className="px-4 py-4 border-b border-slate-200">
                    <p className="font-semibold">{user?.first_name || user?.email || 'Administrator'}</p>
                    <p className="text-sm text-slate-500">Administrator</p>
                  </div>
                  <div className="flex flex-col gap-1 p-2">
                    <Link
                      to="/admin/users"
                      onClick={() => setProfileOpen(false)}
                      className="rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Manage users
                    </Link>
                    <Link
                      to="/admin/system/settings"
                      onClick={() => setProfileOpen(false)}
                      className="rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      System settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-slate-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHeader
