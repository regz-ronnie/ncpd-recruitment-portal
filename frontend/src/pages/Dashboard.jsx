import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useApplications } from '../hooks/useApplications'
import { useJobs } from '../hooks/useJobs'
import { LayoutDashboard, User, Briefcase, FileText, GraduationCap, Paperclip, Bell, Download, MessageCircle, Search, FileCheck, Clock, CalendarCheck, UserCheck, Menu, X, Edit, LogOut } from 'lucide-react'

export function Dashboard() {
  const { user, isAuthenticated, profileCompletion, checkProfileCompletion, getSectionCompletion, logout } = useAuth()
  const { applications } = useApplications()
  const { jobs } = useJobs()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user && isAuthenticated) {
      checkProfileCompletion(100)
    }
  }, [user, isAuthenticated])

  const role = (user?.user_type && String(user.user_type).toLowerCase())
    || (user?.role && String(user.role).toLowerCase())
    || (user?.is_superuser ? 'admin' : undefined)
    || (user?.is_staff ? 'staff' : undefined)
    || (user?.is_hr ? 'hr' : undefined)
  const isHRUser = role === 'hr' || role === 'staff'

  // Get user display name
  const getDisplayName = () => {
    if (!user) return 'User'
    const firstName = user.first_name || user.firstName || ''
    const lastName = user.last_name || user.surname || user.lastName || ''
    if (firstName && lastName) return `${firstName} ${lastName}`
    if (firstName) return firstName
    if (lastName) return lastName
    return user.email || 'User'
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h1>
          <p className="text-gray-600 mb-8">You need to be authenticated to view your dashboard.</p>
          <Link 
            to="/login" 
            className="bg-ncpd-primary text-white px-6 py-3 rounded-lg hover:bg-ncpd-secondary transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-200px)] relative">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <div className="md:hidden bg-gray-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <span className="font-semibold text-sm">Menu</span>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-white hover:bg-gray-700 rounded p-1"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-64 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} bg-white border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto transition-transform duration-300 md:transition-none`}>
        
        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end p-2 border-b border-gray-200">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Collapse Button */}
        <div className="hidden md:flex justify-end p-2">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="p-3 space-y-1">
          <ul className="space-y-1">
              <li>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    true 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Dashboard' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <LayoutDashboard className={`w-5 h-5 ${true ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Dashboard</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/my-profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'My Profile' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <User className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>My Profile</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/vacancies"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Job Vacancies' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Briefcase className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Job Vacancies</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/my-applications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'My Applications' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <FileText className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>My Applications</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/internships"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Internships' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <GraduationCap className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Internships</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/attachments"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Attachments' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Paperclip className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Attachments</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/announcements"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Announcements' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Bell className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Announcements</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/downloads"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Downloads' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Download className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Downloads</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Chat with Us' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <MessageCircle className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Chat with Us</span>
                  </div>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm text-slate-700 hover:bg-slate-50 hover:text-[#006633] ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Logout' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <LogOut className="w-5 h-5 text-slate-500" />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Logout</span>
                  </div>
                </button>
              </li>
            </ul>
          </div>


      </aside>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 bg-gray-100 overflow-x-auto">
        <div className="w-full max-w-[1400px] mx-auto">
          {/* Welcome Section */}
          <div className="mb-3 sm:mb-4 md:mb-6">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
              Welcome to the E-Recruitment Portal Dashboard
            </h1>
            
            {/* User Info */}
            <div className="mt-3 sm:mt-4 bg-white rounded-lg shadow-sm p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#006633] rounded-full flex items-center justify-center text-white font-bold">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{getDisplayName()}</p>
                    <p className="text-xs text-gray-600">Today, {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Profile Completion</p>
                  <p className="text-sm font-bold text-[#006633]">{profileCompletion}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-blue-100">Total Applications</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {(() => {
                      const appsArray = Array.isArray(applications?.data?.data) 
                        ? applications.data.data 
                        : Array.isArray(applications?.data) 
                          ? applications.data 
                          : Array.isArray(applications) 
                            ? applications 
                            : []
                      console.log('Dashboard applications array:', appsArray)
                      return appsArray.length
                    })()}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg hidden sm:block">
                  <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-blue-100 mt-2">All time applications</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-orange-100">Pending Review</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {(() => {
                      const appsArray = Array.isArray(applications?.data?.data) 
                        ? applications.data.data 
                        : Array.isArray(applications?.data) 
                          ? applications.data 
                          : Array.isArray(applications) 
                            ? applications 
                            : []
                      return appsArray.filter(app => app.status === 'pending' || app.status === 'under_review').length
                    })()}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg hidden sm:block">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-orange-100 mt-2">Awaiting response</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-purple-100">Interviews Scheduled</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {(() => {
                      const appsArray = Array.isArray(applications?.data?.data) 
                        ? applications.data.data 
                        : Array.isArray(applications?.data) 
                          ? applications.data 
                          : Array.isArray(applications) 
                            ? applications 
                            : []
                      return appsArray.filter(app => app.status === 'interview_scheduled').length
                    })()}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg hidden sm:block">
                  <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-purple-100 mt-2">Upcoming interviews</p>
            </div>
            
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-md p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-teal-100">Profile Completion</p>
                  <p className="text-2xl sm:text-3xl font-bold">{profileCompletion}%</p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg hidden sm:block">
                  <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-teal-100 mt-2">Profile status</p>
            </div>
          </div>

          {/* Available Vacancies Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Available Vacancies</h2>
              <Link to="/vacancies" className="text-[#006633] hover:text-[#004d26] text-xs sm:text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="p-4 sm:p-6">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search vacancies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
              
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Job Reference</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Designation</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employment Type</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Positions</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Deadline</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Job Grade</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Apply</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(() => {
                      const jobResults = Array.isArray(jobs?.data)
                        ? jobs.data
                        : jobs?.data?.results || []
                      
                      const filteredJobs = jobResults
                        .filter(job => 
                          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.job_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.location?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .slice(0, 5)
                      
                      return filteredJobs.length > 0 ? (
                        filteredJobs.map((job, index) => (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{index + 1}</td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{job.job_reference || 'N/A'}</td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">{job.title}</td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{job.get_employment_type_display || job.employment_type || 'N/A'}</td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{job.positions || 1}</td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                              {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : 'N/A'}
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{job.job_grade || 'N/A'}</td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm">
                              <Link to={`/vacancies/${job.id}`} className="bg-[#006633] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium hover:bg-[#004d26] transition-colors">
                                Apply
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-4 py-8 text-center text-xs sm:text-sm text-gray-500">
                            {jobs?.isLoading ? 'Loading vacancies...' : 'No vacancies available'}
                          </td>
                        </tr>
                      )
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Recent Applications */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-[#006633] to-[#008044] flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-semibold text-white">Recent Applications</h2>
                <Link to="/my-applications" className="text-white hover:text-gray-100 text-xs sm:text-sm font-medium transition-colors">
                  View All
                </Link>
              </div>
              <div className="p-4 sm:p-6">
                {(() => {
                  const appsArray = Array.isArray(applications?.data?.data) 
                    ? applications.data.data 
                    : Array.isArray(applications?.data) 
                      ? applications.data 
                      : Array.isArray(applications) 
                        ? applications 
                        : []
                  
                  return appsArray.length > 0 ? (
                    <div className="space-y-3">
                      {appsArray.slice(0, 5).map((app, index) => (
                        <div key={app.id || index} className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-[#006633]/20 transition-all duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-start space-x-4 flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#006633] to-[#008044] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                                <Briefcase className="text-white w-5 h-5" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate group-hover:text-[#006633] transition-colors">
                                {app.job?.title || app.job_title || app.position || 'Position'}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500 whitespace-nowrap">
                                  Applied {new Date(app.applied_date || app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                {app.job?.job_reference && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <p className="text-xs text-gray-500 whitespace-nowrap">{app.job.job_reference}</p>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${
                                app.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                                app.status === 'accepted' ? 'bg-green-50 text-green-700 border border-green-200' :
                                app.status === 'interview_scheduled' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {app.status?.replace(/_/g, ' ').charAt(0).toUpperCase() + app.status?.replace(/_/g, ' ').slice(1) || 'Under Review'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <FileText className="text-gray-400 w-8 h-8" />
                      </div>
                      <p className="text-gray-600 text-sm font-medium mb-2">No applications yet</p>
                      <p className="text-gray-400 text-xs mb-4">Start your journey by applying to available positions</p>
                      <Link 
                        to="/vacancies" 
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#006633] to-[#008044] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:from-[#004d26] hover:to-[#006633] transition-all duration-300"
                      >
                        Browse Vacancies
                      </Link>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-[#006633] to-[#008044]">
                  <h2 className="text-base sm:text-lg font-semibold text-white">Quick Actions</h2>
                </div>
                <div className="p-4 sm:p-6 grid grid-cols-2 gap-3">
                  <Link 
                    to="/vacancies" 
                    className="group flex flex-col items-center justify-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-[#006633]/30 hover:shadow-md transition-all duration-300 text-center"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#006633] to-[#008044] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform mb-2">
                      <Search className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-[#006633] transition-colors">Browse Vacancies</span>
                  </Link>
                  <Link 
                    to="/my-profile" 
                    className="group flex flex-col items-center justify-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-[#006633]/30 hover:shadow-md transition-all duration-300 text-center"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#006633] to-[#008044] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform mb-2">
                      <Edit className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-[#006633] transition-colors">Edit Profile</span>
                  </Link>
                  <Link 
                    to="/attachments" 
                    className="group flex flex-col items-center justify-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-[#006633]/30 hover:shadow-md transition-all duration-300 text-center"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#006633] to-[#008044] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform mb-2">
                      <Paperclip className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-[#006633] transition-colors">Manage Documents</span>
                  </Link>
                  <Link 
                    to="/announcements" 
                    className="group flex flex-col items-center justify-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-[#006633]/30 hover:shadow-md transition-all duration-300 text-center"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#006633] to-[#008044] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform mb-2">
                      <Bell className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-[#006633] transition-colors">View Announcements</span>
                  </Link>
                </div>
              </div>

              {/* Announcements */}
              <div className="bg-gradient-to-br from-[#006633] to-[#008044] rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 sm:px-6 py-4 bg-white/10 backdrop-blur-sm">
                  <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    Latest News
                  </h2>
                </div>
                <div className="p-4 sm:p-6 grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/15 transition-colors">
                    <p className="text-xs sm:text-sm text-white font-semibold">New vacancies available</p>
                    <p className="text-xs text-white/80 mt-1">Check out our latest job openings</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/15 transition-colors">
                    <p className="text-xs sm:text-sm text-white font-semibold">Profile completion reminder</p>
                    <p className="text-xs text-white/80 mt-1">Complete your profile for better chances</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}