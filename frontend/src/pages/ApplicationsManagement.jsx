import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { hrAPI, normalizeApplicationList } from '../services/api'
import { Link } from 'react-router-dom'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Menu,
  X,
  LayoutGrid,
  List,
  BarChart3,
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
  Users2,
  Briefcase
} from 'lucide-react'

const emptyForm = {
  applicant_name: '',
  vacancy_title: '',
  status: 'submitted',
  notes: ''
}

export default function ApplicationsManagement() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
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

  const { data: resp, isLoading, error } = useQuery(['hr:applications', page, pageSize, sortBy, sortDir], async () => {
    const ordering = sortBy ? (sortDir === 'desc' ? `-${sortBy}` : sortBy) : undefined
    const res = await hrAPI.listApplications({ page, page_size: pageSize, ordering })
    return res.data
  }, { keepPreviousData: true })

  const applications = normalizeApplicationList(resp)
  const total = resp?.count ?? (Array.isArray(resp) ? resp.length : 0)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const createApplication = useMutation((payload) => hrAPI.createApplication(payload), {
    onSuccess: () => queryClient.invalidateQueries(['hr:applications'])
  })

  const updateApplication = useMutation(({ id, data }) => hrAPI.updateApplication(id, data), {
    onSuccess: () => queryClient.invalidateQueries(['hr:applications'])
  })

  const deleteApplication = useMutation((id) => hrAPI.deleteApplication(id), {
    onSuccess: () => queryClient.invalidateQueries(['hr:applications'])
  })

  const updateStatus = useMutation(({ id, status }) => hrAPI.updateApplicationStatus(id, { status }), {
    onSuccess: () => {
      queryClient.invalidateQueries(['hr:applications'])
      console.log('Application status updated successfully')
    },
    onError: (error) => {
      console.error('Failed to update application status:', error.response?.data || error.message)
      alert('Failed to update application status. Please try again.')
    }
  })

  const handleOpenCreate = () => {
    setEditingApplication(null)
    setFormData(emptyForm)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (application) => {
    setEditingApplication(application)
    setFormData({
      applicant_name: application.applicant_name || application.name || '',
      vacancy_title: application.vacancy_title || application.job?.title || '',
      status: application.status || 'submitted',
      notes: application.notes || ''
    })
    setIsFormOpen(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {
      applicant_name: formData.applicant_name,
      vacancy_title: formData.vacancy_title,
      status: formData.status,
      notes: formData.notes,
    }

    if (editingApplication) {
      updateApplication.mutate({ id: editingApplication.id, data: payload })
    } else {
      createApplication.mutate(payload)
    }

    setIsFormOpen(false)
    setFormData(emptyForm)
    setEditingApplication(null)
  }

  const handleDelete = (application) => {
    if (window.confirm(`Delete ${application.name || application.applicant_name}? This action cannot be undone.`)) {
      deleteApplication.mutate(application.id)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted':
        return darkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-200'
      case 'rejected':
        return darkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-200'
      case 'submitted':
        return darkMode ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200'
      case 'under_review':
        return darkMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'interview_scheduled':
        return darkMode ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return darkMode ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'shortlisted':
        return <CheckCircle className="w-3 h-3" />
      case 'rejected':
        return <XCircle className="w-3 h-3" />
      case 'submitted':
        return <Clock className="w-3 h-3" />
      case 'under_review':
        return <Eye className="w-3 h-3" />
      case 'interview_scheduled':
        return <Calendar className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const filteredApplications = applications?.filter(app => {
    const matchesSearch = searchTerm === '' || 
      (app.applicant_name || app.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.job?.title || app.vacancy_title || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  if (isLoading) return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
      <div className="text-center">
        <div className={`inline-block animate-spin rounded-full h-12 w-12 border-4 ${darkMode ? 'border-purple-500 border-t-transparent' : 'border-ncpd-primary border-t-transparent'}`}></div>
        <p className={`mt-4 text-base ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>Loading applications...</p>
      </div>
    </div>
  )
  if (error) return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
      <div className="text-center">
        <div className={`rounded-2xl p-6 max-w-md mx-auto ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          <p className={`text-base font-medium ${darkMode ? 'text-red-400' : 'text-red-800'}`}>Failed to load applications</p>
          <p className={`text-sm mt-2 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>Please try again later</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
      <div className="flex">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg`}
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

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
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700'
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

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 lg:ml-0">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className={`mb-8 rounded-2xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <Users className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Recruitment Management</p>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Applications</h1>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Manage and review all job applications</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                    className={`p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {viewMode === 'table' ? <LayoutGrid className="w-5 h-5" /> : <List className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleOpenCreate}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${darkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Applicant</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className={`mb-6 rounded-2xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="relative">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                          : 'bg-white border-gray-200 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status:</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`px-4 py-3 rounded-xl border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                          : 'bg-white border-gray-200 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                    >
                      <option value="all">All Status</option>
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="interview_scheduled">Interview Scheduled</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sort:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`px-4 py-3 rounded-xl border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                          : 'bg-white border-gray-200 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                    >
                      <option value="created_at">Date</option>
                      <option value="ai_score">AI Score</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications Table */}
            <div className={`rounded-2xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Applicant
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Vacancy
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Date
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
                    {filteredApplications?.map(app => (
                      <tr key={app.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-100'}`}>
                              <Users className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                            </div>
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{app.applicant_name || app.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Briefcase className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{app.job?.title || app.vacancy_title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {app.submitted_date ? new Date(app.submitted_date).toLocaleDateString() : '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            <span className="capitalize">{app.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`${app.id}`}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-700 text-blue-400' 
                                  : 'hover:bg-blue-50 text-blue-600'
                              }`}
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleOpenEdit(app)}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-700 text-green-400' 
                                  : 'hover:bg-green-50 text-green-600'
                              }`}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus.mutate({ id: app.id, status: 'shortlisted' })}
                              disabled={updateStatus.isLoading}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-700 text-emerald-400 disabled:text-gray-600' 
                                  : 'hover:bg-emerald-50 text-emerald-600 disabled:text-gray-400'
                              }`}
                              title="Shortlist"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus.mutate({ id: app.id, status: 'rejected' })}
                              disabled={updateStatus.isLoading}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-700 text-red-400 disabled:text-gray-600' 
                                  : 'hover:bg-red-50 text-red-600 disabled:text-gray-400'
                              }`}
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(app)}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-700 text-red-500' 
                                  : 'hover:bg-red-50 text-red-700'
                              }`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing page {page} of {totalPages} ({filteredApplications.length} applications)
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button 
                    disabled={page <= 1} 
                    onClick={() => setPage(1)} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    First
                  </button>
                  <button 
                    disabled={page <= 1} 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    Previous
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pn === page 
                            ? 'bg-purple-600 text-white' 
                            : darkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pn}
                      </button>
                    ))
                  })()}
                  <button 
                    disabled={page >= totalPages} 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                  <button 
                    disabled={page >= totalPages} 
                    onClick={() => setPage(totalPages)} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex justify-between items-center p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {editingApplication ? 'Edit Applicant' : 'Add Applicant'}
              </h2>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className={`p-1 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Applicant name
                </label>
                <input 
                  value={formData.applicant_name} 
                  onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })} 
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                      : 'bg-white border-gray-200 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                  required 
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Vacancy title
                </label>
                <input 
                  value={formData.vacancy_title} 
                  onChange={(e) => setFormData({ ...formData, vacancy_title: e.target.value })} 
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                      : 'bg-white border-gray-200 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                      : 'bg-white border-gray-200 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="longlisted">Longlisted</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </label>
                <textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                  className={`w-full px-4 py-3 rounded-xl border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                      : 'bg-white border-gray-200 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none`}
                  rows="3"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)} 
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {editingApplication ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
