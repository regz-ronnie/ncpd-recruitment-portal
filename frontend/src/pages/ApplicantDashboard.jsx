import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApplications } from '../hooks/useApplications'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, User, Briefcase, FileText, GraduationCap, Paperclip, Bell, Download, MessageCircle, Menu, X, LogOut } from 'lucide-react'

export function ApplicantDashboard() {
  const { user, logout } = useAuth()
  const { applications } = useApplications()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  console.log('Dashboard applications data:', applications)
  console.log('Dashboard applications.data:', applications?.data)
  console.log('Dashboard applications.isLoading:', applications?.isLoading)
  console.log('Dashboard applications.isSuccess:', applications?.isSuccess)
  console.log('Current user:', user)

  // Get user display name
  const getDisplayName = () => {
    if (!user) return 'Applicant'
    const firstName = user.first_name || user.firstName || ''
    const lastName = user.last_name || user.surname || user.lastName || ''
    if (firstName && lastName) return `${firstName} ${lastName}`
    if (firstName) return firstName
    if (lastName) return lastName
    return user.email || 'Applicant'
  }

  // Handle different possible data structures from API
  const applicationsArray = Array.isArray(applications?.data?.data) 
    ? applications.data.data 
    : Array.isArray(applications?.data) 
      ? applications.data 
      : Array.isArray(applications) 
        ? applications 
        : []

  console.log('Processed applications array:', applicationsArray)
  console.log('Array length:', applicationsArray.length)

  const totalApplications = applicationsArray.length
  const underReview = applicationsArray.filter(app => app.status === 'pending' || app.status === 'under_review').length
  const interviewsScheduled = applicationsArray.filter(app => app.status === 'interview_scheduled').length
  const recentApplications = applicationsArray.slice(0, 5)

  const getStatusBadge = (status) => {
    switch(status) {
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'interview_scheduled':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusLabel = (status) => {
    return status?.replace(/_/g, ' ').charAt(0).toUpperCase() + status?.replace(/_/g, ' ').slice(1) || 'Under Review'
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
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Dashboard' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <LayoutDashboard className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
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
                    true 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'My Applications' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <FileText className={`w-5 h-5 ${true ? 'text-white' : 'text-slate-500'}`} />
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
      <main className="flex-1 pt-2 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 bg-gray-100 overflow-x-auto">
        <div className="w-full max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-3 sm:mb-4 md:mb-6">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Applicant Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-600">Welcome, {getDisplayName()}</p>
          </div>

          <div className="p-3 sm:p-4 lg:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-white transform hover:scale-105 transition-transform">
            <h3 className="text-xs sm:text-sm lg:text-lg font-semibold text-blue-100 mb-1 sm:mb-2">
              Applications Submitted
            </h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{totalApplications}</p>
            <p className="text-blue-100 text-[10px] sm:text-xs lg:text-sm mt-0.5 sm:mt-1">Total applications</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-white transform hover:scale-105 transition-transform">
            <h3 className="text-xs sm:text-sm lg:text-lg font-semibold text-orange-100 mb-1 sm:mb-2">
              Under Review
            </h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{underReview}</p>
            <p className="text-orange-100 text-[10px] sm:text-xs lg:text-sm mt-0.5 sm:mt-1">Applications in progress</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 text-white col-span-2 sm:col-span-1 transform hover:scale-105 transition-transform">
            <h3 className="text-xs sm:text-sm lg:text-lg font-semibold text-purple-100 mb-1 sm:mb-2">
              Interviews Scheduled
            </h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{interviewsScheduled}</p>
            <p className="text-purple-100 text-[10px] sm:text-xs lg:text-sm mt-0.5 sm:mt-1">Upcoming interviews</p>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-3 sm:p-4 lg:p-6">
          <div className="flex justify-between items-center mb-2 sm:mb-3 lg:mb-4">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900">
              Recent Applications
            </h2>
            <button 
              onClick={() => window.location.reload()}
              className="text-xs sm:text-sm text-ncpd-primary hover:text-ncpd-secondary transition-colors"
            >
              Refresh
            </button>
          </div>

          {applications.isLoading ? (
            <div className="text-center py-6 sm:py-8 lg:py-12">
              <p className="text-slate-500 text-xs sm:text-sm lg:text-base">Loading applications...</p>
            </div>
          ) : applicationsArray.length > 0 ? (
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              {applicationsArray.slice(0, 5).map((app, index) => (
                <div key={app.id || index} className="bg-slate-50 p-2.5 sm:p-3 lg:p-4 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1.5 sm:gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900 text-xs sm:text-sm lg:text-base truncate">{app.job?.title || app.position || 'Position'}</h3>
                      <p className="text-slate-600 text-[10px] sm:text-xs lg:text-sm">
                        Applied on {app.applied_date ? new Date(app.applied_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date(app.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`${getStatusBadge(app.status)} px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap self-start sm:self-auto`}>
                      {getStatusLabel(app.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 lg:py-12">
              <p className="text-slate-500 text-xs sm:text-sm lg:text-base">
                {applications.isLoading ? 'Loading applications...' : 'No applications yet'}
              </p>
              <Link to="/vacancies" className="text-ncpd-primary hover:text-ncpd-secondary text-[10px] sm:text-xs lg:text-sm font-medium mt-1.5 sm:mt-2 inline-block transition-colors">
                Start applying to positions
              </Link>
              <div className="mt-4 text-[10px] sm:text-xs text-slate-400">
                <p>Debug info: Array length: {applicationsArray.length}</p>
                <p>IsLoading: {applications.isLoading ? 'Yes' : 'No'}</p>
                <p>IsSuccess: {applications.isSuccess ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
          <Link
            to="/my-applications"
            className="bg-ncpd-primary text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg hover:bg-ncpd-secondary transition-colors text-center text-xs sm:text-sm lg:text-base"
          >
            View All Applications
          </Link>
          <Link
            to="/vacancies"
            className="bg-blue-600 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors text-center text-xs sm:text-sm lg:text-base"
          >
            Browse More Jobs
          </Link>
        </div>
          </div>
        </div>
      </main>
    </div>
  )
}
