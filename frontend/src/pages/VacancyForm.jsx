import React, { useEffect, useState } from 'react'
let ReactQuill = null
try {
  // try to load react-quill if installed
  // eslint-disable-next-line global-require
  const rq = require('react-quill')
  ReactQuill = rq && rq.default ? rq.default : rq
  // eslint-disable-next-line global-require
  require('react-quill/dist/quill.snow.css')
} catch (e) {
  ReactQuill = null
}
import ScoringWeightsEditor from '../components/ScoringWeightsEditor.jsx'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { hrAPI } from '../services/api'
import {
  Briefcase,
  Menu,
  X,
  BarChart3,
  Users,
  CheckCircle2,
  Brain,
  FileSpreadsheet,
  GitBranch,
  Calendar,
  Mail,
  FileText,
  History,
  Shield,
  UserCheck,
  ClipboardList,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  Save,
  Eye,
  Layers
} from 'lucide-react'

export default function VacancyForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarSectionOpen, setSidebarSectionOpen] = useState({
    talent: true,
    operations: true,
    compliance: true,
  })
  const [darkMode, setDarkMode] = useState(false)
  const [form, setForm] = useState({
    title: '',
    reference_no: '',
    department: '',
    job_grade: '',
    employment_type: '',
    location: '',
    positions: 1,
    deadline: '',
    description: '',
    requirements: '',
    responsibilities: '',
    qualifications: '',
    scoring_matrix: ''
  })
  const [errors, setErrors] = useState({})

  const { data } = useQuery(['hr:vacancy', id], async () => {
    if (!isEdit) return null
    const res = await hrAPI.getVacancy(id)
    return res.data
  }, { enabled: isEdit })

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || '',
        reference_no: data.reference_no || '',
        department: data.department || '',
        job_grade: data.job_grade || '',
        employment_type: data.employment_type || '',
        location: data.location || '',
        positions: data.positions || 1,
        deadline: data.application_deadline || data.deadline || '',
        description: data.description || '',
        requirements: data.requirements || '',
        responsibilities: data.responsibilities || '',
        qualifications: data.qualifications || '',
        scoring_matrix: data.scoring_matrix ? (typeof data.scoring_matrix === 'string' ? data.scoring_matrix : JSON.stringify(data.scoring_matrix)) : ''
      })
    }
  }, [data])

  const isAdminContext = location.pathname.startsWith('/admin')
  const adminVacanciesPath = '/admin/recruitment/vacancies'
  const hrVacanciesPath = '/hr/vacancies'
  const navigateTarget = isAdminContext ? adminVacanciesPath : hrVacanciesPath

  const createMutation = useMutation((payload) => hrAPI.createVacancy(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries('hr:vacancies')
      navigate(navigateTarget)
    },
    onError: (error) => {
      console.error('Create vacancy error:', error.response?.data)
      if (error.response?.data) {
        // Display backend validation errors
        const backendErrors = error.response.data
        const errorMessages = []
        
        if (typeof backendErrors === 'string') {
          errorMessages.push(backendErrors)
        } else if (Array.isArray(backendErrors)) {
          errorMessages.push(...backendErrors)
        } else if (typeof backendErrors === 'object') {
          Object.entries(backendErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`)
            } else {
              errorMessages.push(`${field}: ${messages}`)
            }
          })
        }
        
        setErrors({ general: errorMessages.join('; ') })
      }
    }
  })

  const updateMutation = useMutation(({ id, payload }) => hrAPI.updateVacancy(id, payload), {
    onSuccess: () => {
      queryClient.invalidateQueries('hr:vacancies')
      navigate(navigateTarget)
    },
    onError: (error) => {
      console.error('Update vacancy error:', error.response?.data)
      if (error.response?.data) {
        // Display backend validation errors
        const backendErrors = error.response.data
        const errorMessages = []
        
        if (typeof backendErrors === 'string') {
          errorMessages.push(backendErrors)
        } else if (Array.isArray(backendErrors)) {
          errorMessages.push(...backendErrors)
        } else if (typeof backendErrors === 'object') {
          Object.entries(backendErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`)
            } else {
              errorMessages.push(`${field}: ${messages}`)
            }
          })
        }
        
        setErrors({ general: errorMessages.join('; ') })
      }
    }
  })

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // simple validations
    const errs = {}
    if (!form.title || form.title.trim().length < 3) errs.title = 'Title is required (min 3 chars)'
    if (!form.department) errs.department = 'Department is required'
    if (!form.deadline) errs.deadline = 'Deadline is required'
    if (!form.responsibilities) errs.responsibilities = 'Responsibilities are required'
    if (!form.qualifications) errs.qualifications = 'Qualifications are required'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    // try to parse scoring matrix JSON
    const payload = { ...form }
    if (form.scoring_matrix) {
      try {
        payload.scoring_matrix = JSON.parse(form.scoring_matrix)
      } catch (e) {
        // leave as string if invalid JSON
        payload.scoring_matrix = form.scoring_matrix
      }
    }

    // Map frontend field names to backend field names
    payload.application_deadline = payload.deadline
    delete payload.deadline

    console.log('Submitting vacancy payload:', payload)
    console.log('Is edit mode:', isEdit, 'Vacancy ID:', id)

    if (isEdit) {
      updateMutation.mutate({ id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const activeTab = (() => {
    const path = location.pathname.replace(/\/+$/, '')
    if (path === '/hr' || path === '/hr/dashboard') return 'overview'
    if (path === '/hr/vacancies' || path === '/hr/vacancy-management') return 'vacancies'
    if (path === '/hr/candidates') return 'candidates'
    if (path === '/hr/eligibility') return 'eligibility'
    if (path === '/hr/shortlisting') return 'shortlisting'
    if (path === '/hr/longlisting') return 'longlisting'
    if (path === '/hr/pipeline') return 'pipeline'
    if (path === '/hr/shortlisted') return 'shortlisted'
    if (path === '/hr/hiring') return 'hiring'
    if (path === '/hr/interviews') return 'interviews'
    if (path === '/hr/communication') return 'communication'
    if (path === '/hr/reports') return 'reports'
    if (path === '/hr/audit') return 'audit'
    if (path === '/hr/document-verification') return 'document_verification'
    if (path === '/hr/panel-management') return 'panel_management'
    if (path === '/hr/approval-workflow') return 'approval_workflow'
    if (path === '/hr/settings') return 'settings'
    return 'vacancies'
  })()

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-lg border-gray-200'} ${darkMode ? 'border-r' : ''} shadow-xl w-[280px] sm:w-[260px] md:w-[220px] min-w-[280px] sm:min-w-[260px] md:min-w-[220px] flex-shrink-0 fixed top-0 left-0 h-full z-30 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative overflow-y-auto overflow-x-hidden`}>
          <div className="p-4 sm:p-4 md:p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 sm:mb-4 md:mb-6">
              <h2 className={`text-lg sm:text-base md:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>HR Dashboard</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>
            <nav className="space-y-1 flex-1 overflow-y-auto">
              <Link
                to="/hr/dashboard"
                className={`w-full flex items-center space-x-3 sm:space-x-2 md:space-x-3 px-3 sm:px-2 md:px-3 py-3 sm:py-2 md:py-2.5 rounded-xl text-sm sm:text-xs md:text-sm font-medium transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <BarChart3 className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span>Overview</span>
              </Link>
              
              <div className="space-y-2">
                <button
                  type="button"
                  className={`w-full flex items-center justify-between rounded-lg px-3 sm:px-2 md:px-3 py-2 sm:py-2 text-left text-xs sm:text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em] md:hidden ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700'}`}
                  onClick={() => setSidebarSectionOpen((prev) => ({ ...prev, talent: !prev.talent }))}
                >
                  <span>Talent</span>
                  <ChevronDown className={`w-4 h-4 sm:w-3 sm:h-3 md:w-4 md:h-4 transition-transform ${sidebarSectionOpen.talent ? 'rotate-180' : ''}`} />
                </button>
                <p className={`hidden md:block text-xs sm:text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em] mb-3 sm:mb-2 md:mb-3 ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>Talent</p>
                <div className={`${sidebarSectionOpen.talent ? 'block' : 'hidden'} md:block space-y-1`}>
                  <Link
                    to="/hr/candidates"
                    className={`w-full flex items-center space-x-3 sm:space-x-2 md:space-x-3 px-3 sm:px-2 md:px-3 py-3 sm:py-2 md:py-2.5 rounded-xl text-sm sm:text-xs md:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'candidates'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Users className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span>Applicant Tracking</span>
                  </Link>
                  <Link
                    to="/hr/eligibility"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'eligibility'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Eligibility Screening</span>
                  </Link>
                  <Link
                    to="/hr/shortlisting"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'shortlisting'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>AI Shortlisting</span>
                  </Link>
                  <Link
                    to="/hr/longlisting"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'longlisting'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Longlisting</span>
                  </Link>
                  <Link
                    to="/hr/pipeline"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'pipeline'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <GitBranch className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Recruitment Pipeline</span>
                  </Link>
                  <Link
                    to="/hr/shortlisted"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'shortlisted'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Shortlisted Candidates</span>
                  </Link>
                  <Link
                    to="/hr/hiring"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'hiring'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Hiring Workflow</span>
                  </Link>
                  <Link
                    to="/hr/interviews"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'interviews'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Interview Management</span>
                  </Link>
                  <Link
                    to="/hr/communication"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'communication'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Bulk Communication</span>
                  </Link>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 border-t border-blue-100 pt-3 sm:pt-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 px-3 sm:px-2 md:px-3 py-2 sm:py-2 text-left text-xs sm:text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em] text-purple-700 md:hidden"
                  onClick={() => setSidebarSectionOpen((prev) => ({ ...prev, operations: !prev.operations }))}
                >
                  <span>Operations</span>
                  <ChevronDown className={`w-4 h-4 sm:w-3 sm:h-3 md:w-4 md:h-4 transition-transform ${sidebarSectionOpen.operations ? 'rotate-180' : ''}`} />
                </button>
                <p className="hidden md:block text-xs sm:text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em] text-purple-600 mb-3 sm:mb-2 md:mb-3">Operations</p>
                <div className={`${sidebarSectionOpen.operations ? 'block' : 'hidden'} md:block space-y-1`}>
                  <Link
                    to="/hr/vacancies"
                    className={`w-full flex items-center space-x-3 sm:space-x-2 md:space-x-3 px-3 sm:px-2 md:px-3 py-3 sm:py-2 md:py-2.5 rounded-xl text-sm sm:text-xs md:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'vacancies'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Briefcase className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span>Vacancy Management</span>
                  </Link>
                  <Link
                    to="/hr/reports"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'reports'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Reports & Analytics</span>
                  </Link>
                  <Link
                    to="/hr/audit"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'audit'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <History className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Audit Trail</span>
                  </Link>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 border-t border-blue-100 pt-3 sm:pt-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-lg bg-gradient-to-r from-green-50 to-teal-50 px-3 sm:px-2 md:px-3 py-2 sm:py-2 text-left text-xs sm:text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em] text-green-700 md:hidden"
                  onClick={() => setSidebarSectionOpen((prev) => ({ ...prev, compliance: !prev.compliance }))}
                >
                  <span>Compliance</span>
                  <ChevronDown className={`w-4 h-4 sm:w-3 sm:h-3 md:w-4 md:h-4 transition-transform ${sidebarSectionOpen.compliance ? 'rotate-180' : ''}`} />
                </button>
                <p className="hidden md:block text-xs sm:text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em] text-green-600 mb-3 sm:mb-2 md:mb-3">Compliance</p>
                <div className={`${sidebarSectionOpen.compliance ? 'block' : 'hidden'} md:block space-y-1`}>
                  <Link
                    to="/hr/document-verification"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'document_verification'
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 hover:text-green-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Document Verification</span>
                  </Link>
                  <Link
                    to="/hr/panel-management"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'panel_management'
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 hover:text-green-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Panel Management</span>
                  </Link>
                  <Link
                    to="/hr/approval-workflow"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'approval_workflow'
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 hover:text-green-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Approval Workflow</span>
                  </Link>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 border-t border-blue-100 pt-3 sm:pt-4">
                <p className={`hidden md:block text-xs sm:text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em] mb-3 sm:mb-2 md:mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Settings</p>
                <div className="space-y-1">
                  <Link
                    to="/hr/settings"
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'settings'
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      // Handle logout
                      localStorage.removeItem('token')
                      window.location.href = '/login'
                    }}
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      darkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700'
                    }`}
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          {/* Mobile Header */}
          <div className={`lg:hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-20`}>
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{isEdit ? 'Edit Vacancy' : 'Create Vacancy'}</h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header Section */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 mb-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${isEdit ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                    {isEdit ? <Briefcase className="w-6 h-6 text-white" /> : <Sparkles className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {isEdit ? 'Edit Vacancy' : 'Create Vacancy'}
                    </h1>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {isEdit ? 'Update vacancy details and requirements' : 'Fill in the details to create a new job vacancy'}
                    </p>
                  </div>
                </div>
                <Link
                  to={navigateTarget}
                  className={`hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Link>
              </div>
            </div>

            {/* Main Form Card */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <Briefcase className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Basic Information</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Job Title</label>
                      <div className="relative">
                        <Briefcase className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                        <input 
                          value={form.title} 
                          onChange={(e) => handleChange('title', e.target.value)} 
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                              : 'bg-white border-gray-200 focus:border-purple-500'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                          placeholder="e.g. Senior Software Engineer"
                          required 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Reference Number</label>
                        <div className="relative">
                          <FileText className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                          <input 
                            value={form.reference_no} 
                            onChange={(e) => handleChange('reference_no', e.target.value)} 
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                                : 'bg-white border-gray-200 focus:border-purple-500'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                            placeholder="e.g. REF-2024-001"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Department</label>
                        <div className="relative">
                          <Building2 className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                          <input 
                            value={form.department} 
                            onChange={(e) => handleChange('department', e.target.value)} 
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                                : 'bg-white border-gray-200 focus:border-purple-500'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                            placeholder="e.g. Engineering"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Job Grade</label>
                        <div className="relative">
                          <Layers className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                          <input 
                            value={form.job_grade} 
                            onChange={(e) => handleChange('job_grade', e.target.value)} 
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                                : 'bg-white border-gray-200 focus:border-purple-500'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                            placeholder="e.g. Grade 7"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Employment Type</label>
                        <div className="relative">
                          <Clock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                          <select
                            value={form.employment_type} 
                            onChange={(e) => handleChange('employment_type', e.target.value)} 
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                                : 'bg-white border-gray-200 focus:border-purple-500'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer`}
                          >
                            <option value="">Select type</option>
                            <option value="full_time">Full-time</option>
                            <option value="part_time">Part-time</option>
                            <option value="contract">Contract</option>
                            <option value="internship">Internship</option>
                          </select>
                          <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'} pointer-events-none`} />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Positions</label>
                        <div className="relative">
                          <Users className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                          <input 
                            type="number" 
                            value={form.positions} 
                            onChange={(e) => handleChange('positions', parseInt(e.target.value || 1))} 
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                                : 'bg-white border-gray-200 focus:border-purple-500'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                            placeholder="1"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                        <div className="relative">
                          <MapPin className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                          <input 
                            value={form.location} 
                            onChange={(e) => handleChange('location', e.target.value)} 
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                                : 'bg-white border-gray-200 focus:border-purple-500'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                            placeholder="e.g. Nairobi, Kenya"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Application Deadline</label>
                        <div className="relative">
                          <Calendar className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                          <input 
                            type="date" 
                            value={form.deadline} 
                            onChange={(e) => handleChange('deadline', e.target.value)} 
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                                : 'bg-white border-gray-200 focus:border-purple-500'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Description Section */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                      <FileText className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Job Description</h2>
                  </div>
                  
                  <div>
                    {ReactQuill ? (
                      <div className={`rounded-xl border ${darkMode ? 'border-gray-600' : 'border-gray-200'} overflow-hidden bg-white`}>
                        <ReactQuill 
                          value={form.description} 
                          onChange={(val) => handleChange('description', val)} 
                          theme="snow"
                          className={darkMode ? 'bg-gray-700 text-white' : 'bg-white'}
                          placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                        />
                      </div>
                    ) : (
                      <textarea 
                        value={form.description} 
                        onChange={(e) => handleChange('description', e.target.value)} 
                        className={`w-full px-4 py-3 rounded-xl border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                            : 'bg-white border-gray-200 focus:border-purple-500'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none`}
                        rows={8}
                        placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                      ></textarea>
                    )}
                    <p className={`text-xs mt-2 flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Sparkles className="w-4 h-4 mr-1" />
                      Rich editor available when `react-quill` is installed
                    </p>
                  </div>
                </div>

                {/* Scoring Matrix Section */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-green-50 to-teal-50'}`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                      <Brain className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Scoring Matrix</h2>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Configure AI-powered candidate evaluation weights</p>
                    </div>
                  </div>
                  
                  <div>
                    <ScoringWeightsEditor value={form.scoring_matrix} onChange={(v) => handleChange('scoring_matrix', v)} />
                    <p className={`text-xs mt-2 flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Weights will be saved on the vacancy and used by the shortlisting engine
                    </p>
                  </div>
                </div>

                {/* Requirements Section */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-orange-50 to-amber-50'}`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                      <CheckCircle2 className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Requirements</h2>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>List qualifications, skills, and experience needed</p>
                    </div>
                  </div>
                  
                  <div>
                    <textarea 
                      value={form.requirements} 
                      onChange={(e) => handleChange('requirements', e.target.value)} 
                      className={`w-full px-4 py-3 rounded-xl border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                          : 'bg-white border-gray-200 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none`}
                      rows={6}
                      placeholder="e.g.&#10;• Bachelor's degree in Computer Science or related field&#10;• 5+ years of experience in software development&#10;• Proficiency in React, Node.js, and cloud services"
                    ></textarea>
                  </div>
                </div>

                {/* Responsibilities Section */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-cyan-50 to-blue-50'}`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
                      <ClipboardList className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                    </div>
                    <div>
                      <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Responsibilities *</h2>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Describe the key duties and responsibilities for this role</p>
                    </div>
                  </div>
                  
                  <div>
                    <textarea 
                      value={form.responsibilities} 
                      onChange={(e) => handleChange('responsibilities', e.target.value)} 
                      className={`w-full px-4 py-3 rounded-xl border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                          : 'bg-white border-gray-200 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none`}
                      rows={6}
                      placeholder="e.g.&#10;• Lead development of web applications using React and Node.js&#10;• Mentor junior developers and conduct code reviews&#10;• Collaborate with product team to define technical requirements"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Qualifications Section */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-emerald-50 to-green-50'}`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                      <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                      <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Qualifications *</h2>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Specify the required qualifications and certifications</p>
                    </div>
                  </div>
                  
                  <div>
                    <textarea 
                      value={form.qualifications} 
                      onChange={(e) => handleChange('qualifications', e.target.value)} 
                      className={`w-full px-4 py-3 rounded-xl border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                          : 'bg-white border-gray-200 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none`}
                      rows={6}
                      placeholder="e.g.&#10;• Bachelor's degree in Computer Science, Information Technology, or related field&#10;• 5+ years of professional software development experience&#10;• Strong proficiency in JavaScript, React, and modern web frameworks"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to={navigateTarget}
                    className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl border transition-all ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Link>
                  <button 
                    type="submit" 
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                    className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : (isEdit ? 'Update Vacancy' : 'Create Vacancy')}</span>
                  </button>
                </div>

                {/* Error Display */}
                {Object.keys(errors).length > 0 && (
                  <div className={`p-4 rounded-xl border-2 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800`}>
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className={`text-sm font-semibold text-red-800 dark:text-red-300 mb-2`}>Please fix the following errors:</h4>
                        <ul className="space-y-1">
                          {Object.values(errors).map((v, i) => (
                            <li key={i} className={`text-sm text-red-700 dark:text-red-400 flex items-start`}>
                              <span className="mr-2">-</span>
                              <span>{v}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
