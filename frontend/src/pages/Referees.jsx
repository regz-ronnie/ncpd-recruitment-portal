import React, { useRef, useState } from 'react'
import { Pencil, Trash2, Plus, Save, Users } from 'lucide-react'

const emptyForm = {
  refereeName: '',
  organization: '',
  position: '',
  email: '',
  phoneNumber: '',
  relationship: '',
  yearsKnown: ''
}

export function RefereesForm({ data = {}, onChange }) {
  const referees = Array.isArray(data.referees) ? data.referees : []
  const [editingIndex, setEditingIndex] = useState(null)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState(emptyForm)
  const firstInputRef = useRef(null)

  const validateField = (field, value) => {
    if (field === 'email' && value) {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address'
      }
    }

    if (field === 'phoneNumber' && value) {
      const phoneRegex = /^\+?[0-9]{10,15}$/
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        return 'Please enter a valid phone number (10-15 digits)'
      }
    }

    if (field === 'yearsKnown' && value) {
      const years = parseInt(value)
      if (isNaN(years) || years < 0 || years > 50) {
        return 'Years known must be between 0 and 50'
      }
    }

    return ''
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const validateForm = () => {
    if (!formData.refereeName || !formData.email) {
      alert('Referee Name and Email are required')
      return false
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      alert('Please enter a valid email address')
      return false
    }
    if (formData.phoneNumber && !/^\+?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      alert('Please enter a valid phone number')
      return false
    }
    return true
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingIndex(null)
    setErrors({})
  }

  const handleAdd = () => {
    if (!validateForm()) return
    if (referees.length >= 3) {
      alert('You can add a maximum of 3 referees')
      return
    }

    const newReferee = {
      id: Date.now(),
      ...formData
    }

    // Single source of truth: parent formData -> debounced auto-save persists it
    onChange({ referees: [...referees, newReferee] })
    resetForm()
  }

  const handleEdit = (index) => {
    const referee = referees[index]
    if (referee) {
      setFormData({
        refereeName: referee.refereeName || '',
        organization: referee.organization || '',
        position: referee.position || '',
        email: referee.email || '',
        phoneNumber: referee.phoneNumber || '',
        relationship: referee.relationship || '',
        yearsKnown: referee.yearsKnown || ''
      })
      setEditingIndex(index)
    }
  }

  const handleUpdate = () => {
    if (!validateForm()) return

    const updated = referees.map((r, i) =>
      i === editingIndex ? { id: r.id ?? Date.now(), ...formData } : r
    )

    onChange({ referees: updated })
    resetForm()
  }

  const handleDelete = (index) => {
    onChange({ referees: referees.filter((_, i) => i !== index) })
    if (editingIndex === index) resetForm()
  }

  const requiredMet = referees.length === 3

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Referees
        </h3>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          requiredMet ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          <Users className="w-3.5 h-3.5" />
          {referees.length} of 3 required
        </span>
      </div>

      {!requiredMet && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Exactly 3 referees are required. Add {3 - referees.length} more.
        </p>
      )}

      {/* Input Form */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#006633]">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Referee Name</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Organization</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Position/Title</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Email Address</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Phone Number</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Relationship</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Years Known</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    ref={firstInputRef}
                    type="text"
                    placeholder="Enter referee name"
                    value={formData.refereeName}
                    onChange={(e) => handleInputChange('refereeName', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="text"
                    placeholder="Enter organization"
                    value={formData.organization}
                    onChange={(e) => handleInputChange('organization', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="text"
                    placeholder="Enter position/title"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <select
                    value={formData.relationship}
                    onChange={(e) => handleInputChange('relationship', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Academic">Academic</option>
                    <option value="Professional">Professional</option>
                    <option value="Other">Other</option>
                  </select>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="number"
                    placeholder="Years"
                    value={formData.yearsKnown}
                    onChange={(e) => handleInputChange('yearsKnown', e.target.value)}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm ${errors.yearsKnown ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.yearsKnown && <p className="text-red-500 text-xs mt-1">{errors.yearsKnown}</p>}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  {editingIndex !== null ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleUpdate}
                        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
                      >
                        <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Update</span>
                      </button>
                      <button
                        onClick={resetForm}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-xs sm:text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        handleAdd()
                        if (firstInputRef.current) {
                          firstInputRef.current.focus()
                        }
                      }}
                      disabled={referees.length >= 3}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
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
      {referees.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Organization</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Position</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Relationship</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Years</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {referees.map((referee, index) => (
                  <tr key={referee.id ?? index} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{index + 1}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{referee.refereeName}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{referee.organization}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{referee.position}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{referee.email}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{referee.phoneNumber}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{referee.relationship}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{referee.yearsKnown}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="p-1.5 sm:p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
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

      {referees.length < 3 && (
        <button
          onClick={() => {
            if (firstInputRef.current) {
              firstInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
              firstInputRef.current.focus()
            }
          }}
          className="flex items-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-[#006633] hover:bg-[#004d26] text-white rounded-lg font-medium transition-colors text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Add Referee ({referees.length}/3)
        </button>
      )}
    </div>
  )
}
