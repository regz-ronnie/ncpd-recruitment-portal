import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ShieldCheck, FileText, Layers, Mail, MessageCircle, Bell, BarChart3, GitBranch, ShieldAlert, Settings, ListChecks, Users, Briefcase, Building2, Award, ClipboardList, Sparkles } from 'lucide-react'

const featureDefinitions = {
  'recruitment/vacancies': { title: 'Vacancies', description: 'Manage job postings, vacancy details, and hiring needs.' },
  'recruitment/applications': { title: 'Applications', description: 'Review and manage candidate applications.' },
  'recruitment/applicants': { title: 'Applicants', description: 'Browse and manage applicant profiles.' },
  'recruitment/shortlisting': { title: 'Shortlisting', description: 'Run shortlist workflows and ranking criteria.' },
  'recruitment/assessments': { title: 'Assessments', description: 'Configure assessments and evaluate candidates.' },
  'recruitment/interviews': { title: 'Interviews', description: 'Manage interview schedules and feedback.' },
  'recruitment/selection': { title: 'Selection', description: 'Approve candidates and make final selections.' },
  'recruitment/offers': { title: 'Offers', description: 'Issue and track offer letters.' },
  'organization/departments': { title: 'Departments', description: 'Define and maintain organizational departments.' },
  'organization/offices': { title: 'Offices', description: 'Manage office locations and facilities.' },
  'organization/positions': { title: 'Positions', description: 'Manage available positions and job families.' },
  'organization/job-grades': { title: 'Job Grades', description: 'Maintain job grade levels and pay bands.' },
  'documents/candidates': { title: 'Candidate Documents', description: 'Review candidate documents and attachments.' },
  'documents/verification': { title: 'Verification', description: 'Validate documents and supporting records.' },
  'documents/types': { title: 'Document Types', description: 'Configure accepted document type categories.' },
  'communications/email': { title: 'Email', description: 'Manage email templates and campaigns.' },
  'communications/sms': { title: 'SMS', description: 'Manage SMS templates and outbound messaging.' },
  'communications/notifications': { title: 'Notifications', description: 'Configure system notifications and alerts.' },
  'communications/templates': { title: 'Templates', description: 'Create reusable communication templates.' },
  'reports/recruitment': { title: 'Recruitment Reports', description: 'View recruitment KPIs and hiring reports.' },
  'reports/applicants': { title: 'Applicant Reports', description: 'Review applicant analytics and progress.' },
  'reports/interviews': { title: 'Interview Reports', description: 'Analyze interview feedback and trends.' },
  'reports/analytics': { title: 'Analytics', description: 'Monitor portal analytics and dashboards.' },
  'workflow/recruitment': { title: 'Recruitment Workflows', description: 'Configure recruitment workflows and stages.' },
  'workflow/approvals': { title: 'Approvals', description: 'Manage approval flows and permissions.' },
  'workflow/tasks': { title: 'Tasks', description: 'Assign and track workflow tasks.' },
  'auth/users': { title: 'Users', description: 'Manage user accounts, roles, and permissions.' },
  'auth/groups': { title: 'Groups', description: 'Manage user groups and shared roles.' },
  'auth/permissions': { title: 'Permissions', description: 'Configure permission rules and access control.' },
  'security/audit-logs': { title: 'Audit Logs', description: 'Review audit logs and system actions.' },
  'security/login-history': { title: 'Login History', description: 'Review login events and history.' },
  'security/events': { title: 'Security Events', description: 'Track security alerts and incidents.' },
  'system/settings': { title: 'Settings', description: 'Manage portal settings and configuration.' },
  'system/configuration': { title: 'Configuration', description: 'Manage system configuration settings.' },
  'system/logs': { title: 'System Logs', description: 'Review system logs and diagnostics.' },
}

const iconMap = {
  recruitment: ClipboardList,
  organization: Building2,
  documents: FileText,
  communications: Mail,
  reports: BarChart3,
  workflow: ListChecks,
  auth: Users,
  security: ShieldCheck,
  system: Settings,
}

export function AdminFeaturePage() {
  const location = useLocation()
  const path = location.pathname.replace('/admin/', '')
  const feature = featureDefinitions[path]
  const categoryKey = path.split('/')[0]
  const Icon = iconMap[categoryKey] || ShieldCheck

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3 text-slate-600">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-white">
                <Icon className="h-7 w-7" />
              </div>
              <h1 className="mt-6 text-3xl font-bold text-slate-900">{feature?.title || 'Admin Feature'}</h1>
              <p className="mt-3 text-slate-600 max-w-2xl">{feature?.description || 'This admin feature is available from the admin console.'}</p>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-slate-50 p-6">
            <div className="text-slate-700 text-sm leading-7">
              <p className="font-semibold text-slate-900">Status</p>
              <p className="mt-3 text-slate-600">
                This section is a dedicated admin feature entry page. If this feature is not implemented yet, it will be built as part of the portal’s admin console expansion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
