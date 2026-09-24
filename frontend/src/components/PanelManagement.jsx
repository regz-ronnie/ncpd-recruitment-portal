import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck,
  Building2,
  GraduationCap,
  Briefcase,
  Save,
  X,
  Search,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react'
import api from '../services/api'

export const PanelManagement = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingPanel, setEditingPanel] = useState(null)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vacancy_id: '',
    members: []
  })

  const queryClient = useQueryClient()

  // Fetch panels
  const { data: panels, isLoading } = useQuery('panels', () => 
    api.get('/v1/interview-panels/').then(res => res.data)
  )

  // Fetch panel members
  const { data: panelMembers } = useQuery('panel-members', () => 
    api.get('/v1/panel-members/').then(res => res.data)
  )

  // Fetch vacancies
  const { data: vacancies } = useQuery('vacancies', () => 
    api.get('/v1/vacancies/').then(res => res.data)
  )

  // Create panel mutation
  const createPanel = useMutation(
    (data) => api.post('/v1/interview-panels/', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('panels')
        setShowForm(false)
        resetForm()
      }
    }
  )

  // Update panel mutation
  const updatePanel = useMutation(
    ({ id, data }) => api.put(`/v1/interview-panels/${id}/`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('panels')
        setShowForm(false)
        setEditingPanel(null)
        resetForm()
      }
    }
  )

  // Delete panel mutation
  const deletePanel = useMutation(
    (id) => api.delete(`/v1/interview-panels/${id}/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('panels')
      }
    }
  )

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      vacancy_id: '',
      members: []
    })
    setSelectedMembers([])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      ...formData,
      members: selectedMembers
    }
    if (editingPanel) {
      updatePanel.mutate({ id: editingPanel.id, data })
    } else {
      createPanel.mutate(data)
    }
  }

  const handleEdit = (panel) => {
    setEditingPanel(panel)
    setFormData({
      name: panel.name,
      description: panel.description,
      vacancy_id: panel.vacancy_id,
      members: panel.members || []
    })
    setSelectedMembers(panel.members?.map(m => m.id) || [])
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this panel?')) {
      deletePanel.mutate(id)
    }
  }

  const handleMemberToggle = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId))
    } else {
      setSelectedMembers([...selectedMembers, memberId])
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'hr_officer':
        return <Users className="w-4 h-4" />
      case 'technical_evaluator':
        return <Briefcase className="w-4 h-4" />
      case 'department_head':
        return <Building2 className="w-4 h-4" />
      case 'external_expert':
        return <GraduationCap className="w-4 h-4" />
      default:
        return <UserCheck className="w-4 h-4" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'hr_officer':
        return 'bg-blue-100 text-blue-800'
      case 'technical_evaluator':
        return 'bg-green-100 text-green-800'
      case 'department_head':
        return 'bg-purple-100 text-purple-800'
      case 'external_expert':
        return 'bg-orange-100 text-orange-800'
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel Management</h1>
              <p className="text-gray-600 mt-1">Create and manage interview panels</p>
            </div>
            <button
              onClick={() => {
                resetForm()
                setEditingPanel(null)
                setShowForm(true)
              }}
              className="flex items-center space-x-2 btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Create Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panel Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPanel ? 'Edit Panel' : 'Create New Panel'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingPanel(null)
                    resetForm()
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Panel Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      placeholder="e.g., Senior Developer Interview Panel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Associated Vacancy
                    </label>
                    <select
                      value={formData.vacancy_id}
                      onChange={(e) => setFormData({ ...formData, vacancy_id: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Select Vacancy (Optional)</option>
                      {vacancies?.map(vacancy => (
                        <option key={vacancy.id} value={vacancy.id}>
                          {vacancy.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input"
                    placeholder="Describe the panel's purpose and responsibilities..."
                  />
                </div>

                {/* Panel Members */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Panel Members ({selectedMembers.length} selected)
                    </label>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search members..."
                          className="form-input flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {panelMembers?.map((member) => (
                        <label
                          key={member.id}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => handleMemberToggle(member.id)}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">{member.name}</p>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(member.role)}`}>
                                {member.role.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                          <div className="flex items-center text-gray-500">
                            {getRoleIcon(member.role)}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingPanel(null)
                      resetForm()
                    }}
                    className="px-4 py-2 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 btn-primary"
                    disabled={createPanel.isLoading || updatePanel.isLoading}
                  >
                    <Save className="w-4 h-4 mr-2 inline" />
                    {editingPanel ? 'Update Panel' : 'Create Panel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Panels List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {panels?.map((panel) => (
            <div key={panel.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{panel.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{panel.description}</p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(panel)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(panel.id)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {panel.vacancy && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    {panel.vacancy.title}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  {panel.members?.length || 0} Members
                </p>
                <div className="flex flex-wrap gap-1">
                  {panel.members?.slice(0, 3).map((member) => (
                    <span
                      key={member.id}
                      className={`inline-flex items-center px-2 py-1 rounded text-xs ${getRoleColor(member.role)}`}
                    >
                      {member.name}
                    </span>
                  ))}
                  {panel.members?.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                      +{panel.members.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>{panel.interviews_count || 0} Interviews</span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {panels?.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No panels yet</h3>
            <p className="text-gray-500 mb-4">Create your first interview panel to get started</p>
            <button
              onClick={() => {
                resetForm()
                setEditingPanel(null)
                setShowForm(true)
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Create Panel
            </button>
          </div>
        )}
      </div>

      {/* Panel Members Management */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              Panel Members Directory
            </h3>
            <button className="flex items-center space-x-2 btn-primary">
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Department</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {panelMembers?.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{member.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getRoleColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        <span className="ml-1">{member.role.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{member.department || '-'}</td>
                    <td className="px-4 py-3">
                      {member.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
