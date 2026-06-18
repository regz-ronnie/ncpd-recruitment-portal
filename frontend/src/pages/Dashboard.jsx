import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export function Dashboard() {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h1>
          <p className="text-gray-600 mb-8">You need to be authenticated to view your dashboard.</p>
          <Link 
            to="/login" 
            className="bg-ncpd-primary text-white px-6 py-3 rounded-lg hover:bg-ncpd-secondary transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // Sidebar structure mapping image_3b1203.png
  const sidebarGroups = [
    {
      items: [
        { name: 'Dashboard', to: '/dashboard', icon: 'fas fa-chart-bar' }
      ]
    },
    {
      groupName: 'PROFILE',
      items: [
        { name: 'Personal Details', to: '/personal-details', icon: 'far fa-user' },
        { name: 'Education', to: '/education', icon: 'fas fa-graduation-cap' },
        { name: 'Trainings', to: '/trainings', icon: 'fas fa-desktop' },
        { name: 'Professional Membership', to: '/professional-membership', icon: 'far fa-check-circle' },
        { name: 'Employment', to: '/employment', icon: 'far fa-building' },
        { name: 'Files', to: '/files', icon: 'far fa-file' },
      ]
    },
    {
      groupName: 'JOBS',
      items: [
        { name: 'My Applications', to: '/my-applications', icon: 'far fa-file-alt' },
        { name: 'Advertised Jobs', to: '/vacancies', icon: 'far fa-square' }, // adjusted to route to your vacancies
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* SIDEBAR (Desktop) / TOP NAV BAR (Mobile Menu) */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0">
        <div className="p-4 flex justify-between items-center md:hidden border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Portal Navigation</h2>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Dynamic Sidebar Nav matching image_3b1203.png */}
        <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block p-4 space-y-6`}>
          {sidebarGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2">
              {group.groupName && (
                <div className="text-xs font-bold text-gray-900 tracking-wider px-4 mb-3">
                  {group.groupName}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.to
                  return (
                    <Link
                      key={item.name}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-all duration-150 font-medium text-sm ${
                        isActive 
                          ? 'bg-ncpd-primary text-white shadow-sm' 
                          : 'text-slate-700 hover:bg-slate-50 hover:text-ncpd-primary'
                      }`}
                    >
                      <i className={`${item.icon} w-5 text-center text-base opacity-80 ${isActive ? 'text-white' : 'text-slate-500'}`}></i>
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-x-hidden">
        {/* Profile Banner Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName} {user?.lastName}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            NCPD Recruitment Portal Dashboard
          </p>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Status Panel */}
              <div className="bg-ncpd-light border border-ncpd-primary rounded-lg p-4 sm:p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ncpd-primary mb-3">
                    <i className="fas fa-user-circle mr-2"></i>Profile Status
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-gray-200/50 pb-2">
                      <span className="text-gray-600">Profile Completion</span>
                      <span className="text-ncpd-success font-semibold">75%</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-600">Application Status</span>
                      <span className="text-ncpd-primary font-semibold">3 Active</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Link 
                    to="/personal-details" 
                    className="inline-block bg-ncpd-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-ncpd-secondary transition-colors"
                  >
                    Complete Profile
                  </Link>
                </div>
              </div>
              
              {/* Recent Applications Panel */}
              <div className="bg-ncpd-light border border-ncpd-success rounded-lg p-4 sm:p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ncpd-success mb-3">
                    <i className="fas fa-file-alt mr-2"></i>Recent Applications
                  </h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-ncpd-success bg-white p-3 rounded-r-lg shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">Senior Population Programme Officer</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Applied 2 days ago</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                          Under Review
                        </span>
                      </div>
                    </div>
                    <div className="border-l-4 border-ncpd-success bg-white p-3 rounded-r-lg shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">Assistant Director Planning</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Applied 1 week ago</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                          Interview Scheduled
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Link 
                    to="/vacancies" 
                    className="inline-block bg-ncpd-success text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-ncpd-secondary transition-colors"
                  >
                    View All Applications
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="mt-6 bg-ncpd-light border border-ncpd-accent rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-ncpd-accent mb-4">
                <i className="fas fa-bolt mr-2"></i>Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  to="/vacancies" 
                  className="flex items-center justify-between bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-ncpd-primary rounded-lg">
                      <i className="fas fa-search text-lg"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Browse Available Vacancies</h4>
                      <p className="text-xs text-gray-500">View and apply for current openings</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 group-hover:text-ncpd-primary transition-colors ml-2"></i>
                </Link>
                
                <Link 
                  to="/personal-details" 
                  className="flex items-center justify-between bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-ncpd-success rounded-lg">
                      <i className="fas fa-user-edit text-lg"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Update Profile</h4>
                      <p className="text-xs text-gray-500">Add or edit your personal information</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 group-hover:text-ncpd-success transition-colors ml-2"></i>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  )
}