import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { hrAPI } from '../services/api'
import { Link, useLocation } from 'react-router-dom'
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Calendar,
  MapPin,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Menu,
  X,
  LayoutGrid,
  List,
  BarChart3,
  Users,
  FileText,
  History,
  Settings,
  LogOut,
  Sun,
  Moon,
  CheckCircle2,
  Brain,
  FileSpreadsheet,
  GitBranch,
  Mail,
  Shield,
  FolderOpen,
  UserCheck,
  Layers,
  ClipboardList,
  FileCheck,
  Users2
} from 'lucide-react'

export default function VacancyManagement() {
  const location = useLocation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('deadline')
  const [sortDir, setSortDir] = useState('asc')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarSectionOpen, setSidebarSectionOpen] = useState({
    talent: true,
    operations: true,
    compliance: true,
  })
  const [darkMode, setDarkMode] = useState(false)
  const [viewMode, setViewMode] = useState('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: resp, isLoading, error } = useQuery(['hr:vacancies', page, pageSize, sortBy, sortDir], async () => {
    const ordering = sortBy ? (sortDir === 'desc' ? `-${sortBy}` : sortBy) : undefined
    const res = await hrAPI.listVacancies({ page, page_size: pageSize, ordering })
    return res.data
  }, { keepPreviousData: true })

  const vacancies = resp?.results || resp || []
  const total = resp?.count ?? (Array.isArray(resp) ? resp.length : 0)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const publishMutation = useMutation((id) => hrAPI.publishVacancy(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('hr:vacancies')
      console.log('Vacancy published successfully')
    },
    onError: (error) => {
      console.error('Failed to publish vacancy:', error.response?.data || error.message)
      alert('Failed to publish vacancy. Please try again.')
    }
  })

  const closeMutation = useMutation((id) => hrAPI.closeVacancy(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('hr:vacancies')
      console.log('Vacancy closed successfully')
    },
    onError: (error) => {
      console.error('Failed to close vacancy:', error.response?.data || error.message)
      alert('Failed to close vacancy. Please try again.')
    }
  })

  const deleteMutation = useMutation((id) => hrAPI.deleteVacancy(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('hr:vacancies')
      console.log('Vacancy deleted successfully')
    },
    onError: (error) => {
      console.error('Failed to delete vacancy:', error.response?.data || error.message)
      alert('Failed to delete vacancy. Please try again.')
    }
  })

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

  // Filter vacancies
  const filteredVacancies = vacancies.filter(v => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const title = (v.title || '').toLowerCase()
      const department = (v.department_name || v.department || '').toLowerCase()
      if (!title.includes(searchLower) && !department.includes(searchLower)) return false
    }
    if (statusFilter !== 'all' && v.status !== statusFilter) return false
    return true
  })

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return <CheckCircle className="w-4 h-4" />
      case 'draft':
        return <Clock className="w-4 h-4" />
      case 'closed':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading vacancies...</p>
      </div>
    </div>
  )
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
        <div className="flex items-center space-x-3 text-red-600 mb-4">
          <XCircle className="w-8 h-8" />
          <h3 className="text-lg font-semibold">Error Loading Vacancies</h3>
        </div>
        <p className="text-gray-600">Failed to load vacancies. Please try again later.</p>
      </div>
    </div>
  )

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
                  darkMode 
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
                    to="/hr/applications"
                    className={`w-full flex items-center space-x-3 sm:space-x-2 md:space-x-3 px-3 sm:px-2 md:px-3 py-3 sm:py-2 md:py-2.5 rounded-xl text-sm sm:text-xs md:text-sm font-medium transition-all duration-200 ${
                      darkMode 
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
                      darkMode 
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
                      darkMode 
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
                      darkMode 
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
                      darkMode 
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
                      darkMode 
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
                      darkMode 
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
                      darkMode 
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
                      darkMode 
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
                      darkMode 
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
                      darkMode 
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
                      darkMode 
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
                    className={`w-full flex items-center space-x-3 sm:space-x-2 md:space-x-3 px-3 sm:px-2 md:px-3 py-3 sm:py-2 md:py-2.5 rounded-xl text-sm sm:text-xs md:text-sm font-medium transition-all duration-200 ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 hover:text-green-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FileCheck className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span>Document Verification</span>
                  </Link>
                  <Link
                    to="/hr/panel-management"
                    className={`w-full flex items-center space-x-3 sm:space-x-2 md:space-x-3 px-3 sm:px-2 md:px-3 py-3 sm:py-2 md:py-2.5 rounded-xl text-sm sm:text-xs md:text-sm font-medium transition-all duration-200 ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 hover:text-green-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Users2 className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span>Panel Management</span>
                  </Link>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-full flex items-center space-x-3 sm:space-x-2 md:space-x-3 px-3 sm:px-2 md:px-3 py-3 sm:py-2 md:py-2.5 rounded-xl text-sm sm:text-xs md:text-sm font-medium transition-all duration-200 ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 hover:text-green-700'
                    }`}
                  >
                    {darkMode ? <Sun className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5" /> : <Moon className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('access_token')
                      localStorage.removeItem('refresh_token')
                      window.location.href = '/login'
                    }}
                    className={`w-full flex items-center space-x-3 sm:space-x-2 md:space-x-3 px-3 sm:px-2 md:px-3 py-3 sm:py-2 md:py-2.5 rounded-xl text-sm sm:text-xs md:text-sm font-medium transition-all duration-200 ${
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

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg`}
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          {/* Mobile Header */}
          <div className={`lg:hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-20`}>
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Vacancy Management</h1>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Vacancy Management
                  </h1>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    Create and manage job vacancies
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {viewMode === 'table' ? <LayoutGrid className="w-5 h-5" /> : <List className="w-5 h-5" />}
                  </button>
                  <Link
                    to="create"
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Vacancy</span>
                  </Link>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search vacancies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-gray-50 border-gray-200 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-4 py-2 rounded-xl border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                        : 'bg-gray-50 border-gray-200 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`px-4 py-2 rounded-xl border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                        : 'bg-gray-50 border-gray-200 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                  >
                    <option value="title">Sort by Title</option>
                    <option value="deadline">Sort by Deadline</option>
                    <option value="status">Sort by Status</option>
                  </select>
                  <select
                    value={sortDir}
                    onChange={(e) => setSortDir(e.target.value)}
                    className={`px-4 py-2 rounded-xl border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                        : 'bg-gray-50 border-gray-200 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Vacancies</p>
                    <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Published</p>
                    <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {vacancies.filter(v => v.status === 'published').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Draft</p>
                    <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {vacancies.filter(v => v.status === 'draft').length}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Closed</p>
                    <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {vacancies.filter(v => v.status === 'closed').length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Vacancies Table */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Title
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Department
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Location
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Deadline
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Status
                      </th>
                      <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredVacancies?.map(v => (
                      <tr key={v.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-100'}`}>
                              <Briefcase className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                            </div>
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{v.title}</p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{v.employment_type || 'Full-time'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Building2 className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{v.department_name || v.department}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{v.location || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {v.application_deadline || v.deadline ? new Date(v.application_deadline || v.deadline).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(v.status)}`}>
                            {getStatusIcon(v.status)}
                            <span className="capitalize">{v.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`${v.id}/edit`}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-700 text-blue-400' 
                                  : 'hover:bg-blue-50 text-blue-600'
                              }`}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => publishMutation.mutate(v.id)}
                              disabled={v.status === 'published' || publishMutation.isLoading}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-700 text-green-400 disabled:text-gray-600' 
                                  : 'hover:bg-green-50 text-green-600 disabled:text-gray-400'
                              }`}
                              title="Publish"
                            >
                              {publishMutation.isLoading && publishMutation.variables === v.id ? (
                                <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => closeMutation.mutate(v.id)}
                              disabled={v.status === 'closed' || closeMutation.isLoading}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-700 text-red-400 disabled:text-gray-600' 
                                  : 'hover:bg-red-50 text-red-600 disabled:text-gray-400'
                              }`}
                              title="Close"
                            >
                              {closeMutation.isLoading && closeMutation.variables === v.id ? (
                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this vacancy? This action cannot be undone.')) {
                                  deleteMutation.mutate(v.id)
                                }
                              }}
                              disabled={deleteMutation.isLoading}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-700 text-red-500 disabled:text-gray-600' 
                                  : 'hover:bg-red-50 text-red-700 disabled:text-gray-400'
                              }`}
                              title="Delete"
                            >
                              {deleteMutation.isLoading && deleteMutation.variables === v.id ? (
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Showing page {page} of {totalPages} ({filteredVacancies.length} vacancies)
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={pageSize}
                      onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1) }}
                      className={`px-3 py-1 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-200'
                      } text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                    <div className="flex items-center space-x-1">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage(1)}
                        className={`px-3 py-1 rounded-lg border transition-colors ${
                          darkMode 
                            ? 'border-gray-600 hover:bg-gray-700 disabled:opacity-50' 
                            : 'border-gray-200 hover:bg-gray-50 disabled:opacity-50'
                        }`}
                      >
                        First
                      </button>
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={`px-3 py-1 rounded-lg border transition-colors ${
                          darkMode 
                            ? 'border-gray-600 hover:bg-gray-700 disabled:opacity-50' 
                            : 'border-gray-200 hover:bg-gray-50 disabled:opacity-50'
                        }`}
                      >
                        Prev
                      </button>
                      {(() => {
                        const start = Math.max(1, page - 2)
                        const end = Math.min(totalPages, page + 2)
                        const pages = []
                        for (let i = start; i <= end; i++) pages.push(i)
                        return pages.map(pn => (
                          <button
                            key={pn}
                            onClick={() => setPage(pn)}
                            className={`px-3 py-1 rounded-lg border transition-colors ${
                              pn === page
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent'
                                : darkMode
                                  ? 'border-gray-600 hover:bg-gray-700'
                                  : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {pn}
                          </button>
                        ))
                      })()}
                      <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className={`px-3 py-1 rounded-lg border transition-colors ${
                          darkMode 
                            ? 'border-gray-600 hover:bg-gray-700 disabled:opacity-50' 
                            : 'border-gray-200 hover:bg-gray-50 disabled:opacity-50'
                        }`}
                      >
                        Next
                      </button>
                      <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(totalPages)}
                        className={`px-3 py-1 rounded-lg border transition-colors ${
                          darkMode 
                            ? 'border-gray-600 hover:bg-gray-700 disabled:opacity-50' 
                            : 'border-gray-200 hover:bg-gray-50 disabled:opacity-50'
                        }`}
                      >
                        Last
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
