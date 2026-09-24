import React, { useState } from 'react'
import { Download, Upload, Trash2, Edit, FileText, Calendar, Plus, X, Search, Filter } from 'lucide-react'

export function DownloadsManagement() {
  const [downloads, setDownloads] = useState([
    {
      id: 1,
      title: 'Application Guidelines',
      description: 'Complete guide on how to apply for positions at NCPD',
      fileType: 'PDF',
      fileSize: '2.5 MB',
      date: '2024-01-15',
      category: 'Application',
      fileUrl: '/files/application-guidelines.pdf',
      isActive: true
    },
    {
      id: 2,
      title: 'NCPD Organizational Structure',
      description: 'Information about NCPD departments and organizational hierarchy',
      fileType: 'PDF',
      fileSize: '1.8 MB',
      date: '2024-01-10',
      category: 'Organization',
      fileUrl: '/files/organizational-structure.pdf',
      isActive: true
    },
    {
      id: 3,
      title: 'Job Description Templates',
      description: 'Standard job descriptions for various positions',
      fileType: 'PDF',
      fileSize: '3.2 MB',
      date: '2024-01-08',
      category: 'Career',
      fileUrl: '/files/job-templates.pdf',
      isActive: true
    },
    {
      id: 4,
      title: 'Applicant Profile Form',
      description: 'Blank form for completing your applicant profile',
      fileType: 'PDF',
      fileSize: '1.2 MB',
      date: '2024-01-05',
      category: 'Application',
      fileUrl: '/files/profile-form.pdf',
      isActive: true
    },
    {
      id: 5,
      title: 'Recruitment Process Timeline',
      description: 'Overview of the recruitment and selection process',
      fileType: 'PDF',
      fileSize: '0.8 MB',
      date: '2024-01-03',
      category: 'Process',
      fileUrl: '/files/process-timeline.pdf',
      isActive: true
    },
    {
      id: 6,
      title: 'Code of Conduct',
      description: 'NCPD code of conduct and ethical guidelines',
      fileType: 'PDF',
      fileSize: '2.1 MB',
      date: '2024-01-01',
      category: 'Policy',
      fileUrl: '/files/code-of-conduct.pdf',
      isActive: true
    }
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingDownload, setEditingDownload] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Application',
    file: null
  })

  const categories = ['All', 'Application', 'Organization', 'Career', 'Process', 'Policy']

  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = download.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         download.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'All' || download.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleAddDownload = () => {
    setEditingDownload(null)
    setFormData({
      title: '',
      description: '',
      category: 'Application',
      file: null
    })
    setShowModal(true)
  }

  const handleEditDownload = (download) => {
    setEditingDownload(download)
    setFormData({
      title: download.title,
      description: download.description,
      category: download.category,
      file: null
    })
    setShowModal(true)
  }

  const handleDeleteDownload = (id) => {
    if (window.confirm('Are you sure you want to delete this download?')) {
      setDownloads(downloads.filter(d => d.id !== id))
    }
  }

  const handleToggleActive = (id) => {
    setDownloads(downloads.map(d => 
      d.id === id ? { ...d, isActive: !d.isActive } : d
    ))
  }

  const handleSaveDownload = (e) => {
    e.preventDefault()
    
    if (editingDownload) {
      setDownloads(downloads.map(d => 
        d.id === editingDownload.id 
          ? { 
              ...d, 
              title: formData.title,
              description: formData.description,
              category: formData.category,
              fileUrl: formData.file ? URL.createObjectURL(formData.file) : d.fileUrl,
              fileSize: formData.file ? `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB` : d.fileSize,
              fileType: formData.file ? formData.file.name.split('.').pop().toUpperCase() : d.fileType
            }
          : d
      ))
    } else {
      const newDownload = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        fileType: formData.file ? formData.file.name.split('.').pop().toUpperCase() : 'PDF',
        fileSize: formData.file ? `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB` : '0 MB',
        date: new Date().toISOString().split('T')[0],
        fileUrl: formData.file ? URL.createObjectURL(formData.file) : '',
        isActive: true
      }
      setDownloads([...downloads, newDownload])
    }
    
    setShowModal(false)
    setFormData({
      title: '',
      description: '',
      category: 'Application',
      file: null
    })
  }

  const handleDownload = (download) => {
    if (download.fileUrl) {
      window.open(download.fileUrl, '_blank')
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Application': 'bg-blue-100 text-blue-800',
      'Organization': 'bg-purple-100 text-purple-800',
      'Career': 'bg-green-100 text-green-800',
      'Process': 'bg-orange-100 text-orange-800',
      'Policy': 'bg-red-100 text-red-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Downloads Management</h2>
          <p className="text-xs sm:text-sm text-gray-600">Manage downloadable resources for applicants</p>
        </div>
        <button
          onClick={handleAddDownload}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Download
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search downloads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Downloads Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  File Info
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDownloads.length > 0 ? (
                filteredDownloads.map((download) => (
                  <tr key={download.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-semibold text-gray-900">{download.title}</h3>
                          <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-1">{download.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getCategoryColor(download.category)}`}>
                        {download.category}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm text-gray-600">
                        <div>{download.fileType}</div>
                        <div className="text-[10px] sm:text-xs text-gray-500">{download.fileSize}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        {new Date(download.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <button
                        onClick={() => handleToggleActive(download.id)}
                        className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                          download.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } transition-colors`}
                      >
                        {download.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handleDownload(download)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleEditDownload(download)}
                          className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDownload(download.id)}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-3 sm:px-4 lg:px-6 py-8 sm:py-12 text-center">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">No downloads found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {editingDownload ? 'Edit Download' : 'Add New Download'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveDownload} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                  placeholder="Enter download title"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm resize-none"
                  placeholder="Enter download description"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                >
                  {categories.filter(cat => cat !== 'All').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Upload File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    {formData.file ? formData.file.name : 'Drag and drop a file here, or click to select'}
                  </p>
                  <input
                    type="file"
                    required={!editingDownload}
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer text-xs sm:text-sm font-medium transition-colors"
                  >
                    {formData.file ? 'Change File' : 'Select File'}
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
                >
                  {editingDownload ? 'Update Download' : 'Add Download'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}