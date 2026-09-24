import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  FileText, 
  Send,
  ArrowRight,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  AlertCircle,
  Award,
  Briefcase,
  GraduationCap,
  Building2,
  Mail,
  Phone,
  MapPin,
  Download,
  Eye,
  MessageSquare,
  Settings,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { hrAPI } from '../services/api'

const STATUS_STAGES = [
  { key: 'submitted', label: 'Submitted', color: 'blue', icon: FileText },
  { key: 'under_review', label: 'Under Review', color: 'yellow', icon: Clock },
  { key: 'screening', label: 'AI Screening', color: 'purple', icon: Star },
  { key: 'shortlisted', label: 'Shortlisted', color: 'green', icon: CheckCircle },
  { key: 'interview_scheduled', label: 'Interview Scheduled', color: 'orange', icon: Calendar },
  { key: 'interview_completed', label: 'Interview Completed', color: 'teal', icon: Award },
  { key: 'offer_extended', label: 'Offer Extended', color: 'indigo', icon: Send },
  { key: 'offer_accepted', label: 'Offer Accepted', color: 'emerald', icon: Briefcase },
  { key: 'offer_declined', label: 'Offer Declined', color: 'red', icon: XCircle },
  { key: 'rejected', label: 'Rejected', color: 'rose', icon: XCircle },
  { key: 'withdrawn', label: 'Withdrawn', color: 'gray', icon: AlertCircle },
]

const STATUS_COLOR_MAP = {
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  purple: 'bg-purple-50 border-purple-200 text-purple-800',
  green: 'bg-green-50 border-green-200 text-green-800',
  orange: 'bg-orange-50 border-orange-200 text-orange-800',
  teal: 'bg-teal-50 border-teal-200 text-teal-800',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  red: 'bg-red-50 border-red-200 text-red-800',
  rose: 'bg-rose-50 border-rose-200 text-rose-800',
  gray: 'bg-gray-50 border-gray-200 text-gray-800',
}

export const RecruitmentPipeline = ({ vacancyId }) => {
  const queryClient = useQueryClient()
  const [selectedStage, setSelectedStage] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApplications, setSelectedApplications] = useState([])
  const [showActionMenu, setShowActionMenu] = useState(null)
  const [bulkAction, setBulkAction] = useState('')
  const [filters, setFilters] = useState({
    scoreRange: [0, 100],
    experience: 'all',
    education: 'all',
    county: 'all'
  })

  // Fetch pipeline data
  const { data: pipelineData, isLoading, refetch } = useQuery(
    ['recruitment-pipeline', vacancyId],
    () => hrAPI.getPipeline(),
    {
      enabled: true,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  )

  // Mutations for workflow actions
  const shortlistMutation = useMutation(
    ({ id, data }) => hrAPI.shortlistApplication(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recruitment-pipeline'])
        queryClient.invalidateQueries(['hr-applications'])
      }
    }
  )

  const interviewMutation = useMutation(
    ({ id, data }) => hrAPI.moveToInterview(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recruitment-pipeline'])
        queryClient.invalidateQueries(['hr-applications'])
      }
    }
  )

  const completeInterviewMutation = useMutation(
    ({ id, data }) => hrAPI.completeInterview(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recruitment-pipeline'])
        queryClient.invalidateQueries(['hr-applications'])
      }
    }
  )

  const offerMutation = useMutation(
    ({ id, data }) => hrAPI.extendOffer(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recruitment-pipeline'])
        queryClient.invalidateQueries(['hr-applications'])
      }
    }
  )

  const acceptOfferMutation = useMutation(
    ({ id, data }) => hrAPI.acceptOffer(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recruitment-pipeline'])
        queryClient.invalidateQueries(['hr-applications'])
      }
    }
  )

  const rejectMutation = useMutation(
    ({ id, data }) => hrAPI.rejectApplication(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recruitment-pipeline'])
        queryClient.invalidateQueries(['hr-applications'])
      }
    }
  )

  // Filter applications based on search and filters
  const filterApplications = (applications) => {
    if (!applications) return []
    
    return applications.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesScore = app.ai_score >= filters.scoreRange[0] && app.ai_score <= filters.scoreRange[1]
      const matchesExperience = filters.experience === 'all' || 
        (filters.experience === 'senior' && app.experience_years >= 5) ||
        (filters.experience === 'mid' && app.experience_years >= 2 && app.experience_years < 5) ||
        (filters.experience === 'junior' && app.experience_years < 2)
      const matchesEducation = filters.education === 'all' ||
        app.education_level?.toLowerCase().includes(filters.education.toLowerCase())
      
      return matchesSearch && matchesScore && matchesExperience && matchesEducation
    })
  }

  // Get applications for selected stage
  const getStageApplications = () => {
    if (!pipelineData) return []
    
    if (selectedStage === 'all') {
      // Return all applications from all stages
      let allApps = []
      Object.values(pipelineData).forEach(stage => {
        if (stage.applications) {
          allApps = [...allApps, ...stage.applications]
        }
      })
      return filterApplications(allApps)
    }
    
    const stageData = pipelineData[selectedStage]
    return stageData ? filterApplications(stageData.applications) : []
  }

  // Handle workflow actions
  const handleAction = (action, applicationId) => {
    const notes = prompt('Add notes for this action (optional):')
    
    switch (action) {
      case 'shortlist':
        shortlistMutation.mutate({ id: applicationId, data: { notes } })
        break
      case 'interview':
        interviewMutation.mutate({ id: applicationId, data: { notes } })
        break
      case 'complete_interview':
        completeInterviewMutation.mutate({ id: applicationId, data: { notes } })
        break
      case 'offer':
        offerMutation.mutate({ id: applicationId, data: { notes } })
        break
      case 'accept':
        acceptOfferMutation.mutate({ id: applicationId, data: { notes } })
        break
      case 'reject':
        rejectMutation.mutate({ id: applicationId, data: { notes } })
        break
    }
    setShowActionMenu(null)
  }

  // Get available actions for current status
  const getAvailableActions = (status) => {
    const actionMap = {
      'submitted': ['shortlist', 'reject'],
      'under_review': ['shortlist', 'reject'],
      'screening': ['shortlist', 'reject'],
      'shortlisted': ['interview', 'reject'],
      'interview_scheduled': ['complete_interview', 'reject'],
      'interview_completed': ['offer', 'reject'],
      'offer_extended': ['accept'],
      'offer_accepted': [],
      'offer_declined': [],
      'rejected': [],
      'withdrawn': [],
    }
    return actionMap[status] || []
  }

  const currentApplications = getStageApplications()
  const stageData = selectedStage === 'all' ? null : pipelineData?.[selectedStage]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ncpd-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recruitment Pipeline</h2>
            <p className="text-sm text-slate-600 mt-1">Track candidates through the hiring process</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-ncpd-primary rounded-lg hover:bg-ncpd-secondary transition-colors">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          <button
            onClick={() => setSelectedStage('all')}
            className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
              selectedStage === 'all'
                ? 'border-ncpd-primary bg-ncpd-primary/10'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {Object.values(pipelineData || {}).reduce((sum, stage) => sum + (stage.count || 0), 0)}
              </p>
              <p className="text-xs font-medium text-slate-600">All Candidates</p>
            </div>
          </button>

          {STATUS_STAGES.map(stage => {
            const stageInfo = pipelineData?.[stage.key] || { count: 0 }
            const StageIcon = stage.icon
            
            return (
              <button
                key={stage.key}
                onClick={() => setSelectedStage(stage.key)}
                className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedStage === stage.key
                    ? 'border-ncpd-primary bg-ncpd-primary/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-center">
                  <StageIcon className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                  <p className="text-2xl font-bold text-slate-900">{stageInfo.count}</p>
                  <p className="text-xs font-medium text-slate-600">{stage.label}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncpd-primary focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncpd-primary focus:border-transparent"
            >
              <option value="all">All Experience</option>
              <option value="senior">Senior (5+ years)</option>
              <option value="mid">Mid (2-5 years)</option>
              <option value="junior">Junior (0-2 years)</option>
            </select>
            
            <select
              value={filters.education}
              onChange={(e) => setFilters({ ...filters, education: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncpd-primary focus:border-transparent"
            >
              <option value="all">All Education</option>
              <option value="phd">PhD</option>
              <option value="master">Master's</option>
              <option value="bachelor">Bachelor's</option>
              <option value="diploma">Diploma</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {selectedStage === 'all' ? 'All Candidates' : stageData?.label || 'Candidates'}
              <span className="ml-2 text-sm font-normal text-slate-600">
                ({currentApplications.length})
              </span>
            </h3>
            
            {selectedApplications.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg"
                >
                  <option value="">Bulk Action</option>
                  <option value="shortlist">Shortlist</option>
                  <option value="interview">Move to Interview</option>
                  <option value="reject">Reject</option>
                </select>
                <button
                  onClick={() => {
                    selectedApplications.forEach(id => {
                      if (bulkAction) handleAction(bulkAction, id)
                    })
                    setSelectedApplications([])
                    setBulkAction('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-ncpd-primary rounded-lg hover:bg-ncpd-secondary"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {currentApplications.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600">No candidates found in this stage</p>
            </div>
          ) : (
            currentApplications.map(application => {
              const availableActions = getAvailableActions(application.status)
              const stageInfo = STATUS_STAGES.find(s => s.key === application.status)
              const StageIcon = stageInfo?.icon || FileText
              
              return (
                <div key={application.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedApplications([...selectedApplications, application.id])
                        } else {
                          setSelectedApplications(selectedApplications.filter(id => id !== application.id))
                        }
                      }}
                      className="mt-1 w-4 h-4 text-ncpd-primary border-slate-300 rounded focus:ring-ncpd-primary"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">
                            {application.name || application.applicant_name}
                          </h4>
                          <p className="text-sm text-slate-600">{application.job_title}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            STATUS_COLOR_MAP[stageInfo?.color] || 'bg-gray-50 border-gray-200 text-gray-800'
                          }`}>
                            <StageIcon className="w-3 h-3 mr-1" />
                            {stageInfo?.label || application.status}
                          </span>
                          
                          <div className="relative">
                            <button
                              onClick={() => setShowActionMenu(showActionMenu === application.id ? null : application.id)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Settings className="w-5 h-5 text-slate-600" />
                            </button>
                            
                            {showActionMenu === application.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                                {availableActions.map(action => (
                                  <button
                                    key={action}
                                    onClick={() => handleAction(action, application.id)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                                  >
                                    {action === 'shortlist' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                    {action === 'interview' && <Calendar className="w-4 h-4 text-blue-600" />}
                                    {action === 'complete_interview' && <Award className="w-4 h-4 text-purple-600" />}
                                    {action === 'offer' && <Send className="w-4 h-4 text-indigo-600" />}
                                    {action === 'accept' && <Briefcase className="w-4 h-4 text-emerald-600" />}
                                    {action === 'reject' && <XCircle className="w-4 h-4 text-red-600" />}
                                    <span className="capitalize">{action.replace('_', ' ')}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          {application.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4" />
                          {application.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          {application.county || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <GraduationCap className="w-4 h-4" />
                          {application.education_level || 'N/A'}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-slate-900">
                            AI Score: {application.ai_score || 0}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-slate-600">
                            {application.experience_years || 0} years experience
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}