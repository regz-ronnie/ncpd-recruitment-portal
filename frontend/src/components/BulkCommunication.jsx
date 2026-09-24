import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { 
  Mail, 
  Send, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Edit,
  Trash2,
  Download,
  Eye,
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react'
import api from '../services/api'

export const BulkCommunication = ({ vacancyId }) => {
  const [showCompose, setShowCompose] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedRecipients, setSelectedRecipients] = useState([])
  const [emailType, setEmailType] = useState('acknowledgement')
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    template_id: ''
  })

  const queryClient = useQueryClient()

  // Fetch applications for vacancy
  const { data: applications } = useQuery(
    ['vacancy-applications', vacancyId],
    () => api.get(`/v1/vacancies/${vacancyId}/applications/`).then(res => res.data),
    { enabled: !!vacancyId }
  )

  // Fetch email templates
  const { data: templates } = useQuery(
    'email-templates',
    () => api.get('/v1/email-templates/').then(res => res.data)
  )

  // Fetch communication history
  const { data: communications } = useQuery(
    ['communications', vacancyId],
    () => api.get(`/v1/vacancies/${vacancyId}/communications/`).then(res => res.data),
    { enabled: !!vacancyId }
  )

  // Send bulk email mutation
  const sendBulkEmail = useMutation(
    (data) => api.post('/v1/communications/bulk-send/', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['communications', vacancyId])
        setShowCompose(false)
        setSelectedRecipients([])
      }
    }
  )

  // Update template mutation
  const updateTemplate = useMutation(
    ({ id, data }) => api.put(`/v1/email-templates/${id}/`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('email-templates')
        setSelectedTemplate(null)
      }
    }
  )

  const emailTemplates = {
    acknowledgement: {
      subject: 'Application Received - {position_title}',
      body: `Dear {applicant_name},

Thank you for your application for the position of {position_title} at {company_name}.

We have received your application and will review it carefully. You will be notified of the outcome within {review_period}.

If you have any questions, please contact us at {hr_email}.

Best regards,
HR Department
{company_name}`
    },
    interview_invitation: {
      subject: 'Interview Invitation - {position_title}',
      body: `Dear {applicant_name},

Congratulations! You have been shortlisted for an interview for the position of {position_title} at {company_name}.

Interview Details:
- Date: {interview_date}
- Time: {interview_time}
- Venue: {interview_venue}
- Type: {interview_type}

Please bring the following documents:
- Original CV
- Academic Certificates
- Professional Certifications
- National ID

If you have any questions, please contact us at {hr_email}.

Best regards,
HR Department
{company_name}`
    },
    rejection: {
      subject: 'Application Status - {position_title}',
      body: `Dear {applicant_name},

Thank you for your interest in the position of {position_title} at {company_name}.

After careful consideration of your application, we regret to inform you that you have not been selected for this position.

We appreciate the time you took to apply and wish you success in your future endeavors.

Best regards,
HR Department
{company_name}`
    },
    job_offer: {
      subject: 'Job Offer - {position_title}',
      body: `Dear {applicant_name},

We are pleased to offer you the position of {position_title} at {company_name}.

Offer Details:
- Start Date: {start_date}
- Salary: {salary}
- Location: {location}
- Employment Type: {employment_type}

Please review the attached offer letter and sign by {acceptance_deadline} to accept this offer.

If you have any questions, please contact us at {hr_email}.

Congratulations!

Best regards,
HR Department
{company_name}`
    }
  }

  const handleTemplateSelect = (type) => {
    setEmailType(type)
    const template = emailTemplates[type]
    setFormData({
      subject: template.subject,
      body: template.body
    })
  }

  const handleSend = () => {
    if (selectedRecipients.length === 0) {
      alert('Please select at least one recipient')
      return
    }

    sendBulkEmail.mutate({
      recipient_ids: selectedRecipients,
      subject: formData.subject,
      body: formData.body,
      email_type: emailType
    })
  }

  const handleSelectAll = () => {
    if (selectedRecipients.length === applications?.length) {
      setSelectedRecipients([])
    } else {
      setSelectedRecipients(applications?.map(app => app.id) || [])
    }
  }

  const handleRecipientToggle = (applicationId) => {
    if (selectedRecipients.includes(applicationId)) {
      setSelectedRecipients(selectedRecipients.filter(id => id !== applicationId))
    } else {
      setSelectedRecipients([...selectedRecipients, applicationId])
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Communication Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {communications?.filter(c => c.status === 'sent').length || 0}
              </p>
            </div>
            <Send className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {communications?.filter(c => c.status === 'pending').length || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {communications?.filter(c => c.status === 'failed').length || 0}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Recipients</p>
              <p className="text-2xl font-bold text-green-600">
                {applications?.length || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Compose Email */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Bulk Communication
          </h3>
          <button
            onClick={() => setShowCompose(!showCompose)}
            className="flex items-center space-x-2 btn-primary"
          >
            <Edit className="w-4 h-4" />
            <span>{showCompose ? 'Close' : 'Compose Email'}</span>
          </button>
        </div>

        {showCompose && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Email Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => handleTemplateSelect('acknowledgement')}
                  className={`p-3 rounded-lg text-sm font-medium ${
                    emailType === 'acknowledgement'
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-4 h-4 mx-auto mb-1" />
                  Acknowledgement
                </button>
                <button
                  onClick={() => handleTemplateSelect('interview_invitation')}
                  className={`p-3 rounded-lg text-sm font-medium ${
                    emailType === 'interview_invitation'
                      ? 'bg-green-100 text-green-800 border-2 border-green-500'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                  Interview Invite
                </button>
                <button
                  onClick={() => handleTemplateSelect('rejection')}
                  className={`p-3 rounded-lg text-sm font-medium ${
                    emailType === 'rejection'
                      ? 'bg-red-100 text-red-800 border-2 border-red-500'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <XCircle className="w-4 h-4 mx-auto mb-1" />
                  Rejection
                </button>
                <button
                  onClick={() => handleTemplateSelect('job_offer')}
                  className={`p-3 rounded-lg text-sm font-medium ${
                    emailType === 'job_offer'
                      ? 'bg-purple-100 text-purple-800 border-2 border-purple-500'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                  Job Offer
                </button>
              </div>
            </div>

            {/* Recipients Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Recipients ({selectedRecipients.length} selected)
                </label>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedRecipients.length === applications?.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {applications?.map((application) => (
                  <label
                    key={application.id}
                    className="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(application.id)}
                      onChange={() => handleRecipientToggle(application.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{application.name}</p>
                      <p className="text-sm text-gray-500">{application.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      application.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {application.status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Email Composition */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="form-input"
                  placeholder="Email subject..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body
                </label>
                <textarea
                  rows={8}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="form-input"
                  placeholder="Email body..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available placeholders: {applicant_name}, {position_title}, {company_name}, {interview_date}, {interview_time}, {interview_venue}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCompose(false)}
                className="px-4 py-2 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="px-4 py-2 btn-primary"
                disabled={sendBulkEmail.isLoading || selectedRecipients.length === 0}
              >
                <Send className="w-4 h-4 mr-2 inline" />
                Send to {selectedRecipients.length} Recipients
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Communication History */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Communication History
          </h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select className="form-input text-sm">
              <option value="all">All Types</option>
              <option value="acknowledgement">Acknowledgements</option>
              <option value="interview_invitation">Interview Invitations</option>
              <option value="rejection">Rejections</option>
              <option value="job_offer">Job Offers</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {communications?.map((comm) => (
            <div key={comm.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{comm.subject}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comm.status)}`}>
                      {comm.status.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {comm.email_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Sent to {comm.recipient_count} recipients
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Sent: {new Date(comm.sent_at).toLocaleString()}</span>
                    {comm.status === 'sent' && (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Delivered
                      </span>
                    )}
                    {comm.status === 'failed' && (
                      <span className="flex items-center text-red-600">
                        <XCircle className="w-4 h-4 mr-1" />
                        Failed
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Resend"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {communications?.length === 0 && (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No communications sent yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Email Templates Management */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Email Templates
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(emailTemplates).map(([key, template]) => (
            <div key={key} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 capitalize">
                  {key.replace('_', ' ')}
                </h4>
                <button className="p-1 text-gray-600 hover:text-gray-900">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{template.body.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              handleTemplateSelect('acknowledgement')
              setSelectedRecipients(applications?.filter(a => a.status === 'submitted').map(a => a.id) || [])
              setShowCompose(true)
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-left"
          >
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Send Acknowledgements</h4>
            <p className="text-sm text-gray-500">To all new applicants</p>
          </button>
          <button
            onClick={() => {
              handleTemplateSelect('interview_invitation')
              setSelectedRecipients(applications?.filter(a => a.status === 'shortlisted').map(a => a.id) || [])
              setShowCompose(true)
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 text-left"
          >
            <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Send Interview Invites</h4>
            <p className="text-sm text-gray-500">To shortlisted candidates</p>
          </button>
          <button
            onClick={() => {
              handleTemplateSelect('rejection')
              setSelectedRecipients(applications?.filter(a => a.status === 'rejected').map(a => a.id) || [])
              setShowCompose(true)
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 text-left"
          >
            <XCircle className="w-6 h-6 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-900">Send Rejections</h4>
            <p className="text-sm text-gray-500">To rejected candidates</p>
          </button>
        </div>
      </div>
    </div>
  )
}
