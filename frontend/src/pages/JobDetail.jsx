import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle, Search, X, CheckCircle2, Briefcase, GraduationCap, FileText, Award } from 'lucide-react'
import { useJobs } from '../hooks/useJobs'
import { useApplications } from '../hooks/useApplications'

export function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { useJobDetail } = useJobs()
  const { user, isProfileComplete, checkProfileCompletion, isAuthenticated, profileCompletion } = useAuth()
  const { submitApplication, applications } = useApplications()
  const [showProfileWarning, setShowProfileWarning] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: job,
    isLoading: jobLoading,
    isError: jobError,
    error: jobLoadError,
  } = useJobDetail(id)

  useEffect(() => {
    if (user && isAuthenticated) {
      checkProfileCompletion(100)
    }
  }, [user, isAuthenticated, checkProfileCompletion])

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/vacancies/${id}` } })
      return
    }

    if (!isProfileComplete(100)) {
      navigate('/my-profile', { state: { redirectTo: `/vacancies/${id}` } })
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
        const jobIdNum = parseInt(id)
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
    // This ensures applicants upload attachments specific to each vacancy
    localStorage.setItem('clearAttachmentsOnLoad', 'true')
    sessionStorage.setItem('pendingVacancyId', id)
    sessionStorage.setItem('pendingVacancyTitle', job?.title || '')
    navigate('/my-profile', { 
      state: { 
        redirectTo: `/vacancies/${id}`,
        clearAttachments: true,
        vacancyId: id,
        vacancyTitle: job?.title || ''
      } 
    })
  }

  const handleConfirmApplication = async () => {
    setIsSubmitting(true)
    try {
      const applicationData = {
        jobId: parseInt(id),
        cover_letter: `I am applying for the position of ${job?.title}. My profile contains all my qualifications and experience.`,
        copy_from_profile: true  // Signal backend to copy documents from user profile
      }

      console.log('Submitting application with jobId:', parseInt(id))
      console.log('Application data:', applicationData)
      const result = await submitApplication.mutateAsync(applicationData)
      console.log('Application submission result:', result)
      
      setShowConfirmDialog(false)
      
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

  if (jobLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin text-ncpd-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-gray-700">Loading vacancy details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (jobError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vacancy Not Found</h2>
          <p className="text-gray-600 mb-6">
            The vacancy you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/vacancies')}
              className="flex-1 bg-ncpd-primary text-white py-2 px-4 rounded-lg hover:bg-ncpd-primary-dark transition"
            >
              View All Vacancies
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-300 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const title = job?.title || job?.position || 'Vacancy Details'
  const grade = job?.grade || job?.job_grade || job?.grade_level || 'N/A'
  const posts = job?.posts || job?.openings || '1'
  const terms = job?.terms_of_service || job?.terms || job?.contract || 'Details available on request.'
  const purpose = job?.purpose || job?.job_purpose || job?.summary || 'Description not available.'
  
  // Split description items by • if they're in a single string
  const descriptionItems = Array.isArray(job?.description)
    ? job.description
    : typeof job?.description === 'string'
      ? job.description.split('•').map(item => item.trim()).filter(item => item)
      : []
  
  // Split requirement items by • if they're in a single string
  const requirementItems = Array.isArray(job?.requirements)
    ? job.requirements
    : typeof job?.requirements === 'string'
      ? job.requirements.split('•').map(item => item.trim()).filter(item => item)
      : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8">
      <div className="mb-6">
        <Link to="/vacancies" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Vacancies
        </Link>
      </div>

      <div className="border-b border-slate-200 pb-6 mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Page 1 of 7</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
          NATIONAL COUNCIL FOR POPULATION AND DEVELOPMENT
        </h1>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mt-2">
          VACANCIES ADVERTISEMENT – REPLACEMENT
        </h2>
        <p className="mt-4 text-sm sm:text-base text-gray-700 leading-7">
          The National Council for Population and Development is a Semi-Autonomous Government Agency in the National Treasury and Economic Planning. The Council seeks to fill the following vacant positions.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#006633] to-[#008044] px-6 py-4">
            <h3 className="text-xl font-bold text-white">
              {title}
            </h3>
            <p className="text-sm text-white/90 mt-1">{grade} • {posts} Position(s)</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-5 h-5 text-[#006633]" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Terms of Service</p>
                </div>
                <p className="text-sm text-slate-700">{terms}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-[#006633]" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Job Grade</p>
                </div>
                <p className="text-sm text-slate-700">{grade}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#006633]" />
                <p className="text-sm font-semibold text-slate-900">Job Description</p>
              </div>
              <div className="space-y-2">
                {descriptionItems.map((item, index) => (
                  <div key={index} className="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border-l-4 border-[#006633] hover:shadow-md transition-all">
                    <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-[#006633]" />
                <p className="text-sm font-semibold text-slate-900">Requirements for Appointment</p>
              </div>
              <div className="space-y-2">
                {requirementItems.map((item, index) => (
                  <div key={index} className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-white border-l-4 border-emerald-500 hover:shadow-md transition-all">
                    <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 sm:p-6">
          <h4 className="text-lg font-semibold text-blue-900">Ready to Apply?</h4>
          <p className="mt-2 text-sm text-slate-700">
            Applicants who meet the requirements should submit their application letter, detailed CV, copies of academic and professional certificates, testimonials, and a copy of the National Identity Card or Passport.
          </p>

          {showProfileWarning && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="font-semibold text-yellow-900 text-sm">Profile Completion Required</h5>
                  <p className="text-yellow-700 text-xs mt-1">
                    Your profile is {profileCompletion}% complete. Please complete your profile before applying.
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-yellow-200 rounded-full h-1.5">
                      <div
                        className="bg-yellow-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${profileCompletion}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">{profileCompletion}% Complete</p>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => navigate('/my-profile', { state: { redirectTo: `/vacancies/${id}` } })}
                      className="px-3 py-1.5 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors"
                    >
                      Complete Profile
                    </button>
                    <button
                      onClick={() => setShowProfileWarning(false)}
                      className="px-3 py-1.5 bg-white text-yellow-700 border border-yellow-300 rounded text-xs hover:bg-yellow-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleApplyClick}
            className="mt-4 inline-flex justify-center rounded-full bg-ncpd-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-ncpd-secondary transition-colors"
          >
            Apply for This Position
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Application
            </h3>
            <p className="text-gray-600 mb-6">
              You are about to apply for the position of <strong>{job?.title}</strong>. 
              This will submit your application using your current profile information.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApplication}
                disabled={isSubmitting}
                className="px-4 py-2 text-white bg-[#006633] rounded-lg hover:bg-[#004d26] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}
