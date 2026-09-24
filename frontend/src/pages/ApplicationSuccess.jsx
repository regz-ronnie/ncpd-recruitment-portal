import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Home, FileText, Briefcase, ArrowRight } from 'lucide-react'

export default function ApplicationSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const { jobTitle } = location.state || {}

  useEffect(() => {
    // Redirect if accessed directly without state
    if (!location.state) {
      navigate('/vacancies')
    }
  }, [location.state, navigate])

  const handleViewApplications = () => {
    navigate('/my-applications')
  }

  const handleBrowseJobs = () => {
    navigate('/vacancies')
  }

  const handleGoHome = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-[#006633] to-[#008844] px-8 py-12 text-center relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-4 right-4 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>
            
            {/* Success Icon */}
            <div className="relative">
              <div className="mx-auto mb-6 flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full">
                <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Application Submitted!
              </h1>
              <p className="text-white/90 text-lg">
                {jobTitle ? `for ${jobTitle}` : 'Successfully'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            {/* Success Message */}
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                Thank you for your application! Your submission has been received and is now under review by our recruitment team.
              </p>
            </div>

            {/* What Happens Next */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#006633]" />
                What Happens Next
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#006633] rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <span>Your application will be reviewed by our HR team</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#006633] rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <span>Shortlisted candidates will be contacted for interviews</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#006633] rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <span>You can track your application status in your dashboard</span>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handleViewApplications}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-[#006633] hover:bg-green-50 transition-all group"
              >
                <FileText className="w-6 h-6 text-gray-600 group-hover:text-[#006633] transition-colors" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#006633]">
                  View Applications
                </span>
              </button>
              
              <button
                onClick={handleBrowseJobs}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-[#006633] hover:bg-green-50 transition-all group"
              >
                <Briefcase className="w-6 h-6 text-gray-600 group-hover:text-[#006633] transition-colors" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#006633]">
                  Browse Jobs
                </span>
              </button>
              
              <button
                onClick={handleGoHome}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-[#006633] hover:bg-green-50 transition-all group"
              >
                <Home className="w-6 h-6 text-gray-600 group-hover:text-[#006633] transition-colors" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#006633]">
                  Dashboard
                </span>
              </button>
            </div>

            {/* Primary CTA */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleViewApplications}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#006633] to-[#008844] text-white px-6 py-4 rounded-xl font-semibold hover:from-[#004d26] hover:to-[#006633] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Track Your Application</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact us at{' '}
              <a href="mailto:recruitment@ncpd.go.ke" className="text-[#006633] hover:underline">
                recruitment@ncpd.go.ke
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
