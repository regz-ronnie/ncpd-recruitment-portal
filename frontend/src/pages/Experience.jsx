import React, { useState, useRef } from 'react'
import { Pencil, Trash2, Plus, Save } from 'lucide-react'

export function ExperienceForm({ data = {}, onChange, onSave }) {
  const [experiences, setExperiences] = useState(data.experiences || [])
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    employer: '',
    jobTitle: '',
    jobGroup: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    jobDescription: '',
    keyAchievements: ''
  })
  const formRef = useRef(null)
  const firstInputRef = useRef(null)

  const validateField = (field, value) => {
    if (field === 'startDate' && value) {
      const startDate = new Date(value)
      const today = new Date()
      if (startDate > today) {
        return 'Start date cannot be in the future'
      }
    }

    if (field === 'endDate' && value && formData.startDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(value)
      if (endDate < startDate) {
        return 'End date must be after start date'
      }
      if (endDate.getTime() === startDate.getTime()) {
        return 'End date cannot be the same as start date'
      }
    }

    return ''
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Validate field on change
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleAdd = () => {
    // Validate required fields
    if (!formData.employer || !formData.jobTitle) {
      alert('Employer and Job Title are required')
      return
    }

    // Validate dates
    if (formData.startDate && formData.endDate && !formData.isCurrent) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      if (endDate <= startDate) {
        alert('End date must be after start date')
        return
      }
    }

    const newExperience = {
      id: Date.now(),
      ...formData
    }

    const updated = [...experiences, newExperience]
    setExperiences(updated)
    onChange({ experiences: updated })

    setFormData({
      employer: '',
      jobTitle: '',
      jobGroup: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      jobDescription: '',
      keyAchievements: ''
    })
    setErrors({})

    if (onSave) onSave()
  }

  const handleEdit = (id) => {
    const exp = experiences.find(e => e.id === id)
    if (exp) {
      setFormData(exp)
      setEditingId(id)
    }
  }

  const handleUpdate = () => {
    // Validate required fields
    if (!formData.employer || !formData.jobTitle) {
      alert('Employer and Job Title are required')
      return
    }

    // Validate dates
    if (formData.startDate && formData.endDate && !formData.isCurrent) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      if (endDate <= startDate) {
        alert('End date must be after start date')
        return
      }
    }

    const updated = experiences.map(e =>
      e.id === editingId ? { ...formData, id: editingId } : e
    )

    setExperiences(updated)
    onChange({ experiences: updated })

    setFormData({
      employer: '',
      jobTitle: '',
      jobGroup: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      jobDescription: '',
      keyAchievements: ''
    })
    setEditingId(null)
    setErrors({})

    if (onSave) onSave()
  }

  const handleDelete = (id) => {
    const updated = experiences.filter(e => e.id !== id)
    setExperiences(updated)
    onChange({ experiences: updated })

    if (onSave) onSave()
  }

  React.useEffect(() => {
    if (data.experiences) {
      setExperiences(data.experiences)
    }
  }, [data])

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Experience
      </h3>
      
      {/* Input Form */}
      <div ref={formRef} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#006633]">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Employer/Organization</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Job Title</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Job Group/Grade</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Start Date</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">End Date</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Current</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    ref={firstInputRef}
                    type="text"
                    placeholder="Enter employer"
                    value={formData.employer}
                    onChange={(e) => handleInputChange('employer', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="text"
                    placeholder="Enter job title"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="text"
                    placeholder="Enter job group/grade"
                    value={formData.jobGroup}
                    onChange={(e) => handleInputChange('jobGroup', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    disabled={formData.isCurrent}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm disabled:bg-gray-100 ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="checkbox"
                    checked={formData.isCurrent}
                    onChange={(e) => handleInputChange('isCurrent', e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  {editingId ? (
                    <button 
                      onClick={handleUpdate}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
                    >
                      <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Update</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        handleAdd()
                        if (onSave) onSave()
                      }}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
                    >
                      <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Save</span>
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="4"
            placeholder="Describe your responsibilities"
            value={formData.jobDescription}
            onChange={(e) => handleInputChange('jobDescription', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Key Achievements
          </label>
          <textarea
            rows="4"
            placeholder="List your key achievements"
            value={formData.keyAchievements}
            onChange={(e) => handleInputChange('keyAchievements', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Display Table */}
      {experiences.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employer</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Job Title</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Job Group</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Start Date</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">End Date</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Current</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {experiences.map((exp, index) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{index + 1}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{exp.employer}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{exp.jobTitle}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{exp.jobGroup}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{exp.startDate}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{exp.isCurrent ? 'Present' : exp.endDate}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{exp.isCurrent ? 'Yes' : 'No'}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(exp.id)}
                          className="p-1.5 sm:p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 sm:p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button 
        onClick={() => {
          if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setTimeout(() => {
              if (firstInputRef.current) {
                firstInputRef.current.focus()
              }
            }, 500)
          }
        }}
        className="flex items-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-[#006633] hover:bg-[#004d26] text-white rounded-lg font-medium transition-colors text-xs sm:text-sm"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        Add Work Experience
      </button>
    </div>
  )
}
