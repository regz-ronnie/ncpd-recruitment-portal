import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  Filter, 
  Search, 
  ChevronDown,
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
  RefreshCw
} from 'lucide-react'
import { useApplications } from '../hooks/useApplications'
import { useJobs } from '../hooks/useJobs'
import { useAIMatching } from '../hooks/useAI'
import api, { hrAPI } from '../services/api'
import { ApplicationCard } from '../components/ApplicationCard'
import { AIInsightsPanel } from '../components/AIInsightsPanel'
import { CandidateScoringTable } from '../components/CandidateScoringTable'
import { MetricsOverview } from '../components/MetricsOverview'
import { FilterPanel } from '../components/FilterPanel'

export const HRDashboard = () => {
  const [selectedJob, setSelectedJob] = useState(null)
  const [selectedApplications, setSelectedApplications] = useState([])
  const [viewMode, setViewMode] = useState('grid') // grid, table, analytics
  const [filters, setFilters] = useState({
    status: 'all',
    scoreRange: [0, 100],
    skills: [],
    experience: 'all'
  })
  
  const queryClient = useQueryClient()
  
  // Fetch data
  const { data: applications, isLoading: appsLoading, refetch: refetchApps } = useApplications()
  const { data: jobs, isLoading: jobsLoading } = useJobs()
  const { getMatchingResults, triggerMatching } = useAIMatching()
  
  // Mutations
  const updateApplicationStatus = useMutation(
    ({ applicationId, status, notes }) => 
      api.patch(`/v1/applications/${applicationId}/`, { status, notes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('applications')
      }
    }
  )
  
  const triggerAIMatching = useMutation(
    (jobId) => 
      triggerMatching({ job_id: jobId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('applications')
        queryClient.invalidateQueries('matching-results')
      }
    }
  )

  const triggerShortlist = useMutation(
    (jobId) => hrAPI.triggerShortlist(jobId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('applications')
        queryClient.invalidateQueries('vacancies')
      }
    }
  )
  
  // Calculate metrics
  const calculateMetrics = () => {
    if (!applications) return null
    
    const total = applications.length
    const pending = applications.filter(app => app.status === 'submitted').length
    const underReview = applications.filter(app => app.status === 'under_review').length
    const shortlisted = applications.filter(app => app.status === 'shortlisted').length
    const interviewed = applications.filter(app => ['interview_scheduled', 'interview_completed'].includes(app.status)).length
    
    const avgScore = applications.reduce((sum, app) => sum + (app.ai_score || 0), 0) / total || 0
    
    return {
      total,
      pending,
      underReview,
      shortlisted,
      interviewed,
      avgScore: avgScore.toFixed(1)
    }
  }
  
  const metrics = calculateMetrics()
  
  // Filter applications
  const filteredApplications = applications?.filter(app => {
    if (selectedJob && app.job.id !== selectedJob.id) return false
    if (filters.status !== 'all' && app.status !== filters.status) return false
    if (app.ai_score < filters.scoreRange[0] || app.ai_score > filters.scoreRange[1]) return false
    if (filters.skills.length > 0) {
      const appSkills = app.matching_result?.matched_skills || []
      const hasRequiredSkill = filters.skills.some(skill => appSkills.includes(skill))
      if (!hasRequiredSkill) return false
    }
    return true
  }) || []
  
  // Sort by AI score
  const sortedApplications = [...filteredApplications].sort((a, b) => 
    (b.ai_score || 0) - (a.ai_score || 0)
  )
  
  const handleApplicationAction = (application, action, notes = '') => {
    updateApplicationStatus.mutate({
      applicationId: application.id,
      status: action,
      notes
    })
  }
  
  const handleBulkAction = (applicationIds, action) => {
    applicationIds.forEach(id => {
      const app = applications.find(a => a.id === id)
      if (app) {
        handleApplicationAction(app, action)
      }
    })
  }
  
  if (appsLoading || jobsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
              <p className="text-gray-600 mt-1">AI-Powered Recruitment Management</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => triggerAIMatching.mutate(selectedJob?.id)}
                disabled={!selectedJob || triggerAIMatching.isLoading}
                className="flex items-center space-x-2 btn-primary disabled:opacity-50"
              >
                <Brain className="w-4 h-4" />
                <span>Run AI Matching</span>
              </button>
              <button
                onClick={() => triggerShortlist.mutate(selectedJob?.id)}
                disabled={!selectedJob || triggerShortlist.isLoading}
                className="flex items-center space-x-2 btn-warning disabled:opacity-50"
              >
                <Star className="w-4 h-4" />
                <span>Auto-Shortlist</span>
              </button>
              <button
                onClick={() => refetchApps()}
                className="flex items-center space-x-2 btn-secondary"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Metrics Overview */}
      {metrics && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <MetricsOverview metrics={metrics} />
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Job Selector */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Select Position</h3>
              <select
                value={selectedJob?.id || ''}
                onChange={(e) => setSelectedJob(jobs?.find(j => j.id === parseInt(e.target.value)))}
                className="form-input"
              >
                <option value="">All Positions</option>
                {jobs?.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.applications?.length || 0})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filters */}
            <FilterPanel 
              filters={filters} 
              onFiltersChange={setFilters}
              applications={applications}
            />
            
            {/* AI Insights */}
            {insights && !insightsLoading && (
              <AIInsightsPanel insights={insights} />
            )}
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            
            {/* View Mode Toggle */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    viewMode === 'table' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    viewMode === 'analytics' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Analytics
                </button>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{sortedApplications.length} candidates</span>
              </div>
            </div>
            
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedApplications.map(application => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onAction={handleApplicationAction}
                    onSelect={(selected) => {
                      if (selected) {
                        setSelectedApplications([...selectedApplications, application.id])
                      } else {
                        setSelectedApplications(selectedApplications.filter(id => id !== application.id))
                      }
                    }}
                    isSelected={selectedApplications.includes(application.id)}
                  />
                ))}
              </div>
            )}
            
            {/* Table View */}
            {viewMode === 'table' && (
              <CandidateScoringTable
                applications={sortedApplications}
                onAction={handleApplicationAction}
                onSelect={(ids) => setSelectedApplications(ids)}
                selectedIds={selectedApplications}
              />
            )}
            
            {/* Analytics View */}
            {viewMode === 'analytics' && (
              <div className="space-y-6">
                {/* AI Score Distribution */}
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-4">AI Score Distribution</h3>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mr-3" />
                    Analytics charts would be rendered here
                  </div>
                </div>
                
                {/* Skill Gap Analysis */}
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-4">Skill Gap Analysis</h3>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <Target className="w-12 h-12 mr-3" />
                    Skill gap analysis would be rendered here
                  </div>
                </div>
              </div>
            )}
            
            {/* Bulk Actions */}
            {selectedApplications.length > 0 && (
              <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedApplications.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkAction(selectedApplications, 'shortlisted')}
                    className="btn-success text-sm"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleBulkAction(selectedApplications, 'rejected')}
                    className="btn-danger text-sm"
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
      </div>
    </div>
  )
}
