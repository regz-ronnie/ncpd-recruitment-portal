import React, { useState, useRef } from 'react'
import { Pencil, Trash2, Plus, Save } from 'lucide-react'

export function AcademicQualificationsForm({ data = {}, onChange, onSave }) {
  const [qualifications, setQualifications] = useState(data.qualifications || [])
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    course: '',
    startDate: '',
    endDate: '',
    grade: '',
    country: ''
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
    if (!formData.institution || !formData.degree) {
      alert('Institution and Degree are required')
      return
    }

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      if (endDate <= startDate) {
        alert('End date must be after start date')
        return
      }
    }

    const newQualification = {
      id: Date.now(),
      ...formData
    }

    const updated = [...qualifications, newQualification]
    setQualifications(updated)
    onChange({ qualifications: updated })

    // Reset form
    setFormData({
      institution: '',
      degree: '',
      course: '',
      startDate: '',
      endDate: '',
      grade: '',
      country: ''
    })
    setErrors({})

    if (onSave) onSave()
  }

  const handleEdit = (id) => {
    const qual = qualifications.find(q => q.id === id)
    if (qual) {
      setFormData(qual)
      setEditingId(id)
    }
  }

  const handleUpdate = () => {
    // Validate required fields
    if (!formData.institution || !formData.degree) {
      alert('Institution and Degree are required')
      return
    }

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      if (endDate <= startDate) {
        alert('End date must be after start date')
        return
      }
    }

    const updated = qualifications.map(q =>
      q.id === editingId ? { ...formData, id: editingId } : q
    )

    setQualifications(updated)
    onChange({ qualifications: updated })

    // Reset form
    setFormData({
      institution: '',
      degree: '',
      course: '',
      startDate: '',
      endDate: '',
      grade: '',
      country: ''
    })
    setEditingId(null)
    setErrors({})

    if (onSave) onSave()
  }

  const handleDelete = (id) => {
    const updated = qualifications.filter(q => q.id !== id)
    setQualifications(updated)
    onChange({ qualifications: updated })

    if (onSave) onSave()
  }

  React.useEffect(() => {
    if (data.qualifications) {
      setQualifications(data.qualifications)
    }
  }, [data])

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Academic Qualification(s)
      </h3>
      
      {/* Input Form */}
      <div ref={formRef} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#006633]">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Institution</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Degree/Diploma/Certificate</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Course/Programme</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Start Date</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">End Date</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Grade/Class</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Country</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    ref={firstInputRef}
                    type="text"
                    placeholder="Enter institution"
                    value={formData.institution}
                    onChange={(e) => handleInputChange('institution', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <select 
                    value={formData.degree}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Degree">Degree</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                  </select>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="text"
                    placeholder="Enter course/programme"
                    value={formData.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
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
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <select 
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  >
                    <option value="">Select</option>
                    <option value="First Class">First Class</option>
                    <option value="Second Class Upper">Second Class Upper</option>
                    <option value="Second Class Lower">Second Class Lower</option>
                    <option value="Pass">Pass</option>
                    <option value="Distinction">Distinction</option>
                    <option value="Credit">Credit</option>
                  </select>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <select 
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Other">Other</option>
                  </select>
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

      {/* Display Table */}
      {qualifications.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Institution</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Degree</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Course</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Start Date</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">End Date</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Grade</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Country</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {qualifications.map((qual, index) => (
                  <tr key={qual.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{index + 1}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{qual.institution}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{qual.degree}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{qual.course}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{qual.startDate}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{qual.endDate}</td>
                    <td className="px-2 sm:px-4 py- now:py-3 text-xs sm:text-sm text-gray-900">{qual.grade}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{qual.country}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(qual.id)}
                          className="p-1.5 sm:p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(qual.id)}
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
        Add Academic Qualification
      </button>
    </div>
  )
}
