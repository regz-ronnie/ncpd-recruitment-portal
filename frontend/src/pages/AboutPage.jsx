import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export function AboutPage() {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
  )
}
