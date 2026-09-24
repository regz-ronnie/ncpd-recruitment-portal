import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useJobs } from '../hooks/useJobs'
import { useAuth } from '../contexts/AuthContext'
import { useApplications } from '../hooks/useApplications'

export function HomePage() {
  const { jobs } = useJobs()
  const isLoading = jobs?.isLoading
  const navigate = useNavigate()
  const { isAuthenticated, isProfileComplete } = useAuth()
  const { submitApplication, applications } = useApplications()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState('Open Advertised Vacancies')

  const fallbackVacancies = [
    
   /* {
      reference: 'VN001',
      title: 'Senior Investigator',
      type: 'Full-time',
      positions: 2,
      deadline: 'Open',
      grade: 'Grade 9',
      status: 'Active',
      id: 1,
    },
    {
      reference: 'VN002',
      title: 'Research Officer',
      type: 'Contract',
      positions: 4,
      deadline: 'Open',
      grade: 'Grade 8',
      status: 'Active',
      id: 2,
    },
    ...*/
  ]
    
  const vacancyTabs = [
    'Open Advertised Vacancies',
    'Closed Advertised Vacancies',
    'Internships',
  ]

  const jobResults = Array.isArray(jobs?.data)
    ? jobs.data
    : jobs?.data?.results || []

  const vacancies = jobResults.length > 0
    ? jobResults.map((job, index) => ({
        reference: job.reference || job.job_number || `VN${job.id || index + 970}`,
        title: job.title || job.position || 'Vacancy Title',
        type: job.type || job.employment_type || job.job_type || 'Open',
        positions: job.positions || job.openings || 1,
        deadline: job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : job.deadline || 'Open',
        grade: job.grade || job.job_grade || 'N/A',
        status: job.status ? String(job.status).replace(/_/g, ' ') : 'Active',
        id: job.id || index + 1,
        isInternship: job.is_internship || job.type?.toLowerCase().includes('internship') || false,
        isClosed: job.status === 'closed' || job.status === 'Closed' || false,
      }))
    : fallbackVacancies

  // Filter vacancies based on active filter
  const filteredVacancies = vacancies.filter(vacancy => {
    const typeLower = vacancy.type?.toLowerCase() || ''
    
    switch (activeFilter) {
      case 'Open Advertised Vacancies':
        return !vacancy.isClosed && !vacancy.isInternship
      case 'Closed Advertised Vacancies':
        return vacancy.isClosed && !vacancy.isInternship
      case 'Internships':
        return vacancy.isInternship
      default:
        return true
    }
  })

  const handleApplyClick = (jobId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/` } })
      return
    }

    if (!isProfileComplete(100)) {
      // Clear existing attachments and navigate to profile to upload new ones
      localStorage.setItem('clearAttachmentsOnLoad', 'true')
      navigate('/my-profile', { 
        state: { 
          redirectTo: `/`,
          clearAttachments: true,
          vacancyId: jobId
        } 
      })
      return
    }

    // Check if already applied
    const hasAlreadyApplied = applications?.data?.data?.some(
      application => application.job?.id === parseInt(jobId) || application.job === jobId
    ) || applications?.data?.some(
      application => application.job?.id === parseInt(jobId) || application.job === jobId
    )

    if (hasAlreadyApplied) {
      alert('You have already applied for this position.')
      navigate('/my-applications')
      return
    }

    // Clear existing attachments and navigate to profile to upload new ones
    localStorage.setItem('clearAttachmentsOnLoad', 'true')
    navigate('/my-profile', { 
      state: { 
        redirectTo: `/`,
        clearAttachments: true,
        vacancyId: jobId
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

      await submitApplication.mutateAsync(applicationData)
      setShowConfirmDialog(false)
      setSelectedJob(null)
      alert('Application submitted successfully!')
      navigate('/my-applications')
    } catch (error) {
      console.error('Application submission failed:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <section
        className="relative overflow-hidden bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 102, 51, 0.82), rgba(0, 119, 60, 0.38)), url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#006633]/90 via-[#008044]/40 to-[#00331a]/90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl space-y-5 sm:space-y-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/90">NCPD Careers</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              National Council for Population and Development
            </h1>
            <p className="text-base sm:text-lg leading-7 sm:leading-8 text-slate-100/90 max-w-2xl">
              Apply for advertised career opportunities that support sustainable population and development across Kenya.
            </p>
            <div className="flex flex-row items-center justify-center gap-3">
              <Link
                to="/vacancies"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#006633] shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-100 sm:px-6 sm:py-3"
              >
                Explore More Vacancies
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 sm:px-6 sm:py-3"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="rounded-3xl bg-ncpd-light border border-ncpd-primary px-6 py-5 text-center text-sm sm:text-base text-ncpd-primary shadow-sm">
          <span className="font-semibold">NCPD invites all qualified applicants to apply for the following advertised career opportunities!</span>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-row flex-wrap items-center justify-center sm:grid sm:grid-cols-4 gap-3 text-center text-sm font-semibold text-white">
          {vacancyTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`inline-flex items-center justify-center rounded-2xl sm:rounded-3xl px-6 py-4 transition-colors w-fit ${
                activeFilter === tab
                  ? 'bg-ncpd-primary ring-2 ring-white ring-offset-2 ring-offset-ncpd-primary'
                  : 'bg-ncpd-primary/70 hover:bg-ncpd-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md p-4 md:p-6">
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {isLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  <div className="inline-flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin text-ncpd-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span>Loading vacancies, please wait...</span>
                  </div>
                </div>
              ) : filteredVacancies.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No vacancies available at the moment. Please check back later.
                </div>
              ) : (
                filteredVacancies.map((vacancy, index) => (
                  <div key={`${vacancy.reference}-${vacancy.id}`} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{vacancy.reference}</p>
                          <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">{vacancy.title}</h3>
                        </div>
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 whitespace-nowrap">
                          {vacancy.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400 font-medium">Type</p>
                          <p className="text-xs text-slate-700 font-semibold truncate">{vacancy.type}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400 font-medium">Posts</p>
                          <p className="text-xs text-slate-700 font-semibold">{vacancy.positions}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400 font-medium">Deadline</p>
                          <p className="text-xs text-slate-700 font-semibold truncate">{vacancy.deadline}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400 font-medium">Grade</p>
                          <p className="text-xs text-slate-700 font-semibold truncate">{vacancy.grade}</p>
                        </div>
                        <div className="text-center">
                          <Link
                            to={`/vacancies/${vacancy.id}`}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-200 transition-colors w-full"
                          >
                            View
                          </Link>
                        </div>
                        <div className="text-center">
                          <button
                            onClick={() => handleApplyClick(vacancy.id)}
                            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#006633] to-[#008044] px-2 py-1.5 text-[10px] font-semibold text-white hover:from-[#004d26] hover:to-[#006633] transition-all shadow-sm w-full"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-4 text-left font-semibold text-slate-600">Job Reference</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-600">Job Title/Designation</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-600">Employment Type</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-600">Positions</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-600">Application Deadline</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-600">Job Grade</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                        <div className="inline-flex items-center justify-center gap-2">
                          <svg className="h-5 w-5 animate-spin text-ncpd-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          <span>Loading vacancies, please wait...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredVacancies.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                        No vacancies available at the moment. Please check back later.
                      </td>
                    </tr>
                  ) : (
                    filteredVacancies.map((vacancy, index) => (
                      <tr key={`${vacancy.reference}-${vacancy.id}`} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-4 py-4 text-slate-700 font-medium">{vacancy.reference}</td>
                        <td className="px-4 py-4 text-slate-700">{vacancy.title}</td>
                        <td className="px-4 py-4 text-slate-700">{vacancy.type}</td>
                        <td className="px-4 py-4 text-slate-700">{vacancy.positions}</td>
                        <td className="px-4 py-4 text-slate-700">{vacancy.deadline}</td>
                        <td className="px-4 py-4 text-slate-700">{vacancy.grade}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {vacancy.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 space-x-2">
                          <Link
                            to={`/vacancies/${vacancy.id}`}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleApplyClick(vacancy.id)}
                            className="inline-flex items-center rounded-full bg-ncpd-primary px-3 py-1 text-xs font-semibold text-white hover:bg-ncpd-secondary transition-colors"
                          >
                            Apply Now
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Application</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to apply for the position of <strong>{selectedJob.title}</strong>? 
              Your profile data will be used for this application.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmDialog(false)
                  setSelectedJob(null)
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                No, Cancel
              </button>
              <button
                onClick={handleConfirmApplication}
                disabled={isSubmitting}
                className="px-4 py-2 bg-ncpd-primary text-white rounded-lg hover:bg-ncpd-secondary transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
