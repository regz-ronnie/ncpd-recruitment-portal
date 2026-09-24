import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useJobs } from '../hooks/useJobs'
import { useAuth } from '../contexts/AuthContext'
import { useApplications } from '../hooks/useApplications'
import { X, LayoutDashboard, User, Briefcase, FileText, GraduationCap, Paperclip, Bell, Download, MessageCircle, Menu, LogOut } from 'lucide-react'

export function JobListings() {
  const { jobs } = useJobs()
  const navigate = useNavigate()
  const { isAuthenticated, isProfileComplete, checkProfileCompletion, user, logout } = useAuth()
  const { submitApplication, applications } = useApplications()
  const [activeTab, setActiveTab] = useState('open')
  const [showBanner, setShowBanner] = useState(true)
  const [subTab, setSubTab] = useState('active')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

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

  const fallbackJobs = [
    /*{
      id: 1,
      title: 'Senior Research Scientist - Turkana County (Kakuma/Kalobeyei)',
      department: 'Research Division',
      location: 'Turkana County',
      employment_type: 'Contract',
      description: 'Conduct research studies and analyze population data for policy development.',
      requirements: 'Bachelor\'s degree in statistics, economics, sociology, or related field.',
      application_deadline: '2026-07-29',
      job_grade: 'NCPD 05',
      positions: 1,
      job_reference: 'VN00993',
      is_urgent: true,
      is_featured: true,
    },
    {
      id: 2,
      title: 'Research Scientist - Turkana County (Kakuma/Kalobeyei)',
      department: 'Research Division',
      location: 'Turkana County',
      employment_type: 'Contract',
      description: 'Support research, data collection, and reporting for population programmes.',
      requirements: 'Bachelor\'s degree in statistics, economics, sociology, or related field.',
      application_deadline: '2026-07-29',
      job_grade: 'NCPD 06',
      positions: 1,
      job_reference: 'VN00994',
      is_urgent: false,
      is_featured: true,
    },
    {
      id: 3,
      title: 'Biostatistician - Turkana County (Kakuma/Kalobeyei)',
      department: 'Research Division',
      location: 'Turkana County',
      employment_type: 'Contract',
      description: 'Provide statistical analysis for research studies and population programs.',
      requirements: 'Master\'s degree in biostatistics or related field with 3 years experience.',
      application_deadline: '2026-07-29',
      job_grade: 'NCPD 06',
      positions: 1,
      job_reference: 'VN00995',
      is_urgent: false,
      is_featured: false,
    },
    {
      id: 4,
      title: 'Community Liaison Officer - Turkana County (Kakuma/Kalobeyei)',
      department: 'Community Engagement',
      location: 'Turkana County',
      employment_type: 'Contract',
      description: 'Facilitate community engagement and liaison for research programs.',
      requirements: 'Bachelor\'s degree in social sciences or community development.',
      application_deadline: '2026-07-29',
      job_grade: 'NCPD 07',
      positions: 1,
      job_reference: 'VN00996',
      is_urgent: false,
      is_featured: false,
    },
    {
      id: 5,
      title: 'Clinical Research Scientist - Kisumu',
      department: 'Clinical Research',
      location: 'Kisumu',
      employment_type: 'Contract',
      description: 'Lead clinical research studies and coordinate with healthcare facilities.',
      requirements: 'Medical degree with research experience. Minimum 5 years in clinical research.',
      application_deadline: '2026-08-09',
      job_grade: 'NCPD 05',
      positions: 1,
      job_reference: 'VN00997',
      is_urgent: true,
      is_featured: true,
    },*/
  ]

  const jobResults = Array.isArray(jobs?.data)
    ? jobs.data
    : jobs?.data?.results || []
  const displayedJobs = jobResults.length > 0 ? jobResults : fallbackJobs

  // Filter jobs based on active tab and sub-tab
  const filteredJobs = displayedJobs.filter(job => {
    const isInternship = job.is_internship || job.employment_type?.toLowerCase().includes('internship') || false
    const isClosed = job.status === 'closed' || job.status === 'Closed' || false
    const typeLower = job.employment_type?.toLowerCase() || ''
    
    // Main tab filtering
    if (activeTab === 'open') {
      // Sub-tab filtering
      if (subTab === 'active') {
        return !isClosed && !isInternship
      } else if (subTab === 'closed') {
        return isClosed && !isInternship
      } else if (subTab === 'contract') {
        return typeLower.includes('contract') && !isInternship
      } else if (subTab === 'full-time') {
        return (typeLower.includes('permanent') || typeLower.includes('pensionable') || typeLower.includes('full-time') || typeLower.includes('full time')) && !isInternship
      } else if (subTab === 'internships') {
        return isInternship
      }
      return !isClosed && !isInternship
    } else if (activeTab === 'closed') {
      return isClosed && !isInternship
    } else if (activeTab === 'applied') {
      const appliedJobIds = applications?.data?.data?.map(app => app.job?.id) || 
                            applications?.data?.map(app => app.job?.id) || []
      return appliedJobIds.includes(job.id) && !isInternship
    } else if (activeTab === 'internships') {
      return isInternship
    }
    return true
  })

  const handleApplyClick = (jobId) => {
    console.log('Apply click check:', { isAuthenticated, isProfileComplete: isProfileComplete(100), user })
    
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/vacancies` } })
      return
    }

    if (!isProfileComplete(100)) {
      // Clear existing attachments and navigate to profile to upload new ones
      localStorage.setItem('clearAttachmentsOnLoad', 'true')
      navigate('/my-profile', { 
        state: { 
          redirectTo: `/vacancies`,
          clearAttachments: true,
          vacancyId: jobId
        } 
      })
      return
    }

    // Check if already applied
    const applicationsArray = Array.isArray(applications?.data?.data) 
      ? applications.data.data 
      : Array.isArray(applications?.data) 
        ? applications.data 
        : Array.isArray(applications) 
          ? applications 
          : []
    
    const hasAlreadyApplied = applicationsArray.some(
      application => {
        const jobIdNum = parseInt(jobId)
        // Check both possible structures
        const applicationJobId = application.job?.id || application.job
        return applicationJobId === jobIdNum
      }
    )

    if (hasAlreadyApplied) {
      alert('You have already applied for this position. Check your applications page for status updates.')
      navigate('/my-applications')
      return
    }

    // Clear existing attachments and navigate to profile to upload new ones
    localStorage.setItem('clearAttachmentsOnLoad', 'true')
    navigate('/my-profile', { 
      state: { 
        redirectTo: `/vacancies`,
        clearAttachments: true,
        vacancyId: jobId
      } 
    })
  }

  const hasAppliedToJob = (jobId) => {
    const applicationsArray = Array.isArray(applications?.data?.data) 
      ? applications.data.data 
      : Array.isArray(applications?.data) 
        ? applications.data 
        : Array.isArray(applications) 
          ? applications 
          : []
    
    return applicationsArray.some(
      application => {
        const jobIdNum = parseInt(jobId)
        const applicationJobId = application.job?.id || application.job
        return applicationJobId === jobIdNum
      }
    )
  }

  const getAppliedJobs = () => {
    console.log('Full applications object:', applications)
    console.log('Applications status:', applications?.status)
    console.log('Applications isLoading:', applications?.isLoading)
    
    const applicationsArray = Array.isArray(applications?.data?.data) 
      ? applications.data.data 
      : Array.isArray(applications?.data) 
        ? applications.data 
        : Array.isArray(applications) 
          ? applications 
          : []
    
    console.log('Applications array:', applicationsArray)
    console.log('Applications array length:', applicationsArray.length)
    if (applicationsArray.length > 0) {
      console.log('First application data structure:', applicationsArray[0])
    }
    
    // Return applications with their job details
    // Handle both nested job object and flat structure
    return applicationsArray.map(app => {
      const jobData = app.job || {}
      return {
        id: jobData.id || app.id,
        title: jobData.title || app.job_title,
        job_reference: jobData.job_reference || jobData.reference,
        employment_type: jobData.employment_type || jobData.type,
        positions: jobData.positions || jobData.position_count,
        application_deadline: jobData.application_deadline || jobData.deadline,
        job_grade: jobData.job_grade || jobData.grade,
        application_status: app.status,
        application_id: app.id,
        applied_date: app.created_at || app.applied_date,
        ...jobData
      }
    })
  }

  const handleConfirmApplication = async () => {
    if (!selectedJob) return
    
    setIsSubmitting(true)
    try {
      const applicationData = {
        jobId: selectedJob.id,
        cover_letter: `I am applying for the position of ${selectedJob.title}. My profile contains all my qualifications and experience.`
      }

      console.log('Submitting application:', applicationData)
      console.log('User authenticated:', isAuthenticated, 'User ID:', user?.id)
      const result = await submitApplication.mutateAsync(applicationData)
      console.log('Application submission result:', result)
      
      setShowConfirmDialog(false)
      setSelectedJob(null)
      
      // Show success message
      alert('Application submitted successfully! You can track your application status in the dashboard.')
      
      // Navigate to applications page
      navigate('/my-applications')
    } catch (error) {
      console.error('Application submission failed:', error)
      console.error('Error details:', error.response?.data)
      alert('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  })

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
                    true 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Job Vacancies' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Briefcase className={`w-5 h-5 ${true ? 'text-white' : 'text-slate-500'}`} />
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
      <main className="flex-1 pt-2 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 bg-gray-100 overflow-x-auto">
        <div className="w-full max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-3 sm:mb-4 md:mb-6">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
              Welcome {getDisplayName()}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">{currentTime}</p>
          </div>

          {/* Alert Banner */}
          {showBanner && (
            <div className="bg-ncpd-primary text-white px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-start justify-between mb-4 sm:mb-6">
              <div className="min-w-0 pr-8">
                <p className="font-semibold text-xs sm:text-sm lg:text-base">
                  Dear {getDisplayName()}! Kindly ensure you complete your profile before applying for any Open Positions.
                </p>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-white hover:bg-white/20 rounded p-1 flex-shrink-0 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}

          <div className="p-3 sm:p-4 lg:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg p-2.5 sm:p-3 lg:p-4 text-white transform hover:scale-105 transition-transform">
            <p className="text-[10px] sm:text-xs lg:text-sm text-blue-100 font-medium">Open Vacancies</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{displayedJobs.filter(j => j.status !== 'closed' && j.status !== 'Closed').length}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl sm:rounded-2xl shadow-lg p-2.5 sm:p-3 lg:p-4 text-white transform hover:scale-105 transition-transform">
            <p className="text-[10px] sm:text-xs lg:text-sm text-slate-100 font-medium">Closed Vacancies</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{displayedJobs.filter(j => j.status === 'closed' || j.status === 'Closed').length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg p-2.5 sm:p-3 lg:p-4 text-white transform hover:scale-105 transition-transform">
            <p className="text-[10px] sm:text-xs lg:text-sm text-purple-100 font-medium">Applied Vacancies</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{getAppliedJobs().length}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl sm:rounded-2xl shadow-lg p-2.5 sm:p-3 lg:p-4 text-white transform hover:scale-105 transition-transform">
            <p className="text-[10px] sm:text-xs lg:text-sm text-teal-100 font-medium">Internships</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{displayedJobs.filter(j => j.is_internship || j.employment_type?.toLowerCase().includes('internship')).length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('open')}
                className={`px-2 sm:px-3 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-[10px] sm:text-xs lg:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'open'
                    ? 'bg-ncpd-primary text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Open Advertised Vacancies
              </button>
              <button
                onClick={() => setActiveTab('closed')}
                className={`px-2 sm:px-3 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-[10px] sm:text-xs lg:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'closed'
                    ? 'bg-ncpd-primary text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Closed Advertised Vacancies
              </button>
              <button
                onClick={() => setActiveTab('applied')}
                className={`px-2 sm:px-3 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-[10px] sm:text-xs lg:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'applied'
                    ? 'bg-ncpd-primary text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Applied Vacancies
              </button>
              <button
                onClick={() => setActiveTab('internships')}
                className={`px-2 sm:px-3 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-[10px] sm:text-xs lg:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'internships'
                    ? 'bg-ncpd-primary text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Internships
              </button>
            </div>
          </div>

          {/* Sub-tabs */}
          {activeTab === 'open' && (
            <div className="border-b border-slate-200 bg-slate-50">
              <div className="flex overflow-x-auto scrollbar-hide px-2 sm:px-3 lg:px-6">
                <button
                  onClick={() => setSubTab('active')}
                  className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm font-medium whitespace-nowrap transition-colors ${
                    subTab === 'active'
                      ? 'text-ncpd-primary border-b-2 border-ncpd-primary'
                      : 'text-slate-600 hover:text-ncpd-primary'
                  }`}
                >
                  Active Vacancies
                </button>
                <button
                  onClick={() => setSubTab('closed')}
                  className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm font-medium ml-2 sm:ml-4 lg:ml-6 whitespace-nowrap transition-colors ${
                    subTab === 'closed'
                      ? 'text-ncpd-primary border-b-2 border-ncpd-primary'
                      : 'text-slate-600 hover:text-ncpd-primary'
                  }`}
                >
                  Closed Vacancies
                </button>
                <button
                  onClick={() => setSubTab('contract')}
                  className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm font-medium ml-2 sm:ml-4 lg:ml-6 whitespace-nowrap transition-colors ${
                    subTab === 'contract'
                      ? 'text-ncpd-primary border-b-2 border-ncpd-primary'
                      : 'text-slate-600 hover:text-ncpd-primary'
                  }`}
                >
                  Contract Jobs
                </button>
                <button
                  onClick={() => setSubTab('permanent')}
                  className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm font-medium ml-2 sm:ml-4 lg:ml-6 whitespace-nowrap transition-colors ${
                    subTab === 'permanent'
                      ? 'text-ncpd-primary border-b-2 border-ncpd-primary'
                      : 'text-slate-600 hover:text-ncpd-primary'
                  }`}
                >
                  Permanent Jobs
                </button>
                <button
                  onClick={() => setSubTab('internships')}
                  className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm font-medium ml-2 sm:ml-4 lg:ml-6 whitespace-nowrap transition-colors ${
                    subTab === 'internships'
                      ? 'text-ncpd-primary border-b-2 border-ncpd-primary'
                      : 'text-slate-600 hover:text-ncpd-primary'
                  }`}
                >
                  Internships Jobs
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-2 sm:p-3 lg:p-6">
            {activeTab === 'open' && (
              <>
                <div className="mb-3 sm:mb-4">
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 font-medium">
                    {subTab === 'active' && 'Ready for Application'}
                    {subTab === 'closed' && 'Closed for Application'}
                    {subTab === 'contract' && 'Contract Positions'}
                    {subTab === 'permanent' && 'Permanent Positions'}
                    {subTab === 'internships' && 'Internship Opportunities'}
                  </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
                  <table className="w-full min-w-[600px] sm:min-w-[800px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">#</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Ref</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Designation</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Type</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Positions</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Deadline</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Grade</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Apply</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredJobs.map((job, index) => (
                        <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900">{index + 1}</td>
                          <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900">{job.job_reference || `VN00${814 + index}`}</td>
                          <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 font-medium max-w-[150px] sm:max-w-none truncate">{job.title}</td>
                          <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 hidden sm:table-cell">{job.employment_type}</td>
                          <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 hidden lg:table-cell">{job.positions || 1}</td>
                          <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900">
                            {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : 'N/A'}
                          </td>
                          <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 hidden lg:table-cell">{job.job_grade || 'N/A'}</td>
                          <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm">
                            {hasAppliedToJob(job.id) ? (
                              <span className="bg-slate-200 text-slate-700 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full text-[10px] sm:text-xs lg:text-sm font-medium whitespace-nowrap">
                                Applied
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApplyClick(job.id)}
                                className="bg-ncpd-primary text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full text-[10px] sm:text-xs lg:text-sm font-medium hover:bg-ncpd-secondary transition-colors whitespace-nowrap"
                              >
                                Apply
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600">
                    Page 1 of 1 Showing {filteredJobs.length} of {filteredJobs.length}
                  </p>
                  <div className="flex gap-1.5 sm:gap-2">
                    <button className="px-2 sm:px-3 py-1 border border-slate-300 rounded-lg text-[10px] sm:text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors" disabled>
                      Previous
                    </button>
                    <button className="px-2 sm:px-3 py-1 bg-ncpd-primary text-white rounded-lg text-[10px] sm:text-xs hover:bg-ncpd-secondary transition-colors">
                      1
                    </button>
                    <button className="px-2 sm:px-3 py-1 border border-slate-300 rounded-lg text-[10px] sm:text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors" disabled>
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'closed' && (
              <>
                <div className="mb-3 sm:mb-4">
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 font-medium">
                    Closed Vacancies
                  </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
                  <table className="w-full min-w-[600px] sm:min-w-[800px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">#</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Ref</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Designation</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Type</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Positions</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Deadline</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Grade</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredJobs.length > 0 ? (
                        filteredJobs.map((job, index) => (
                          <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900">{index + 1}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900">{job.job_reference || `VN00${814 + index}`}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 font-medium max-w-[150px] sm:max-w-none truncate">{job.title}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 hidden sm:table-cell">{job.employment_type}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 hidden lg:table-cell">{job.positions || 1}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900">
                              {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : 'N/A'}
                            </td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 hidden lg:table-cell">{job.job_grade || 'N/A'}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm">
                              <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-medium">Closed</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-2 sm:px-3 lg:px-4 py-6 sm:py-8 lg:py-12 text-center">
                            <p className="text-slate-500 text-xs sm:text-sm lg:text-base">No closed vacancies available</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'applied' && (
              <>
                <div className="mb-3 sm:mb-4">
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 font-medium">
                    Your Applied Vacancies
                  </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
                  <table className="w-full min-w-[600px] sm:min-w-[800px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">#</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Ref</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Designation</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Type</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Positions</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Deadline</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Grade</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {getAppliedJobs().length > 0 ? (
                        getAppliedJobs().map((job, index) => {
                          return (
                            <tr key={job.application_id || job.id || index} className="hover:bg-slate-50 transition-colors">
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900">{index + 1}</td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900">{job.job_reference || job.reference || `VN00${814 + index}`}</td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 font-medium max-w-[150px] sm:max-w-none truncate">{job.title || job.job_title || 'Position'}</td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 hidden sm:table-cell">{job.employment_type || job.type || 'N/A'}</td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 hidden lg:table-cell">{job.positions || job.position_count || 1}</td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900">
                                {job.application_deadline || job.deadline ? new Date(job.application_deadline || job.deadline).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : 'N/A'}
                              </td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 hidden lg:table-cell">{job.job_grade || job.grade || 'N/A'}</td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                                  job.application_status === 'submitted' ? 'bg-green-100 text-green-800' :
                                  job.application_status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                  job.application_status === 'interview_scheduled' ? 'bg-blue-100 text-blue-800' :
                                  job.application_status === 'accepted' ? 'bg-green-100 text-green-800' :
                                  job.application_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-slate-100 text-slate-800'
                                }`}>
                                  {(job.application_status || job.status || 'Submitted').replace(/_/g, ' ')}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-2 sm:px-3 lg:px-4 py-6 sm:py-8 lg:py-12 text-center">
                            <p className="text-slate-500 text-xs sm:text-sm lg:text-base">No applied vacancies yet</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600">
                    Showing {getAppliedJobs().length} applied vacancies
                  </p>
                </div>
              </>
            )}

            {activeTab === 'internships' && (
              <>
                <div className="mb-3 sm:mb-4">
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 font-medium">
                    Internship Opportunities
                  </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
                  <table className="w-full min-w-[600px] sm:min-w-[800px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">#</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Ref</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Designation</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Type</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Positions</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Deadline</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Grade</th>
                        <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">Apply</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredJobs.length > 0 ? (
                        filteredJobs.map((job, index) => (
                          <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900">{index + 1}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900">{job.job_reference || `VN00${814 + index}`}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 font-medium max-w-[150px] sm:max-w-none truncate">{job.title}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 hidden sm:table-cell">{job.employment_type}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 hidden lg:table-cell">{job.positions || 1}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900">
                              {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : 'N/A'}
                            </td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-slate-900 hidden lg:table-cell">{job.job_grade || 'N/A'}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm">
                              <button
                                onClick={() => handleApplyClick(job.id)}
                                className="px-2 sm:px-3 py-1 bg-ncpd-primary text-white rounded-lg text-[10px] font-medium hover:bg-ncpd-secondary transition-colors"
                              >
                                Apply
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-2 sm:px-3 lg:px-4 py-6 sm:py-8 lg:py-12 text-center">
                            <p className="text-slate-500 text-xs sm:text-sm lg:text-base">No internships available at the moment</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && selectedJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4 animate-slide-in-up">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Confirm Application</h3>
              <p className="text-sm sm:text-base text-slate-600 mb-6">
                Are you sure you want to apply for the position of <strong className="text-slate-900">{selectedJob.title}</strong>? 
                Your profile data will be used for this application.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false)
                    setSelectedJob(null)
                  }}
                  disabled={isSubmitting}
                  className="btn-secondary w-full sm:w-auto disabled:opacity-50"
                >
                  No, Cancel
                </button>
                <button
                  onClick={handleConfirmApplication}
                  disabled={isSubmitting}
                  className="btn-primary w-full sm:w-auto disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Yes, Apply'}
                </button>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
  )
}
