import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Trainings() {
  const location = useLocation()
  const [trainings, setTrainings] = useState([
    {
      id: 1,
      title: 'Project Management Professional',
      institution: 'PMI Kenya',
      startDate: '2023-01',
      endDate: '2023-03',
      current: false,
      certificateNumber: 'PMP-2023-001',
      description: 'Comprehensive project management training covering all aspects of project lifecycle'
    }
  ])

  const handleTrainingAdd = () => {
    const newTraining = {
      id: Date.now(),
      title: '',
      institution: '',
      startDate: '',
      endDate: '',
      current: false,
      certificateNumber: '',
      description: ''
    }
    setTrainings([...trainings, newTraining])
  }

  const handleTrainingChange = (id, field, value) => {
    setTrainings(trainings.map(training => 
      training.id === id ? { ...training, [field]: value } : training
    ))
  }

  const handleTrainingRemove = (id) => {
    setTrainings(trainings.filter(training => training.id !== id))
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
            <Link to="/education" className={`block px-3 py-2 ml-4 text-sm rounded transition-colors ${
              location.pathname === '/education' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Education</Link>
            <Link to="/trainings" className={`block px-3 py-2 ml-4 text-sm bg-ncpd-primary text-white rounded`}>Trainings</Link>
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
              <h2 className="text-2xl font-bold text-gray-900">Trainings & Certifications</h2>
              <button
                onClick={handleTrainingAdd}
                className="px-4 py-2 bg-ncpd-primary text-white rounded-lg hover:bg-ncpd-secondary"
              >
                Add Training
              </button>
            </div>
            
            <div className="space-y-6">
              {trainings.map((training) => (
                <div key={training.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Training Title</label>
                      <input
                        type="text"
                        value={training.title}
                        onChange={(e) => handleTrainingChange(training.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Project Management Professional"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                      <input
                        type="text"
                        value={training.institution}
                        onChange={(e) => handleTrainingChange(training.id, 'institution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. PMI Kenya"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="month"
                        value={training.startDate}
                        onChange={(e) => handleTrainingChange(training.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="month"
                        value={training.endDate}
                        onChange={(e) => handleTrainingChange(training.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Number</label>
                      <input
                        type="text"
                        value={training.certificateNumber}
                        onChange={(e) => handleTrainingChange(training.id, 'certificateNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. PMP-2023-001"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        rows={3}
                        value={training.description}
                        onChange={(e) => handleTrainingChange(training.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief description of the training program"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleTrainingRemove(training.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
