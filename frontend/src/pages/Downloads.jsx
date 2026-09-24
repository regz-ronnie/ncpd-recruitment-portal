import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Download, FileText, Calendar, Building2, User, BookOpen, AlertCircle, LayoutDashboard, Briefcase, GraduationCap, Paperclip, Bell, MessageCircle, Menu, X, LogOut } from 'lucide-react'

export default function Downloads() {
  const { logout } = useAuth()
  const [downloads, setDownloads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    // In a real application, this would fetch from an API
    // For now, we'll use localStorage to simulate data persistence
    const fetchDownloads = () => {
      try {
        const storedDownloads = localStorage.getItem('hr_downloads')
        if (storedDownloads) {
          const parsedDownloads = JSON.parse(storedDownloads)
          // Only show active downloads
          setDownloads(parsedDownloads.filter(d => d.isActive))
        } else {
          // Default downloads if none exist
          const defaultDownloads = [
            {
              id: 1,
              title: 'Application Guidelines',
              description: 'Complete guide on how to apply for positions at NCPD',
              fileType: 'PDF',
              fileSize: '2.5 MB',
              date: '2024-01-15',
              category: 'Application',
              icon: 'FileText',
              fileUrl: '/files/application-guidelines.pdf',
              isActive: true
            },
            {
              id: 2,
              title: 'NCPD Organizational Structure',
              description: 'Information about NCPD departments and organizational hierarchy',
              fileType: 'PDF',
              fileSize: '1.8 MB',
              date: '2024-01-10',
              category: 'Organization',
              icon: 'Building2',
              fileUrl: '/files/organizational-structure.pdf',
              isActive: true
            },
            {
              id: 3,
              title: 'Job Description Templates',
              description: 'Standard job descriptions for various positions',
              fileType: 'PDF',
              fileSize: '3.2 MB',
              date: '2024-01-08',
              category: 'Career',
              icon: 'BookOpen',
              fileUrl: '/files/job-templates.pdf',
              isActive: true
            },
            {
              id: 4,
              title: 'Applicant Profile Form',
              description: 'Blank form for completing your applicant profile',
              fileType: 'PDF',
              fileSize: '1.2 MB',
              date: '2024-01-05',
              category: 'Application',
              icon: 'User',
              fileUrl: '/files/profile-form.pdf',
              isActive: true
            },
            {
              id: 5,
              title: 'Recruitment Process Timeline',
              description: 'Overview of the recruitment and selection process',
              fileType: 'PDF',
              fileSize: '0.8 MB',
              date: '2024-01-03',
              category: 'Process',
              icon: 'Calendar',
              fileUrl: '/files/process-timeline.pdf',
              isActive: true
            },
            {
              id: 6,
              title: 'Code of Conduct',
              description: 'NCPD code of conduct and ethical guidelines',
              fileType: 'PDF',
              fileSize: '2.1 MB',
              date: '2024-01-01',
              category: 'Policy',
              icon: 'FileText',
              fileUrl: '/files/code-of-conduct.pdf',
              isActive: true
            }
          ]
          setDownloads(defaultDownloads)
        }
        setLoading(false)
      } catch (err) {
        setError('Failed to load downloads')
        setLoading(false)
      }
    }

    fetchDownloads()
  }, [])

  const handleDownload = (resource) => {
    if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank')
    } else {
      alert('Download link not available')
    }
  }

  const getIcon = (iconName) => {
    const icons = {
      FileText: FileText,
      Building2: Building2,
      User: User,
      BookOpen: BookOpen,
      Calendar: Calendar
    }
    const Icon = icons[iconName] || FileText
    return <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Application': 'bg-blue-100 text-blue-800',
      'Organization': 'bg-purple-100 text-purple-800',
      'Career': 'bg-green-100 text-green-800',
      'Process': 'bg-orange-100 text-orange-800',
      'Policy': 'bg-red-100 text-red-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading downloads...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Downloads</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
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
                    true 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Downloads' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Download className={`w-5 h-5 ${true ? 'text-white' : 'text-slate-500'}`} />
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
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Downloads</h1>
            <p className="text-xs sm:text-sm text-gray-600">Resources and documents for applicants</p>
          </div>

          <div className="p-3 sm:p-4 lg:p-6">
        {downloads.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {downloads.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-5 lg:p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                      <div className="text-blue-600">
                        {getIcon(resource.icon)}
                      </div>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getCategoryColor(resource.category)}`}>
                      {resource.category}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2">
                    {resource.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4 line-clamp-2">
                    {resource.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{resource.fileType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{resource.fileSize}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatDate(resource.date)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(resource)}
                    className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>

            {/* Additional Information */}
            <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-1 sm:mb-2">
                    Need Additional Documents?
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-800">
                    If you need specific documents that are not available here, please contact the HR department through the chat system or visit the NCPD offices.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 lg:p-12 text-center">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No Downloads Available</h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              There are currently no downloadable resources available. Please check back later.
            </p>
          </div>
        )}
      </div>
        </div>
      </main>
    </div>
  )
}
