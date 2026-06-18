import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { userAPI } from '../services/api'

export function PersonalDetails() {
  const { user, updateProfile } = useAuth()
  const location = useLocation()
  const [formData, setFormData] = useState(null)
  const [originalData, setOriginalData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const normalizeProfile = (profile) => ({
    firstName: profile.first_name || profile.firstName || '',
    lastName: profile.last_name || profile.lastName || '',
    birthDate: profile.date_of_birth || profile.birthDate || '',
    phone: profile.phone_number || profile.phone || '',
    email: profile.email || '',
    nationality: profile.nationality || '',
    kraPin: profile.kra_pin || '',
    ethnicity: profile.ethnicity || '',
    religion: profile.religion || '',
    shaShif: profile.sha_shif || '',
    nssf: profile.nssf || ''
  })

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    userAPI.getProfile()
      .then((response) => {
        const profileData = normalizeProfile(response.data)
        setFormData(profileData)
        setOriginalData(profileData)
      })
      .catch((fetchError) => {
        console.error('Failed to load personal details:', fetchError)
        setError('Unable to load your personal details. Please try again.')
        setFormData(normalizeProfile(user))
        setOriginalData(normalizeProfile(user))
      })
      .finally(() => setIsLoading(false))
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    if (!formData) return

    setIsSaving(true)
    setError('')

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.birthDate,
        phone_number: formData.phone,
        email: formData.email,
        nationality: formData.nationality,
        kra_pin: formData.kraPin,
        ethnicity: formData.ethnicity,
        religion: formData.religion,
        sha_shif: formData.shaShif,
        nssf: formData.nssf,
      }

      const result = await updateProfile(payload)
      if (!result.success) {
        throw new Error(result.error || 'Unable to save profile')
      }

      const savedData = normalizeProfile(result.data)
      setFormData(savedData)
      setOriginalData(savedData)
      setIsEditing(false)
    } catch (saveError) {
      console.error('Profile save failed:', saveError)
      setError('Unable to save your personal details. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData)
    }
    setIsEditing(false)
  }

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-700">Loading your personal details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Retains its layout position from your image but with responsive width constraints */}
      <div className="w-[140px] sm:w-64 bg-white shadow-lg shrink-0">
        <div className="p-3 sm:p-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
          <nav className="flex flex-col space-y-2">
            <Link to="/dashboard" className={`block px-2 sm:px-3 py-2 text-sm sm:text-base rounded-lg transition-colors ${
              location.pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}>Dashboard</Link>
            <div className="text-gray-500 font-medium px-2 sm:px-3 py-2 text-xs sm:text-sm">PROFILE</div>
            <Link to="/personal-details" className={`block px-2 sm:px-3 py-2 sm:ml-4 text-xs sm:text-sm bg-ncpd-primary text-white rounded transition-colors ${
              location.pathname === '/personal-details' ? 'bg-blue-50 text-blue-600' : 'hover:bg-ncpd-light'
            }`}>Personal Details</Link>
            <Link to="/education" className={`block px-2 sm:px-3 py-2 sm:ml-4 text-xs sm:text-sm rounded transition-colors ${
              location.pathname === '/education' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Education</Link>
            <Link to="/trainings" className={`block px-2 sm:px-3 py-2 sm:ml-4 text-xs sm:text-sm bg-ncpd-primary text-white rounded`}>Trainings</Link>
            <Link to="/professional-membership" className={`block px-2 sm:px-3 py-2 sm:ml-4 text-xs sm:text-sm rounded transition-colors ${
              location.pathname === '/professional-membership' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Professional Membership</Link>
            <Link to="/employment" className={`block px-2 sm:px-3 py-2 sm:ml-4 text-xs sm:text-sm rounded transition-colors ${
              location.pathname === '/employment' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Employment</Link>
            <Link to="/files" className={`block px-2 sm:px-3 py-2 sm:ml-4 text-xs sm:text-sm rounded transition-colors ${
              location.pathname === '/files' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Files</Link>
          </nav>
        </div>
      </div>

      {/* Main Content Workspace - Dynamic sizing fixes text spillover */}
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <div className="p-3 sm:p-6 lg:p-8">
          
          {/* Profile Header Card */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {/* Profile Details text wrapping logic */}
                <div className="space-y-1 min-w-0 w-full">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 break-words">{formData.firstName || 'John'} {formData.lastName || 'Doe'}</h2>
                  <p className="text-xs sm:text-base text-gray-600 break-words"><span className="font-medium sm:font-normal">Birth Date:</span> {formData.birthDate || 'Not specified'}</p>
                  <p className="text-xs sm:text-base text-gray-600 break-words"><span className="font-medium sm:font-normal">Phone:</span> {formData.phone || 'Not specified'}</p>
                  <p className="text-xs sm:text-base text-gray-600 break-all"><span className="font-medium sm:font-normal">Email:</span> {formData.email || 'Not specified'}</p>
                </div>
              </div>
              
              {/* Profile Actions */}
              <div className="w-full md:w-auto flex justify-center mt-2 md:mt-0">
                {isEditing ? (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 bg-ncpd-primary text-white rounded-lg hover:bg-ncpd-secondary text-xs sm:text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-xs sm:text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto px-4 py-1.5 sm:py-2 bg-ncpd-primary text-white rounded-lg hover:bg-ncpd-secondary text-xs sm:text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {/* Personal Information Section */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Personal Information</h2>
            
            <div className="space-y-3 sm:space-y-4">
              {[
                { label: 'Nationality', name: 'nationality' },
                { label: 'KRA PIN', name: 'kraPin' },
                { label: 'Ethnicity', name: 'ethnicity' },
                { label: 'Religion', name: 'religion' },
                { label: 'SHA/SHIF', name: 'shaShif' },
                { label: 'NSSF', name: 'nssf' }
              ].map((item, index, arr) => (
                <div key={item.name} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 gap-1 sm:gap-4 ${index !== arr.length - 1 ? 'border-b' : ''}`}>
                  <span className="text-gray-700 font-medium text-xs sm:text-base whitespace-nowrap">{item.label}</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name={item.name}
                      value={formData[item.name]}
                      onChange={handleChange}
                      className="w-full sm:w-48 md:w-64 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary text-xs sm:text-sm"
                    />
                  ) : (
                    <span className="text-gray-600 text-xs sm:text-base break-all sm:break-normal text-left sm:text-right">
                      {formData[item.name] || 'Not specified'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}