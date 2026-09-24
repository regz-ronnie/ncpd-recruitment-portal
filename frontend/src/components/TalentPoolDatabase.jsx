import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Database, 
  Search, 
  Filter, 
  User, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Star,
  Mail,
  Phone,
  Download,
  Plus,
  Eye,
  Bookmark,
  BookmarkCheck,
  X
} from 'lucide-react'
import api from '../services/api'

export const TalentPoolDatabase = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    skills: '',
    degree: '',
    experience: '',
    county: '',
    availability: 'all'
  })
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const queryClient = useQueryClient()

  // Fetch talent pool
  const { data: candidates, isLoading } = useQuery(
    ['talent-pool', searchTerm, filters],
    () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filters.skills) params.append('skills', filters.skills)
      if (filters.degree) params.append('degree', filters.degree)
      if (filters.experience) params.append('experience', filters.experience)
      if (filters.county) params.append('county', filters.county)
      if (filters.availability !== 'all') params.append('availability', filters.availability)
      
      return api.get(`/v1/talent-pool/?${params}`).then(res => res.data)
    }
  )

  // Add to talent pool mutation
  const addToTalentPool = useMutation(
    (candidateId) => api.post(`/v1/talent-pool/${candidateId}/add/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('talent-pool')
      }
    }
  )

  // Remove from talent pool mutation
  const removeFromTalentPool = useMutation(
    (candidateId) => api.delete(`/v1/talent-pool/${candidateId}/remove/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('talent-pool')
      }
    }
  )

  const handleBookmark = (candidateId, isBookmarked) => {
    if (isBookmarked) {
      removeFromTalentPool.mutate(candidateId)
    } else {
      addToTalentPool.mutate(candidateId)
    }
  }

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'immediately':
        return 'bg-green-100 text-green-800'
      case 'within_month':
        return 'bg-blue-100 text-blue-800'
      case 'within_3_months':
        return 'bg-yellow-100 text-yellow-800'
      case 'not_available':
        return 'bg-red-100 text-red-800'
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
              <h1 className="text-2xl font-bold text-gray-900">Talent Pool Database</h1>
              <p className="text-gray-600 mt-1">Search and manage qualified candidates for future vacancies</p>
            </div>
            <button className="flex items-center space-x-2 btn-primary">
              <Plus className="w-4 h-4" />
              <span>Add Candidate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, skills, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 btn-secondary"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Export */}
            <button className="flex items-center space-x-2 btn-secondary">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Python, Django"
                    value={filters.skills}
                    onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree
                  </label>
                  <select
                    value={filters.degree}
                    onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
                    className="form-input"
                  >
                    <option value="">All Degrees</option>
                    <option value="certificate">Certificate</option>
                    <option value="diploma">Diploma</option>
                    <option value="bachelor">Bachelor's</option>
                    <option value="master">Master's</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (Years)
                  </label>
                  <select
                    value={filters.experience}
                    onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                    className="form-input"
                  >
                    <option value="">All Experience</option>
                    <option value="0-1">0-1 Years</option>
                    <option value="1-3">1-3 Years</option>
                    <option value="3-5">3-5 Years</option>
                    <option value="5-10">5-10 Years</option>
                    <option value="10+">10+ Years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    County
                  </label>
                  <select
                    value={filters.county}
                    onChange={(e) => setFilters({ ...filters, county: e.target.value })}
                    className="form-input"
                  >
                    <option value="">All Counties</option>
                    <option value="nairobi">Nairobi</option>
                    <option value="mombasa">Mombasa</option>
                    <option value="kisumu">Kisumu</option>
                    <option value="nakuru">Nakuru</option>
                    <option value="kiambu">Kiambu</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                    className="form-input"
                  >
                    <option value="all">All</option>
                    <option value="immediately">Immediately</option>
                    <option value="within_month">Within 1 Month</option>
                    <option value="within_3_months">Within 3 Months</option>
                    <option value="not_available">Not Available</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setFilters({
                    skills: '',
                    degree: '',
                    experience: '',
                    county: '',
                    availability: 'all'
                  })}
                  className="px-4 py-2 btn-secondary"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 btn-primary"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{candidates?.length || 0}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Available Now</p>
                <p className="text-2xl font-bold text-green-600">
                  {candidates?.filter(c => c.availability === 'immediately').length || 0}
                </p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Experience (5+ Years)</p>
                <p className="text-2xl font-bold text-purple-600">
                  {candidates?.filter(c => c.experience_years >= 5).length || 0}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Master's/PhD</p>
                <p className="text-2xl font-bold text-orange-600">
                  {candidates?.filter(c => ['master', 'phd'].includes(c.education_level)).length || 0}
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates?.map((candidate) => (
              <div key={candidate.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                      <p className="text-sm text-gray-500">{candidate.current_role || 'Seeking Opportunities'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookmark(candidate.id, candidate.in_talent_pool)}
                    className={`p-2 rounded ${
                      candidate.in_talent_pool 
                        ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {candidate.in_talent_pool ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {candidate.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {candidate.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {candidate.county || 'Location not specified'}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <GraduationCap className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-700">{candidate.education_level?.replace('_', ' ') || 'Not specified'}</span>
                    {candidate.institution && <span className="text-gray-500"> - {candidate.institution}</span>}
                  </div>
                  <div className="flex items-center text-sm">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-700">{candidate.experience_years || 0} Years Experience</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 mr-2 text-gray-500" />
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getAvailabilityColor(candidate.availability)}`}>
                      {candidate.availability?.replace('_', ' ') || 'Not specified'}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills?.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills?.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{candidate.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedCandidate(candidate)}
                    className="flex-1 flex items-center justify-center space-x-2 btn-secondary text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 btn-primary text-sm">
                    <Mail className="w-4 h-4" />
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {candidates?.length === 0 && (
            <div className="text-center py-12">
              <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Candidate Profile</h2>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">{selectedCandidate.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{selectedCandidate.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{selectedCandidate.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-medium">{selectedCandidate.county || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Availability:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getAvailabilityColor(selectedCandidate.availability)}`}>
                        {selectedCandidate.availability?.replace('_', ' ') || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Education
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Level:</span>
                      <span className="font-medium">{selectedCandidate.education_level?.replace('_', ' ') || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Institution:</span>
                      <span className="font-medium">{selectedCandidate.institution || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Field of Study:</span>
                      <span className="font-medium">{selectedCandidate.field_of_study || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Graduation Year:</span>
                      <span className="font-medium">{selectedCandidate.graduation_year || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Experience
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Experience:</span>
                      <span className="font-medium">{selectedCandidate.experience_years || 0} Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Current Role:</span>
                      <span className="font-medium">{selectedCandidate.current_role || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Current Company:</span>
                      <span className="font-medium">{selectedCandidate.current_company || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Industry:</span>
                      <span className="font-medium">{selectedCandidate.industry || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Notes</h3>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Add notes about this candidate..."
                />
              </div>

              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2 btn-secondary"
                >
                  Close
                </button>
                <button className="px-4 py-2 btn-primary">
                  <Mail className="w-4 h-4 mr-2 inline" />
                  Contact Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
