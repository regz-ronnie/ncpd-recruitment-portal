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
  Grid3X3,
  List,
  TrendingUp,
  BarChart3,
  UserPlus,
  UserMinus,
  Layers,
  Zap
} from 'lucide-react'
import { hrAPI } from '../services/api'

export const ShortlistedCandidates = ({ vacancyId }) => {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [showActionMenu, setShowActionMenu] = useState(null)
  const [sortBy, setSortBy] = useState('ai_score') // ai_score, experience, name, date
  const [sortOrder, setSortOrder] = useState('desc')
  const [filters, setFilters] = useState({
    minScore: 70,
    experience: 'all',
    education: 'all',
    county: 'all'
  })

  // Fetch shortlisted candidates
  const { data: pipelineData, isLoading, refetch } = useQuery(
    ['shortlisted-candidates', vacancyId],
    () => hrAPI.getPipeline(),
    {
      enabled: true,
      refetchInterval: 30000,
    }
  )

  // Get shortlisted applications
  const shortlistedApps = pipelineData?.shortlisted?.applications || []

  // Filter and sort candidates
  const filteredCandidates = shortlistedApps
    .filter(candidate => {
      const matchesSearch = searchTerm === '' || 
        candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesScore = (candidate.ai_score || 0) >= filters.minScore
      const matchesExperience = filters.experience === 'all' || 
        (filters.experience === 'senior' && (candidate.experience_years || 0) >= 5) ||
        (filters.experience === 'mid' && (candidate.experience_years || 0) >= 2 && (candidate.experience_years || 0) < 5) ||
        (filters.experience === 'junior' && (candidate.experience_years || 0) < 2)
      const matchesEducation = filters.education === 'all' ||
        candidate.education_level?.toLowerCase().includes(filters.education.toLowerCase())
      const matchesCounty = filters.county === 'all' ||
        candidate.county === filters.county
      
      return matchesSearch && matchesScore && matchesExperience && matchesEducation && matchesCounty
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'ai_score':
          comparison = (a.ai_score || 0) - (b.ai_score || 0)
          break
        case 'experience':
          comparison = (a.experience_years || 0) - (b.experience_years || 0)
          break
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '')
          break
        case 'date':
          comparison = new Date(a.created_at || 0) - new Date(b.created_at || 0)
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Mutations for workflow actions
  const interviewMutation = useMutation(
    ({ id, data }) => hrAPI.moveToInterview(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['shortlisted-candidates'])
        queryClient.invalidateQueries(['recruitment-pipeline'])
      }
    }
  )

  const rejectMutation = useMutation(
    ({ id, data }) => hrAPI.rejectApplication(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['shortlisted-candidates'])
        queryClient.invalidateQueries(['recruitment-pipeline'])
      }
    }
  )

  const handleBulkAction = (action) => {
    const notes = prompt('Add notes for this bulk action (optional):')
    
    selectedCandidates.forEach(id => {
      if (action === 'interview') {
        interviewMutation.mutate({ id, data: { notes } })
      } else if (action === 'reject') {
        rejectMutation.mutate({ id, data: { notes } })
      }
    })
    
    setSelectedCandidates([])
  }

  const handleIndividualAction = (action, candidateId) => {
    const notes = prompt('Add notes for this action (optional):')
    
    if (action === 'interview') {
      interviewMutation.mutate({ id: candidateId, data: { notes } })
    } else if (action === 'reject') {
      rejectMutation.mutate({ id: candidateId, data: { notes } })
    }
    
    setShowActionMenu(null)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 70) return 'text-blue-600 bg-blue-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Poor'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ncpd-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Shortlisted Candidates</h2>
            <p className="text-sm text-slate-600 mt-1">
              {filteredCandidates.length} candidates ready for interview scheduling
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Refresh
            </button>
            
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-ncpd-primary text-white' : 'hover:bg-slate-100'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-ncpd-primary text-white' : 'hover:bg-slate-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Shortlisted</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{filteredCandidates.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Excellent (80%+)</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {filteredCandidates.filter(c => (c.ai_score || 0) >= 80).length}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg. Experience</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {filteredCandidates.length > 0 
                  ? Math.round(filteredCandidates.reduce((sum, c) => sum + (c.experience_years || 0), 0) / filteredCandidates.length)
                  : 0}
                <span className="text-sm font-normal text-slate-600 ml-1">years</span>
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg. AI Score</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {filteredCandidates.length > 0 
                  ? Math.round(filteredCandidates.reduce((sum, c) => sum + (c.ai_score || 0), 0) / filteredCandidates.length)
                  : 0}
                <span className="text-sm font-normal text-slate-600 ml-1">%</span>
              </p>
            </div>
            <Zap className="w-8 h-8 text-purple-500" />
          </div>
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
          
          <div className="flex gap-3 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncpd-primary focus:border-transparent"
            >
              <option value="ai_score">Sort by AI Score</option>
              <option value="experience">Sort by Experience</option>
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <select
              value={filters.minScore}
              onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncpd-primary focus:border-transparent"
            >
              <option value="0">All Scores</option>
              <option value="80">80%+</option>
              <option value="70">70%+</option>
              <option value="60">60%+</option>
            </select>
            
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
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCandidates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {selectedCandidates.length} candidates selected
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('interview')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Schedule Interviews
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject Selected
              </button>
              <button
                onClick={() => setSelectedCandidates([])}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidates Grid/List */}
      {filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No shortlisted candidates found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map(candidate => (
            <div key={candidate.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCandidates([...selectedCandidates, candidate.id])
                      } else {
                        setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.id))
                      }
                    }}
                    className="w-4 h-4 text-ncpd-primary border-slate-300 rounded focus:ring-ncpd-primary"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900">{candidate.name || candidate.applicant_name}</h4>
                    <p className="text-sm text-slate-600">{candidate.job_title}</p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(candidate.ai_score || 0)}`}>
                  {candidate.ai_score || 0}%
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  {candidate.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  {candidate.phone || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {candidate.county || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <GraduationCap className="w-4 h-4" />
                  {candidate.education_level || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Briefcase className="w-4 h-4" />
                  {candidate.experience_years || 0} years experience
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-slate-900">
                    {getScoreLabel(candidate.ai_score || 0)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleIndividualAction('interview', candidate.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Schedule Interview"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleIndividualAction('reject', candidate.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.length === filteredCandidates.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCandidates(filteredCandidates.map(c => c.id))
                      } else {
                        setSelectedCandidates([])
                      }
                    }}
                    className="w-4 h-4 text-ncpd-primary border-slate-300 rounded focus:ring-ncpd-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Education</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">AI Score</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCandidates.map(candidate => (
                <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCandidates([...selectedCandidates, candidate.id])
                        } else {
                          setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.id))
                        }
                      }}
                      className="w-4 h-4 text-ncpd-primary border-slate-300 rounded focus:ring-ncpd-primary"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{candidate.name || candidate.applicant_name}</p>
                      <p className="text-sm text-slate-600">{candidate.job_title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">
                      <p>{candidate.email}</p>
                      <p>{candidate.phone || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{candidate.county || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{candidate.education_level || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{candidate.experience_years || 0} years</td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(candidate.ai_score || 0)}`}>
                      {candidate.ai_score || 0}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleIndividualAction('interview', candidate.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Schedule Interview"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleIndividualAction('reject', candidate.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}