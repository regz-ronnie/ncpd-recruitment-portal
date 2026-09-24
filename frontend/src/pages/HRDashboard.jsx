import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import JSZip from 'jszip'
import { PDFViewer } from '../components/PDFViewer'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts'
import {
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Eye,
  MessageSquare,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Brain,
  Target,
  BarChart3,
  Download,
  RefreshCw,
  Shield,
  FileText,
  Folder,
  FolderOpen,
  Workflow,
  Database,
  GitBranch,
  Settings,
  Accessibility,
  Users2,
  Building2,
  GraduationCap,
  Award,
  CheckSquare,
  Layers,
  Activity,
  Zap,
  FileCheck,
  ClipboardList,
  UserCheck,
  Lock,
  Unlock,
  EyeOff,
  MapPin,
  Menu,
  Copy,
  Grid3X3,
  Table,
  FileUp,
  Mail,
  History,
  LayoutGrid,

  FileSpreadsheet,
  Send,
  CheckCircle2,
  X,
  Sun,
  Moon,
  LogOut
} from 'lucide-react'
import { useJobs } from '../hooks/useJobs'
import { useAIMatching, useAIInsights } from '../hooks/useAI'
import { useHRAnalytics } from '../hooks/useHRAnalytics'
import api, { hrAPI, normalizeApplicationList, normalizeUserList } from '../services/api'
import { ApplicationCard } from '../components/ApplicationCard'
import { AIInsightsPanel } from '../components/AIInsightsPanel'
import { CandidateScoringTable } from '../components/CandidateScoringTable'
import { MetricsOverview } from '../components/MetricsOverview'
import { FilterPanel } from '../components/FilterPanel'
import { IntelligentShortlisting } from '../components/IntelligentShortlisting'
import { DownloadsManagement } from '../components/DownloadsManagement'
import { HRAnalyticsDashboard } from '../components/HRAnalyticsDashboard'
import { KENYAN_COUNTIES } from '../data/kenyanCounties'

export const HRDashboard = () => {
  const location = useLocation()
  const [selectedApplications, setSelectedApplications] = useState([])
  const [viewMode, setViewMode] = useState('grid') // grid, table, analytics, roles, workflow, architecture, downloads
  const [bulkSelectMode, setBulkSelectMode] = useState(false)
  const [selectedForBulk, setSelectedForBulk] = useState([])
  const [showComparison, setShowComparison] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    scoreRange: [0, 100],
    skills: [],
    experience: 'all',
    experienceOperator: 'gte', // gte, lte
    experienceValue: '',
    ageOperator: 'gte', // gte, lte
    ageValue: '',
    county: 'all',
    role: 'all',
    searchTerm: '',
    educationLevel: 'all',
    employmentType: 'all',
    gender: 'all',
    disabilityStatus: 'all',
    certification: 'all'
  })
  const [userRole, setUserRole] = useState('hr_manager') // hr_officer, hr_manager, director, interview_panel
  const [accessibilityMode, setAccessibilityMode] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showArchitecture, setShowArchitecture] = useState(false)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarSectionOpen, setSidebarSectionOpen] = useState({
    talent: true,
    operations: true,
    compliance: true,
  })
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [selectedVacancyId, setSelectedVacancyId] = useState(null)
  const [documentViewer, setDocumentViewer] = useState({ isOpen: false, documents: [], applicantName: null })
  const [expandedFolders, setExpandedFolders] = useState({})

  // Helper function to group documents by type
  const groupDocumentsByType = (allDocuments, applicationResume, applicationPortfolio, additionalDocs) => {
    const folders = {
      resume: { name: 'Resume', documents: [], icon: 'FileText' },
      portfolio: { name: 'Portfolio', documents: [], icon: 'Folder' },
      additional: { name: 'Additional Documents', documents: [], icon: 'Folder' },
      certificates: { name: 'Certificates', documents: [], icon: 'Award' },
      other: { name: 'Other Documents', documents: [], icon: 'FileText' }
    }

    // Add resume
    if (applicationResume) {
      folders.resume.documents.push({
        name: 'Resume',
        file: applicationResume,
        type: 'resume'
      })
    }

    // Add portfolio
    if (applicationPortfolio) {
      folders.portfolio.documents.push({
        name: 'Portfolio',
        file: applicationPortfolio,
        type: 'portfolio'
      })
    }

    // Add additional documents
    if (additionalDocs && Array.isArray(additionalDocs)) {
      additionalDocs.forEach((doc, idx) => {
        const docName = doc.name || doc.document_type || `Document ${idx + 1}`
        const docFile = doc.file_url || doc.url || doc.file
        const docType = doc.document_type?.toLowerCase() || ''
        
        if (docType.includes('certificate') || docType.includes('cert')) {
          folders.certificates.documents.push({
            name: docName,
            file: docFile,
            type: 'certificate'
          })
        } else {
          folders.additional.documents.push({
            name: docName,
            file: docFile,
            type: 'additional'
          })
        }
      })
    }

    // Add all_documents if present
    if (allDocuments && Array.isArray(allDocuments)) {
      allDocuments.forEach((doc, idx) => {
        const docName = doc.name || doc.document_type || `Document ${idx + 1}`
        const docFile = doc.file_url || doc.url || doc.file
        const docType = doc.document_type?.toLowerCase() || ''
        
        if (docType.includes('resume') || docType.includes('cv')) {
          if (!folders.resume.documents.length) {
            folders.resume.documents.push({
              name: docName,
              file: docFile,
              type: 'resume'
            })
          }
        } else if (docType.includes('portfolio')) {
          if (!folders.portfolio.documents.length) {
            folders.portfolio.documents.push({
              name: docName,
              file: docFile,
              type: 'portfolio'
            })
          }
        } else if (docType.includes('certificate') || docType.includes('cert')) {
          folders.certificates.documents.push({
            name: docName,
            file: docFile,
            type: 'certificate'
          })
        } else {
          folders.other.documents.push({
            name: docName,
            file: docFile,
            type: 'other'
          })
        }
      })
    }

    // Return only folders that have documents
    return Object.entries(folders)
      .filter(([_, folder]) => folder.documents.length > 0)
      .map(([key, folder]) => ({ key, ...folder }))
  }

  const toggleFolder = (applicantId, folderKey) => {
    setExpandedFolders(prev => ({
      ...prev,
      [`${applicantId}-${folderKey}`]: !prev[`${applicantId}-${folderKey}`]
    }))
  }

  // Handle download all files in a folder as ZIP
  const handleDownloadFolder = async (documents, folderName, applicantName) => {
    if (!documents || documents.length === 0) return

    try {
      const zip = new JSZip()
      
      // Add each file to the ZIP
      for (const doc of documents) {
        if (doc.file) {
          const url = getBackendMediaUrl(doc.file)
          const response = await fetch(url)
          const blob = await response.blob()
          const fileName = doc.name || `${folderName}_${documents.indexOf(doc) + 1}`
          zip.file(fileName, blob)
        }
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Create filename with applicant name only
      const sanitizedAppName = applicantName?.replace(/[^a-zA-Z0-9]/g, '_') || 'applicant'
      const zipFileName = `${sanitizedAppName}.zip`
      
      // Download the ZIP file
      const link = document.createElement('a')
      link.href = URL.createObjectURL(zipBlob)
      link.download = zipFileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Error creating ZIP file:', error)
      alert('Failed to create ZIP file. Please try again.')
    }
  }

  // Handle individual document download
  const handleDownloadDocument = (fileUrl, fileName) => {
    if (!fileUrl) return
    
    const url = getBackendMediaUrl(fileUrl)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'document'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Handle view candidate action
  const handleViewCandidate = (candidate) => {
    const allDocuments = candidate.all_documents || []
    const applicationResume = candidate.resume_file || candidate.applicant?.resume_file
    const applicationPortfolio = candidate.portfolio_file || candidate.applicant?.portfolio_file
    const additionalDocs = candidate.additional_documents || candidate.applicant?.attachments || []
    
    setDocumentViewer({
      isOpen: true,
      documents: allDocuments.length > 0 ? allDocuments : [
        ...(applicationResume ? [{ name: 'Resume', file: applicationResume, type: 'resume' }] : []),
        ...(applicationPortfolio ? [{ name: 'Portfolio', file: applicationPortfolio, type: 'portfolio' }] : []),
        ...(additionalDocs || []).map((doc, idx) => ({
          name: doc.name || doc.document_type || `Document ${idx + 1}`,
          file: doc.file_url || doc.url || doc.file,
          type: 'additional'
        }))
      ],
      applicantName: candidate.name || candidate.applicant_name || candidate.applicant?.name || `${candidate.first_name || candidate.applicant?.first_name || ''} ${candidate.last_name || candidate.applicant?.last_name || ''}`.trim() || 'Unknown'
    })
  }

  // Helper function to convert media URLs to backend URLs
  const getBackendMediaUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // If it's already absolute, check if it's pointing to frontend
      if (url.includes(':3000') || url.includes(':3001') || url.includes(':3002') || url.includes(':3003')) {
        return url.replace(/:300[0-3]/, ':8000')
      }
      return url
    }
    // Convert relative URL to backend URL
    const host = window.location.hostname
    return `http://${host}:8000${url}`
  }

  // Helper function to detect mobile devices
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
  }

  // Handle view documents - always opens modal (made mobile-friendly)
  const handleViewDocuments = (app, allDocuments, applicationResume, applicationPortfolio, additionalDocs) => {
    console.log('handleViewDocuments called', { app, allDocuments, applicationResume, applicationPortfolio, additionalDocs })
    
    const documents = allDocuments.length > 0 ? allDocuments : [
      ...(applicationResume ? [{ name: 'Resume', file: applicationResume, type: 'resume' }] : []),
      ...(applicationPortfolio ? [{ name: 'Portfolio', file: applicationPortfolio, type: 'portfolio' }] : []),
      ...(additionalDocs || []).map((doc, idx) => ({
        name: doc.name || doc.document_type || `Document ${idx + 1}`,
        file: doc.file_url || doc.url || doc.file,
        type: 'additional'
      }))
    ]

    const applicantName = app.name || app.applicant_name || app.applicant?.name || `${app.first_name || app.applicant?.first_name || ''} ${app.last_name || app.applicant?.last_name || ''}`.trim() || 'Unknown'

    console.log('Setting document viewer', { documents, applicantName, isOpen: true })
    
    setDocumentViewer({
      isOpen: true,
      documents,
      applicantName
    })
  }

  // Shared data extraction function for longlisting - used by both view and export
  const extractLonglistingData = (app, index) => {
    // Get work experience
    const workExperiences = app.work_experiences || app.applicant?.work_experiences || app.work_experiences_json || app.applicant?.work_experiences_json || []
    
    // Calculate age
    const calculateAge = (dob) => {
      if (!dob) return 'N/A'
      const birthDate = new Date(dob)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    }
    const age = calculateAge(app.date_of_birth || app.applicant?.date_of_birth)
    
    // Format gender to use initials
    const formatGender = (gender) => {
      if (!gender) return 'N/A'
      const genderLower = gender.toLowerCase()
      if (genderLower === 'male' || genderLower === 'm') return 'M'
      if (genderLower === 'female' || genderLower === 'f') return 'F'
      if (genderLower === 'other' || genderLower === 'o') return 'O'
      return gender.charAt(0).toUpperCase()
    }
    
    // Get academic qualifications
    const academicQuals = app.academic_qualifications || app.applicant?.academic_qualifications || app.academicQualifications || []
    const bachelorDegree = academicQuals.length > 0 
      ? academicQuals[0]?.course || academicQuals[0]?.program || academicQuals[0]?.degree || 'N/A'
      : 'N/A'
    
    // Get professional qualifications
    const professionalQuals = app.professional_qualifications || app.applicant?.professional_qualifications || app.professionalQualifications || []
    const qualificationsText = professionalQuals.length > 0 
      ? professionalQuals.map(q => {
          const issuer = q.institution || q.issuing_organization || ''
          const name = q.qualification || q.name || ''
          const date = q.issued_date || q.date || ''
          const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
          return `${issuer ? issuer + ': ' : ''}${name}${formattedDate ? ' (Issued ' + formattedDate + ')' : ''}`
        }).join('\n')
      : 'N/A'
    
    // Format employment history
    const employmentEntries = workExperiences.length > 0 ? workExperiences.map(exp => {
      const employer = exp.employer || exp.company || 'N/A'
      const position = exp.jobTitle || exp.position || 'N/A'
      
      // Calculate duration in years and months
      let durationText = 'N/A'
      if (exp.startDate) {
        const start = new Date(exp.startDate)
        const end = exp.endDate && exp.endDate !== '' ? new Date(exp.endDate) : new Date()
        const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
        const years = Math.floor(totalMonths / 12)
        const months = totalMonths % 12
        
        const startYear = start.getFullYear()
        const endYear = exp.endDate && exp.endDate !== '' ? end.getFullYear() : 'present'
        const dateRange = `${startYear}-${endYear}`
        
        if (years > 0 && months > 0) {
          durationText = `${dateRange} (${years} yrs, ${months} months)`
        } else if (years > 0) {
          durationText = `${dateRange} (${years} yrs)`
        } else if (months > 0) {
          durationText = `${dateRange} (${months} months)`
        }
      }
      
      return {
        employer,
        position,
        duration: durationText
      }
    }) : [{ employer: 'N/A', position: 'N/A', duration: 'N/A' }]

    return {
      index: index + 1,
      name: app.name || app.applicant_name || app.applicant?.name || `${app.first_name || app.applicant?.first_name || ''} ${app.last_name || app.applicant?.last_name || ''}`.trim() || 'Unknown',
      nationalId: app.national_id || app.applicant?.national_id || app.id_number || app.applicant?.id_number || app.idNumber || app.applicant?.idNumber || app.passport_no || app.applicant?.passport_no || app.passportNo || app.applicant?.passportNo || 'N/A',
      age,
      gender: formatGender(app.gender || app.applicant?.gender),
      county: app.county || app.applicant?.county || 'N/A',
      bachelorDegree,
      qualificationsText,
      employmentEntries,
      status: app.status || 'N/A',
      workExperiences,
      academicQuals,
      professionalQuals
    }
  }

  const activeTab = (() => {
    const path = location.pathname.replace(/\/+$/, '')

    if (path === '/hr' || path === '/hr/dashboard') return 'overview'
    if (path === '/hr/vacancies') return 'vacancies'
    if (path === '/hr/candidates') return 'candidates'
    if (path === '/hr/eligibility') return 'eligibility'
    if (path === '/hr/shortlisting') return 'shortlisting'
    if (path === '/hr/longlisting') return 'longlisting'
    if (path === '/hr/interviews') return 'interviews'
    if (path === '/hr/communication') return 'communication'
    if (path === '/hr/reports') return 'reports'
    if (path === '/hr/audit') return 'audit'
    if (path === '/hr/settings') return 'settings'
    if (path === '/hr/document-verification') return 'document_verification'
    if (path === '/hr/panel-management') return 'panel_management'
    if (path === '/hr/approval-workflow') return 'approval_workflow'
    if (path === '/hr/pipeline') return 'pipeline'
    if (path === '/hr/shortlisted') return 'shortlisted'
    if (path === '/hr/hiring') return 'hiring'
    return 'overview'
  })()

  // Filter states for Longlisting and AI Shortlisting
  const [longlistingFilters, setLonglistingFilters] = useState({
    age: 'all',
    county: 'all',
    experience: 'all',
    educationLevel: 'all',
    gender: 'all',
    disabilityStatus: 'all'
  })
  const [shortlistingFilters, setShortlistingFilters] = useState({
    age: 'all',
    county: 'all',
    experience: 'all',
    educationLevel: 'all',
    gender: 'all',
    minScore: 0
  })
  
  const queryClient = useQueryClient()

  // Use the new HR analytics hook for fetching real data
  const { applications: hrApplications, vacancies: hrVacancies, metrics: hrMetrics, isLoading: hrDataLoading, refetch: refetchHRData } = useHRAnalytics()

  // Fetch data using HR-specific endpoints (for other tabs)
  const { data: applicationsPayload, isLoading: appsLoading, refetch: refetchApps } = useQuery(
    'hr-applications',
    async () => {
      const res = await hrAPI.listApplications()
      console.log('HR Applications raw response:', res.data)
      const normalized = normalizeApplicationList(res.data)
      console.log('HR Applications normalized:', normalized)
      return normalized
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )
  const applications = Array.isArray(applicationsPayload) ? applicationsPayload : []

  const { data: usersPayload } = useQuery(
    'hr-users',
    async () => {
      const res = await hrAPI.listUsers()
      return normalizeUserList(res.data)
    },
    {
      staleTime: 5 * 60 * 1000,
    }
  )
  const users = Array.isArray(usersPayload) ? usersPayload : []

  const candidateSource = applications.length > 0 ? applications : users
  
  // For longlisting tab, we need to ensure we're using applications for the selected vacancy
  const longlistingApplications = selectedVacancyId 
    ? applications.filter(app => app.job?.id === selectedVacancyId)
    : applications
  const { data: jobs, isLoading: jobsLoading } = useJobs()
  const { getMatchingResults, triggerMatching } = useAIMatching()
  const { insights: insightsQuery } = useAIInsights()
  const insights = insightsQuery?.data
  const insightsLoading = insightsQuery?.isLoading

  // Vacancy Management
  const { data: vacancies, isLoading: vacanciesLoading, refetch: refetchVacancies } = useQuery(
    'hr-vacancies',
    () => hrAPI.listVacancies().then(res => res.data?.results || res.data || []),
    {
      staleTime: 5 * 60 * 1000,
    }
  )

  // Auto-select first vacancy removed to keep "All Positions" as default
  // If you want auto-selection, uncomment the following:
  // useEffect(() => {
  //   if (!selectedVacancyId && vacancies?.length > 0) {
  //     setSelectedVacancyId(vacancies[0].id)
  //   }
  // }, [vacancies, selectedVacancyId])

  // Panel Management
  const { data: panels, isLoading: panelsLoading, refetch: refetchPanels } = useQuery(
    'hr-panels',
    () => hrAPI.listPanels().then(res => res.data),
    {
      staleTime: 5 * 60 * 1000,
    }
  )

  // Audit Logs
  const { data: auditLogs, isLoading: auditLogsLoading, refetch: refetchAuditLogs } = useQuery(
    'hr-audit-logs',
    () => hrAPI.getAuditLogs().then(res => res.data),
    {
      staleTime: 2 * 60 * 1000,
    }
  )

  // Analytics
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery(
    'hr-analytics',
    () => hrAPI.getAnalytics().then(res => res.data),
    {
      staleTime: 5 * 60 * 1000,
    }
  )
  
  // Mutations
  const updateApplicationStatus = useMutation(
    ({ applicationId, status, notes }) =>
      hrAPI.updateApplicationStatus(applicationId, { status, notes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hr-applications')
      }
    }
  )
  
  const triggerAIMatching = useMutation(
    (jobId) =>
      triggerMatching({ job_id: jobId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hr-applications')
        queryClient.invalidateQueries('matching-results')
      }
    }
  )

  const triggerShortlist = useMutation(
    (jobId) => hrAPI.triggerShortlist(jobId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hr-applications')
        queryClient.invalidateQueries('vacancies')
      }
    }
  )
  
  // Calculate comprehensive metrics
  const calculateMetrics = () => {
    if (!applications) return null
    
    const total = candidateSource.length
    const pending = candidateSource.filter(app => app.status === 'submitted').length
    const underReview = candidateSource.filter(app => app.status === 'under_review').length
    const shortlisted = candidateSource.filter(app => app.status === 'shortlisted').length
    const interviewed = candidateSource.filter(app => ['interview_scheduled', 'interview_completed'].includes(app.status)).length
    const rejected = candidateSource.filter(app => app.status === 'rejected').length
    const hired = candidateSource.filter(app => 
      app.status === 'offer_accepted' || 
      app.status === 'hired' ||
      app.status === 'offer_extended'
    ).length
    
    const avgScore = candidateSource.reduce((sum, app) => sum + (app.ai_score || 0), 0) / total || 0
    const avgExperience = candidateSource.reduce((sum, app) => sum + (app.experience_years || 0), 0) / total || 0
    
    // Time to hire metrics
    const submittedApps = candidateSource.filter(app => app.submitted_date)
    const avgTimeToHire = submittedApps.length > 0 
      ? submittedApps.reduce((sum, app) => sum + (app.time_to_hire_days || 0), 0) / submittedApps.length 
      : 0
    
    // Diversity metrics
    const genderDistribution = {
      male: candidateSource.filter(app => app.gender?.toLowerCase() === 'male').length,
      female: candidateSource.filter(app => app.gender?.toLowerCase() === 'female').length,
      other: candidateSource.filter(app => {
        const gender = app.gender?.toLowerCase()
        return gender === 'other' || gender === 'n/a' || gender === '' || !gender
      }).length
    }
    
    // County distribution
    const countyDistribution = candidateSource.reduce((acc, app) => {
      const county = app.county || 'Unknown'
      acc[county] = (acc[county] || 0) + 1
      return acc
    }, {})
    
    // Disability status
    const disabilityDistribution = {
      withDisability: candidateSource.filter(app => app.disability_status === 'yes').length,
      withoutDisability: candidateSource.filter(app => app.disability_status === 'no').length,
      notDisclosed: candidateSource.filter(app => !app.disability_status || app.disability_status === 'not_disclosed').length
    }
    
    // Education levels - extract from academic qualifications prioritized over personal education (excluding high school for high-level recruitment)
    const educationDistribution = candidateSource.reduce((acc, app) => {
      // Helper function to get highest education - prioritizes academic qualifications
      const getHighestEducation = (applicant) => {
        const academicQuals = applicant.academic_qualifications || applicant.academicQualifications || []
        const personalEducation = applicant.highest_education || applicant.highestEducation || applicant.education_level || null
        
        // First priority: Use academic qualifications data for high-level recruitment
        if (academicQuals && academicQuals.length > 0) {
          const educationLevels = ['phd', 'doctorate', 'master', 'bachelor', 'diploma', 'certificate', 'professional certification']
          const foundLevels = academicQuals
            .map(q => {
              // Check for the 'degree' field which contains the actual education level
              const degreeText = (q.degree || q.qualification || q.level || q.qualification_level || '').toLowerCase()
              // Skip high school and secondary education in academic qualifications
              if (degreeText.includes('high school') || degreeText.includes('secondary') || degreeText.includes('kcse')) {
                return null
              }
              return degreeText
            })
            .filter(level => level && educationLevels.some(eduLevel => level.includes(eduLevel)))
          
          if (foundLevels.length > 0) {
            // Get the highest education level found
            for (const level of educationLevels) {
              if (foundLevels.some(found => found.includes(level))) {
                return level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ')
              }
            }
          }
        }
        
        // Second priority: Use personal education field, but exclude high school
        if (personalEducation) {
          const normalizedPersonal = personalEducation.toLowerCase().trim()
          // Skip high school from personal education field for high-level recruitment
          if (normalizedPersonal.includes('high school') || normalizedPersonal.includes('secondary') || normalizedPersonal.includes('kcse')) {
            return 'Other' // Downgrade basic education to 'Other'
          }
          // Use the personal education if it's a valid professional level
          if (normalizedPersonal.includes('phd') || normalizedPersonal.includes('doctorate')) return 'PhD'
          if (normalizedPersonal.includes('master')) return 'Master Degree'
          if (normalizedPersonal.includes('bachelor')) return 'Bachelor Degree'
          if (normalizedPersonal.includes('diploma')) return 'Diploma'
          if (normalizedPersonal.includes('professional') || normalizedPersonal.includes('certification')) return 'Professional Certification'
          if (normalizedPersonal.includes('certificate')) return 'Certificate'
          // Return the personal education if it doesn't match known patterns but isn't high school
          return personalEducation.charAt(0).toUpperCase() + personalEducation.slice(1)
        }
        
        // If neither academic qualifications nor valid personal education, return 'Other'
        return 'Other'
      }
      
      const level = getHighestEducation(app) || 'Other'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {})
    
    // Skill match metrics
    const highSkillMatch = candidateSource.filter(app => app.ai_score >= 80).length
    const mediumSkillMatch = candidateSource.filter(app => app.ai_score >= 60 && app.ai_score < 80).length
    const lowSkillMatch = candidateSource.filter(app => app.ai_score < 60).length
    
    return {
      total,
      pending,
      underReview,
      shortlisted,
      interviewed,
      rejected,
      hired,
      avgScore: avgScore.toFixed(1),
      avgExperience: avgExperience.toFixed(1),
      avgTimeToHire: avgTimeToHire.toFixed(1),
      genderDistribution,
      countyDistribution,
      disabilityDistribution,
      educationDistribution,
      skillMatchDistribution: {
        high: highSkillMatch,
        medium: mediumSkillMatch,
        low: lowSkillMatch
      },
      conversionRate: total > 0 ? ((hired / total) * 100).toFixed(1) : '0.0'
    }
  }
  
  const metrics = calculateMetrics() || {
    total: 0,
    pending: 0,
    underReview: 0,
    shortlisted: 0,
    interviewed: 0,
    rejected: 0,
    hired: 0,
    avgScore: 0,
    avgExperience: 0,
    avgTimeToHire: 0,
    genderDistribution: { male: 0, female: 0, other: 0 },
    countyDistribution: {},
    disabilityDistribution: { withDisability: 0, withoutDisability: 0, notDisclosed: 0 },
    educationDistribution: {},
    skillMatchDistribution: { high: 0, medium: 0, low: 0 },
    conversionRate: '0.0'
  }
  
  // Filter applications
  const filteredApplications = candidateSource.filter(app => {
    if (selectedVacancyId && app.job?.id !== selectedVacancyId) return false
    if (filters.status !== 'all' && app.status !== filters.status) return false
    if (app.ai_score < filters.scoreRange[0] || app.ai_score > filters.scoreRange[1]) return false
    if (filters.skills.length > 0) {
      const appSkills = app.matching_result?.matched_skills || []
      const hasRequiredSkill = filters.skills.some(skill => appSkills.includes(skill))
      if (!hasRequiredSkill) return false
    }
    // Age filter - calculate from date of birth
    if (filters.ageValue) {
      const dob = app.date_of_birth || app.applicant?.date_of_birth
      if (dob) {
        const birthDate = new Date(dob)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear() - 
          ((today.getMonth() < birthDate.getMonth() || 
           (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) ? 1 : 0)
        
        if (filters.ageOperator === 'gte' && age < parseInt(filters.ageValue)) return false
        if (filters.ageOperator === 'lte' && age > parseInt(filters.ageValue)) return false
      }
    }
    // Experience filter - handle decimal values for months
    if (filters.experienceValue) {
      const experience = parseFloat(app.experience_years) || 0
      const requiredExperience = parseFloat(filters.experienceValue)
      if (filters.experienceOperator === 'gte' && experience < requiredExperience) return false
      if (filters.experienceOperator === 'lte' && experience > requiredExperience) return false
    }
    // County filter - case insensitive
    if (filters.county !== 'all' && app.county?.toLowerCase() !== filters.county.toLowerCase()) return false
    
    // Education Level filter
    if (filters.educationLevel !== 'all') {
      const educationNormalized = app.education_level_normalized || 
        (app.education_level || app.highest_education || '').toLowerCase().replace(/[_\s]/g, '')
      const filterLower = filters.educationLevel.toLowerCase().replace(/[_\s]/g, '')
      
      if (educationNormalized !== filterLower) return false
    }
    
    // Employment Type filter
    if (filters.employmentType !== 'all') {
      const employmentTypeNormalized = app.employment_type_normalized || 
        (app.employment_type || app.job?.employment_type || '').toLowerCase().replace(/[_\s]/g, '')
      const filterLower = filters.employmentType.toLowerCase().replace(/[_\s]/g, '')
      
      if (employmentTypeNormalized !== filterLower) return false
    }
    
    // Gender filter
    if (filters.gender !== 'all') {
      const gender = app.gender?.toLowerCase() || ''
      if (gender !== filters.gender.toLowerCase()) return false
    }
    
    // Disability Status filter
    if (filters.disabilityStatus !== 'all') {
      const disability = app.disability_status?.toLowerCase() || ''
      const filterLower = filters.disabilityStatus.toLowerCase()
      
      // Handle cases where disability status might be empty/null
      if (filterLower === 'not_disclosed' && (disability === '' || disability === 'n/a' || !disability)) {
        // Not disclosed means empty or n/a
        return true
      }
      
      if (disability !== filterLower) return false
    }
    
    // Professional Certification filter
    if (filters.certification !== 'all') {
      const certs = app.certifications || app.professional_qualifications || []
      const hasCertification = Array.isArray(certs) ? certs.length > 0 : false
      
      if (filters.certification === 'none' && hasCertification) return false
      if (filters.certification !== 'none' && !hasCertification) return false
      
      if (filters.certification !== 'none' && hasCertification) {
        const certLower = filters.certification.toLowerCase()
        const certNames = certs.map(c => 
          typeof c === 'string' ? c.toLowerCase() : 
          (c.name || c.qualification || c.title || c.certificate_type || '').toLowerCase()
        )
        
        const certMatchMap = {
          'cpa': ['cpa', 'accounting', 'certified public accountant'],
          'cips': ['cips', 'purchasing', 'supply', 'chartered institute'],
          'hr': ['hr', 'human resources', 'personnel', 'hrm'],
          'it': ['it', 'information technology', 'computer', 'software', 'tech'],
          'engineering': ['engineering', 'engineer', 'eng'],
          'other': ['other']
        }
        
        const matchedForms = certMatchMap[certLower] || [certLower]
        const hasMatchingCert = matchedForms.some(form => 
          certNames.some(certName => certName.includes(form))
        )
        
        if (!hasMatchingCert) return false
      }
    }
    
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const fullName = `${app.first_name || ''} ${app.last_name || ''}`.toLowerCase()
      const email = (app.email || '').toLowerCase()
      if (!fullName.includes(searchLower) && !email.includes(searchLower)) return false
    }
    return true
  })
  
  // Sort by AI score
  const sortedApplications = [...filteredApplications].sort((a, b) => 
    (b.ai_score || 0) - (a.ai_score || 0)
  )

  const getCertificateText = (app) => {
    const certs = app.certifications || app.certification || app.certification_list || []
    if (Array.isArray(certs)) return certs.map(c => c.name || c).join(', ') || 'N/A'
    return typeof certs === 'string' ? certs : 'N/A'
  }

  const getCertificationHolder = (app) =>
    app.certificate_holder || app.certification_holder || app.certification_issuer || 'N/A'
  
  const handleApplicationAction = (application, action, notes = '') => {
    updateApplicationStatus.mutate({
      applicationId: application.id,
      status: action,
      notes
    })
  }
  
  const handleBulkAction = (applicationIds, action) => {
    applicationIds.forEach(id => {
      const app = candidateSource.find(a => a.id === id)
      if (app) {
        handleApplicationAction(app, action)
      }
    })
  }

  const handleExport = () => {
    const dataToExport = sortedApplications.map(app => ({
      Name: `${app.first_name} ${app.last_name}`,
      Email: app.email,
      Phone: app.phone_number,
      Status: app.status,
      'AI Score': app.ai_score || 0,
      Experience: `${app.experience_years || 0} years`,
      Education: app.education_level,
      County: app.county,
      'Applied Date': app.submitted_date,
    }))

    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `candidates_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportExcel = () => {
    const dataToExport = longlistingApplications.map((app, index) => {
      const data = extractLonglistingData(app, index)
      
      return {
        '#': data.index,
        Name: data.name,
        'ID No.': data.nationalId,
        Age: data.age,
        Gender: data.gender,
        County: data.county,
        Degree: data.bachelorDegree,
        Qualifications: data.qualificationsText,
        Employer: data.employmentEntries.map(e => e.employer).join('\n'),
        Position: data.employmentEntries.map(e => e.position).join('\n'),
        Duration: data.employmentEntries.map(e => e.duration).join('\n'),
        Status: data.status
      }
    })

    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(row => Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `longlisting_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    // Use the same shared data extraction function
    const dataToExport = longlistingApplications.map((app, index) => {
      const data = extractLonglistingData(app, index)
      
      return {
        '#': data.index,
        Name: data.name,
        'ID No.': data.nationalId,
        Age: data.age,
        Gender: data.gender,
        County: data.county,
        Degree: data.bachelorDegree,
        Qualifications: data.qualificationsText,
        Employer: data.employmentEntries.map(e => e.employer).join('\n'),
        Position: data.employmentEntries.map(e => e.position).join('\n'),
        Duration: data.employmentEntries.map(e => e.duration).join('\n'),
        Status: data.status
      }
    })

    // Create PDF using jsPDF with A3 landscape for more space
    const doc = new jsPDF('l', 'mm', 'a3') // A3 landscape for more width
    
    // Add title
    doc.setFontSize(18)
    doc.setTextColor(30, 64, 175)
    doc.text('LONGLISTING REPORT', 14, 15)
    
    // Add metadata
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22)
    doc.text(`Total Applicants: ${longlistingApplications.length}`, 14, 27)
    
    // Prepare table data
    const tableColumn = ['#', 'Name', 'ID No.', 'Age', 'Gender', 'County', 'Degree', 'Qualifications', 'Employer', 'Position', 'Duration', 'Status']
    const tableRows = dataToExport.map(row => [
      row['#'],
      row.Name,
      row['ID No.'],
      row.Age,
      row.Gender,
      row.County,
      row.Degree,
      row.Qualifications,
      row.Employer,
      row.Position,
      row.Duration,
      row.Status
    ])
    
    // Add table to PDF with auto column widths
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 32,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 10,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        0: { cellWidth: 15 },  // #
        1: { cellWidth: 35 }, // Name
        2: { cellWidth: 30 }, // ID No.
        3: { cellWidth: 15 }, // Age
        4: { cellWidth: 20 }, // Gender
        5: { cellWidth: 30 }, // County
        6: { cellWidth: 35 }, // Degree
        7: { cellWidth: 45 }, // Qualifications
        8: { cellWidth: 40 }, // Employer
        9: { cellWidth: 40 }, // Position
        10: { cellWidth: 40 }, // Duration
        11: { cellWidth: 25 }  // Status
      },
      margin: { top: 35, left: 10, right: 10, bottom: 10 }
    })
    
    // Save the PDF
    doc.save(`longlisting_report_${new Date().toISOString().split('T')[0]}.pdf`)
  }
  
  if (appsLoading || jobsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }
  
  return (
    <div className={`min-h-screen ${accessibilityMode ? 'bg-white text-black' : darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${accessibilityMode ? 'bg-gray-100 border-r-4 border-black' : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-lg border-gray-200'} ${darkMode ? 'border-r' : ''} shadow-xl w-[280px] sm:w-[260px] md:w-[220px] min-w-[280px] sm:min-w-[260px] md:min-w-[220px] flex-shrink-0 fixed top-0 left-0 h-full z-30 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative overflow-y-auto overflow-x-hidden`}>
          <div className="p-4 sm:p-4 md:p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 sm:mb-4 md:mb-6">
              <h2 className={`text-lg sm:text-base md:text-xl font-bold ${accessibilityMode ? 'text-black' : darkMode ? 'text-white' : 'text-gray-900'}`}>HR Dashboard</h2>
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
                    ? accessibilityMode
                      ? 'bg-black text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : accessibilityMode
                      ? 'text-gray-700 hover:bg-gray-200'
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
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                      activeTab === 'document_verification'
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                      activeTab === 'panel_management'
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
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
                  <Link
                    to="/hr/approval-workflow"
                    className={`w-full flex items-center space-x-3 sm:space-x-2 md:space-x-3 px-3 sm:px-2 md:px-3 py-3 sm:py-2 md:py-2.5 rounded-xl text-sm sm:text-xs md:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'approval_workflow'
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 hover:text-green-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <GitBranch className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span>Approval Workflow</span>
                  </Link>
                  <Link
                    to="/hr/settings"
                    className={`w-full flex items-center space-x-3 sm:space-x-2 md:space-x-3 px-3 sm:px-2 md:px-3 py-3 sm:py-2 md:py-2.5 rounded-xl text-sm sm:text-xs md:text-sm font-medium transition-all duration-200 ${
                      activeTab === 'settings'
                        ? accessibilityMode
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                        : accessibilityMode
                          ? 'text-gray-700 hover:bg-gray-200'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 hover:text-green-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Settings className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span>Settings</span>
                  </Link>
                </div>
              </div>

              {/* User Profile Section */}
              <div className="mt-4 sm:mt-6 border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 pb-4">
                <button
                  onClick={() => {
                    // Handle logout - you might want to use your auth context here
                    if (window.confirm('Are you sure you want to logout?')) {
                      localStorage.removeItem('token')
                      window.location.href = '/login'
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 sm:px-3 md:px-4 py-3 sm:py-2 md:py-2.5 rounded-lg text-sm sm:text-xs md:text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                >
                  <LogOut className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className={`flex-1 lg:ml-0 p-4 sm:p-4 md:p-6 min-w-0 ${darkMode ? 'bg-gray-900' : ''}`}>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`lg:hidden mb-6 sm:mb-6 p-4 sm:p-3 md:p-4 rounded-2xl ${accessibilityMode ? 'bg-black text-white border-4 border-white' : darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-xl hover:shadow-2xl transition-all active:scale-95 fixed top-4 left-4 z-40`}
          >
            <Menu className="w-7 h-7 sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </button>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
            {/* Key Metrics - Minimal Text */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
              <div className={`text-center p-2 sm:p-3 rounded-xl sm:rounded-2xl ${darkMode ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{metrics.total || 0}</p>
              </div>
              <div className={`text-center p-2 sm:p-3 rounded-xl sm:rounded-2xl ${darkMode ? 'bg-gradient-to-br from-green-600 to-green-800' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{metrics.shortlisted || 0}</p>
              </div>
              <div className={`text-center p-2 sm:p-3 rounded-xl sm:rounded-2xl ${darkMode ? 'bg-gradient-to-br from-purple-600 to-purple-800' : 'bg-gradient-to-br from-purple-500 to-purple-600'}`}>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{metrics.interviewed || 0}</p>
              </div>
              <div className={`text-center p-2 sm:p-3 rounded-xl sm:rounded-2xl ${darkMode ? 'bg-gradient-to-br from-yellow-600 to-yellow-800' : 'bg-gradient-to-br from-yellow-500 to-yellow-600'}`}>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{metrics.hired || 0}</p>
              </div>
              <div className={`text-center p-2 sm:p-3 rounded-xl sm:rounded-2xl ${darkMode ? 'bg-gradient-to-br from-indigo-600 to-indigo-800' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'}`}>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{metrics.conversionRate || 0}%</p>
              </div>
              <div className={`text-center p-2 sm:p-3 rounded-xl sm:rounded-2xl ${darkMode ? 'bg-gradient-to-br from-pink-600 to-pink-800' : 'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{metrics.avgScore || 0}</p>
              </div>
            </div>

            {/* Modern Analytics Dashboard with Descriptions */}
            <div className="space-y-6">
              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-xl'} rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-100/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                      <Users className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">+12%</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.total || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Applications</p>
                  </div>
                </div>

                <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-xl'} rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-100/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                      <Briefcase className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">+2</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.shortlisted || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Shortlisted</p>
                  </div>
                </div>

                <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-xl'} rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-100/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                      <Clock className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">-3d</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.avgTimeToHire || '0'}d</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Time to Hire</p>
                  </div>
                </div>

                <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-xl'} rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-100/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                      <Target className={`w-6 h-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">+5%</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.avgScore || '0'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg AI Score</p>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {/* Status Distribution Pie Chart */}
                <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-xl'} rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-100/50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Application Status</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Current stage distribution</p>
                    </div>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                      <FileText className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200} minHeight={180}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: metrics.pending || 0 },
                          { name: 'Review', value: metrics.underReview || 0 },
                          { name: 'Short', value: metrics.shortlisted || 0 },
                          { name: 'Int', value: metrics.interviewed || 0 },
                          { name: 'Hired', value: metrics.hired || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        fontSize={10}
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#10b981" />
                        <Cell fill="#8b5cf6" />
                        <Cell fill="#6366f1" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#333', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Insight:</span> {metrics.pending > metrics.shortlisted ? 'More applications pending review' : 'Good progress in processing'}
                    </p>
                  </div>
                </div>

                {/* Gender Distribution Pie Chart */}
                <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-xl'} rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-100/50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gender Distribution</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Applicant demographics</p>
                    </div>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-pink-900/30' : 'bg-pink-50'}`}>
                      <Users className={`w-5 h-5 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200} minHeight={180}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Male', value: metrics.genderDistribution?.male || 0 },
                          { name: 'Female', value: metrics.genderDistribution?.female || 0 },
                          { name: 'Other', value: metrics.genderDistribution?.other || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        fontSize={10}
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#ec4899" />
                        <Cell fill="#6b7280" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#333', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Insight:</span> Diversity indicator for workforce planning
                    </p>
                  </div>
                </div>

                {/* Recruitment Funnel Area Chart */}
                <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-xl'} rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-100/50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recruitment Funnel</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Candidate journey pipeline</p>
                    </div>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                      <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200} minHeight={180}>
                    <AreaChart data={[
                      { name: 'Applied', value: metrics.total || 0 },
                      { name: 'Review', value: metrics.underReview || 0 },
                      { name: 'Short', value: metrics.shortlisted || 0 },
                      { name: 'Int', value: metrics.interviewed || 0 },
                      { name: 'Hired', value: metrics.hired || 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="name" fontSize={10} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <YAxis fontSize={10} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#333', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb' }} />
                      <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Insight:</span> {metrics.total > 0 ? `${((metrics.hired / metrics.total) * 100).toFixed(1)}% conversion rate` : 'No conversion data yet'}
                    </p>
                  </div>
                </div>

                {/* Education Bar Chart */}
                <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-xl'} rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-100/50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Education Levels</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Highest qualifications</p>
                    </div>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                      <GraduationCap className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200} minHeight={180}>
                    <BarChart data={Object.entries(metrics.educationDistribution || {})
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([level, count]) => ({ 
                        name: level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' '), 
                        value: count 
                      }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="name" fontSize={10} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <YAxis fontSize={10} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#333', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb' }} />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Insight:</span> Top qualification requirements met
                    </p>
                  </div>
                </div>

                {/* County Distribution Bar Chart */}
                <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-xl'} rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-100/50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Counties</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Geographic distribution</p>
                    </div>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                      <MapPin className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200} minHeight={180}>
                    <BarChart data={Object.entries(metrics.countyDistribution || {})
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([county, count]) => ({ name: county.substring(0, 8), value: count }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="name" fontSize={10} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <YAxis fontSize={10} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#333', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb' }} />
                      <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Insight:</span> Regional talent availability
                    </p>
                  </div>
                </div>

                {/* Disability Status Pie Chart */}
                <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-xl'} rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-100/50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Disability Status</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Inclusive hiring metrics</p>
                    </div>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                      <Accessibility className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200} minHeight={180}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'With', value: 50 },
                          { name: 'Without', value: 50 }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        fontSize={10}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#3b82f6" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#333', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Insight:</span> Compliance with inclusion policies
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-2 lg:order-1">
              {/* Job Selector */}
              <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 border border-gray-100/50`}>
                <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl md:text-2xl' : 'text-gray-900'} mb-3 sm:mb-4`}>Select Position</h3>
                <select
                  value={selectedVacancyId || ''}
                  onChange={(e) => setSelectedVacancyId(e.target.value ? parseInt(e.target.value) : null)}
                  className={`w-full px-4 py-3 sm:px-5 sm:py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <option value="">All Positions</option>
                  {vacancies?.map(vacancy => (
                    <option key={vacancy.id} value={vacancy.id}>
                      {vacancy.title} ({vacancy.positions || 1} positions)
                    </option>
                  ))}
                </select>
              </div>

              {/* Filters */}
              <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100/50`}>
                <h3 className={`font-bold ${accessibilityMode ? 'text-lg sm:text-xl md:text-2xl' : 'text-gray-900'} mb-4 sm:mb-5`}>Advanced Filters</h3>
                
                {/* Search */}
                <div className="mb-5 sm:mb-6">
                  <label className={`block text-sm sm:text-base font-semibold ${accessibilityMode ? 'font-bold' : 'text-gray-700'} mb-2`}>Search Candidates</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                      className={`w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    />
                  </div>
                </div>

                {/* Age and Experience Filters - Vertical Layout */}
                <div className="space-y-4 sm:space-y-5 mb-5 sm:mb-6">
                  {/* Age Filter */}
                  <div>
                    <label className={`block text-sm sm:text-base font-semibold ${accessibilityMode ? 'font-bold' : 'text-gray-700'} mb-2`}>Age</label>
                    <div className="flex gap-2 sm:gap-3">
                      <select
                        value={filters.ageOperator}
                        onChange={(e) => setFilters({...filters, ageOperator: e.target.value})}
                        className={`w-20 sm:w-24 px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <option value="gte">≥</option>
                        <option value="lte">≤</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Age"
                        min="18"
                        max="65"
                        value={filters.ageValue}
                        onChange={(e) => setFilters({...filters, ageValue: e.target.value})}
                        className={`flex-1 sm:w-28 px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum age: 18, Maximum: 65</p>
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <label className={`block text-sm sm:text-base font-semibold ${accessibilityMode ? 'font-bold' : 'text-gray-700'} mb-2`}>Experience</label>
                    <div className="flex gap-2 sm:gap-3">
                      <select
                        value={filters.experienceOperator}
                        onChange={(e) => setFilters({...filters, experienceOperator: e.target.value})}
                        className={`w-20 sm:w-24 px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <option value="gte">≥</option>
                        <option value="lte">≤</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Years"
                        step="0.1"
                        min="0"
                        value={filters.experienceValue}
                        onChange={(e) => setFilters({...filters, experienceValue: e.target.value})}
                        className={`flex-1 sm:w-28 px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter years (e.g., 2.5 for 2 years 6 months)</p>
                  </div>
                </div>

                {/* County and Status Filters - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
                  {/* County Filter */}
                  <div>
                    <label className={`block text-sm sm:text-base font-semibold ${accessibilityMode ? 'font-bold' : 'text-gray-700'} mb-2`}>County</label>
                    <select
                      value={filters.county}
                      onChange={(e) => setFilters({...filters, county: e.target.value})}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <option value="all">All Counties</option>
                      {KENYAN_COUNTIES.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className={`block text-sm sm:text-base font-semibold ${accessibilityMode ? 'font-bold' : 'text-gray-700'} mb-2`}>Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <option value="all">All Statuses</option>
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="longlisted">Longlisted</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview_scheduled">Interview Scheduled</option>
                      <option value="interview_completed">Interview Completed</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>
                </div>

                {/* Education Level Filter */}
                <div className="mb-4 sm:mb-5">
                  <label className={`block text-sm sm:text-base font-semibold ${accessibilityMode ? 'font-bold' : 'text-gray-700'} mb-2`}>Education Level</label>
                  <select
                    value={filters.educationLevel}
                    onChange={(e) => setFilters({...filters, educationLevel: e.target.value})}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <option value="all">All Levels</option>
                    <option value="high_school">High School</option>
                    <option value="diploma">Diploma</option>
                    <option value="bachelor">Bachelor Degree</option>
                    <option value="master">Master Degree</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Employment Type Filter */}
                <div className="mb-4 sm:mb-5">
                  <label className={`block text-sm sm:text-base font-semibold ${accessibilityMode ? 'font-bold' : 'text-gray-700'} mb-2`}>Employment Type</label>
                  <select
                    value={filters.employmentType}
                    onChange={(e) => setFilters({...filters, employmentType: e.target.value})}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <option value="all">All Types</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                    <option value="internship">Internship</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>

                {/* Gender Filter */}
                <div className="mb-4 sm:mb-5">
                  <label className={`block text-sm sm:text-base font-semibold ${accessibilityMode ? 'font-bold' : 'text-gray-700'} mb-2`}>Gender</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters({...filters, gender: e.target.value})}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                {/* Disability Status Filter */}
                <div className="mb-4 sm:mb-5">
                  <label className={`block text-sm sm:text-base font-semibold ${accessibilityMode ? 'font-bold' : 'text-gray-700'} mb-2`}>Disability Status</label>
                  <select
                    value={filters.disabilityStatus}
                    onChange={(e) => setFilters({...filters, disabilityStatus: e.target.value})}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <option value="all">All</option>
                    <option value="yes">Person with Disability</option>
                    <option value="no">No Disability</option>
                    <option value="not_disclosed">Not Disclosed</option>
                  </select>
                </div>

                {/* Certification Filter */}
                <div className="mb-5 sm:mb-6">
                  <label className={`block text-sm sm:text-base font-semibold ${accessibilityMode ? 'font-bold' : 'text-gray-700'} mb-2`}>Professional Certification</label>
                  <select
                    value={filters.certification}
                    onChange={(e) => setFilters({...filters, certification: e.target.value})}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <option value="all">All</option>
                    <option value="cpa">CPA/K</option>
                    <option value="cips">CIPS</option>
                    <option value="hr">HR Professional</option>
                    <option value="it">IT Certification</option>
                    <option value="engineering">Engineering</option>
                    <option value="other">Other</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => setFilters({
                    status: 'all',
                    scoreRange: [0, 100],
                    skills: [],
                    experience: 'all',
                    experienceOperator: 'gte',
                    experienceValue: '',
                    ageOperator: 'gte',
                    ageValue: '',
                    county: 'all',
                    role: 'all',
                    searchTerm: '',
                    educationLevel: 'all',
                    employmentType: 'all',
                    gender: 'all',
                    disabilityStatus: 'all',
                    certification: 'all'
                  })}
                  className={`w-full px-4 py-3 sm:px-5 sm:py-3.5 border-2 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 ${accessibilityMode ? 'border-4 border-black text-lg sm:text-xl bg-white hover:bg-gray-100' : 'border-gray-300 bg-white hover:bg-gray-100 text-gray-700'}`}
                >
                  Clear All Filters
                </button>
              </div>
              {/* AI Insights */}
              {insights && !insightsLoading && (
                <AIInsightsPanel insights={insights} />
              )}
            </div>
            
            {/* Main Content Area */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {/* Analytics Reports Section - Always Displayed */}
              <div className="mb-5 sm:mb-6">
                {(() => {
                  const filteredApps = sortedApplications
                  const total = filteredApps.length
                  
                  // AI Score Distribution
                  const highMatch = filteredApps.filter(app => (app.ai_score || app.score || 0) >= 80).length
                  const mediumMatch = filteredApps.filter(app => {
                    const score = app.ai_score || app.score || 0
                    return score >= 60 && score < 80
                  }).length
                  const lowMatch = filteredApps.filter(app => (app.ai_score || app.score || 0) < 60).length
                  
                  // Gender Distribution
                  const maleCount = filteredApps.filter(app => app.gender?.toLowerCase() === 'male').length
                  const femaleCount = filteredApps.filter(app => app.gender?.toLowerCase() === 'female').length
                  const otherCount = filteredApps.filter(app => app.gender?.toLowerCase() === 'other').length
                  
                  // Education Distribution
                  const educationDist = filteredApps.reduce((acc, app) => {
                    const level = app.education_level || 'other'
                    acc[level] = (acc[level] || 0) + 1
                    return acc
                  }, {})
                  
                  // County Distribution
                  const countyDist = filteredApps.reduce((acc, app) => {
                    const county = app.county || 'unknown'
                    acc[county] = (acc[county] || 0) + 1
                    return acc
                  }, {})
                  
                  // Skills Match Distribution
                  const skillsDistribution = [
                    { range: '0-20', min: 0, max: 20, color: '#f43f5e' },
                    { range: '21-40', min: 21, max: 40, color: '#f97316' },
                    { range: '41-60', min: 41, max: 60, color: '#f59e0b' },
                    { range: '61-80', min: 61, max: 80, color: '#3b82f6' },
                    { range: '81-100', min: 81, max: 100, color: '#10b981' }
                  ].map(range => ({
                    name: range.range,
                    value: filteredApps.filter(app => {
                      const score = app.ai_score || app.score || 0
                      return score >= range.min && score <= range.max
                    }).length,
                    color: range.color
                  }))
                  
                  return (
                    <div className="space-y-4 sm:space-y-5">
                      {/* Filter Summary */}
                      <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} rounded-2xl shadow-xl p-3 sm:p-4 border border-gray-100/50`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            <span className={`font-semibold ${accessibilityMode ? 'text-base sm:text-lg' : 'text-gray-900'}`}>
                              Showing {total} candidates
                            </span>
                          </div>
                          <button
                            onClick={() => setFilters({
                              status: 'all',
                              scoreRange: [0, 100],
                              skills: [],
                              experience: 'all',
                              experienceOperator: 'gte',
                              experienceValue: '',
                              ageOperator: 'gte',
                              ageValue: '',
                              county: 'all',
                              role: 'all',
                              searchTerm: '',
                              educationLevel: 'all',
                              employmentType: 'all',
                              gender: 'all',
                              disabilityStatus: 'all',
                              certification: 'all'
                            })}
                            className="px-3 py-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 text-xs sm:text-sm font-medium transition-all hover:scale-105 shadow-md"
                          >
                            Clear Filters
                          </button>
                        </div>
                      </div>

                      {/* Analytics Overview Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {/* AI Score Card */}
                        <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100/50`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-xs sm:text-sm ${accessibilityMode ? 'font-bold' : 'text-gray-500'}`}>High Match</p>
                              <p className={`text-lg sm:text-xl font-bold text-emerald-600`}>{highMatch}</p>
                            </div>
                            <div className="p-2 bg-emerald-100 rounded-lg">
                              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Gender Card */}
                        <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100/50`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-xs sm:text-sm ${accessibilityMode ? 'font-bold' : 'text-gray-500'}`}>Female</p>
                              <p className={`text-lg sm:text-xl font-bold text-pink-600`}>{femaleCount}</p>
                            </div>
                            <div className="p-2 bg-pink-100 rounded-lg">
                              <Users2 className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Education Card */}
                        <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100/50`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-xs sm:text-sm ${accessibilityMode ? 'font-bold' : 'text-gray-500'}`}>Graduates</p>
                              <p className={`text-lg sm:text-xl font-bold text-purple-600`}>
                                {Object.values(educationDist).reduce((a, b) => a + b, 0)}
                              </p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Skills Card */}
                        <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100/50`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-xs sm:text-sm ${accessibilityMode ? 'font-bold' : 'text-gray-500'}`}>Avg Score</p>
                              <p className={`text-lg sm:text-xl font-bold text-blue-600`}>
                                {total > 0 ? Math.round(filteredApps.reduce((sum, app) => sum + (app.ai_score || app.score || 0), 0) / total) : 0}%
                              </p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Analytics Charts Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* AI Score Distribution Chart */}
                        <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100/50`}>
                          <h4 className={`font-semibold ${accessibilityMode ? 'text-base sm:text-lg' : 'text-gray-900'} mb-2 sm:mb-3 flex items-center gap-2`}>
                            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            AI Score Distribution
                          </h4>
                          <div className="h-40 sm:h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'High (80%+)', value: highMatch, color: '#10b981' },
                                    { name: 'Medium (60-79%)', value: mediumMatch, color: '#f59e0b' },
                                    { name: 'Low (<60%)', value: lowMatch, color: '#f43f5e' }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={60}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  <Cell fill="#10b981" />
                                  <Cell fill="#f59e0b" />
                                  <Cell fill="#f43f5e" />
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Gender Distribution Chart */}
                        <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100/50`}>
                          <h4 className={`font-semibold ${accessibilityMode ? 'text-base sm:text-lg' : 'text-gray-900'} mb-2 sm:mb-3 flex items-center gap-2`}>
                            <Users2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            Gender Distribution
                          </h4>
                          <div className="h-40 sm:h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Male', value: maleCount, color: '#3b82f6' },
                                    { name: 'Female', value: femaleCount, color: '#ec4899' },
                                    { name: 'Other', value: otherCount, color: '#6b7280' }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={60}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  <Cell fill="#3b82f6" />
                                  <Cell fill="#ec4899" />
                                  <Cell fill="#6b7280" />
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Candidate Table - Always Displayed */}
              <div>
                {/* Bulk Select Toggle */}
                <div className="flex items-center justify-end mb-3 sm:mb-4">
                  <button
                    onClick={() => setBulkSelectMode(!bulkSelectMode)}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                      bulkSelectMode
                        ? accessibilityMode
                          ? 'bg-black text-white'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : accessibilityMode
                          ? 'bg-white text-black border-4 border-black'
                          : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    {bulkSelectMode ? 'Exit Selection' : 'Select Candidates'}
                  </button>
                </div>

                {/* Table View */}
                <CandidateScoringTable
                  candidates={sortedApplications}
                  onView={handleViewCandidate}
                  onMessage={() => {} }
                  selectedIds={selectedForBulk}
                  bulkSelectMode={bulkSelectMode}
                />
              </div>

              {/* Candidate Comparison Panel */}
              {showComparison && selectedForBulk.length >= 2 && (
                <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100/50 mt-5 sm:mt-6`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-5 gap-2">
                    <h3 className="font-semibold text-gray-900 flex items-center text-sm sm:text-base md:text-lg">
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2" />
                      Candidate Comparison
                    </h3>
                    <button
                      onClick={() => setShowComparison(false)}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 text-xs sm:text-sm transition-all hover:scale-105 active:scale-95"
                    >
                      Close
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs sm:text-sm md:text-base">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left font-semibold text-gray-900">Criteria</th>
                          {sortedApplications
                            .filter(app => selectedForBulk.includes(app.id))
                            .map(app => (
                              <th key={app.id} className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900 whitespace-nowrap">
                                {app.first_name} {app.last_name}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-gray-700">AI Score</td>
                          {sortedApplications
                            .filter(app => selectedForBulk.includes(app.id))
                            .map(app => (
                              <td key={app.id} className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center">
                                <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm md:text-base font-medium ${
                                  app.ai_score >= 80 ? 'bg-green-100 text-green-800' :
                                  app.ai_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {app.ai_score || 0}%
                                </span>
                              </td>
                            ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-gray-700">Experience</td>
                          {sortedApplications
                            .filter(app => selectedForBulk.includes(app.id))
                            .map(app => (
                              <td key={app.id} className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center">
                                {app.experience_years || 0} years
                              </td>
                            ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-gray-700">Education Level</td>
                          {sortedApplications
                            .filter(app => selectedForBulk.includes(app.id))
                            .map(app => (
                              <td key={app.id} className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center">
                                {app.education_level || 'N/A'}
                              </td>
                            ))}
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-gray-700">Status</td>
                          {sortedApplications
                            .filter(app => selectedForBulk.includes(app.id))
                            .map(app => (
                              <td key={app.id} className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center">
                                <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm md:text-base font-medium ${
                                  app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                                  app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {app.status || 'submitted'}
                                </span>
                              </td>
                            ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Analytics View */}
              {viewMode === 'analytics' && (
                <div className="space-y-5 sm:space-y-6">
                  {/* Calculate filtered metrics */}
                  {(() => {
                    const filteredApps = sortedApplications
                    const total = filteredApps.length
                    
                    // AI Score Distribution
                    const highMatch = filteredApps.filter(app => (app.ai_score || app.score || 0) >= 80).length
                    const mediumMatch = filteredApps.filter(app => {
                      const score = app.ai_score || app.score || 0
                      return score >= 60 && score < 80
                    }).length
                    const lowMatch = filteredApps.filter(app => (app.ai_score || app.score || 0) < 60).length
                    
                    // Gender Distribution
                    const maleCount = filteredApps.filter(app => app.gender?.toLowerCase() === 'male').length
                    const femaleCount = filteredApps.filter(app => app.gender?.toLowerCase() === 'female').length
                    const otherCount = filteredApps.filter(app => app.gender?.toLowerCase() === 'other').length
                    
                    // Education Distribution
                    const educationDist = filteredApps.reduce((acc, app) => {
                      const level = app.education_level || 'other'
                      acc[level] = (acc[level] || 0) + 1
                      return acc
                    }, {})
                    
                    // County Distribution
                    const countyDist = filteredApps.reduce((acc, app) => {
                      const county = app.county || 'unknown'
                      acc[county] = (acc[county] || 0) + 1
                      return acc
                    }, {})
                    
                    // Skills Match Distribution
                    const skillsDistribution = [
                      { range: '0-20', min: 0, max: 20, color: '#f43f5e' },
                      { range: '21-40', min: 21, max: 40, color: '#f97316' },
                      { range: '41-60', min: 41, max: 60, color: '#f59e0b' },
                      { range: '61-80', min: 61, max: 80, color: '#3b82f6' },
                      { range: '81-100', min: 81, max: 100, color: '#10b981' }
                    ].map(range => ({
                      name: range.range,
                      value: filteredApps.filter(app => {
                        const score = app.ai_score || app.score || 0
                        return score >= range.min && score <= range.max
                      }).length,
                      color: range.color
                    }))
                    
                    return (
                      <>
                        {/* Filter Summary */}
                        <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} rounded-2xl shadow-xl p-4 sm:p-5 border border-gray-100/50`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                              <span className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl' : 'text-gray-900'}`}>
                                Showing {total} candidates
                              </span>
                            </div>
                            <button
                              onClick={() => setFilters({
                                status: 'all',
                                scoreRange: [0, 100],
                                skills: [],
                                experience: 'all',
                                experienceOperator: 'gte',
                                experienceValue: '',
                                ageOperator: 'gte',
                                ageValue: '',
                                county: 'all',
                                role: 'all',
                                searchTerm: '',
                                educationLevel: 'all',
                                employmentType: 'all',
                                gender: 'all',
                                disabilityStatus: 'all',
                                certification: 'all'
                              })}
                              className="px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium transition-all hover:scale-105 shadow-md"
                            >
                              Clear Filters
                            </button>
                          </div>
                        </div>

                        {/* AI Score Distribution Chart */}
                        <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100/50`}>
                          <div className="flex items-center justify-between mb-4 sm:mb-5">
                            <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl md:text-2xl' : 'text-gray-900'} flex items-center gap-2`}>
                              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                              AI Score Distribution
                            </h3>
                            <div className="flex gap-2">
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">High: {highMatch}</span>
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Medium: {mediumMatch}</span>
                              <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold">Low: {lowMatch}</span>
                            </div>
                          </div>
                          <div className="h-64 sm:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'High Match (80%+)', value: highMatch, color: '#10b981' },
                                    { name: 'Medium Match (60-79%)', value: mediumMatch, color: '#f59e0b' },
                                    { name: 'Low Match (<60%)', value: lowMatch, color: '#f43f5e' }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  <Cell fill="#10b981" />
                                  <Cell fill="#f59e0b" />
                                  <Cell fill="#f43f5e" />
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                    <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 border border-gray-100/50 hover:shadow-lg transition-all hover:scale-[1.02]`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs sm:text-sm md:text-base ${accessibilityMode ? 'font-bold' : 'text-gray-500'}`}>Conversion Rate</p>
                          <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${accessibilityMode ? 'text-2xl sm:text-3xl' : ''}`}>{metrics.conversionRate}%</p>
                        </div>
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                          <TrendingUp className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white`} />
                        </div>
                      </div>
                    </div>
                    <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 border border-gray-100/50 hover:shadow-lg transition-all hover:scale-[1.02]`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs sm:text-sm md:text-base ${accessibilityMode ? 'font-bold' : 'text-gray-500'}`}>Avg Experience</p>
                          <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${accessibilityMode ? 'text-2xl sm:text-3xl' : ''}`}>{metrics.avgExperience} yrs</p>
                        </div>
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                          <Briefcase className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white`} />
                        </div>
                      </div>
                    </div>
                    <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 border border-gray-100/50 hover:shadow-lg transition-all hover:scale-[1.02]`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs sm:text-sm md:text-base ${accessibilityMode ? 'font-bold' : 'text-gray-500'}`}>Avg Time to Hire</p>
                          <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${accessibilityMode ? 'text-2xl sm:text-3xl' : ''}`}>{metrics.avgTimeToHire} days</p>
                        </div>
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                          <Clock className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white`} />
                        </div>
                      </div>
                    </div>
                    <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 border border-gray-100/50 hover:shadow-lg transition-all hover:scale-[1.02]`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs sm:text-sm md:text-base ${accessibilityMode ? 'font-bold' : 'text-gray-500'}`}>Avg AI Score</p>
                          <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${accessibilityMode ? 'text-2xl sm:text-3xl' : ''}`}>{metrics.avgScore}</p>
                        </div>
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                          <Brain className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white`} />
                        </div>
                      </div>
                    </div>
                  </div>

                        {/* Gender Distribution Chart */}
                        <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100/50`}>
                          <div className="flex items-center justify-between mb-4 sm:mb-5">
                            <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl md:text-2xl' : 'text-gray-900'} flex items-center gap-2`}>
                              <Users2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                              Gender Distribution
                            </h3>
                            <div className="flex gap-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Male: {maleCount}</span>
                              <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">Female: {femaleCount}</span>
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">Other: {otherCount}</span>
                            </div>
                          </div>
                          <div className="h-64 sm:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Male', value: maleCount, color: '#3b82f6' },
                                    { name: 'Female', value: femaleCount, color: '#ec4899' },
                                    { name: 'Other', value: otherCount, color: '#6b7280' }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  <Cell fill="#3b82f6" />
                                  <Cell fill="#ec4899" />
                                  <Cell fill="#6b7280" />
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* County Distribution Chart */}
                        <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100/50`}>
                          <div className="flex items-center justify-between mb-4 sm:mb-5">
                            <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl md:text-2xl' : 'text-gray-900'} flex items-center gap-2`}>
                              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                              Applications by County (Top 10)
                            </h3>
                          </div>
                          <div className="h-64 sm:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart 
                                data={Object.entries(countyDist)
                                  .sort((a, b) => b[1] - a[1])
                                  .slice(0, 10)
                                  .map(([county, count], index) => ({
                                    name: county,
                                    value: count,
                                    color: index < 3 ? ['#10b981', '#3b82f6', '#8b5cf6'][index] : '#6b7280'
                                  }))}
                                layout="vertical"
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis 
                                  type="category" 
                                  dataKey="name" 
                                  tick={{ fill: '#6b7280', fontSize: 11 }}
                                  width={100}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                  {Object.entries(countyDist)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 10)
                                    .map((_, index) => (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={index < 3 ? ['#10b981', '#3b82f6', '#8b5cf6'][index] : '#6b7280'}
                                      />
                                    ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Skills Match Distribution Chart */}
                        <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100/50`}>
                          <div className="flex items-center justify-between mb-4 sm:mb-5">
                            <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl md:text-2xl' : 'text-gray-900'} flex items-center gap-2`}>
                              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                              Skills Match Distribution
                            </h3>
                          </div>
                          <div className="h-64 sm:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={skillsDistribution}>
                                <defs>
                                  <linearGradient id="colorSkills" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="name" 
                                  tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke="#3b82f6" 
                                  fillOpacity={1} 
                                  fill="url(#colorSkills)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Education Levels Bar Chart */}
                        <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100/50`}>
                          <div className="flex items-center justify-between mb-4 sm:mb-5">
                            <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl md:text-2xl' : 'text-gray-900'} flex items-center gap-2`}>
                              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                              Education Levels Distribution
                            </h3>
                          </div>
                          <div className="h-64 sm:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={Object.entries(educationDist)
                                .sort((a, b) => b[1] - a[1])
                                .map(([level, count]) => ({
                                  name: level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                  value: count,
                                  color: level === 'phd' ? '#8b5cf6' : 
                                        level === 'master' ? '#6366f1' : 
                                        level === 'bachelor' ? '#3b82f6' : 
                                        level === 'diploma' ? '#0ea5e9' : '#06b6d4'
                                }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="name" 
                                  tick={{ fill: '#6b7280', fontSize: 12 }}
                                  angle={-45}
                                  textAnchor="end"
                                  height={100}
                                />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                  {Object.entries(educationDist)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([level, count], index) => (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={level === 'phd' ? '#8b5cf6' : 
                                              level === 'master' ? '#6366f1' : 
                                              level === 'bachelor' ? '#3b82f6' : 
                                              level === 'diploma' ? '#0ea5e9' : '#06b6d4'}
                                      />
                                    ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Disability Status */}
                        <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100/50`}>
                          <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl md:text-2xl' : 'text-gray-900'} mb-4 sm:mb-5`}>Disability Status (NCPD Compliance)</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                              <Accessibility className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-600" />
                              <p className={`text-xl sm:text-2xl font-bold ${accessibilityMode ? 'text-2xl sm:text-3xl' : 'text-green-600'}`}>
                                {filteredApps.filter(app => app.disability === true).length}
                              </p>
                              <p className={`text-xs sm:text-sm ${accessibilityMode ? 'font-semibold' : 'text-gray-500'}`}>With Disability</p>
                              <p className={`text-xs ${accessibilityMode ? 'font-semibold' : 'text-gray-400'} mt-1`}>
                                {total > 0 ? ((filteredApps.filter(app => app.disability === true).length / total) * 100).toFixed(1) : 0}%
                              </p>
                            </div>
                            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                              <UserCheck className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-600" />
                              <p className={`text-xl sm:text-2xl font-bold ${accessibilityMode ? 'text-2xl sm:text-3xl' : 'text-blue-600'}`}>
                                {filteredApps.filter(app => app.disability === false).length}
                              </p>
                              <p className={`text-xs sm:text-sm ${accessibilityMode ? 'font-semibold' : 'text-gray-500'}`}>Without Disability</p>
                              <p className={`text-xs ${accessibilityMode ? 'font-semibold' : 'text-gray-400'} mt-1`}>
                                {total > 0 ? ((filteredApps.filter(app => app.disability === false).length / total) * 100).toFixed(1) : 0}%
                              </p>
                            </div>
                            <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                              <EyeOff className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-gray-600" />
                              <p className={`text-xl sm:text-2xl font-bold ${accessibilityMode ? 'text-2xl sm:text-3xl' : 'text-gray-600'}`}>
                                {filteredApps.filter(app => app.disability === null || app.disability === undefined).length}
                              </p>
                              <p className={`text-xs sm:text-sm ${accessibilityMode ? 'font-semibold' : 'text-gray-500'}`}>Not Disclosed</p>
                              <p className={`text-xs ${accessibilityMode ? 'font-semibold' : 'text-gray-400'} mt-1`}>
                                {total > 0 ? ((filteredApps.filter(app => app.disability === null || app.disability === undefined).length / total) * 100).toFixed(1) : 0}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
              
              {/* Bulk Actions */}
              {selectedApplications.length > 0 && (
                <div className={`fixed bottom-6 right-6 ${accessibilityMode ? 'border-4 border-black' : 'bg-white'} rounded-lg shadow-lg ${accessibilityMode ? '' : 'border border-gray-200'} p-4`}>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm ${accessibilityMode ? 'font-bold' : 'text-gray-600'}`}>
                      {selectedApplications.length} selected
                    </span>
                    <button
                      onClick={() => handleBulkAction(selectedApplications, 'shortlisted')}
                      className={`btn-success text-sm ${accessibilityMode ? 'border-2 border-green-600' : ''}`}
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleBulkAction(selectedApplications, 'rejected')}
                      className={`btn-danger text-sm ${accessibilityMode ? 'border-2 border-red-600' : ''}`}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setSelectedApplications([])}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interviews Tab */}
        {activeTab === 'interviews' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl' : 'text-gray-900'} mb-3 sm:mb-4`}>Interview Management</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-blue-600" />
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{metrics?.interviewed || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Interviews Scheduled</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-green-600" />
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{metrics?.hired || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Candidates Hired</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-purple-600" />
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">{metrics?.avgTimeToHire || 0} days</p>
                  <p className="text-xs sm:text-sm text-gray-500">Avg Time to Hire</p>
                </div>
              </div>
            </div>

            {/* Workflow Pipeline */}
            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl' : 'text-gray-900'} mb-3 sm:mb-4`}>Candidate Pipeline</h3>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 overflow-x-auto pb-4">
                {[
                  { status: 'submitted', label: 'Applied', color: 'bg-gray-100', count: metrics?.pending || 0 },
                  { status: 'under_review', label: 'Under Review', color: 'bg-blue-100', count: metrics?.underReview || 0 },
                  { status: 'shortlisted', label: 'Shortlisted', color: 'bg-yellow-100', count: metrics?.shortlisted || 0 },
                  { status: 'interview_scheduled', label: 'Interview', color: 'bg-purple-100', count: applications?.filter(a => a.status === 'interview_scheduled').length || 0 },
                  { status: 'interview_completed', label: 'Interview Done', color: 'bg-indigo-100', count: applications?.filter(a => a.status === 'interview_completed').length || 0 },
                  { status: 'hired', label: 'Hired', color: 'bg-green-100', count: metrics?.hired || 0 },
                  { status: 'rejected', label: 'Rejected', color: 'bg-red-100', count: metrics?.rejected || 0 },
                ].map((stage) => (
                  <div key={stage.status} className={`flex-shrink-0 w-36 sm:w-48 p-3 sm:p-4 rounded-lg ${stage.color} cursor-pointer hover:opacity-80 transition-opacity`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold text-xs sm:text-sm ${accessibilityMode ? 'text-base sm:text-lg' : 'text-gray-900'}`}>{stage.label}</span>
                      <span className={`text-xl sm:text-2xl font-bold ${accessibilityMode ? 'text-2xl sm:text-3xl' : 'text-gray-700'}`}>{stage.count}</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-gray-500 h-1.5 sm:h-2 rounded-full"
                        style={{ width: `${metrics?.total > 0 ? (stage.count / metrics.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl' : 'text-gray-900'} mb-3 sm:mb-4`}>Interview Panel Management</h3>
              <p className={`text-sm sm:text-base text-gray-600 ${accessibilityMode ? 'text-lg' : ''}`}>Manage interview panels, schedule interviews, and track interview feedback.</p>
              <button className={`mt-3 sm:mt-4 px-3 sm:px-4 py-2 text-xs sm:text-sm ${accessibilityMode ? 'bg-blue-600 text-white border-2 border-blue-600' : 'btn-primary'}`}>
                Schedule Interview
              </button>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <HRAnalyticsDashboard 
            metrics={hrMetrics}
            applications={hrApplications}
            vacancies={hrVacancies}
          />
        )}

        {/* Roles & Permissions Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-xl' : 'text-gray-900'} mb-4`}>User Roles & Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border-2 border-blue-200 rounded-lg">
                  <Users2 className="w-8 h-8 mb-2 text-blue-600" />
                  <h4 className="font-semibold">HR Officer</h4>
                  <p className="text-sm text-gray-500 mt-2">View applications, schedule interviews, update candidate status</p>
                </div>
                <div className="p-4 border-2 border-green-200 rounded-lg">
                  <Building2 className="w-8 h-8 mb-2 text-green-600" />
                  <h4 className="font-semibold">HR Manager</h4>
                  <p className="text-sm text-gray-500 mt-2">Full access to all HR functions, approve hires, manage vacancies</p>
                </div>
                <div className="p-4 border-2 border-purple-200 rounded-lg">
                  <Award className="w-8 h-8 mb-2 text-purple-600" />
                  <h4 className="font-semibold">Director</h4>
                  <p className="text-sm text-gray-500 mt-2">Strategic oversight, approve senior hires, view all reports</p>
                </div>
                <div className="p-4 border-2 border-orange-200 rounded-lg">
                  <GraduationCap className="w-8 h-8 mb-2 text-orange-600" />
                  <h4 className="font-semibold">Interview Panel</h4>
                  <p className="text-sm text-gray-500 mt-2">View assigned candidates, submit interview feedback</p>
                </div>
              </div>
            </div>

            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-xl' : 'text-gray-900'} mb-4`}>Permission Matrix</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className={`${accessibilityMode ? 'border-b-4 border-black' : 'border-b border-gray-200'}`}>
                      <th className="px-4 py-3 text-left font-semibold">Permission</th>
                      <th className="px-4 py-3 text-center font-semibold">HR Officer</th>
                      <th className="px-4 py-3 text-center font-semibold">HR Manager</th>
                      <th className="px-4 py-3 text-center font-semibold">Director</th>
                      <th className="px-4 py-3 text-center font-semibold">Interview Panel</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={`${accessibilityMode ? 'border-b-2 border-gray-300' : 'border-b border-gray-100'}`}>
                      <td className="px-4 py-3">View Applications</td>
                      <td className="px-4 py-3 text-center"><CheckSquare className="w-5 h-5 mx-auto text-green-600" /></td>
                      <td className="px-4 py-3 text-center"><CheckSquare className="w-5 h-5 mx-auto text-green-600" /></td>
                      <td className="px-4 py-3 text-center"><CheckSquare className="w-5 h-5 mx-auto text-green-600" /></td>
                      <td className="px-4 py-3 text-center"><CheckSquare className="w-5 h-5 mx-auto text-green-600" /></td>
                    </tr>
                    <tr className={`${accessibilityMode ? 'border-b-2 border-gray-300' : 'border-b border-gray-100'}`}>
                      <td className="px-4 py-3">Create Vacancies</td>
                      <td className="px-4 py-3 text-center"><XCircle className="w-5 h-5 mx-auto text-red-600" /></td>
                      <td className="px-4 py-3 text-center"><CheckSquare className="w-5 h-5 mx-auto text-green-600" /></td>
                      <td className="px-4 py-3 text-center"><CheckSquare className="w-5 h-5 mx-auto text-green-600" /></td>
                      <td className="px-4 py-3 text-center"><XCircle className="w-5 h-5 mx-auto text-red-600" /></td>
                    </tr>
                    <tr className={`${accessibilityMode ? 'border-b-2 border-gray-300' : 'border-b border-gray-100'}`}>
                      <td className="px-4 py-3">Approve Hires</td>
                      <td className="px-4 py-3 text-center"><XCircle className="w-5 h-5 mx-auto text-red-600" /></td>
                      <td className="px-4 py-3 text-center"><CheckSquare className="w-5 h-5 mx-auto text-green-600" /></td>
                      <td className="px-4 py-3 text-center"><CheckSquare className="w-5 h-5 mx-auto text-green-600" /></td>
                      <td className="px-4 py-3 text-center"><XCircle className="w-5 h-5 mx-auto text-red-600" /></td>
                    </tr>
                    <tr className={`${accessibilityMode ? 'border-b-2 border-gray-300' : 'border-b border-gray-100'}`}>
                      <td className="px-4 py-3">Run AI Matching</td>
                      <td className="px-4 py-3 text-center"><XCircle className="w-5 h-5 mx-auto text-red-600" /></td>
                      <td className="px-4 py-3 text-center"><CheckSquare className="w-5 h-5 mx-auto text-green-600" /></td>
                      <td className="px-4 py-3 text-center"><CheckSquare className="w-5 h-5 mx-auto text-green-600" /></td>
                      <td className="px-4 py-3 text-center"><XCircle className="w-5 h-5 mx-auto text-red-600" /></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">View Reports</td>
                      <td className="px-4 py-3 text-center"><CheckSquare className="w-5 h-5 mx-auto text-green-600" /></td>
                      <td className="px-4 py-3 text-center"><CheckSquare className="w-5 h-5 mx-auto text-green-600" /></td>
                      <td className="px-4 py-3 text-center"><CheckSquare className="w-5 h-5 mx-auto text-green-600" /></td>
                      <td className="px-4 py-3 text-center"><XCircle className="w-5 h-5 mx-auto text-red-600" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-xl' : 'text-gray-900'} mb-4`}>Recruitment Workflow</h3>
              <div className="flex items-center justify-between space-x-4 overflow-x-auto py-4">
                <div className="flex flex-col items-center min-w-max">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold">Application</p>
                  <p className="text-xs text-gray-500">Submitted</p>
                </div>
                <div className="flex-1 h-1 bg-gray-200"></div>
                <div className="flex flex-col items-center min-w-max">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                    <Eye className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="text-sm font-semibold">Review</p>
                  <p className="text-xs text-gray-500">Under Review</p>
                </div>
                <div className="flex-1 h-1 bg-gray-200"></div>
                <div className="flex flex-col items-center min-w-max">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <Brain className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-sm font-semibold">AI Matching</p>
                  <p className="text-xs text-gray-500">Scored</p>
                </div>
                <div className="flex-1 h-1 bg-gray-200"></div>
                <div className="flex flex-col items-center min-w-max">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm font-semibold">Shortlist</p>
                  <p className="text-xs text-gray-500">Selected</p>
                </div>
                <div className="flex-1 h-1 bg-gray-200"></div>
                <div className="flex flex-col items-center min-w-max">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                    <Calendar className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-sm font-semibold">Interview</p>
                  <p className="text-xs text-gray-500">Scheduled</p>
                </div>
                <div className="flex-1 h-1 bg-gray-200"></div>
                <div className="flex flex-col items-center min-w-max">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="text-sm font-semibold">Hire</p>
                  <p className="text-xs text-gray-500">Offer Accepted</p>
                </div>
              </div>
            </div>

            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-xl' : 'text-gray-900'} mb-4`}>AI Shortlisting Algorithm</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Longlisting</h4>
                    <p className="text-sm text-gray-500">Filter candidates based on minimum requirements (education, experience, basic skills)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">AI Skill Matching</h4>
                    <p className="text-sm text-gray-500">Analyze applications using NLP to extract skills and match against job requirements</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Scoring Algorithm</h4>
                    <p className="text-sm text-gray-500">Calculate weighted scores based on skill match, experience, education, and other factors</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-yellow-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Shortlisting</h4>
                    <p className="text-sm text-gray-500">Auto-select top candidates based on configurable score thresholds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Architecture Tab */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-xl' : 'text-gray-900'} mb-4`}>System Architecture</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border-2 border-blue-200 rounded-lg">
                  <Layers className="w-8 h-8 mb-2 text-blue-600" />
                  <h4 className="font-semibold">Frontend Layer</h4>
                  <p className="text-sm text-gray-500 mt-2">React + Vite + TailwindCSS</p>
                </div>
                <div className="p-4 border-2 border-green-200 rounded-lg">
                  <GitBranch className="w-8 h-8 mb-2 text-green-600" />
                  <h4 className="font-semibold">API Layer</h4>
                  <p className="text-sm text-gray-500 mt-2">Django REST Framework</p>
                </div>
                <div className="p-4 border-2 border-purple-200 rounded-lg">
                  <Database className="w-8 h-8 mb-2 text-purple-600" />
                  <h4 className="font-semibold">Database Layer</h4>
                  <p className="text-sm text-gray-500 mt-2">PostgreSQL + Redis</p>
                </div>
              </div>
            </div>

            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-xl' : 'text-gray-900'} mb-4`}>Database Schema (Django Models)</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">User Model</h4>
                  <p className="text-sm text-gray-600">id, username, email, role, created_at, updated_at</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">Vacancy Model</h4>
                  <p className="text-sm text-gray-600">id, title, description, requirements, salary_range, status, created_by</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Application Model</h4>
                  <p className="text-sm text-gray-600">id, vacancy_id, applicant_id, status, ai_score, submitted_date, document_url</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800">MatchingResult Model</h4>
                  <p className="text-sm text-gray-600">id, application_id, matched_skills, missing_skills, score, confidence</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800">Interview Model</h4>
                  <p className="text-sm text-gray-600">id, application_id, scheduled_date, panel_members, feedback, status</p>
                </div>
              </div>
            </div>

            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-xl' : 'text-gray-900'} mb-4`}>API Design</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">GET</span>
                  <code className="text-sm">/api/v1/applications/</code>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">POST</span>
                  <code className="text-sm">/api/v1/applications/</code>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">PUT</span>
                  <code className="text-sm">/api/v1/applications/{id}/</code>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded">POST</span>
                  <code className="text-sm">/api/v1/ai/match/</code>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">POST</span>
                  <code className="text-sm">/api/v1/hr/shortlist/</code>
                </div>
              </div>
            </div>

            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-xl' : 'text-gray-900'} mb-4`}>Implementation Roadmap</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Zap className="w-6 h-6 text-yellow-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Phase 1: Core Infrastructure</h4>
                    <p className="text-sm text-gray-500">Database setup, user authentication, basic CRUD operations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Phase 2: Application Management</h4>
                    <p className="text-sm text-gray-500">Application submission, document upload, basic filtering</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-6 h-6 text-purple-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Phase 3: AI Integration</h4>
                    <p className="text-sm text-gray-500">AI matching, scoring algorithms, skill extraction</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Phase 4: Advanced Features</h4>
                    <p className="text-sm text-gray-500">Interview management, reporting, analytics dashboard</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-6 h-6 text-orange-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Phase 5: Accessibility & Optimization</h4>
                    <p className="text-sm text-gray-500">NCPD accessibility features, performance optimization, deployment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vacancy Management Tab */}
        {activeTab === 'vacancies' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl' : 'text-gray-900'}`}>Vacancy Management</h3>
                <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${accessibilityMode ? 'bg-blue-600 text-white border-2 border-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  <Briefcase className="w-4 h-4" />
                  <span>Create Vacancy</span>
                </button>
              </div>
              {vacanciesLoading ? (
                <div className="text-center py-8">
                  <div className="spinner"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading vacancies...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600">{vacancies?.filter(v => v.status === 'active').length || 0}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Active Vacancies</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">{vacancies?.filter(v => v.status === 'published').length || 0}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Published</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{vacancies?.filter(v => v.status === 'pending_approval').length || 0}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Pending Approval</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl sm:text-3xl font-bold text-purple-600">{vacancies?.filter(v => v.status === 'draft').length || 0}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Draft</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl' : 'text-gray-900'} mb-3 sm:mb-4`}>Recent Vacancies</h3>
              {vacanciesLoading ? (
                <div className="text-center py-8">
                  <div className="spinner"></div>
                </div>
              ) : vacancies && vacancies.length > 0 ? (
                <div className="space-y-3">
                  {vacancies.slice(0, 10).map(vacancy => (
                    <div key={vacancy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{vacancy.title}</p>
                          <p className="text-xs text-gray-500">Deadline: {vacancy.deadline || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-200 rounded-lg" title="Clone">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-200 rounded-lg" title="Edit">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No vacancies found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Eligibility Screening Tab */}
        {activeTab === 'eligibility' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl' : 'text-gray-900'} mb-3 sm:mb-4`}>Automated Eligibility Screening</h3>
              <div className="mb-4">
                <select className="w-full px-3 py-2 border rounded-lg text-sm" onChange={(e) => setSelectedApplication(applications?.find(a => a.id === parseInt(e.target.value)))}>
                  <option value="">Select Application</option>
                  {applications?.map(app => (
                    <option key={app.id} value={app.id}>{app.applicant_name}</option>
                  ))}
                </select>
              </div>
              {selectedApplication ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Requirement</th>
                          <th className="px-4 py-3 text-left font-semibold">Candidate</th>
                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3">Degree</td>
                          <td className="px-4 py-3">{selectedApplication.education_level || 'N/A'}</td>
                          <td className="px-4 py-3"><CheckCircle className="w-5 h-5 text-green-600" /></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Experience</td>
                          <td className="px-4 py-3">{selectedApplication.experience || 'N/A'} Years</td>
                          <td className="px-4 py-3"><CheckCircle className="w-5 h-5 text-green-600" /></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Certification</td>
                          <td className="px-4 py-3">{selectedApplication.certification || 'N/A'}</td>
                          <td className="px-4 py-3"><XCircle className="w-5 h-5 text-red-600" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="font-semibold text-blue-900">Eligibility Score: {selectedApplication.eligibility_score || 75}%</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select an application to view eligibility screening</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Shortlisting Tab */}
        {activeTab === 'shortlisting' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl' : 'text-gray-900'} mb-3 sm:mb-4`}>AI Shortlisting</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choose Vacancy</label>
                  <select
                    value={selectedVacancyId || ''}
                    onChange={(e) => setSelectedVacancyId(e.target.value ? parseInt(e.target.value) : null)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${accessibilityMode ? 'border-4 border-black text-xl' : 'border-gray-300'}`}
                  >
                    <option value="">Select vacancy</option>
                    {vacancies?.map((vacancy) => (
                      <option key={vacancy.id} value={vacancy.id}>
                        {vacancy.title || `Vacancy #${vacancy.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-gray-500">
                  Run AI shortlisting for the selected vacancy and review ranked candidates based on application analysis from the application queue.
                </div>
              </div>
            </div>

            {selectedVacancyId ? (
              <IntelligentShortlisting vacancyId={selectedVacancyId} />
            ) : (
              <div className="card p-6 text-gray-600">
                Please select a vacancy to load AI shortlisting results and candidate rankings.
              </div>
            )}
          </div>
        )}

        {/* Longlisting Tab */}
        {activeTab === 'longlisting' && (
          <div className="space-y-4 sm:space-y-6 w-full overflow-hidden">
            <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100/50 w-full max-w-full`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                <div className="w-full sm:w-auto min-w-0">
                  <h3 className={`font-bold ${accessibilityMode ? 'text-lg sm:text-xl md:text-2xl' : 'text-gray-900'} text-sm sm:text-base lg:text-lg mb-2`}>Longlisting Automation</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Select Vacancy:</label>
                    <select 
                      value={selectedVacancyId || ''} 
                      onChange={(e) => setSelectedVacancyId(e.target.value ? parseInt(e.target.value) : null)}
                      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm w-full sm:w-auto ${accessibilityMode ? 'border-4 border-black' : 'border-gray-300'}`}
                    >
                      <option value="">All Vacancies</option>
                      {vacancies?.map(vacancy => (
                        <option key={vacancy.id} value={vacancy.id}>{vacancy.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                  <button 
                    onClick={() => handleExportExcel()}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl ${accessibilityMode ? 'bg-green-600 text-white border-2 border-green-600' : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'} transition-all hover:scale-105 active:scale-95`}
                  >
                    <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm font-medium">Export Excel</span>
                  </button>
                  <button 
                    onClick={() => handleExportPDF()}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl ${accessibilityMode ? 'bg-red-600 text-white border-2 border-red-600' : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'} transition-all hover:scale-105 active:scale-95`}
                  >
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm font-medium">Export PDF</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto w-full max-w-full">
                <table className="w-full min-w-[1050px] text-xs sm:text-sm lg:text-base border-collapse table-layout-fixed" style={{ tableLayout: 'fixed' }}>
                  <thead className={`${accessibilityMode ? 'bg-gray-100 border-2 border-black' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} border-b border-gray-200`}>
                    <tr>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm lg:text-base text-gray-900 w-[4%] min-w-[40px]">#</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm lg:text-base text-gray-900 w-[10%] min-w-[80px]">Name</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm lg:text-base text-gray-900 w-[9%] min-w-[70px]">ID No.</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm lg:text-base text-gray-900 w-[5%] min-w-[50px]">Age</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm lg:text-base text-gray-900 w-[7%] min-w-[60px]">Gender</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm lg:text-base text-gray-900 w-[8%] min-w-[70px]">County</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm lg:text-base text-gray-900 w-[11%] min-w-[90px]">Degree</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm lg:text-base text-gray-900 w-[12%] min-w-[100px]">Qualifications</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm lg:text-base text-gray-900 bg-blue-100 w-[8%] min-w-[70px]">Employer</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm lg:text-base text-gray-900 bg-blue-100 w-[9%] min-w-[75px]">Position</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm lg:text-base text-gray-900 bg-blue-100 w-[9%] min-w-[75px]">Duration</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm lg:text-base text-gray-900 w-[10%] min-w-[85px]">Documents</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm lg:text-base text-gray-900 w-[12%] min-w-[90px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {longlistingApplications.length > 0 ? (
                      longlistingApplications.map((app, index) => {
                        // Use the shared data extraction function
                        const data = extractLonglistingData(app, index)
                        
                        // For HTML display, we need to format the duration with bold tags
                        const employmentEntries = data.employmentEntries.map(entry => {
                          // Add bold formatting for display
                          const durationWithBold = entry.duration.replace(/\(([^)]+)\)/, '<strong>($1)</strong>')
                          return {
                            ...entry,
                            duration: durationWithBold
                          }
                        })
                        
                        // Get documents for display - use all_documents from backend if available
                        const allDocuments = app.all_documents || []
                        const applicationResume = app.resume_file || app.applicant?.resume_file
                        const applicationPortfolio = app.portfolio_file || app.applicant?.portfolio_file
                        const additionalDocs = app.additional_documents || app.applicant?.attachments || []
                        
                        // Debug logging to check document data
                        if (index === 0) {
                          console.log('Longlisting Document Debug:', {
                            appId: app.id,
                            appName: data.name,
                            allDocuments: allDocuments,
                            applicationResume,
                            applicationPortfolio,
                            additionalDocs,
                            fullApp: app
                          })
                        }

                        return (
                          <tr key={`${app.id || index}-${data.name || app.first_name || index}`}>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700 font-medium text-xs sm:text-sm lg:text-base text-center">{data.index}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700 font-medium text-xs sm:text-sm lg:text-base">
                              {data.name}
                            </td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm lg:text-base">{data.nationalId}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm lg:text-base">{data.age}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm lg:text-base">{data.gender}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm lg:text-base">{data.county}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm lg:text-base">{data.bachelorDegree}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm lg:text-base whitespace-pre-line">{data.qualificationsText}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm lg:text-base whitespace-pre-line">
                              {employmentEntries.map((entry, idx) => (
                                <div key={idx}>{entry.employer}</div>
                              ))}
                            </td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm lg:text-base whitespace-pre-line">
                              {employmentEntries.map((entry, idx) => (
                                <div key={idx}>{entry.position}</div>
                              ))}
                            </td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700 text-xs sm:text-sm lg:text-base">
                              {employmentEntries.map((entry, idx) => (
                                <div key={idx} dangerouslySetInnerHTML={{ __html: entry.duration }}></div>
                              ))}
                            </td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700">
                              {(() => {
                                const documentFolders = groupDocumentsByType(allDocuments, applicationResume, applicationPortfolio, additionalDocs)
                                return documentFolders.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {documentFolders.map(folder => {
                                      const isExpanded = expandedFolders[`${app.id}-${folder.key}`]
                                      const IconComponent = folder.icon === 'FileText' ? FileText : 
                                                         folder.icon === 'Folder' ? Folder : 
                                                         folder.icon === 'Award' ? Award : Folder
                                      return (
                                        <div key={folder.key} className="flex flex-col">
                                          <button
                                            onClick={() => handleDownloadFolder(folder.documents, folder.name, data.name)}
                                            className="flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                                            title={`Download all ${folder.documents.length} files in ${folder.name}`}
                                          >
                                            <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                                            {data.name} ({folder.documents.length})
                                          </button>
                                        </div>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs sm:text-sm">No docs</span>
                                )
                              })()}
                            </td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700">
                              <div className="flex flex-col sm:flex-row gap-1">
                                <button
                                  onClick={() => handleViewDocuments(app, allDocuments, applicationResume, applicationPortfolio, additionalDocs)}
                                  className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium hover:bg-blue-50 px-1 sm:px-2 py-1 rounded transition-colors"
                                >
                                  View
                                </button>
                                {app.status === 'shortlisted' ? (
                                  <button
                                    disabled
                                    className="text-green-800 bg-green-100 text-xs sm:text-sm font-medium px-1 sm:px-2 py-1 rounded opacity-75 cursor-not-allowed"
                                  >
                                    Shortlisted
                                  </button>
                                ) : app.status === 'rejected' ? (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to shortlist ${app.name || app.applicant_name || 'this applicant'}?`)) {
                                        updateApplicationStatus.mutate({
                                          applicationId: app.id,
                                          status: 'shortlisted',
                                          notes: 'Shortlisted from longlisting stage'
                                        })
                                      }
                                    }}
                                    disabled={updateApplicationStatus.isLoading}
                                    className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium hover:bg-green-50 px-1 sm:px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {updateApplicationStatus.isLoading ? 'Processing...' : 'Shortlist'}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to shortlist ${app.name || app.applicant_name || 'this applicant'}?`)) {
                                        updateApplicationStatus.mutate({
                                          applicationId: app.id,
                                          status: 'shortlisted',
                                          notes: 'Shortlisted from longlisting stage'
                                        })
                                      }
                                    }}
                                    disabled={updateApplicationStatus.isLoading}
                                    className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium hover:bg-green-50 px-1 sm:px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {updateApplicationStatus.isLoading ? 'Processing...' : 'Shortlist'}
                                  </button>
                                )}
                                {app.status === 'rejected' ? (
                                  <button
                                    disabled
                                    className="text-red-800 bg-red-100 text-xs sm:text-sm font-medium px-1 sm:px-2 py-1 rounded opacity-75 cursor-not-allowed"
                                  >
                                    Rejected
                                  </button>
                                ) : app.status === 'shortlisted' ? (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to reject ${app.name || app.applicant_name || 'this applicant'}?`)) {
                                        updateApplicationStatus.mutate({
                                          applicationId: app.id,
                                          status: 'rejected',
                                          notes: 'Rejected from longlisting stage'
                                        })
                                      }
                                    }}
                                    disabled={updateApplicationStatus.isLoading}
                                    className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium hover:bg-red-50 px-1 sm:px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {updateApplicationStatus.isLoading ? 'Processing...' : 'Reject'}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to reject ${app.name || app.applicant_name || 'this applicant'}?`)) {
                                        updateApplicationStatus.mutate({
                                          applicationId: app.id,
                                          status: 'rejected',
                                          notes: 'Rejected from longlisting stage'
                                        })
                                      }
                                    }}
                                    disabled={updateApplicationStatus.isLoading}
                                    className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium hover:bg-red-50 px-1 sm:px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {updateApplicationStatus.isLoading ? 'Processing...' : 'Reject'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="13" className="px-2 sm:px-3 lg:px-4 py-8 text-center text-gray-500 text-xs sm:text-sm lg:text-base">
                          No applications found. {selectedVacancyId ? 'No applications for this vacancy yet.' : 'Please select a vacancy to view applications.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Communication Tab */}
        {activeTab === 'communication' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl' : 'text-gray-900'} mb-3 sm:mb-4`}>Bulk Communication</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <button className={`p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors ${accessibilityMode ? 'border-2 border-red-600' : ''}`}>
                  <XCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                  <p className="font-medium text-sm text-center">Rejection Emails</p>
                </button>
                <button className={`p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors ${accessibilityMode ? 'border-2 border-green-600' : ''}`}>
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="font-medium text-sm text-center">Interview Invitations</p>
                </button>
                <button className={`p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors ${accessibilityMode ? 'border-2 border-blue-600' : ''}`}>
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium text-sm text-center">Job Offers</p>
                </button>
                <button className={`p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors ${accessibilityMode ? 'border-2 border-purple-600' : ''}`}>
                  <Mail className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-medium text-sm text-center">Acknowledgements</p>
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Send to:</p>
                <select className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option>All Applicants</option>
                  <option>Shortlisted Candidates</option>
                  <option>Interviewed Candidates</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Audit Trail Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl' : 'text-gray-900'} mb-3 sm:mb-4`}>Compliance & Audit Trail</h3>
              {auditLogsLoading ? (
                <div className="text-center py-8">
                  <div className="spinner"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading audit logs...</p>
                </div>
              ) : auditLogs && auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.map(log => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <History className={`w-5 h-5 mt-0.5 ${
                        log.action_type === 'approve' ? 'text-green-600' :
                        log.action_type === 'reject' ? 'text-red-600' :
                        log.action_type === 'create' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-gray-500">User: {log.user} • {log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No audit logs found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 sm:mb-4`}>Settings</h3>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : ''}`}>Dark Mode</span>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-6 rounded-full ${darkMode ? 'bg-blue-600' : 'bg-gray-300'} relative`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : ''}`}>Role-Based Access</span>
                  </div>
                  <select className={`px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-600 text-white border-gray-500' : 'border'}`}>
                    <option>HR Manager</option>
                    <option>HR Officer</option>
                    <option>Director</option>
                    <option>Interview Panel</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recruitment Pipeline Tab */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100/50 w-full max-w-full`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                <div className="w-full sm:w-auto min-w-0">
                  <h3 className={`font-bold ${accessibilityMode ? 'text-lg sm:text-xl md:text-2xl' : 'text-gray-900'} text-sm sm:text-base lg:text-lg mb-2`}>Recruitment Pipeline</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Track candidates through the recruitment process</p>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    className="px-3 py-2 border rounded-lg text-xs sm:text-sm"
                    value={selectedVacancyId || ''}
                    onChange={(e) => setSelectedVacancyId(e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="">All Vacancies</option>
                    {vacancies?.map(vacancy => (
                      <option key={vacancy.id} value={vacancy.id}>{vacancy.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto pb-4">
                {(() => {
                  // Use hrApplications data which has the correct structure
                  const pipelineApplications = hrApplications || applications || []
                  
                  // Debug: Log all unique status values
                  const uniqueStatuses = [...new Set(pipelineApplications.map(app => app.status))]
                  console.log('Unique status values in pipeline applications:', uniqueStatuses)
                  console.log('Total applications in pipeline:', pipelineApplications.length)
                  
                  const stages = [
                    { status: 'submitted', label: 'Applied', color: 'bg-gray-100 border-gray-300' },
                    { status: 'under_review', label: 'Under Review', color: 'bg-blue-100 border-blue-300' },
                    { status: 'longlisted', label: 'Longlisted', color: 'bg-yellow-100 border-yellow-300' },
                    { status: 'shortlisted', label: 'Shortlisted', color: 'bg-green-100 border-green-300' },
                    { status: 'interview_scheduled', label: 'Interview', color: 'bg-purple-100 border-purple-300' },
                    { status: 'interview_completed', label: 'Interview Done', color: 'bg-indigo-100 border-indigo-300' },
                    { status: 'hired', label: 'Hired', color: 'bg-emerald-100 border-emerald-300' },
                    { status: 'rejected', label: 'Rejected', color: 'bg-red-100 border-red-300' }
                  ]
                  
                  return stages.map(stage => {
                    const stageApplications = pipelineApplications.filter(app => {
                      const appStatus = app.status?.toLowerCase() || ''
                      const stageStatus = stage.status.toLowerCase()
                      return appStatus === stageStatus && 
                             (!selectedVacancyId || app.vacancy_id === selectedVacancyId)
                    })
                  
                    return (
                      <div key={stage.status} className={`min-w-[200px] ${stage.color} border-2 rounded-xl p-3 sm:p-4`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-xs sm:text-sm text-gray-900">{stage.label}</h4>
                          <span className="text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded-full">
                            {stageApplications.length}
                          </span>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {stageApplications.length > 0 ? (
                            stageApplications.map(app => (
                              <div 
                                key={app.id} 
                                className="bg-white p-2 sm:p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleViewCandidate(app)}
                              >
                                <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                                  {app.applicant_name || app.name || 'Unknown'}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                                  {app.position || app.vacancy_title || 'Position'}
                                </p>
                                <div className="flex gap-1 mt-2">
                                  <select
                                    className="text-[10px] sm:text-xs px-1 py-1 border rounded flex-1"
                                    value={app.status}
                                    onChange={(e) => {
                                      if (window.confirm(`Move ${app.applicant_name || app.name || 'this applicant'} to ${e.target.options[e.target.selectedIndex].text}?`)) {
                                        updateApplicationStatus.mutate({
                                          applicationId: app.id,
                                          status: e.target.value,
                                          notes: `Moved to ${e.target.value} in pipeline`
                                        })
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="submitted">Applied</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="longlisted">Longlisted</option>
                                    <option value="shortlisted">Shortlisted</option>
                                    <option value="interview_scheduled">Interview</option>
                                    <option value="interview_completed">Interview Done</option>
                                    <option value="hired">Hired</option>
                                    <option value="rejected">Rejected</option>
                                  </select>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 text-center py-4">No candidates</p>
                          )}
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Shortlisted Candidates Tab */}
        {activeTab === 'shortlisted' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`${accessibilityMode ? 'border-4 border-black bg-white' : 'bg-white/90 backdrop-blur-xl'} rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border border-gray-100/50 w-full max-w-full`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                <div className="w-full sm:w-auto min-w-0">
                  <h3 className={`font-bold ${accessibilityMode ? 'text-lg sm:text-xl md:text-2xl' : 'text-gray-900'} text-sm sm:text-base lg:text-lg mb-2`}>Shortlisted Candidates</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Candidates who have been shortlisted for the position</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${accessibilityMode ? 'bg-black text-white' : 'bg-green-100 text-green-800'}`}>
                    {applications.filter(app => app.status === 'shortlisted').length} Shortlisted
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm lg:text-base">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">#</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Name</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">ID No.</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Age</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Gender</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">County</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Degree</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Employer</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Position</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Experience</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Documents</th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.filter(app => app.status === 'shortlisted').length > 0 ? (
                      applications.filter(app => app.status === 'shortlisted').map((app, index) => {
                        const data = extractLonglistingData(app, index)
                        
                        const employmentEntries = data.employmentEntries.map(entry => {
                          return {
                            employer: entry.employer,
                            position: entry.position,
                            duration: entry.duration
                          }
                        })

                        const allDocuments = app.all_documents || []
                        const applicationResume = app.resume_file || app.applicant?.resume_file
                        const applicationPortfolio = app.portfolio_file || app.applicant?.portfolio_file
                        const additionalDocs = app.additional_documents || app.applicant?.attachments || []

                        return (
                          <tr key={app.id} className="hover:bg-gray-50">
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-medium text-gray-900">{index + 1}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-medium text-gray-900">{data.name}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-600">{data.nationalId}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-600">{data.age}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-600">{data.gender}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-600">{data.county}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-600">{data.bachelorDegree}</td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-600">
                              {employmentEntries.map((e, i) => (
                                <div key={i} className="text-xs">{e.employer}</div>
                              ))}
                            </td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-600">
                              {employmentEntries.map((e, i) => (
                                <div key={i} className="text-xs">{e.position}</div>
                              ))}
                            </td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-600">
                              {employmentEntries.map((e, i) => (
                                <div key={i} className="text-xs">{e.duration}</div>
                              ))}
                            </td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-600">
                              {(() => {
                                const documentFolders = groupDocumentsByType(allDocuments, applicationResume, applicationPortfolio, additionalDocs)
                                return documentFolders.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {documentFolders.map(folder => {
                                      const isExpanded = expandedFolders[`${app.id}-${folder.key}`]
                                      return (
                                        <div key={folder.key} className="flex flex-col">
                                          <button
                                            onClick={() => handleDownloadFolder(folder.documents, folder.name, data.name)}
                                            className="flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                                            title={`Download all ${folder.documents.length} files in ${folder.name}`}
                                          >
                                            <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                                            {data.name} ({folder.documents.length})
                                          </button>
                                        </div>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs sm:text-sm">No docs</span>
                                )
                              })()}
                            </td>
                            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-gray-700">
                              <div className="flex flex-col sm:flex-row gap-1">
                                <button
                                  onClick={() => handleViewDocuments(app, allDocuments, applicationResume, applicationPortfolio, additionalDocs)}
                                  className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium hover:bg-blue-50 px-1 sm:px-2 py-1 rounded transition-colors"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to schedule an interview for ${app.name || app.applicant_name || 'this applicant'}?`)) {
                                      updateApplicationStatus.mutate({
                                        applicationId: app.id,
                                        status: 'interview_scheduled',
                                        notes: 'Interview scheduled for shortlisted candidate'
                                      })
                                    }
                                  }}
                                  disabled={updateApplicationStatus.isLoading}
                                  className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm font-medium hover:bg-purple-50 px-1 sm:px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updateApplicationStatus.isLoading ? 'Processing...' : 'Schedule Interview'}
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to reject ${app.name || app.applicant_name || 'this applicant'}?`)) {
                                      updateApplicationStatus.mutate({
                                        applicationId: app.id,
                                        status: 'rejected',
                                        notes: 'Rejected from shortlisted candidates'
                                      })
                                    }
                                  }}
                                  disabled={updateApplicationStatus.isLoading}
                                  className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium hover:bg-red-50 px-1 sm:px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updateApplicationStatus.isLoading ? 'Processing...' : 'Reject'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="12" className="px-2 sm:px-3 lg:px-4 py-8 text-center text-gray-500 text-xs sm:text-sm lg:text-base">
                          No shortlisted candidates found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Hiring Workflow Tab */}
        {activeTab === 'hiring' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4">Hiring Workflow</h3>
              <p className="text-sm text-gray-600">Hiring workflow view component loading...</p>
            </div>
          </div>
        )}

        {/* Document Verification Tab */}
        {activeTab === 'document_verification' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl' : 'text-gray-900'} mb-3 sm:mb-4`}>Document Verification</h3>
              <div className="mb-4">
                <select className="w-full px-3 py-2 border rounded-lg text-sm" onChange={(e) => setSelectedApplication(applications?.find(a => a.id === parseInt(e.target.value)))}>
                  <option value="">Select Application</option>
                  {applications?.map(app => (
                    <option key={app.id} value={app.id}>{app.applicant_name}</option>
                  ))}
                </select>
              </div>
              {selectedApplication ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">Resume Uploaded</p>
                        <p className="text-xs text-gray-500">Verified</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">Complete</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">National ID Uploaded</p>
                        <p className="text-xs text-gray-500">Verified</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">Complete</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-sm">Academic Certificates</p>
                        <p className="text-xs text-gray-500">Missing</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">Incomplete</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-sm">Professional Licenses</p>
                        <p className="text-xs text-gray-500">Pending Review</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-semibold rounded-full">Pending</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select an application to view document verification status</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel Management Tab */}
        {activeTab === 'panel_management' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl' : 'text-gray-900'}`}>Interview Panel Management</h3>
                <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${accessibilityMode ? 'bg-blue-600 text-white border-2 border-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  <Users2 className="w-4 h-4" />
                  <span>Create Panel</span>
                </button>
              </div>
              {panelsLoading ? (
                <div className="text-center py-8">
                  <div className="spinner"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading panels...</p>
                </div>
              ) : panels && panels.length > 0 ? (
                <div className="space-y-3">
                  {panels.map(panel => (
                    <div key={panel.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{panel.name}</p>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${panel.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {panel.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {panel.members && panel.members.map(member => (
                          <span key={member.id} className="px-2 py-1 bg-white border rounded text-xs">
                            {member.name} ({member.role})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No panels found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HR Approval Workflow Tab */}
        {activeTab === 'approval_workflow' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`card ${accessibilityMode ? 'border-4 border-black' : ''}`}>
              <h3 className={`font-semibold ${accessibilityMode ? 'text-lg sm:text-xl' : 'text-gray-900'} mb-3 sm:mb-4`}>HR Approval Workflow</h3>
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Step 1: HR Creates Vacancy</p>
                      <p className="text-xs text-gray-500">Completed by John Smith</p>
                    </div>
                  </div>
                  <div className="absolute left-5 top-10 w-0.5 h-8 bg-green-400" />
                </div>
                <div className="relative">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Step 2: HR Manager Approval</p>
                      <p className="text-xs text-gray-500">Approved by Mary Johnson</p>
                    </div>
                  </div>
                  <div className="absolute left-5 top-10 w-0.5 h-8 bg-green-400" />
                </div>
                <div className="relative">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Step 3: Director Approval</p>
                      <p className="text-xs text-gray-500">Pending Director Review</p>
                    </div>
                    <button className={`px-3 py-1 rounded-lg text-xs ${accessibilityMode ? 'bg-blue-600 text-white border-2 border-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      Approve
                    </button>
                  </div>
                  <div className="absolute left-5 top-10 w-0.5 h-8 bg-gray-300" />
                </div>
                <div className="relative">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-400">Step 4: Publish Vacancy</p>
                      <p className="text-xs text-gray-400">Awaiting previous approvals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Viewer Modal - mobile-friendly */}
        {documentViewer.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col relative z-[10000]">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Documents - {documentViewer.applicantName}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{documentViewer.documents.length} document(s)</p>
                </div>
                <button
                  onClick={() => setDocumentViewer({ isOpen: false, documents: [], applicantName: null })}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-2 sm:p-4">
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {documentViewer.documents.map((doc, idx) => (
                    <div key={idx} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                      <div className="h-[80vh] sm:h-[70vh]">
                        <PDFViewer
                          url={getBackendMediaUrl(doc.file)}
                          fileName={doc.name}
                          className="h-full rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end p-3 sm:p-4 border-t">
                <button
                  onClick={() => setDocumentViewer({ isOpen: false, documents: [], applicantName: null })}
                  className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Close
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
