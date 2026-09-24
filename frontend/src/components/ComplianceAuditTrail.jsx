import { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  Shield, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Scale,
  Activity,
  Lock,
  Unlock
} from 'lucide-react'
import api from '../services/api'

export const ComplianceAuditTrail = ({ vacancyId, applicationId }) => {
  const [selectedAction, setSelectedAction] = useState(null)
  const [filters, setFilters] = useState({
    action_type: 'all',
    user: 'all',
    date_range: 'all',
    entity: 'all'
  })

  // Fetch audit trail
  const { data: auditLogs, isLoading } = useQuery(
    ['audit-trail', vacancyId, applicationId, filters],
    () => {
      const params = new URLSearchParams()
      if (vacancyId) params.append('vacancy_id', vacancyId)
      if (applicationId) params.append('application_id', applicationId)
      if (filters.action_type !== 'all') params.append('action_type', filters.action_type)
      if (filters.user !== 'all') params.append('user_id', filters.user)
      if (filters.date_range !== 'all') params.append('date_range', filters.date_range)
      if (filters.entity !== 'all') params.append('entity', filters.entity)
      
      return api.get(`/v1/audit-trail/?${params}`).then(res => res.data)
    }
  )

  // Fetch users for filter
  const { data: users } = useQuery('users', () => 
    api.get('/v1/users/').then(res => res.data)
  )

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'shortlist':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'reject':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'approve':
        return <Shield className="w-5 h-5 text-blue-600" />
      case 'interview_schedule':
        return <Calendar className="w-5 h-5 text-purple-600" />
      case 'score_submit':
        return <Scale className="w-5 h-5 text-orange-600" />
      case 'status_change':
        return <Activity className="w-5 h-5 text-gray-600" />
      case 'document_upload':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'access':
        return <Unlock className="w-5 h-5 text-gray-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'shortlist':
        return 'bg-green-100 text-green-800'
      case 'reject':
        return 'bg-red-100 text-red-800'
      case 'approve':
        return 'bg-blue-100 text-blue-800'
      case 'interview_schedule':
        return 'bg-purple-100 text-purple-800'
      case 'score_submit':
        return 'bg-orange-100 text-orange-800'
      case 'status_change':
        return 'bg-gray-100 text-gray-800'
      case 'document_upload':
        return 'bg-blue-100 text-blue-800'
      case 'access':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEntityLabel = (entity) => {
    switch (entity) {
      case 'application':
        return 'Application'
      case 'vacancy':
        return 'Vacancy'
      case 'interview':
        return 'Interview'
      case 'panel':
        return 'Interview Panel'
      case 'candidate':
        return 'Candidate'
      default:
        return entity
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
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Compliance & Audit Trail
          </h3>
          <button className="flex items-center space-x-2 btn-secondary">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Activity className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">{auditLogs?.length || 0}</p>
            <p className="text-sm text-gray-500">Total Actions</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-600">
              {auditLogs?.filter(log => log.action_type === 'shortlist').length || 0}
            </p>
            <p className="text-sm text-gray-500">Shortlisted</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold text-red-600">
              {auditLogs?.filter(log => log.action_type === 'reject').length || 0}
            </p>
            <p className="text-sm text-gray-500">Rejected</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-600">
              {auditLogs?.filter(log => log.action_type === 'approve').length || 0}
            </p>
            <p className="text-sm text-gray-500">Approvals</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-gray-900">Filter Audit Trail</h4>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search logs..."
              className="form-input text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <select
              value={filters.action_type}
              onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
              className="form-input"
            >
              <option value="all">All Actions</option>
              <option value="shortlist">Shortlist</option>
              <option value="reject">Reject</option>
              <option value="approve">Approve</option>
              <option value="interview_schedule">Interview Schedule</option>
              <option value="score_submit">Score Submit</option>
              <option value="status_change">Status Change</option>
              <option value="document_upload">Document Upload</option>
              <option value="access">Access</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User
            </label>
            <select
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              className="form-input"
            >
              <option value="all">All Users</option>
              {users?.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.date_range}
              onChange={(e) => setFilters({ ...filters, date_range: e.target.value })}
              className="form-input"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity
            </label>
            <select
              value={filters.entity}
              onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
              className="form-input"
            >
              <option value="all">All Entities</option>
              <option value="application">Application</option>
              <option value="vacancy">Vacancy</option>
              <option value="interview">Interview</option>
              <option value="panel">Interview Panel</option>
              <option value="candidate">Candidate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Trail Timeline */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Activity Timeline
        </h3>

        <div className="space-y-4">
          {auditLogs?.map((log) => (
            <div key={log.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                  {getActionIcon(log.action_type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1">
                  <p className="font-medium text-gray-900">{log.action_name}</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action_type)}`}>
                    {log.action_type.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{log.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{log.user_name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>{getEntityLabel(log.entity_type)}</span>
                  </div>
                  {log.ip_address && (
                    <div className="flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>IP: {log.ip_address}</span>
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                {log.details && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(log.details).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-500">{key}:</span>
                          <span className="ml-2 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={() => setSelectedAction(log)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {auditLogs?.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No audit logs found</p>
            </div>
          )}
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Scale className="w-5 h-5 mr-2" />
          Compliance Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Decision Accountability</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Shortlisting Decisions</span>
                <span className="text-sm font-medium">
                  {auditLogs?.filter(log => log.action_type === 'shortlist').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Rejection Decisions</span>
                <span className="text-sm font-medium">
                  {auditLogs?.filter(log => log.action_type === 'reject').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Approval Actions</span>
                <span className="text-sm font-medium">
                  {auditLogs?.filter(log => log.action_type === 'approve').length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Access & Security</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Total Access Events</span>
                <span className="text-sm font-medium">
                  {auditLogs?.filter(log => log.action_type === 'access').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Unique Users</span>
                <span className="text-sm font-medium">
                  {new Set(auditLogs?.map(log => log.user_id)).size || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Document Uploads</span>
                <span className="text-sm font-medium">
                  {auditLogs?.filter(log => log.action_type === 'document_upload').length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Detail Modal */}
      {selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Action Details</h2>
                <button
                  onClick={() => setSelectedAction(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
                    {getActionIcon(selectedAction.action_type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedAction.action_name}</h3>
                    <p className="text-sm text-gray-500">{selectedAction.action_type.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">User</p>
                    <p className="font-medium">{selectedAction.user_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Timestamp</p>
                    <p className="font-medium">{new Date(selectedAction.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Entity Type</p>
                    <p className="font-medium">{getEntityLabel(selectedAction.entity_type)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Entity ID</p>
                    <p className="font-medium">{selectedAction.entity_id}</p>
                  </div>
                  {selectedAction.ip_address && (
                    <div>
                      <p className="text-sm text-gray-500">IP Address</p>
                      <p className="font-medium">{selectedAction.ip_address}</p>
                    </div>
                  )}
                  {selectedAction.user_agent && (
                    <div>
                      <p className="text-sm text-gray-500">User Agent</p>
                      <p className="font-medium text-xs">{selectedAction.user_agent}</p>
                    </div>
                  )}
                </div>

                {selectedAction.description && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-900">{selectedAction.description}</p>
                  </div>
                )}

                {selectedAction.details && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Additional Details</p>
                    <div className="bg-gray-50 rounded p-4">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(selectedAction.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedAction.changes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Changes Made</p>
                    <div className="bg-gray-50 rounded p-4">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(selectedAction.changes, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedAction(null)}
                  className="px-4 py-2 btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
