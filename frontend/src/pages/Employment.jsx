import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ExperienceForm } from '../components/ExperienceForm.jsx'

export function Employment() {
  const location = useLocation()
  const [currentWorkplace, setCurrentWorkplace] = useState({
    employmentStatus: 'Public Service',
    employerName: '',
    station: '',
    employmentNumber: '',
    substantivePost: '',
    jobGrade: '',
    termsOfService: '',
    dateOfCurrentAppointment: '',
    dateOfPreviousAppointment: '',
    upgradedPost: '',
    secondmentOrganization: '',
    secondmentDesignation: '',
    secondmentJobGroup: '',
    grossSalary: ''
  })

  const [experience, setExperience] = useState([
    {
      id: 1,
      company: 'Ministry of Finance',
      position: 'Senior Accountant',
      startDate: '2022-06',
      endDate: '',
      current: true,
      description: 'Managing financial accounts and budget preparation',
      achievements: ['Improved financial reporting accuracy by 25%', 'Led team of 5 accountants']
    }
  ])

  const handleWorkplaceChange = (field, value) => {
    setCurrentWorkplace(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleExperienceChange = (newExperience) => {
    setExperience(newExperience)
  }

  const handleExperienceAdd = (exp) => {
    setExperience([...experience, exp])
  }

  const handleExperienceRemove = (id) => {
    setExperience(experience.filter(exp => exp.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Strictly vertical navigation, fixed side position */}
      <div className="w-[140px] sm:w-64 bg-white shadow-lg shrink-0">
        <div className="p-3 sm:p-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
          <nav className="flex flex-col space-y-2">
            <Link to="/dashboard" className={`block px-2 sm:px-3 py-2 text-sm sm:text-base rounded-lg transition-colors ${
              location.pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}>Dashboard</Link>
            <div className="text-gray-500 font-medium px-2 sm:px-3 py-2 text-xs sm:text-sm">PROFILE</div>
            <Link to="/personal-details" className={`block px-2 sm:px-3 py-2 sm:ml-4 text-xs sm:text-sm rounded transition-colors ${
              location.pathname === '/personal-details' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Personal Details</Link>
            <Link to="/education" className={`block px-2 sm:px-3 py-2 sm:ml-4 text-xs sm:text-sm rounded transition-colors ${
              location.pathname === '/education' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Education</Link>
            <Link to="/trainings" className={`block px-2 sm:px-3 py-2 sm:ml-4 text-xs sm:text-sm rounded transition-colors ${
              location.pathname === '/trainings' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Trainings</Link>
            <Link to="/professional-membership" className={`block px-2 sm:px-3 py-2 sm:ml-4 text-xs sm:text-sm rounded transition-colors ${
              location.pathname === '/professional-membership' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Professional Membership</Link>
            <Link to="/employment" className={`block px-2 sm:px-3 py-2 sm:ml-4 text-xs sm:text-sm bg-ncpd-primary text-white rounded`}>Employment</Link>
            <Link to="/files" className={`block px-2 sm:px-3 py-2 sm:ml-4 text-xs sm:text-sm rounded transition-colors ${
              location.pathname === '/files' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Files</Link>
          </nav>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <div className="p-3 sm:p-6 lg:p-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-6">Current Workplace Information</h2>
            
            {/* Form grid converts from single column on mobile to 2 columns on medium screens up */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Select Employment Status *</label>
                <select
                  value={currentWorkplace.employmentStatus}
                  onChange={(e) => handleWorkplaceChange('employmentStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                >
                  <option value="">Select an option</option>
                  <option value="Public Service">Public Service</option>
                  <option value="Private Sector">Private Sector</option>
                  <option value="Self-Employed">Self-Employed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Employer Name</label>
                <input
                  type="text"
                  value={currentWorkplace.employerName}
                  onChange={(e) => handleWorkplaceChange('employerName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  placeholder="e.g. Kenya Revenue Authority"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Station</label>
                <input
                  type="text"
                  value={currentWorkplace.station}
                  onChange={(e) => handleWorkplaceChange('station', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  placeholder="e.g. Nairobi"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Employment/Personal Number</label>
                <input
                  type="text"
                  value={currentWorkplace.employmentNumber}
                  onChange={(e) => handleWorkplaceChange('employmentNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  placeholder="e.g. 123456"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Present Substantive Post</label>
                <input
                  type="text"
                  value={currentWorkplace.substantivePost}
                  onChange={(e) => handleWorkplaceChange('substantivePost', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  placeholder="e.g. Senior Accountant"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Job Grade</label>
                <input
                  type="text"
                  value={currentWorkplace.jobGrade}
                  onChange={(e) => handleWorkplaceChange('jobGrade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  placeholder="Enter your Job Grade"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Terms of Service</label>
                <select
                  value={currentWorkplace.termsOfService}
                  onChange={(e) => handleWorkplaceChange('termsOfService', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                >
                  <option value="">Select an option</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Date of Current Appointment</label>
                <input
                  type="date"
                  value={currentWorkplace.dateOfCurrentAppointment}
                  onChange={(e) => handleWorkplaceChange('dateOfCurrentAppointment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Date of Previous Appointment</label>
                <input
                  type="date"
                  value={currentWorkplace.dateOfPreviousAppointment}
                  onChange={(e) => handleWorkplaceChange('dateOfPreviousAppointment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Gross Salary</label>
                <input
                  type="number"
                  value={currentWorkplace.grossSalary}
                  onChange={(e) => handleWorkplaceChange('grossSalary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Work Experience</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">List your work experiences, including details and duration.</p>
            
            {/* Nested block container ensures internal experience forms don't push layouts out */}
            <div className="w-full overflow-x-hidden">
              <ExperienceForm
                experiences={experience}
                onExperienceChange={handleExperienceChange}
                onExperienceAdd={handleExperienceAdd}
                onExperienceRemove={handleExperienceRemove}
              />
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}