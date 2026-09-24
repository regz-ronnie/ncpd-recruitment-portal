import React, { useState, useRef } from 'react'
import { Pencil, Trash2, Plus, Save } from 'lucide-react'

export function RefereesForm({ data = {}, onChange, onSave }) {
  const [referees, setReferees] = useState(data.referees || [])
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    refereeName: '',
    organization: '',
    position: '',
    email: '',
    phoneNumber: '',
    relationship: '',
    yearsKnown: ''
  })
  const formRef = useRef(null)
  const firstInputRef = useRef(null)

  const validateField = (field, value) => {
    // Email validation
    if (field === 'email' && value) {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address'
      }
    }

    // Phone number validation
    if (field === 'phoneNumber' && value) {
      const phoneRegex = /^\+?[0-9]{10,15}$/
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        return 'Please enter a valid phone number (10-15 digits)'
      }
    }

    // Years known validation
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
    
    // Validate field on change
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleAdd = () => {
    // Validate required fields
    if (!formData.refereeName || !formData.email) {
      alert('Referee Name and Email are required')
      return
    }

    // Validate email format
    if (formData.email) {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address')
        return
      }
    }

    // Validate phone format if provided
    if (formData.phoneNumber) {
      const phoneRegex = /^\+?[0-9]{10,15}$/
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
        alert('Please enter a valid phone number')
        return
      }
    }

    const newReferee = {
      id: Date.now(),
      ...formData
    }

    const updated = [...referees, newReferee]
    setReferees(updated)
    onChange({ referees: updated })

    setFormData({
      refereeName: '',
      organization: '',
      position: '',
      email: '',
      phoneNumber: '',
      relationship: '',
      yearsKnown: ''
    })
    setErrors({})

    if (onSave) onSave()
  }

  const handleEdit = (id) => {
    const referee = referees.find(r => r.id === id)
    if (referee) {
      setFormData(referee)
      setEditingId(id)
    }
  }

  const handleUpdate = () => {
    // Validate required fields
    if (!formData.refereeName || !formData.email) {
      alert('Referee Name and Email are required')
      return
    }

    // Validate email format
    if (formData.email) {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address')
        return
      }
    }

    // Validate phone format if provided
    if (formData.phoneNumber) {
      const phoneRegex = /^\+?[0-9]{10,15}$/
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
        alert('Please enter a valid phone number')
        return
      }
    }

    const updated = referees.map(r =>
      r.id === editingId ? { ...formData, id: editingId } : r
    )

    setReferees(updated)
    onChange({ referees: updated })

    setFormData({
      refereeName: '',
      organization: '',
      position: '',
      email: '',
      phoneNumber: '',
      relationship: '',
      yearsKnown: ''
    })
    setEditingId(null)
    setErrors({})

    if (onSave) onSave()
  }

  const handleDelete = (id) => {
    const updated = referees.filter(r => r.id !== id)
    setReferees(updated)
    onChange({ referees: updated })

    if (onSave) onSave()
  }

  React.useEffect(() => {
    if (data.referees) {
      setReferees(data.referees)
    }
  }, [data])

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Referees
      </h3>
      
      {/* Input Form */}
      <div ref={formRef} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                  <tr key={referee.id} className="hover:bg-gray-50">
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
                          onClick={() => handleEdit(referee.id)}
                          className="p-1.5 sm:p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(referee.id)}
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
        Add Referee
      </button>
    </div>
  )
}
