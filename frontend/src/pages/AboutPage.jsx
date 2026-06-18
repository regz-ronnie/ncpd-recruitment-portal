import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export function AboutPage() {
  const location = useLocation()
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
            <Link to="/help" className={`block px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/help' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}>Help</Link>
            <Link to="/about" className={`block px-3 py-2 bg-blue-50 text-blue-600 rounded-lg`}>About Us</Link>
            <Link to="/privacy" className={`block px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/privacy' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}>Privacy Policy</Link>
            <Link to="/contact" className={`block px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/contact' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}>Contact</Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About NCPD</h2>
            
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                The National Council for Population and Development (NCPD) is a government agency mandated to coordinate, 
                monitor, and evaluate population and development programs in Kenya.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600 mb-4">
                To provide leadership and coordination in the implementation of population and development programs 
                for sustainable development and improved quality of life for all Kenyans.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600 mb-4">
                To be the leading institution in coordinating population and development programs for national development.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Core Functions</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4">
                <li>Policy formulation and coordination on population and development matters</li>
                <li>Monitoring and evaluation of population programs</li>
                <li>Research and data collection on population trends</li>
                <li>Capacity building and training on population issues</li>
                <li>Public awareness and education on population matters</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600"><strong>Address:</strong> NCPD Headquarters, Nairobi, Kenya</p>
                <p className="text-gray-600"><strong>Phone:</strong> +254 20 271 7444</p>
                <p className="text-gray-600"><strong>Email:</strong> info@ncpd.go.ke</p>
                <p className="text-gray-600"><strong>Website:</strong> www.ncpd.go.ke</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
