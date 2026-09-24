import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mail, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Plus,
  Edit,
  Trash2,
  Send,
  Download,
  Star,
  MessageSquare,
  Video,
  Building
} from 'lucide-react'
import api from '../services/api'

export const InterviewManagement = ({ vacancyId }) => {
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [formData, setFormData] = useState({
    application_id: '',
    scheduled_date: '',
    scheduled_time: '',
    venue: '',
    interview_type: 'in_person',
    panel_members: [],
    notes: ''
  })

  const queryClient = useQueryClient()

  // Fetch interviews for vacancy
  const { data: interviews, isLoading } = useQuery(
    ['vacancy-interviews', vacancyId],
    () => api.get(`/v1/vacancies/${vacancyId}/interviews/`).then(res => res.data),
    { enabled: !!vacancyId }
  )

  // Fetch shortlisted applications
  const { data: applications } = useQuery(
    ['vacancy-applications-shortlisted', vacancyId],
    () => api.get(`/v1/vacancies/${vacancyId}/applications/?status=shortlisted`).then(res => res.data),
    { enabled: !!vacancyId }
  )

  // Fetch panel members
  const { data: panelMembers } = useQuery(
    ['panel-members'],
    () => api.get('/v1/panel-members/').then(res => res.data)
  )

  // Schedule interview mutation
  const scheduleInterview = useMutation(
    (data) => api.post('/v1/interviews/', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vacancy-interviews', vacancyId])
        setShowScheduleForm(false)
        resetForm()
      }
    }
  )

  // Update interview mutation
  const updateInterview = useMutation(
    ({ id, data }) => api.put(`/v1/interviews/${id}/`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vacancy-interviews', vacancyId])
        setSelectedInterview(null)
      }
    }
  )

  // Cancel interview mutation
  const cancelInterview = useMutation(
    (id) => api.post(`/v1/interviews/${id}/cancel/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vacancy-interviews', vacancyId])
      }
    }
  )

  // Send invitation mutation
  const sendInvitation = useMutation(
    (id) => api.post(`/v1/interviews/${id}/send-invitation/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vacancy-interviews', vacancyId])
      }
    }
  )

  // Submit score mutation
  const submitScore = useMutation(
    ({ interviewId, scores }) => api.post(`/v1/interviews/${interviewId}/submit-scores/`, { scores }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vacancy-interviews', vacancyId])
      }
    }
  )

  const resetForm = () => {
    setFormData({
      application_id: '',
      scheduled_date: '',
      scheduled_time: '',
      venue: '',
      interview_type: 'in_person',
      panel_members: [],
      notes: ''
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    scheduleInterview.mutate(formData)
  }

  const handleSchedule = (applicationId) => {
    setFormData({ ...formData, application_id: applicationId })
    setShowScheduleForm(true)
  }

  const handleCancel = (id) => {
    if (confirm('Are you sure you want to cancel this interview?')) {
      cancelInterview.mutate(id)
    }
  }

  const handleSendInvitation = (id) => {
    sendInvitation.mutate(id)
  }

  const getInterviewTypeIcon = (type) => {
    switch (type) {
      case 'in_person':
        return <Building className="w-4 h-4" />
      case 'virtual':
        return <Video className="w-4 h-4" />
      case 'phone':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'no_show':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Schedule Interview Form */}
      {showScheduleForm && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Schedule Interview</h3>
            <button
              onClick={() => {
                setShowScheduleForm(false)
                resetForm()
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applicant *
                </label>
                <select
                  required
                  value={formData.application_id}
                  onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                  className="form-input"
                >
                  <option value="">Select Applicant</option>
                  {applications?.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.name} - {app.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Type *
                </label>
                <select
                  required
                  value={formData.interview_type}
                  onChange={(e) => setFormData({ ...formData, interview_type: e.target.value })}
                  className="form-input"
                >
                  <option value="in_person">In-Person</option>
                  <option value="virtual">Virtual (Video)</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue / Meeting Link *
                </label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Board Room or Zoom link"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Panel Members
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {panelMembers?.map(member => (
                  <label key={member.id} className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.panel_members.includes(member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            panel_members: [...formData.panel_members, member.id]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            panel_members: formData.panel_members.filter(id => id !== member.id)
                          })
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{member.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="form-input"
                placeholder="Additional notes for the interview..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowScheduleForm(false)
                  resetForm()
                }}
                className="px-4 py-2 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 btn-primary"
                disabled={scheduleInterview.isLoading}
              >
                <Calendar className="w-4 h-4 mr-2 inline" />
                Schedule Interview
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{interviews?.length || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">
                {interviews?.filter(i => i.status === 'scheduled').length || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {interviews?.filter(i => i.status === 'completed').length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Invitations</p>
              <p className="text-2xl font-bold text-yellow-600">
                {interviews?.filter(i => i.status === 'scheduled' && !i.invitation_sent).length || 0}
              </p>
            </div>
            <Mail className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Schedule New Interview Button */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900">Interview Management</h3>
            <p className="text-sm text-gray-500 mt-1">Schedule and manage candidate interviews</p>
          </div>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="flex items-center space-x-2 btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Interview</span>
          </button>
        </div>
      </div>

      {/* Interviews List */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Scheduled Interviews</h3>

        <div className="space-y-4">
          {interviews?.map((interview) => (
            <div key={interview.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{interview.applicant_name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                      {interview.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {!interview.invitation_sent && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Invitation Not Sent
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(interview.scheduled_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {interview.scheduled_time}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {interview.venue}
                    </div>
                    <div className="flex items-center text-gray-600">
                      {getInterviewTypeIcon(interview.interview_type)}
                      <span className="ml-2 capitalize">{interview.interview_type.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {interview.panel_members?.length > 0 && (
                    <div className="mt-3 flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Panel: {interview.panel_members.map(m => m.name).join(', ')}</span>
                    </div>
                  )}

                  {interview.status === 'completed' && interview.scores && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">Average Score: {interview.average_score}/100</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {interview.scores.map((score, index) => (
                          <div key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {score.panel_member}: {score.score}/100
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  {interview.status === 'scheduled' && !interview.invitation_sent && (
                    <button
                      onClick={() => handleSendInvitation(interview.id)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                      title="Send Invitation"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedInterview(interview)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="View Details"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  {interview.status === 'scheduled' && (
                    <button
                      onClick={() => handleCancel(interview.id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                      title="Cancel Interview"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {interviews?.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No interviews scheduled yet</p>
          </div>
        )}
      </div>

      {/* Interview Score Sheet Template */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Interview Score Sheet
        </h3>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technical Skills (40%)
              </label>
              <input type="range" className="w-full" max="40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Skills (30%)
              </label>
              <input type="range" className="w-full" max="30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Solving (20%)
              </label>
              <input type="range" className="w-full" max="20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cultural Fit (10%)
              </label>
              <input type="range" className="w-full" max="10" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Score: 0/100</span>
              <div className="flex space-x-3">
                <button className="btn-secondary">
                  <Download className="w-4 h-4 mr-2 inline" />
                  Download Template
                </button>
                <button className="btn-primary">
                  Submit Score
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Template Preview */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Interview Invitation Email Template
        </h3>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="font-semibold text-gray-900">Subject: Interview Invitation - [Position Name]</p>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p>Dear [Applicant Name],</p>
              <p>Congratulations! You have been shortlisted for an interview for the position of [Position Name] at [Company Name].</p>
              <p><strong>Interview Details:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Date: [Interview Date]</li>
                <li>Time: [Interview Time]</li>
                <li>Venue: [Interview Venue]</li>
                <li>Type: [Interview Type]</li>
              </ul>
              <p>Please bring the following documents:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Original CV</li>
                <li>Academic Certificates</li>
                <li>Professional Certifications</li>
                <li>National ID</li>
              </ul>
              <p>If you have any questions, please contact us at [HR Email].</p>
              <p>Best regards,<br />HR Department<br />[Company Name]</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button className="btn-secondary">
              <Edit className="w-4 h-4 mr-2 inline" />
              Customize Template
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
