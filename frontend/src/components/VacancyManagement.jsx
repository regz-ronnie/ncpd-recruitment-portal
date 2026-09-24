import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Save,
  X,
  Upload,
  Download,
  Eye,
  AlertTriangle
} from 'lucide-react'
import api from '../services/api'

export const VacancyManagement = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingVacancy, setEditingVacancy] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    employment_type: 'full_time',
    salary_range: '',
    application_deadline: '',
    requirements: '',
    qualifications: '',
    responsibilities: '',
    mandatory_documents: [],
    education_level: '',
    experience_years: '',
    skills: [],
    age_limit: '',
    status: 'draft'
  })

  const queryClient = useQueryClient()

  // Fetch vacancies
  const { data: vacancies, isLoading } = useQuery('vacancies', () => 
    api.get('/v1/vacancies/').then(res => res.data)
  )

  // Create vacancy mutation
  const createVacancy = useMutation(
    (data) => api.post('/v1/vacancies/', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vacancies')
        setShowForm(false)
        resetForm()
      }
    }
  )

  // Update vacancy mutation
  const updateVacancy = useMutation(
    ({ id, data }) => api.put(`/v1/vacancies/${id}/`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vacancies')
        setShowForm(false)
        setEditingVacancy(null)
        resetForm()
      }
    }
  )

  // Delete vacancy mutation
  const deleteVacancy = useMutation(
    (id) => api.delete(`/v1/vacancies/${id}/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vacancies')
      }
    }
  )

  // Clone vacancy mutation
  const cloneVacancy = useMutation(
    (id) => api.post(`/v1/vacancies/${id}/clone/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vacancies')
      }
    }
  )

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      department: '',
      location: '',
      employment_type: 'full_time',
      salary_range: '',
      application_deadline: '',
      requirements: '',
      qualifications: '',
      responsibilities: '',
      mandatory_documents: [],
      education_level: '',
      experience_years: '',
      skills: [],
      age_limit: '',
      status: 'draft'
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingVacancy) {
      updateVacancy.mutate({ id: editingVacancy.id, data: formData })
    } else {
      createVacancy.mutate(formData)
    }
  }

  const handleEdit = (vacancy) => {
    setEditingVacancy(vacancy)
    setFormData(vacancy)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this vacancy?')) {
      deleteVacancy.mutate(id)
    }
  }

  const handleClone = (id) => {
    cloneVacancy.mutate(id)
  }

  const handlePublish = (vacancy) => {
    updateVacancy.mutate({ 
      id: vacancy.id, 
      data: { ...vacancy, status: 'published' } 
    })
  }

  const addDocument = (doc) => {
    setFormData({
      ...formData,
      mandatory_documents: [...formData.mandatory_documents, doc]
    })
  }

  const removeDocument = (index) => {
    setFormData({
      ...formData,
      mandatory_documents: formData.mandatory_documents.filter((_, i) => i !== index)
    })
  }

  const addSkill = (skill) => {
    setFormData({
      ...formData,
      skills: [...formData.skills, skill]
    })
  }

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    })
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
              <h1 className="text-2xl font-bold text-gray-900">Vacancy Management</h1>
              <p className="text-gray-600 mt-1">Create and manage job vacancies</p>
            </div>
            <button
              onClick={() => {
                resetForm()
                setEditingVacancy(null)
                setShowForm(true)
              }}
              className="flex items-center space-x-2 btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Create Vacancy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vacancy Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingVacancy ? 'Edit Vacancy' : 'Create New Vacancy'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingVacancy(null)
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
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="form-input"
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="form-input"
                      placeholder="e.g., IT Department"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="form-input"
                      placeholder="e.g., Nairobi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type *
                    </label>
                    <select
                      required
                      value={formData.employment_type}
                      onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                      className="form-input"
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      value={formData.salary_range}
                      onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                      className="form-input"
                      placeholder="e.g., KES 80,000 - 120,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.application_deadline}
                      onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input"
                    placeholder="Provide a detailed description of the role..."
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsibilities *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    className="form-input"
                    placeholder="List the key responsibilities..."
                  />
                </div>

                {/* Qualification Criteria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education Level *
                    </label>
                    <select
                      required
                      value={formData.education_level}
                      onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Select Education Level</option>
                      <option value="certificate">Certificate</option>
                      <option value="diploma">Diploma</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">PhD</option>
                      <option value="professional">Professional Certification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Experience (Years) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                      className="form-input"
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age Limit (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.age_limit}
                      onChange={(e) => setFormData({ ...formData, age_limit: e.target.value })}
                      className="form-input"
                      placeholder="e.g., 18-35 years"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      className="form-input flex-1"
                      placeholder="Add a skill and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          addSkill(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mandatory Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mandatory Documents
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      className="form-input flex-1"
                      placeholder="Add a document and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          addDocument(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.mandatory_documents.map((doc, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        {doc}
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Additional Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="form-input"
                    placeholder="Any additional requirements..."
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingVacancy(null)
                      resetForm()
                    }}
                    className="px-4 py-2 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 btn-primary"
                    disabled={createVacancy.isLoading || updateVacancy.isLoading}
                  >
                    <Save className="w-4 h-4 mr-2 inline" />
                    {editingVacancy ? 'Update Vacancy' : 'Create Vacancy'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Vacancies List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vacancies?.map((vacancy) => (
            <div key={vacancy.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{vacancy.title}</h3>
                  <p className="text-sm text-gray-500">{vacancy.department}</p>
                </div>
                <div className="flex space-x-1">
                  {vacancy.status === 'published' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Published
                    </span>
                  )}
                  {vacancy.status === 'draft' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Draft
                    </span>
                  )}
                  {vacancy.status === 'closed' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="w-3 h-3 mr-1" />
                      Closed
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Deadline: {new Date(vacancy.application_deadline).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  {vacancy.applications?.length || 0} Applications
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Eye className="w-4 h-4 mr-2" />
                  {vacancy.education_level} • {vacancy.experience_years}+ years
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {vacancy.skills?.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700"
                  >
                    {skill}
                  </span>
                ))}
                {vacancy.skills?.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                    +{vacancy.skills.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(vacancy)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleClone(vacancy.id)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Clone"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(vacancy.id)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {vacancy.status === 'draft' && (
                  <button
                    onClick={() => handlePublish(vacancy)}
                    className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Publish</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {vacancies?.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vacancies yet</h3>
            <p className="text-gray-500 mb-4">Create your first vacancy to get started</p>
            <button
              onClick={() => {
                resetForm()
                setEditingVacancy(null)
                setShowForm(true)
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Create Vacancy
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
