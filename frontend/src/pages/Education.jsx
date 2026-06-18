import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { EducationForm } from '../components/EducationForm.jsx'

export function Education() {
  const location = useLocation()
  const [education, setEducation] = useState([
    {
      id: 1,
      institution: 'University of Nairobi',
      degree: 'Bachelor of Arts',
      field: 'Economics',
      startDate: '2018-09',
      endDate: '2022-06',
      current: false,
      gpa: '3.8',
      achievements: ['Dean\'s List', 'Economics Society Member']
    }
  ])

  const handleEducationChange = (newEducation) => {
    setEducation(newEducation)
  }

  const handleEducationAdd = (edu) => {
    setEducation([...education, edu])
  }

  const handleEducationRemove = (id) => {
    setEducation(education.filter(edu => edu.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
          <nav className="space-y-2">
            <Link to="/dashboard" className={`block px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}>Dashboard</Link>
            <div className="text-gray-500 font-medium px-3 py-2">PROFILE</div>
            <Link to="/personal-details" className={`block px-3 py-2 ml-4 text-sm rounded transition-colors ${
              location.pathname === '/personal-details' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Personal Details</Link>
            <Link to="/education" className={`block px-3 py-2 ml-4 text-sm bg-ncpd-primary text-white rounded`}>Education</Link>
            <Link to="/trainings" className={`block px-3 py-2 ml-4 text-sm rounded transition-colors ${
              location.pathname === '/trainings' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Trainings</Link>
            <Link to="/professional-membership" className={`block px-3 py-2 ml-4 text-sm rounded transition-colors ${
              location.pathname === '/professional-membership' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Professional Membership</Link>
            <Link to="/employment" className={`block px-3 py-2 ml-4 text-sm rounded transition-colors ${
              location.pathname === '/employment' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Employment</Link>
            <Link to="/files" className={`block px-3 py-2 ml-4 text-sm rounded transition-colors ${
              location.pathname === '/files' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Files</Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Educational Background</h2>
              <button
                onClick={handleEducationAdd}
                className="px-4 py-2 bg-ncpd-primary text-white rounded-lg hover:bg-ncpd-secondary"
              >
                Add Education
              </button>
            </div>
            
            <div className="space-y-6">
              {education.map((edu) => (
                <div key={edu.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. University of Nairobi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Bachelor of Arts"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => handleEducationChange(edu.id, 'field', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Economics"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => handleEducationChange(edu.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => handleEducationChange(edu.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GPA</label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => handleEducationChange(edu.id, 'gpa', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. 3.8"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
                    <textarea
                      value={edu.achievements.join(', ')}
                      onChange={(e) => handleEducationChange(edu.id, 'achievements', e.target.value.split(', '))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="e.g. Dean's List, Honor Roll"
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleEducationRemove(edu.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-end">
              <button className="px-6 py-2 bg-ncpd-primary text-white rounded-lg hover:bg-ncpd-secondary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
