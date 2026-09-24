import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { 
  Send, 
  CheckCircle, 
  XCircle, 
  FileText, 
  DollarSign,
  Calendar,
  Building2,
  Briefcase,
  Award,
  Users,
  Clock,
  AlertCircle,
  Download,
  MessageSquare,
  Eye,
  Settings,
  TrendingUp,
  BarChart3,
  FileCheck,
  UserCheck,
  Plus,
  Minus,
  Info,
  ChevronRight,
  ChevronDown,
  GraduationCap
} from 'lucide-react'
import { hrAPI } from '../services/api'

export const HiringWorkflow = ({ vacancyId }) => {
  const queryClient = useQueryClient()
  const [selectedStage, setSelectedStage] = useState('interview_completed')
  const [showOfferForm, setShowOfferForm] = useState(null)
  const [offerDetails, setOfferDetails] = useState({
    salary: '',
    start_date: '',
    benefits: '',
    terms: ''
  })
  const [expandedOffers, setExpandedOffers] = useState({})

  // Fetch pipeline data for hiring stages
  const { data: pipelineData, isLoading, refetch } = useQuery(
    ['hiring-workflow', vacancyId],
    () => hrAPI.getPipeline(),
    {
      enabled: true,
      refetchInterval: 30000,
    }
  )

  // Focus on hiring-related stages
  const hiringStages = ['interview_completed', 'offer_extended', 'offer_accepted', 'offer_declined']
  
  const getHiringApplications = () => {
    if (!pipelineData) return []
    
    let applications = []
    hiringStages.forEach(stage => {
      if (pipelineData[stage]?.applications) {
        applications = [...applications, ...pipelineData[stage].applications]
      }
    })
    
    return applications
  }

  const hiringApplications = getHiringApplications()

  // Mutations for hiring workflow
  const extendOfferMutation = useMutation(
    ({ id, data }) => hrAPI.extendOffer(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['hiring-workflow'])
        queryClient.invalidateQueries(['recruitment-pipeline'])
        setShowOfferForm(null)
      }
    }
  )

  const acceptOfferMutation = useMutation(
    ({ id, data }) => hrAPI.acceptOffer(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['hiring-workflow'])
        queryClient.invalidateQueries(['recruitment-pipeline'])
      }
    }
  )

  const declineOfferMutation = useMutation(
    ({ id, data }) => hrAPI.declineOffer(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['hiring-workflow'])
        queryClient.invalidateQueries(['recruitment-pipeline'])
      }
    }
  )

  const handleExtendOffer = (applicationId) => {
    extendOfferMutation.mutate({
      id: applicationId,
      data: {
        notes: `Offer extended with terms: Salary ${offerDetails.salary}, Start: ${offerDetails.start_date}, Benefits: ${offerDetails.benefits}`
      }
    })
  }

  const handleAcceptOffer = (applicationId) => {
    const notes = prompt('Add acceptance notes (optional):')
    acceptOfferMutation.mutate({ id: applicationId, data: { notes } })
  }

  const handleDeclineOffer = (applicationId) => {
    const reason = prompt('Please provide reason for declining:')
    if (reason) {
      declineOfferMutation.mutate({ id: applicationId, data: { notes: reason } })
    }
  }

  const toggleOfferExpansion = (applicationId) => {
    setExpandedOffers(prev => ({
      ...prev,
      [applicationId]: !prev[applicationId]
    }))
  }

  const getStageColor = (status) => {
    const colors = {
      'interview_completed': 'bg-teal-50 border-teal-200 text-teal-800',
      'offer_extended': 'bg-indigo-50 border-indigo-200 text-indigo-800',
      'offer_accepted': 'bg-emerald-50 border-emerald-200 text-emerald-800',
      'offer_declined': 'bg-red-50 border-red-200 text-red-800',
    }
    return colors[status] || 'bg-gray-50 border-gray-200 text-gray-800'
  }

  const getStageLabel = (status) => {
    const labels = {
      'interview_completed': 'Interview Completed',
      'offer_extended': 'Offer Extended',
      'offer_accepted': 'Offer Accepted',
      'offer_declined': 'Offer Declined',
    }
    return labels[status] || status
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ncpd-primary"></div>
      </div>
    )
  }

  // Calculate stats
  const stats = {
    readyForOffer: (pipelineData?.interview_completed?.count || 0),
    offersExtended: (pipelineData?.offer_extended?.count || 0),
    offersAccepted: (pipelineData?.offer_accepted?.count || 0),
    offersDeclined: (pipelineData?.offer_declined?.count || 0),
    acceptanceRate: (pipelineData?.offer_extended?.count || 0) > 0 
      ? Math.round((pipelineData?.offer_accepted?.count || 0) / (pipelineData?.offer_extended?.count || 1) * 100)
      : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Hiring Workflow</h2>
            <p className="text-sm text-slate-600 mt-1">Manage job offers and final hiring decisions</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Hiring Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ready for Offer</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.readyForOffer}</p>
            </div>
            <FileCheck className="w-8 h-8 text-teal-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Offers Extended</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.offersExtended}</p>
            </div>
            <Send className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Offers Accepted</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.offersAccepted}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Offers Declined</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.offersDeclined}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Acceptance Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.acceptanceRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Stage Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {hiringStages.map(stage => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap ${
                selectedStage === stage
                  ? 'border-ncpd-primary bg-ncpd-primary/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-sm font-medium text-slate-900">
                {getStageLabel(stage)}
              </span>
              <span className="ml-2 text-xs text-slate-600">
                ({pipelineData?.[stage]?.count || 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {hiringApplications.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600">No candidates in hiring stages</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {hiringApplications
              .filter(app => selectedStage === 'all' || app.status === selectedStage)
              .map(application => (
                <div key={application.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold text-slate-900">
                          {application.name || application.applicant_name}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStageColor(application.status)}`}>
                          {getStageLabel(application.status)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-4">{application.job_title}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Award className="w-4 h-4" />
                          AI Score: {application.ai_score || 0}%
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Briefcase className="w-4 h-4" />
                          {application.experience_years || 0} years experience
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <GraduationCap className="w-4 h-4" />
                          {application.education_level || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building2 className="w-4 h-4" />
                          {application.county || 'N/A'}
                        </div>
                      </div>
                      
                      {/* Offer Details for extended offers */}
                      {application.status === 'offer_extended' && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-indigo-900">Offer Details</h5>
                            <button
                              onClick={() => toggleOfferExpansion(application.id)}
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              {expandedOffers[application.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                          
                          {expandedOffers[application.id] ? (
                            <div className="text-sm text-indigo-800 space-y-2">
                              <p><strong>Notes:</strong> {application.review_notes || 'No additional details provided'}</p>
                              <p><strong>Extended:</strong> {application.review_date ? new Date(application.review_date).toLocaleDateString() : 'N/A'}</p>
                              <p><strong>Reviewed by:</strong> {application.reviewed_by?.name || 'HR Team'}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-indigo-700">Offer extended and awaiting candidate response</p>
                          )}
                        </div>
                      )}
                      
                      {/* Accepted offer details */}
                      {application.status === 'offer_accepted' && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <div>
                              <h5 className="font-medium text-emerald-900">Offer Accepted</h5>
                              <p className="text-sm text-emerald-700">
                                Candidate has accepted the offer and is ready for onboarding
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Declined offer details */}
                      {application.status === 'offer_declined' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <div>
                              <h5 className="font-medium text-red-900">Offer Declined</h5>
                              <p className="text-sm text-red-700">
                                {application.review_notes || 'Candidate declined the offer'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      {application.status === 'interview_completed' && (
                        <button
                          onClick={() => setShowOfferForm(application.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          Extend Offer
                        </button>
                      )}
                      
                      {application.status === 'offer_extended' && (
                        <>
                          <button
                            onClick={() => handleAcceptOffer(application.id)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept Offer
                          </button>
                          <button
                            onClick={() => handleDeclineOffer(application.id)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Decline Offer
                          </button>
                        </>
                      )}
                      
                      {application.status === 'offer_accepted' && (
                        <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg">
                          <UserCheck className="w-4 h-4" />
                          Ready for Onboarding
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Offer Form Modal */}
                  {showOfferForm === application.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h5 className="font-medium text-slate-900 mb-3">Extend Job Offer</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                          <input
                            type="text"
                            placeholder="e.g., KES 150,000/month"
                            value={offerDetails.salary}
                            onChange={(e) => setOfferDetails({ ...offerDetails, salary: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncpd-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={offerDetails.start_date}
                            onChange={(e) => setOfferDetails({ ...offerDetails, start_date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncpd-primary focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Benefits</label>
                          <textarea
                            placeholder="e.g., Health insurance, 30 days leave, performance bonus..."
                            value={offerDetails.benefits}
                            onChange={(e) => setOfferDetails({ ...offerDetails, benefits: e.target.value })}
                            rows="2"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncpd-primary focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Additional Terms</label>
                          <textarea
                            placeholder="Any additional terms or conditions..."
                            value={offerDetails.terms}
                            onChange={(e) => setOfferDetails({ ...offerDetails, terms: e.target.value })}
                            rows="2"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncpd-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleExtendOffer(application.id)}
                          disabled={!offerDetails.salary || !offerDetails.start_date}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4" />
                          Send Offer
                        </button>
                        <button
                          onClick={() => setShowOfferForm(null)}
                          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}