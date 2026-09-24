import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Users, ShieldCheck, LayoutDashboard, PlusCircle, FolderOpen, Building2, FileText, Mail, BarChart3, ListChecks, ShieldAlert, Settings } from 'lucide-react'
import { adminAPI, jobsAPI } from '../services/api.js'

export function AdminDashboard() {
  const { user } = useAuth()

  const displayName = () => {
    if (!user) return 'Administrator'
    const firstName = user.first_name || user.firstName || ''
    const lastName = user.last_name || user.lastName || user.surname || ''
    return [firstName, lastName].filter(Boolean).join(' ') || user.email || 'Administrator'
  }

  const [applicantCount, setApplicantCount] = useState(null)
  const [jobsCount, setJobsCount] = useState(null)
  const [recentApplicants, setRecentApplicants] = useState([])
  const [recentJobs, setRecentJobs] = useState([])

  useEffect(() => {
    let mounted = true

    const loadCounts = async () => {
      try {
        const usersResp = await adminAPI.listUsers()
        const users = usersResp.data || []
        const applicants = users.filter((u) => (u.user_type || '').toLowerCase() === 'applicant')
        if (mounted) {
          setApplicantCount(applicants.length)
          // show up to 5 recent applicants
          setRecentApplicants(applicants.slice(0, 5))
        }
      } catch (e) {
        if (mounted) setApplicantCount(0)
      }

      try {
        const jobsResp = await jobsAPI.getJobs({ page_size: 100, ordering: '-created_at' })
        const jobs = jobsResp.data?.results || jobsResp.data || []
        if (mounted) {
          setJobsCount(Array.isArray(jobs) ? jobs.length : 0)
          setRecentJobs(Array.isArray(jobs) ? jobs.slice(0, 10) : [])
        }
      } catch (e) {
        if (mounted) {
          setJobsCount(0)
          setRecentJobs([])
        }
      }
    }

    loadCounts()
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="mb-4 sm:mb-6 lg:mb-8 rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xl border border-slate-200">
          <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Administrator Panel</p>
              <h1 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-slate-900">Welcome, {displayName()}</h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl">
                This is your dedicated admin console. Manage users, HR access, site settings, and recruitment workflows from here.
              </p>
            </div>
            {/* action buttons removed per design: no Create HR / Staff or HR Dashboard links here */}
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 lg:gap-4 xl:grid-cols-3">
          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-500 text-white">
                <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Dashboard</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">View high-level recruitment and system metrics.</p>
              </div>
            </div>
                  <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs text-slate-500">Applicants</p>
                      <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-slate-900">{applicantCount ?? '—'}</p>
                    </div>
                    <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs text-slate-500">Jobs</p>
                      <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-slate-900">{jobsCount ?? '—'}</p>
                    </div>
                  </div>
          </div>

          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-sky-500 text-white">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Recruitment</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">Manage vacancies, applicants, interviews, and offers.</p>
              </div>
            </div>
                  <div className="mt-4 sm:mt-6">
                    <h3 className="text-xs sm:text-sm font-medium text-slate-700">Recent applicants</h3>
                    <div className="mt-2 sm:mt-3 space-y-2">
                      {recentApplicants.length === 0 ? (
                            <div className="text-xs sm:text-sm text-slate-500">No recent applicants</div>
                          ) : (
                            recentApplicants.map((a) => (
                              <div key={a.id} className="rounded-lg border border-slate-100 bg-slate-50 px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-800">
                                {a.first_name || a.email} {a.last_name || ''} — {a.user_type}
                              </div>
                            ))
                          )}
                    </div>
                        <div className="mt-3 sm:mt-4">
                          <h3 className="text-xs sm:text-sm font-medium text-slate-700">Recent job posts</h3>
                          <div className="mt-2 sm:mt-3 space-y-2">
                            {recentJobs.length === 0 ? (
                              <div className="text-xs sm:text-sm text-slate-500">No recent jobs</div>
                            ) : (
                              recentJobs.map((job) => (
                                <div key={job.id} className="rounded-lg border border-slate-100 bg-white px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-800">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">{job.title || job.name || job.position || 'Untitled'}</div>
                                      <div className="text-[10px] sm:text-xs text-slate-500">{job.department || job.department_name || job.category || ''} • {job.location || job.city || 'N/A'}</div>
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-slate-500">{job.status || job.publish_status || ''}</div>
                                  </div>
                                  <div className="mt-1 text-[10px] sm:text-xs text-slate-400">Deadline: {job.application_deadline || job.deadline || job.closing_date || '—'}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                  </div>
          </div>

          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-500 text-white">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Organization</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">Configure departments, offices, positions, and grades.</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 space-y-2">
              <Link to="/admin/organization/departments" className="block rounded-xl sm:rounded-2xl bg-slate-900 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition">
                Departments
              </Link>
              <Link to="/admin/organization/positions" className="block rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50 transition">
                Positions
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 lg:gap-4 xl:grid-cols-3">
          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-fuchsia-500 text-white">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Documents</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">Manage candidate documents, verification, and types.</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 space-y-2">
              <Link to="/admin/documents/candidates" className="block rounded-xl sm:rounded-2xl bg-slate-900 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition">
                Candidate Documents
              </Link>
              <Link to="/admin/documents/verification" className="block rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50 transition">
                Verification
              </Link>
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-orange-500 text-white">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Communications</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">Configure emails, SMS, notifications, and templates.</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 space-y-2">
              <Link to="/admin/communications/email" className="block rounded-xl sm:rounded-2xl bg-slate-900 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition">
                Email
              </Link>
              <Link to="/admin/communications/sms" className="block rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50 transition">
                SMS
              </Link>
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-cyan-500 text-white">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Reports</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">Access recruitment, applicant, interview, and analytics reports.</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 space-y-2">
              <Link to="/admin/reports/recruitment" className="block rounded-xl sm:rounded-2xl bg-slate-900 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition">
                Recruitment Reports
              </Link>
              <Link to="/admin/reports/analytics" className="block rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50 transition">
                Analytics
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 lg:gap-4 xl:grid-cols-3">
          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-600 text-white">
                <ListChecks className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Workflow</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">Manage recruitment workflows, approvals, and tasks.</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 space-y-2">
              <Link to="/admin/workflow/recruitment" className="block rounded-xl sm:rounded-2xl bg-slate-900 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition">
                Recruitment Workflows
              </Link>
              <Link to="/admin/workflow/approvals" className="block rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50 transition">
                Approvals
              </Link>
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-violet-500 text-white">
                <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Security</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">Review audit logs, login history, and security events.</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 space-y-2">
              <Link to="/admin/security/audit-logs" className="block rounded-xl sm:rounded-2xl bg-slate-900 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition">
                Audit Logs
              </Link>
              <Link to="/admin/security/login-history" className="block rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50 transition">
                Login History
              </Link>
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-slate-900 text-white">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">System</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">Manage portal configuration, settings, and system logs.</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 space-y-2">
              <Link to="/admin/system/settings" className="block rounded-xl sm:rounded-2xl bg-slate-900 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition">
                Settings
              </Link>
              <Link to="/admin/system/logs" className="block rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50 transition">
                System Logs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
