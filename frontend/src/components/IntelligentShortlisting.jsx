import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { 
  Brain, 
  Sliders, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  XCircle,
  Download,
  Save,
  RefreshCw,
  BarChart3,
  Target,
  Zap
} from 'lucide-react'
import api from '../services/api'

export const IntelligentShortlisting = ({ vacancyId }) => {
  const [showCriteria, setShowCriteria] = useState(false)
  const [criteria, setCriteria] = useState({
    education_weight: 30,
    experience_weight: 40,
    certifications_weight: 20,
    skills_weight: 10,
    minimum_score: 70
  })
  const [autoShortlist, setAutoShortlist] = useState(false)

  const queryClient = useQueryClient()

  // Fetch vacancy details
  const { data: vacancy } = useQuery(
    ['vacancy', vacancyId],
    () => api.get(`/jobs/${vacancyId}/`).then(res => res.data),
    { enabled: !!vacancyId }
  )

  // Fetch applications with AI scores
  const { data: applications, isLoading, refetch } = useQuery(
    ['vacancy-applications-scored', vacancyId],
    () => api.get(`/applications/?job=${vacancyId}`).then(res => res.data?.results || res.data || []),
    { enabled: !!vacancyId }
  )

  // Update shortlisting criteria
  const updateCriteria = useMutation(
    (data) => api.put(`/jobs/${vacancyId}/`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vacancy', vacancyId])
        setShowCriteria(false)
      }
    }
  )

  // Trigger AI shortlisting
  const triggerShortlisting = useMutation(
    () => api.post(`/jobs/${vacancyId}/ai-shortlist/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vacancy-applications-scored', vacancyId])
      }
    }
  )

  // Calculate weighted score for each applicant
  const calculateWeightedScore = (applicant) => {
    if (!applicant.ai_analysis) return 0

    const analysis = applicant.ai_analysis
    const educationScore = analysis.education_match || 0
    const experienceScore = analysis.experience_match || 0
    const certificationsScore = analysis.certifications_match || 0
    const skillsScore = analysis.skills_match || 0

    const weightedScore = 
      (educationScore * criteria.education_weight / 100) +
      (experienceScore * criteria.experience_weight / 100) +
      (certificationsScore * criteria.certifications_weight / 100) +
      (skillsScore * criteria.skills_weight / 100)

    return Math.round(weightedScore)
  }

  const handleCriteriaSave = () => {
    updateCriteria.mutate(criteria)
  }

  const handleAutoShortlist = () => {
    triggerShortlisting.mutate()
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
        <div className="spinner"></div>
      </div>
    )
  }

  // Sort applications by weighted score
  const sortedApplications = [...(applications || [])].sort((a, b) => 
    calculateWeightedScore(b) - calculateWeightedScore(a)
  )

  return (
    <div className="space-y-6">
      {/* Criteria Configuration */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Sliders className="w-5 h-5 mr-2" />
            Shortlisting Criteria
          </h3>
          <button
            onClick={() => setShowCriteria(!showCriteria)}
            className="flex items-center space-x-2 btn-secondary"
          >
            {showCriteria ? 'Hide' : 'Configure'}
          </button>
        </div>

        {showCriteria && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Weight: {criteria.education_weight}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={criteria.education_weight}
                  onChange={(e) => setCriteria({ ...criteria, education_weight: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Weight: {criteria.experience_weight}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={criteria.experience_weight}
                  onChange={(e) => setCriteria({ ...criteria, experience_weight: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications Weight: {criteria.certifications_weight}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={criteria.certifications_weight}
                  onChange={(e) => setCriteria({ ...criteria, certifications_weight: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills Weight: {criteria.skills_weight}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={criteria.skills_weight}
                  onChange={(e) => setCriteria({ ...criteria, skills_weight: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Score for Shortlisting: {criteria.minimum_score}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={criteria.minimum_score}
                onChange={(e) => setCriteria({ ...criteria, minimum_score: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCriteria(false)}
                className="px-4 py-2 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCriteriaSave}
                className="px-4 py-2 btn-primary"
                disabled={updateCriteria.isLoading}
              >
                <Save className="w-4 h-4 mr-2 inline" />
                Save Criteria
              </button>
            </div>
          </div>
        )}

        {!showCriteria && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-lg font-bold text-blue-600">{criteria.education_weight}%</p>
              <p className="text-xs text-gray-500">Education</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-bold text-green-600">{criteria.experience_weight}%</p>
              <p className="text-xs text-gray-500">Experience</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-lg font-bold text-purple-600">{criteria.certifications_weight}%</p>
              <p className="text-xs text-gray-500">Certifications</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-lg font-bold text-orange-600">{criteria.skills_weight}%</p>
              <p className="text-xs text-gray-500">Skills</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Shortlisting Actions */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI-Powered Shortlisting
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Automatically rank applicants based on configured criteria
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => refetch()}
              className="flex items-center space-x-2 btn-secondary"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Scores</span>
            </button>
            <button
              onClick={handleAutoShortlist}
              className="flex items-center space-x-2 btn-primary"
              disabled={triggerShortlisting.isLoading}
            >
              <Zap className="w-4 h-4" />
              <span>Run AI Shortlisting</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shortlisting Results */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Shortlisting Results
          </h3>
          <button className="flex items-center space-x-2 btn-secondary">
            <Download className="w-4 h-4" />
            <span>Export Rankings</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Rank</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Applicant</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Weighted Score</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Education</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Experience</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Certifications</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Skills</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedApplications.map((applicant, index) => {
                const weightedScore = calculateWeightedScore(applicant)
                const isEligible = weightedScore >= criteria.minimum_score
                return (
                  <tr key={applicant.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-200 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{applicant.name}</p>
                        <p className="text-sm text-gray-500">{applicant.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full ${getScoreColor(weightedScore)}`}>
                        <span className="font-bold">{weightedScore}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{getScoreLabel(weightedScore)}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm">
                        <p className="font-medium">{applicant.ai_analysis?.education_match || 0}%</p>
                        <p className="text-gray-500 text-xs">({criteria.education_weight}% weight)</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm">
                        <p className="font-medium">{applicant.ai_analysis?.experience_match || 0}%</p>
                        <p className="text-gray-500 text-xs">({criteria.experience_weight}% weight)</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm">
                        <p className="font-medium">{applicant.ai_analysis?.certifications_match || 0}%</p>
                        <p className="text-gray-500 text-xs">({criteria.certifications_weight}% weight)</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm">
                        <p className="font-medium">{applicant.ai_analysis?.skills_match || 0}%</p>
                        <p className="text-gray-500 text-xs">({criteria.skills_weight}% weight)</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEligible ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Shortlisted
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Not Shortlisted
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {sortedApplications.length === 0 && (
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No applications to rank</p>
          </div>
        )}
      </div>

      {/* Score Distribution */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Score Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Award className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-600">
              {sortedApplications.filter(app => calculateWeightedScore(app) >= 80).length}
            </p>
            <p className="text-sm text-gray-500">Excellent (80%+)</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">
              {sortedApplications.filter(app => {
                const score = calculateWeightedScore(app)
                return score >= 70 && score < 80
              }).length}
            </p>
            <p className="text-sm text-gray-500">Good (70-79%)</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Target className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold text-yellow-600">
              {sortedApplications.filter(app => {
                const score = calculateWeightedScore(app)
                return score >= 60 && score < 70
              }).length}
            </p>
            <p className="text-sm text-gray-500">Fair (60-69%)</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold text-red-600">
              {sortedApplications.filter(app => calculateWeightedScore(app) < 60).length}
            </p>
            <p className="text-sm text-gray-500">Poor (&lt;60%)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
