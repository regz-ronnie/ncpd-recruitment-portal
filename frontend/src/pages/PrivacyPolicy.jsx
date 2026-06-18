import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export function PrivacyPolicy() {
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
            <Link to="/about" className={`block px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/about' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}>About Us</Link>
            <Link to="/privacy" className={`block px-3 py-2 bg-blue-50 text-blue-600 rounded-lg`}>Privacy Policy</Link>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
            
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                <strong>Last updated:</strong> January 2026
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Introduction</h3>
              <p className="text-gray-600 mb-4">
                The National Council for Population and Development (NCPD) is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, and protect your personal information when you use 
                our E-Recruitment portal.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Information We Collect</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4">
                <li>Personal identification information (name, ID number, contact details)</li>
                <li>Educational qualifications and professional certifications</li>
                <li>Employment history and work experience</li>
                <li>Professional memberships and affiliations</li>
                <li>Uploaded documents (CV, certificates, etc.)</li>
                <li>Application history and status</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How We Use Your Information</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4">
                <li>To process and evaluate your job applications</li>
                <li>To communicate with you about your applications</li>
                <li>To maintain recruitment records</li>
                <li>To improve our recruitment processes</li>
                <li>To comply with legal and regulatory requirements</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Security</h3>
              <p className="text-gray-600 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Rights</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4">
                <li>Right to access your personal information</li>
                <li>Right to correct inaccurate information</li>
                <li>Right to request deletion of your information</li>
                <li>Right to object to processing of your information</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Us</h3>
              <p className="text-gray-600 mb-4">
                If you have questions about this Privacy Policy or how we handle your personal information, 
                please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600"><strong>Email:</strong> privacy@ncpd.go.ke</p>
                <p className="text-gray-600"><strong>Phone:</strong> +254 20 271 7444</p>
                <p className="text-gray-600"><strong>Address:</strong> NCPD Headquarters, Nairobi, Kenya</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
