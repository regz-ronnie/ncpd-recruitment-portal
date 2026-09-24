import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Search, Menu, X, LayoutDashboard, User, Briefcase, FileText, GraduationCap, Paperclip, Bell, Download, MessageSquare, LogOut } from 'lucide-react'

export function CandidateHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/my-profile', label: 'My Profile', icon: User },
    { path: '/vacancies', label: 'Job Vacancies', icon: Briefcase },
    { path: '/my-applications', label: 'Job Applications', icon: FileText },
    { path: '/internships', label: 'Internships', icon: GraduationCap },
    { path: '/attachments', label: 'Attachments', icon: Paperclip },
    { path: '/announcements', label: 'Announcement', icon: Bell },
    { path: '/downloads', label: 'Downloads', icon: Download },
    { path: '/chat', label: 'Chat with Us', icon: MessageSquare },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/vacancies?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="bg-white shadow-md border-b-2 border-[#006633]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full border-2 border-[#006633] bg-white p-1 shadow flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src="/logo.png"
                alt="NCPD logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#006633]">NCPD E-Recruitment Portal</p>
              <p className="text-[10px] text-gray-600">National Council for Population and Development</p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search here..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </form>

          {/* User Info */}
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-[#006633] text-white text-[10px] font-bold uppercase rounded">
                  Candidate Registration
                </span>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-1 py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-[#006633] text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#006633]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
            <li className="ml-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search here..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </form>
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === item.path
                          ? 'bg-[#006633] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
              <li>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}
