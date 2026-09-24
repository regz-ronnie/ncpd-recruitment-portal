import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Timeline,
  FileText,
  Calendar,
  MessageSquare,
  Eye,
  Search,
  Download,
  RefreshCw,
  Activity,
  Star
} from 'lucide-react'
import api, { hrAPI, normalizeApplicationList } from '../services/api'

export const ApplicantTrackingSystem = ({ vacancyId }) => {
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const queryClient = useQueryClient()

  // Fetch applications with timeline
  const { data: applicationsPayload, isLoading, refetch } = useQuery(
    ['ats-applications', vacancyId],
    async () => {
      try {
        const response = await api.get(`/v1/vacancies/${vacancyId}/applications/?timeline=true`)
        return response.data
      } catch (error) {
        const fallbackResponse = await hrAPI.listApplications({ page_size: 100 })
        return fallbackResponse.data
      }
    },
    { enabled: true }
  )

  const applications = normalizeApplicationList(applicationsPayload)

  // Update application status mutation
  const updateStatus = useMutation(
    ({ applicationId, status, notes }) =>
      hrAPI.updateApplicationStatus(applicationId, { status, notes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ats-applications', vacancyId])
      }
    }
  )

  // Add timeline event mutation
  const addTimelineEvent = useMutation(
    ({ applicationId, event, notes }) =>
      hrAPI.addTimelineEvent(applicationId, { event, notes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ats-applications', vacancyId])
      }
    }
  )

  const handleStatusChange = (applicationId, newStatus) => {
    updateStatus.mutate({
      applicationId,
      status: newStatus,
      notes: `Status changed to ${newStatus}`
    })
  }

  const handleAddNote = (applicationId, note) => {
    addTimelineEvent.mutate({
      applicationId,
      event: 'note_added',
      notes: note
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'longlisted':
        return 'bg-purple-100 text-purple-800'
      case 'shortlisted':
        return 'bg-green-100 text-green-800'
      case 'interview_scheduled':
        return 'bg-orange-100 text-orange-800'
      case 'interview_completed':
        return 'bg-indigo-100 text-indigo-800'
      case 'selected':
        return 'bg-emerald-100 text-emerald-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <FileText className="w-4 h-4" />
      case 'under_review':
        return <Clock className="w-4 h-4" />
      case 'longlisted':
        return <CheckCircle className="w-4 h-4" />
      case 'shortlisted':
        return <Star className="w-4 h-4" />
      case 'interview_scheduled':
        return <Calendar className="w-4 h-4" />
      case 'interview_completed':
        return <CheckCircle className="w-4 h-4" />
      case 'selected':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getFilteredApplications = () => {
    let filtered = applications || []

    if (searchTerm) {
      filtered = filtered.filter(app => {
        const name = app.name || ''
        const email = app.email || ''
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus)
    }

    return filtered
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  const filteredApps = getFilteredApplications()

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications?.length || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {applications?.filter(app => ['under_review', 'longlisted', 'shortlisted', 'interview_scheduled'].includes(app.status)).length || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Selected</p>
              <p className="text-2xl font-bold text-green-600">
                {applications?.filter(app => app.status === 'selected').length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {applications?.filter(app => app.status === 'rejected').length || 0}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="longlisted">Longlisted</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="interview_completed">Interview Completed</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 btn-secondary"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 btn-secondary">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Timeline className="w-5 h-5 mr-2" />
          Applicant Tracking
        </h3>

        <div className="space-y-4">
          {filteredApps.map((application) => (
            <div key={application.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{application.name}</h4>
                      <p className="text-sm text-gray-500">{application.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1">{application.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  {/* Timeline */}
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Timeline</span>
                    </div>
                    <div className="relative pl-6">
                      {application.timeline?.map((event, index) => (
                        <div key={index} className="mb-4 last:mb-0">
                          <div className="absolute left-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                          <div className="ml-6">
                            <p className="text-sm font-medium text-gray-900">{event.event}</p>
                            <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                            {event.notes && (
                              <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 flex items-center space-x-2">
                    <select
                      value={application.status}
                      onChange={(e) => handleStatusChange(application.id, e.target.value)}
                      className="form-input text-sm"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="longlisted">Longlisted</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview_scheduled">Interview Scheduled</option>
                      <option value="interview_completed">Interview Completed</option>
                      <option value="selected">Selected</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="flex items-center space-x-2 btn-secondary text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>

                {/* Time in current status */}
                <div className="ml-4 text-right">
                  <p className="text-xs text-gray-500">
                    {application.days_in_status} days in current status
                  </p>
                  <p className="text-xs text-gray-500">
                    Total: {application.total_days} days
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredApps.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No applications found</p>
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Applicant Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Applicant Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {selectedApplication.name}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedApplication.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedApplication.phone}</p>
                    <p><span className="text-gray-500">Location:</span> {selectedApplication.location}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Current Status
                  </h3>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full ${getStatusColor(selectedApplication.status)}`}>
                    {getStatusIcon(selectedApplication.status)}
                    <span className="ml-2 font-medium">{selectedApplication.status.replace('_', ' ')}</span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="text-gray-500">Applied:</span> {new Date(selectedApplication.submitted_date).toLocaleDateString()}</p>
                    <p><span className="text-gray-500">Days in status:</span> {selectedApplication.days_in_status}</p>
                    <p><span className="text-gray-500">Total days:</span> {selectedApplication.total_days}</p>
                  </div>
                </div>
              </div>

              {/* Full Timeline */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Timeline className="w-5 h-5 mr-2" />
                  Complete Timeline
                </h3>
                <div className="relative pl-6">
                  {selectedApplication.timeline?.map((event, index) => (
                    <div key={index} className="mb-6 last:mb-0">
                      <div className={`absolute left-0 w-4 h-4 rounded-full border-2 border-white ${
                        index === 0 ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="ml-6">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900">{event.event}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {event.user && (
                          <p className="text-xs text-gray-500">by {event.user}</p>
                        )}
                        {event.notes && (
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Note */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Add Note
                </h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add a note to the timeline..."
                    className="form-input flex-1"
                    id={`note-${selectedApplication.id}`}
                  />
                  <button
                    onClick={() => {
                      const noteInput = document.getElementById(`note-${selectedApplication.id}`)
                      if (noteInput && noteInput.value) {
                        handleAddNote(selectedApplication.id, noteInput.value)
                        noteInput.value = ''
                      }
                    }}
                    className="btn-primary"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2 btn-secondary"
                >
                  Close
                </button>
                <button className="px-4 py-2 btn-primary">
                  <MessageSquare className="w-4 h-4 mr-2 inline" />
                  Contact Applicant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
