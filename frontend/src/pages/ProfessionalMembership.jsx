import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function ProfessionalMembership() {
  const location = useLocation()
  const [memberships, setMemberships] = useState([
    {
      id: 1,
      organization: 'Institute of Certified Public Accountants of Kenya (ICPAK)',
      membershipNumber: 'CPAK-2021-1234',
      membershipType: 'Associate Member',
      startDate: '2021-06',
      status: 'Active',
      description: 'Professional accounting body membership'
    }
  ])

  const handleMembershipAdd = () => {
    const newMembership = {
      id: Date.now(),
      organization: '',
      membershipNumber: '',
      membershipType: '',
      startDate: '',
      status: 'Active',
      description: ''
    }
    setMemberships([...memberships, newMembership])
  }

  const handleMembershipChange = (id, field, value) => {
    setMemberships(memberships.map(membership => 
      membership.id === id ? { ...membership, [field]: value } : membership
    ))
  }

  const handleMembershipRemove = (id) => {
    setMemberships(memberships.filter(membership => membership.id !== id))
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
            <Link to="/trainings" className={`block px-3 py-2 ml-4 text-sm rounded transition-colors ${
              location.pathname === '/trainings' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}>Trainings</Link>
            <Link to="/professional-membership" className={`block px-3 py-2 ml-4 text-sm bg-ncpd-primary text-white rounded`}>Professional Membership</Link>
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
              <h2 className="text-2xl font-bold text-gray-900">Professional Memberships</h2>
              <button
                onClick={handleMembershipAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Membership
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">Here, you'll add any registrations/associations with professional bodies such as ICPAK, the EBK, etc.</p>
            
            <div className="space-y-6">
              {memberships.map((membership) => (
                <div key={membership.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Body</label>
                      <input
                        type="text"
                        value={membership.organization}
                        onChange={(e) => handleMembershipChange(membership.id, 'organization', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Institute of Certified Public Accountants of Kenya (ICPAK)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Membership Number</label>
                      <input
                        type="text"
                        value={membership.membershipNumber}
                        onChange={(e) => handleMembershipChange(membership.id, 'membershipNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. CPAK-2021-1234"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Membership Type</label>
                      <select
                        value={membership.membershipType}
                        onChange={(e) => handleMembershipChange(membership.id, 'membershipType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Type</option>
                        <option value="Student Member">Student Member</option>
                        <option value="Associate Member">Associate Member</option>
                        <option value="Full Member">Full Member</option>
                        <option value="Fellow">Fellow</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="month"
                        value={membership.startDate}
                        onChange={(e) => handleMembershipChange(membership.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={membership.status}
                        onChange={(e) => handleMembershipChange(membership.id, 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        rows={3}
                        value={membership.description}
                        onChange={(e) => handleMembershipChange(membership.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief description of the professional body and your role"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleMembershipRemove(membership.id)}
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
