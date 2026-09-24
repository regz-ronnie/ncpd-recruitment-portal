import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useJobs } from '../hooks/useJobs'
import { useAuth } from '../contexts/AuthContext'
import { useApplications } from '../hooks/useApplications'
import { X } from 'lucide-react'

export function Home() {
  const { jobs } = useJobs()
  const navigate = useNavigate()
  const { isAuthenticated, isProfileComplete } = useAuth()
  const { submitApplication, applications } = useApplications()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const jobResults = Array.isArray(jobs?.data)
    ? jobs.data
    : jobs?.data?.results || []
  const featuredVacancies = jobResults.slice(0, 5).map(job => ({
    reference: job.job_reference || `VN${job.id}`,
    title: job.title,
    type: job.employment_type,
    positions: job.positions || 1,
    deadline: job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : 'N/A',
    grade: job.job_grade || 'N/A',
    status: job.status === 'published' ? 'Active' : job.status,
    id: job.id,
  }))

  const handleViewClick = (jobId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/vacancies/${jobId}` } })
      return
    }

    if (!isProfileComplete(100)) {
      navigate('/my-profile', { state: { redirectTo: `/vacancies/${jobId}` } })
      return
    }

    // If authenticated and profile complete, navigate to job details
    navigate(`/vacancies/${jobId}`)
  }

  const handleApplyClick = (jobId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/vacancies/${jobId}` } })
      return
    }

    if (!isProfileComplete(100)) {
      // Clear existing attachments and navigate to profile to upload new ones
      localStorage.setItem('clearAttachmentsOnLoad', 'true')
      navigate('/my-profile', { 
        state: { 
          redirectTo: `/vacancies/${jobId}`,
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
        redirectTo: `/vacancies/${jobId}`,
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

      console.log('Submitting application:', applicationData)
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.32em] text-white/90">NCPD Careers</p>
            <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
              National Council for Population and Development
            </h1>
            <p className="mt-6 text-base sm:text-xl leading-8 text-slate-100/90">
              Apply for advertised career opportunities that support sustainable population and development across Kenya.
            </p>
            
            <div className="mt-8 flex flex-row items-center justify-start gap-3">
              <Link
                to="/vacancies"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#006633] shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-100"
              >
                View  More Vacancies
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20"
              >
                Register
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
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 text-center text-sm font-semibold text-white">
          <Link
            to="/vacancies"
            className="inline-flex items-center justify-center rounded-2xl sm:rounded-3xl bg-ncpd-primary px-6 py-4 hover:bg-ncpd-secondary transition-colors"
          >
            Active Job Vacancies
          </Link>
          <Link
            to="/vacancies"
            className="inline-flex items-center justify-center rounded-2xl sm:rounded-3xl bg-ncpd-accent px-6 py-4 hover:bg-[#009759] transition-colors"
          >
            Contract Job Vacancies
          </Link>
          <Link
            to="/vacancies"
            className="inline-flex items-center justify-center rounded-2xl sm:rounded-3xl bg-[#004d26] px-6 py-4 hover:bg-[#00331a] transition-colors"
          >
            Permanent & Pensionable Job Vacancies
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
          <div className="overflow-x-auto">
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
                {featuredVacancies.map((vacancy, index) => (
                  <tr key={vacancy.reference} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
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
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewClick(vacancy.id)}
                          className="inline-flex items-center rounded-full border border-slate-300 bg-slate-800 text-slate-200 px-3 py-1 text-xs font-semibold hover:bg-slate-700 hover:text-white transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleApplyClick(vacancy.id)}
                          className="inline-flex items-center rounded-full bg-ncpd-primary px-3 py-1 text-xs font-semibold text-white hover:bg-ncpd-secondary transition-colors"
                        >
                          Apply Now
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowConfirmDialog(false)
                setSelectedJob(null)
              }}
              disabled={isSubmitting}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Application
            </h3>
            <p className="text-gray-600 mb-6">
              You are about to apply for the position of <strong>{selectedJob.title}</strong>. 
              This will submit your application using your current profile information.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false)
                  setSelectedJob(null)
                }}
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
  )
}