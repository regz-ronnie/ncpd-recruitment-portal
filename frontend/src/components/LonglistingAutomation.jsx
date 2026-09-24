import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { 
  FileText, 
  Download, 
  Table, 
  FileSpreadsheet, 
  FileCode,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Settings,
  Play,
  RefreshCw,
  Eye,
  Edit
} from 'lucide-react'
import api from '../services/api'

export const LonglistingAutomation = ({ vacancyId }) => {
  const [showSettings, setShowSettings] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('excel')
  const [templateSettings, setTemplateSettings] = useState({
    includeEducation: true,
    includeExperience: true,
    includeSkills: true,
    includeScore: true,
    includeStatus: true,
    includeDocuments: false,
    customFields: []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const queryClient = useQueryClient()

  // Fetch applications for longlisting
  const { data: applications, isLoading, refetch } = useQuery(
    ['longlist-applications', vacancyId],
    () => api.get(`/v1/vacancies/${vacancyId}/applications/?longlist=true`).then(res => res.data),
    { enabled: !!vacancyId }
  )

  // Fetch vacancy details
  const { data: vacancy } = useQuery(
    ['vacancy', vacancyId],
    () => api.get(`/v1/vacancies/${vacancyId}/`).then(res => res.data),
    { enabled: !!vacancyId }
  )

  // Generate longlist mutation
  const generateLonglist = useMutation(
    (format) => api.post(`/v1/vacancies/${vacancyId}/generate-longlist/`, { 
      format,
      template_settings: templateSettings 
    }),
    {
      onSuccess: (data) => {
        // Trigger download
        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `longlist_${vacancy?.title}.${format}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
    }
  )

  // Auto-generate longlist mutation
  const autoGenerateLonglist = useMutation(
    () => api.post(`/v1/vacancies/${vacancyId}/auto-longlist/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['longlist-applications', vacancyId])
      }
    }
  )

  const handleGenerate = (format) => {
    // Use client-side export for better data control
    handleClientSideExport(format)
  }

  const handleClientSideExport = (format) => {
    const longlistData = filteredApps.map((app, index) => {
      const education = getEducationDetails(app)
      const experience = getExperienceDetails(app)
      
      return {
        '#': index + 1,
        'Name': app.name,
        'Email': app.email,
        'Degree': education.degree,
        'Institution': education.institution,
        'Field of Study': education.field_of_study,
        'Duration': education.duration,
        'Current Position': experience.current_position,
        'Current Employer': experience.current_employer,
        'Years of Experience': experience.years,
        'Score': app.longlist_score || 0,
        'Status': app.longlist_status?.replace('_', ' ') || 'pending',
        'Application Date': app.created_at || 'N/A'
      }
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(longlistData[0] || {})
      const csvContent = [
        headers.join(','),
        ...longlistData.map(row => headers.map(header => 
          `"${(row[header] || '').toString().replace(/"/g, '""')}"`
        ).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `longlist_${vacancy?.title || 'export'}.csv`
      link.click()
    } else if (format === 'excel') {
      // Generate tab-separated for Excel
      const headers = Object.keys(longlistData[0] || {})
      const tsvContent = [
        headers.join('\t'),
        ...longlistData.map(row => headers.map(header => 
          (row[header] || '').toString().replace(/\t/g, '  ')
        ).join('\t'))
      ].join('\n')

      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `longlist_${vacancy?.title || 'export'}.xls`
      link.click()
    } else {
      // For PDF and Word, fall back to backend
      generateLonglist.mutate(format)
    }
  }

  const handleAutoGenerate = () => {
    autoGenerateLonglist.mutate()
  }

  const getFilteredApplications = () => {
    let filtered = applications || []
    
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.longlist_status === filterStatus)
    }
    
    return filtered
  }

  // Helper function to extract highest degree from academic qualifications
  const getHighestDegree = (academicQualifications) => {
    if (!academicQualifications || !Array.isArray(academicQualifications) || academicQualifications.length === 0) {
      return 'N/A'
    }
    
    // Try to find the highest degree (Bachelor's, Master's, PhD, etc.)
    const degreeHierarchy = ['phd', 'doctorate', 'master', 'bachelor', 'diploma', 'certificate']
    
    for (const level of degreeHierarchy) {
      const match = academicQualifications.find(qual => 
        qual.degree?.toLowerCase().includes(level) || 
        qual.qualification?.toLowerCase().includes(level) ||
        qual.level?.toLowerCase().includes(level)
      )
      if (match) {
        return match.degree || match.qualification || match.level || 'N/A'
      }
    }
    
    // If no hierarchy match, return the first qualification
    const firstQual = academicQualifications[0]
    return firstQual.degree || firstQual.qualification || firstQual.level || 'N/A'
  }

  // Helper function to get education details
  const getEducationDetails = (app) => {
    // Try to get from academic_qualifications array first
    if (app.academic_qualifications && Array.isArray(app.academic_qualifications) && app.academic_qualifications.length > 0) {
      const qual = app.academic_qualifications[0]
      
      // Format duration properly
      let duration = 'N/A'
      if (qual.duration) {
        duration = qual.duration
      } else if (qual.start_date && qual.end_date) {
        const startDate = new Date(qual.start_date)
        const endDate = new Date(qual.end_date)
        const years = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 365))
        duration = years > 0 ? `${years} years` : 'Less than 1 year'
      } else if (qual.years) {
        duration = `${qual.years} years`
      }
      
      return {
        degree: qual.degree || qual.qualification || qual.level || 'N/A',
        institution: qual.institution || 'N/A',
        field_of_study: qual.field_of_study || qual.specialization || 'N/A',
        duration: duration
      }
    }
    
    // Fallback to individual fields
    return {
      degree: app.highest_education || app.education_level || 'N/A',
      institution: app.institution || 'N/A',
      field_of_study: app.field_of_study || 'N/A',
      duration: 'N/A'
    }
  }

  // Helper function to get experience details
  const getExperienceDetails = (app) => {
    // Try to get from work_experiences array first
    if (app.work_experiences && Array.isArray(app.work_experiences) && app.work_experiences.length > 0) {
      const exp = app.work_experiences[0]
      
      // Calculate total years from all experiences
      let totalYears = 0
      app.work_experiences.forEach(e => {
        if (e.years) {
          totalYears += parseFloat(e.years) || 0
        } else if (e.start_date && e.end_date) {
          const startDate = new Date(e.start_date)
          const endDate = new Date(e.end_date)
          const years = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365)
          totalYears += years
        } else if (e.duration) {
          // Try to parse duration string like "3 years" or "2.5 years"
          const match = e.duration.toString().match(/(\d+\.?\d*)/)
          if (match) {
            totalYears += parseFloat(match[1])
          }
        }
      })
      
      // Round to 1 decimal place
      totalYears = Math.round(totalYears * 10) / 10
      
      return {
        years: totalYears || app.experience_years || 0,
        current_position: exp.position || exp.title || exp.job_title || app.current_position || 'N/A',
        current_employer: exp.employer || exp.company || app.current_employer || 'N/A'
      }
    }
    
    // Fallback to individual fields
    return {
      years: app.experience_years || 0,
      current_position: app.current_position || 'N/A',
      current_employer: app.current_employer || 'N/A'
    }
  }

  const getLonglistStatusColor = (status) => {
    switch (status) {
      case 'eligible':
        return 'bg-green-100 text-green-800'
      case 'ineligible':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800'
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

  const filteredApps = getFilteredApplications()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Table className="w-5 h-5 mr-2" />
              Longlisting Automation
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Generate and export longlisting tables automatically
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 btn-secondary"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleAutoGenerate}
              className="flex items-center space-x-2 btn-primary"
              disabled={autoGenerateLonglist.isLoading}
            >
              <Play className="w-4 h-4" />
              <span>Auto-Generate</span>
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Longlist Template Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="form-input"
                >
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="word">Word (.docx)</option>
                  <option value="csv">CSV (.csv)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select className="form-input">
                  <option value="score_desc">Score (High to Low)</option>
                  <option value="score_asc">Score (Low to High)</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="date_desc">Application Date (Newest)</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Include Columns
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={templateSettings.includeEducation}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, includeEducation: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Education</span>
                </label>
                <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={templateSettings.includeExperience}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, includeExperience: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Experience</span>
                </label>
                <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={templateSettings.includeSkills}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, includeSkills: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Skills</span>
                </label>
                <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={templateSettings.includeScore}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, includeScore: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Score</span>
                </label>
                <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={templateSettings.includeStatus}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, includeStatus: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Status</span>
                </label>
                <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={templateSettings.includeDocuments}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, includeDocuments: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Documents</span>
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 btn-primary"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications?.length || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Eligible</p>
              <p className="text-2xl font-bold text-green-600">
                {applications?.filter(app => app.longlist_status === 'eligible').length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ineligible</p>
              <p className="text-2xl font-bold text-red-600">
                {applications?.filter(app => app.longlist_status === 'ineligible').length || 0}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {applications?.filter(app => app.longlist_status === 'pending').length || 0}
              </p>
            </div>
            <RefreshCw className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input"
          >
            <option value="all">All Status</option>
            <option value="eligible">Eligible</option>
            <option value="ineligible">Ineligible</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
      </div>

      {/* Longlist Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">Longlist Table</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleGenerate('excel')}
              className="flex items-center space-x-2 btn-secondary"
              disabled={generateLonglist.isLoading}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => handleGenerate('pdf')}
              className="flex items-center space-x-2 btn-secondary"
              disabled={generateLonglist.isLoading}
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleGenerate('word')}
              className="flex items-center space-x-2 btn-secondary"
              disabled={generateLonglist.isLoading}
            >
              <FileCode className="w-4 h-4" />
              <span>Word</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-900">#</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Degree</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Institution</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Field of Study</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Duration</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Experience</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Score</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app, index) => {
                const education = getEducationDetails(app)
                const experience = getExperienceDetails(app)
                
                return (
                  <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {app.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{app.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{app.email}</td>
                    <td className="px-4 py-3 text-gray-600">{education.degree}</td>
                    <td className="px-4 py-3 text-gray-600">{education.institution}</td>
                    <td className="px-4 py-3 text-gray-600">{education.field_of_study}</td>
                    <td className="px-4 py-3 text-gray-600">{education.duration}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="text-sm">
                        <div className="font-medium">{experience.current_position}</div>
                        <div className="text-xs text-gray-500">{experience.current_employer}</div>
                        <div className="text-xs text-gray-500">{experience.years} years experience</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${app.longlist_score >= 70 ? 'text-green-600' : app.longlist_score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {app.longlist_score || 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLonglistStatusColor(app.longlist_status)}`}>
                        {app.longlist_status?.replace('_', ' ') || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-8">
            <Table className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No applications found</p>
          </div>
        )}
      </div>

      {/* Preview Template */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Template Preview
        </h3>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="bg-gray-200 px-4 py-2 font-medium text-gray-700">
              Longlist - {vacancy?.title || 'Position'}
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="px-2 py-1 text-left font-semibold">#</th>
                    <th className="px-2 py-1 text-left font-semibold">Name</th>
                    <th className="px-2 py-1 text-left font-semibold">Degree</th>
                    <th className="px-2 py-1 text-left font-semibold">Institution</th>
                    <th className="px-2 py-1 text-left font-semibold">Field</th>
                    <th className="px-2 py-1 text-left font-semibold">Duration</th>
                    <th className="px-2 py-1 text-left font-semibold">Experience</th>
                    <th className="px-2 py-1 text-left font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.slice(0, 5).map((app, index) => {
                    const education = getEducationDetails(app)
                    const experience = getExperienceDetails(app)
                    
                    return (
                      <tr key={app.id} className="border-b border-gray-200">
                        <td className="px-2 py-1">{index + 1}</td>
                        <td className="px-2 py-1">{app.name}</td>
                        <td className="px-2 py-1">{education.degree}</td>
                        <td className="px-2 py-1">{education.institution}</td>
                        <td className="px-2 py-1">{education.field_of_study}</td>
                        <td className="px-2 py-1">{education.duration}</td>
                        <td className="px-2 py-1">{experience.years} years</td>
                        <td className="px-2 py-1 font-bold">{app.longlist_score || 0}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredApps.length > 5 && (
                <p className="text-center text-gray-500 text-sm mt-4">
                  ... and {filteredApps.length - 5} more entries
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Export Options
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleGenerate('excel')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 text-left"
            disabled={generateLonglist.isLoading}
          >
            <FileSpreadsheet className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Excel Format</h4>
            <p className="text-sm text-gray-500">.xlsx with formulas</p>
          </button>
          <button
            onClick={() => handleGenerate('pdf')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 text-left"
            disabled={generateLonglist.isLoading}
          >
            <FileText className="w-8 h-8 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-900">PDF Format</h4>
            <p className="text-sm text-gray-500">Print-ready document</p>
          </button>
          <button
            onClick={() => handleGenerate('word')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-left"
            disabled={generateLonglist.isLoading}
          >
            <FileCode className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Word Format</h4>
            <p className="text-sm text-gray-500">Editable document</p>
          </button>
        </div>
      </div>
    </div>
  )
}
