import React, { useState, useRef } from 'react'
import { Pencil, Trash2, Save, Upload } from 'lucide-react'
import axios from 'axios'

export function AttachmentsForm({ data = {}, onChange, onSave }) {
  const [attachments, setAttachments] = useState(data.attachments || [])
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    documentType: '',
    fileName: '',
    file: null
  })
  const formRef = useRef(null)
  const firstInputRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Accepted formats: PDF, JPG, PNG, DOC, DOCX')
        e.target.value = '' // Clear the input
        return
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        alert('File size exceeds 5MB limit. Please upload a smaller file.')
        e.target.value = '' // Clear the input
        return
      }

      setFormData(prev => ({ ...prev, fileName: file.name, file }))
    }
  }

  const uploadFile = async (file, documentType) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('document_type', documentType)

      const token = localStorage.getItem('access_token')
      const response = await axios.post('/api/v1/auth/upload-document/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })

      return response.data
    } catch (error) {
      console.error('File upload failed:', error)
      alert('Failed to upload file. Please try again.')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleAdd = async () => {
    // Validate required fields
    if (!formData.documentType || !formData.fileName) {
      alert('Document Type and File are required')
      return
    }

    let fileUrl = null
    if (formData.file instanceof File) {
      // Validate file type again before upload
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(formData.file.type)) {
        alert('Invalid file type. Accepted formats: PDF, JPG, PNG, DOC, DOCX')
        return
      }

      // Validate file size again before upload
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (formData.file.size > maxSize) {
        alert('File size exceeds 5MB limit. Please upload a smaller file.')
        return
      }

      const uploadResult = await uploadFile(formData.file, formData.documentType)
      if (!uploadResult) return
      fileUrl = uploadResult.url
    }

    const newAttachment = {
      id: Date.now(),
      documentType: formData.documentType,
      fileName: formData.fileName,
      dateUploaded: new Date().toISOString().split('T')[0],
      file: fileUrl ? { url: fileUrl, name: formData.fileName } : formData.file || {}
    }

    const updated = [...attachments, newAttachment]
    setAttachments(updated)
    onChange({ attachments: updated })

    setFormData({
      documentType: '',
      fileName: '',
      file: null
    })

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleEdit = (id) => {
    const attachment = attachments.find(a => a.id === id)
    if (attachment) {
      setFormData(attachment)
      setEditingId(id)
    }
  }

  const handleUpdate = async () => {
    // Validate required fields
    if (!formData.documentType || !formData.fileName) {
      alert('Document Type and File are required')
      return
    }

    let fileUrl = formData.file?.url
    if (formData.file instanceof File) {
      // Validate file type again before upload
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(formData.file.type)) {
        alert('Invalid file type. Accepted formats: PDF, JPG, PNG, DOC, DOCX')
        return
      }

      // Validate file size again before upload
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (formData.file.size > maxSize) {
        alert('File size exceeds 5MB limit. Please upload a smaller file.')
        return
      }

      const uploadResult = await uploadFile(formData.file, formData.documentType)
      if (!uploadResult) return
      fileUrl = uploadResult.url
    }

    const updated = attachments.map(a =>
      a.id === editingId
        ? {
            ...formData,
            id: editingId,
            dateUploaded: a.dateUploaded,
            file: fileUrl ? { url: fileUrl, name: formData.fileName } : (formData.file || {})
          }
        : a
    )

    setAttachments(updated)
    onChange({ attachments: updated })

    setFormData({
      documentType: '',
      fileName: '',
      file: null
    })
    setEditingId(null)

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = (id) => {
    const updated = attachments.filter(a => a.id !== id)
    setAttachments(updated)
    onChange({ attachments: updated })
  }

  React.useEffect(() => {
    if (data.attachments) {
      setAttachments(data.attachments)
    }
  }, [data])

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Attachments
      </h3>
      
      <div className="bg-[#006633]/10 border border-[#006633] rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <h4 className="font-semibold text-[#006633] mb-2 text-sm sm:text-base">Required Documents</h4>
        <ul className="text-xs sm:text-sm text-[#006633] space-y-1">
          <li>• Curriculum Vitae (CV)</li>
          <li>• Cover Letter</li>
          <li>• Academic Certificates</li>
          <li>• Professional Certificates</li>
          <li>• National ID/Passport</li>
          <li>• KRA PIN Certificate</li>
          <li>• NHIF Card (if applicable)</li>
          <li>• NSSF Card (if applicable)</li>
          <li>• Passport Size Photo</li>
        </ul>
      </div>

      {/* Input Form */}
      <div ref={formRef} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-[#006633]">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Document Type</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Upload File</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <select 
                    ref={firstInputRef}
                    value={formData.documentType}
                    onChange={(e) => handleInputChange('documentType', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
                  >
                    <option value="">Select Document Type</option>
                    <option value="CV">Curriculum Vitae (CV)</option>
                    <option value="Cover Letter">Cover Letter</option>
                    <option value="Academic Certificate">Academic Certificate</option>
                    <option value="Professional Certificate">Professional Certificate</option>
                    <option value="National ID">National ID/Passport</option>
                    <option value="KRA PIN">KRA PIN Certificate</option>
                    <option value="NHIF Card">NHIF Card</option>
                    <option value="NSSF Card">NSSF Card</option>
                    <option value="Passport Photo">Passport Size Photo</option>
                    <option value="Other">Other</option>
                  </select>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
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
                      onClick={handleAdd}
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

      <p className="text-xs text-gray-500">Files will be uploaded when you submit your profile. Accepted formats: PDF, JPG, PNG, DOC (Max 5MB)</p>

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
        <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
        Upload Document
      </button>

      {/* Uploaded Documents List */}
      <div className="mt-6 sm:mt-8">
        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Uploaded Documents</h4>
        {attachments.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Document Type</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">File Name</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date Uploaded</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attachments.map((attachment, index) => (
                    <tr key={attachment.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600">{index + 1}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{attachment.documentType}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{attachment.fileName}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600">{attachment.dateUploaded}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(attachment.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(attachment.id)}
                            className="text-red-600 hover:text-red-800"
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
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}