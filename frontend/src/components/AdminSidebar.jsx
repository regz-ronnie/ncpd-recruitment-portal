import React from 'react'
import { NavLink } from 'react-router-dom'
import { Users, ClipboardList, Building2, FileText, Mail, BarChart3, ListChecks, ShieldCheck, Settings, Lock } from 'lucide-react'

const sections = [
  { key: 'dashboard', label: 'Dashboard', to: '/admin/dashboard', icon: BarChart3 },
  {
    key: 'recruitment',
    label: 'Recruitment',
    icon: ClipboardList,
    items: [
      { key: 'vacancies', label: 'Vacancies', to: '/admin/recruitment/vacancies' },
      { key: 'applications', label: 'Applications', to: '/admin/recruitment/applications' },
      { key: 'applicants', label: 'Applicants', to: '/admin/recruitment/applicants' },
      { key: 'shortlisting', label: 'Shortlisting', to: '/admin/recruitment/shortlisting' },
      { key: 'assessments', label: 'Assessments', to: '/admin/recruitment/assessments' },
      { key: 'interviews', label: 'Interviews', to: '/admin/recruitment/interviews' },
      { key: 'selection', label: 'Selection', to: '/admin/recruitment/selection' },
      { key: 'offers', label: 'Offers', to: '/admin/recruitment/offers' },
    ],
  },
  {
    key: 'organization',
    label: 'Organization',
    icon: Building2,
    items: [
      { key: 'departments', label: 'Departments', to: '/admin/organization/departments' },
      { key: 'offices', label: 'Offices', to: '/admin/organization/offices' },
      { key: 'positions', label: 'Positions', to: '/admin/organization/positions' },
      { key: 'job-grades', label: 'Job Grades', to: '/admin/organization/job-grades' },
    ],
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: FileText,
    items: [
      { key: 'candidates', label: 'Candidate Documents', to: '/admin/documents/candidates' },
      { key: 'verification', label: 'Verification', to: '/admin/documents/verification' },
      { key: 'types', label: 'Document Types', to: '/admin/documents/types' },
    ],
  },
  {
    key: 'communications',
    label: 'Communications',
    icon: Mail,
    items: [
      { key: 'email', label: 'Email', to: '/admin/communications/email' },
      { key: 'sms', label: 'SMS', to: '/admin/communications/sms' },
      { key: 'notifications', label: 'Notifications', to: '/admin/communications/notifications' },
      { key: 'templates', label: 'Templates', to: '/admin/communications/templates' },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: BarChart3,
    items: [
      { key: 'recruitment', label: 'Recruitment Reports', to: '/admin/reports/recruitment' },
      { key: 'applicants', label: 'Applicant Reports', to: '/admin/reports/applicants' },
      { key: 'interviews', label: 'Interview Reports', to: '/admin/reports/interviews' },
      { key: 'analytics', label: 'Analytics', to: '/admin/reports/analytics' },
    ],
  },
  {
    key: 'workflow',
    label: 'Workflow',
    icon: ListChecks,
    items: [
      { key: 'recruitment-workflows', label: 'Recruitment Workflows', to: '/admin/workflow/recruitment' },
      { key: 'approvals', label: 'Approvals', to: '/admin/workflow/approvals' },
      { key: 'tasks', label: 'Tasks', to: '/admin/workflow/tasks' },
    ],
  },
  {
    key: 'auth',
    label: 'Auth & Access',
    icon: Users,
    items: [
      { key: 'users', label: 'Users', to: '/admin/users' },
      { key: 'groups', label: 'Groups', to: '/admin/auth/groups' },
      { key: 'permissions', label: 'Permissions', to: '/admin/auth/permissions' },
    ],
  },
  {
    key: 'security',
    label: 'Security',
    icon: ShieldCheck,
    items: [
      { key: 'audit-logs', label: 'Audit Logs', to: '/admin/security/audit-logs' },
      { key: 'login-history', label: 'Login History', to: '/admin/security/login-history' },
      { key: 'events', label: 'Security Events', to: '/admin/security/events' },
    ],
  },
  { key: 'system', label: 'System', icon: Settings, items: [ { key: 'settings', label: 'Settings', to: '/admin/system/settings' }, { key: 'logs', label: 'System Logs', to: '/admin/system/logs' } ] },
]

export function AdminSidebar() {
  return (
    <aside className="w-64 hidden md:block border-r border-slate-100 bg-white">
      <div className="h-full overflow-y-auto px-4 py-6">
        <div className="mb-6 px-2">
          <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Admin</h3>
        </div>
        <nav className="space-y-3">
          {sections.map((sec) => {
            const Icon = sec.icon
            return (
              <div key={sec.key} className="">
                <div className="px-2">
                  <NavLink to={sec.to || '#'} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-700"><Icon className="h-4 w-4" /></span>
                    <span>{sec.label}</span>
                  </NavLink>
                </div>
                {sec.items && (
                  <div className="mt-2 space-y-1 pl-8">
                    {sec.items.map((it) => (
                      <NavLink key={it.key} to={it.to} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {it.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default AdminSidebar
