import React, { useState, useRef } from 'react'
import { Pencil, Trash2, Plus, Save } from 'lucide-react'

export function ProfessionalBodiesForm({ data = {}, onChange, onSave }) {
  const [bodies, setBodies] = useState(data.bodies || [])
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    bodyName: '',
    membershipNumber: '',
    membershipType: '',
    dateOfAdmission: '',
    membershipStatus: ''
  })
  const formRef = useRef(null)
  const firstInputRef = useRef(null)

  const validateField = (field, value) => {
    if (field === 'dateOfAdmission' && value) {
      const admissionDate = new Date(value)
      const today = new Date()
      if (admissionDate > today) {
        return 'Admission date cannot be in the future'
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
    if (!formData.bodyName || !formData.membershipNumber) {
      alert('Body Name and Membership Number are required')
      return
    }

    // Validate admission date
    if (formData.dateOfAdmission) {
      const admissionDate = new Date(formData.dateOfAdmission)
      const today = new Date()
      if (admissionDate > today) {
        alert('Admission date cannot be in the future')
        return
      }
    }

    const newBody = {
      id: Date.now(),
      ...formData
    }

    const updated = [...bodies, newBody]
    setBodies(updated)
    onChange({ bodies: updated })

    setFormData({
      bodyName: '',
      membershipNumber: '',
      membershipType: '',
      dateOfAdmission: '',
      membershipStatus: ''
    })
    setErrors({})

    if (onSave) onSave()
  }

  const handleEdit = (id) => {
    const body = bodies.find(b => b.id === id)
    if (body) {
      setFormData(body)
      setEditingId(id)
    }
  }

  const handleUpdate = () => {
    // Validate required fields
    if (!formData.bodyName || !formData.membershipNumber) {
      alert('Body Name and Membership Number are required')
      return
    }

    // Validate admission date
    if (formData.dateOfAdmission) {
      const admissionDate = new Date(formData.dateOfAdmission)
      const today = new Date()
      if (admissionDate > today) {
        alert('Admission date cannot be in the future')
        return
      }
    }

    const updated = bodies.map(b =>
      b.id === editingId ? { ...formData, id: editingId } : b
    )

    setBodies(updated)
    onChange({ bodies: updated })

    setFormData({
      bodyName: '',
      membershipNumber: '',
      membershipType: '',
      dateOfAdmission: '',
      membershipStatus: ''
    })
    setEditingId(null)
    setErrors({})

    if (onSave) onSave()
  }

  const handleDelete = (id) => {
    const updated = bodies.filter(b => b.id !== id)
    setBodies(updated)
    onChange({ bodies: updated })

    if (onSave) onSave()
  }

  React.useEffect(() => {
    if (data.bodies) {
      setBodies(data.bodies)
    }
  }, [data])

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Professional Body(s)
      </h3>
      
      {/* Input Form */}
      <div ref={formRef} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#006633]">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Professional Body Name</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Membership Number</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Membership Type</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Date of Admission</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Membership Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    ref={firstInputRef}
                    type="text"
                    placeholder="Enter body name"
                    value={formData.bodyName}
                    onChange={(e) => handleInputChange('bodyName', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="text"
                    placeholder="Enter membership number"
                    value={formData.membershipNumber}
                    onChange={(e) => handleInputChange('membershipNumber', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  />
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <select 
                    value={formData.membershipType}
                    onChange={(e) => handleInputChange('membershipType', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Full Member">Full Member</option>
                    <option value="Associate Member">Associate Member</option>
                    <option value="Student Member">Student Member</option>
                    <option value="Fellow">Fellow</option>
                  </select>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    type="date"
                    value={formData.dateOfAdmission}
                    onChange={(e) => handleInputChange('dateOfAdmission', e.target.value)}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm ${errors.dateOfAdmission ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.dateOfAdmission && <p className="text-red-500 text-xs mt-1">{errors.dateOfAdmission}</p>}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <select 
                    value={formData.membershipStatus}
                    onChange={(e) => handleInputChange('membershipStatus', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
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
      {bodies.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Body Name</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Membership No</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Admission Date</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bodies.map((body, index) => (
                  <tr key={body.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{index + 1}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{body.bodyName}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{body.membershipNumber}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{body.membershipType}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{body.dateOfAdmission}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{body.membershipStatus}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(body.id)}
                          className="p-1.5 sm:p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(body.id)}
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
        Add Professional Body
      </button>
    </div>
  )
}
