import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MenuIcon, XIcon } from '@heroicons/react/outline'

export function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="responsive-container">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span>National Council for Population and Development</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="tel:+254202020" className="hover:text-ncpd-light transition-colors">+254 20 2020</a>
              <a href="mailto:info@ncpd.go.ke" className="hover:text-ncpd-light transition-colors">info@ncpd.go.ke</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="gov-header sticky top-0 z-50">
        <div className="responsive-container">
          <div className="gov-nav py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-ncpd-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">NCPD</h1>
                  <p className="text-xs text-gray-600">Recruitment Portal</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link to="/dashboard" className="gov-nav-link">
                Dashboard
              </Link>
              
              {/* Auth Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <Link to="/login" className="btn-outline text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XIcon className="h-6 w-6 text-gray-600" />
                ) : (
                  <MenuIcon className="h-6 w-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="responsive-container py-4">
              <nav className="flex flex-col space-y-2">
                <Link 
                  to="/dashboard" 
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 mt-4">
                  <Link 
                    to="/login" 
                    className="btn-outline text-sm flex-1 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn-primary text-sm flex-1 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer footer-border">
        <div className="responsive-container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About Section */}
            <div>
              <h3 className="footer-heading">NCPD Recruitment Portal</h3>
              <p className="text-gray-300 text-sm mb-4">
                National Council for Population and Development's official recruitment portal. 
                Join us in our mission to build sustainable population for a prosperous Kenya.
              </p>
              <div className="flex space-x-4">
                <a href="https://ncpd.go.ke" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="footer-link text-sm">Home</Link>
                </li>
                <li>
                  <Link to="/vacancies" className="footer-link text-sm">Available Vacancies</Link>
                </li>
                <li>
                  <Link to="/application-form" className="footer-link text-sm">Apply Online</Link>
                </li>
                <li>
                  <Link to="/about" className="footer-link text-sm">About NCPD</Link>
                </li>
                <li>
                  <Link to="/contact" className="footer-link text-sm">Contact Us</Link>
                </li>
              </ul>
            </div>
            
            {/* Services */}
            <div>
              <h4 className="footer-heading">Services</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard" className="footer-link text-sm">Candidate Dashboard</Link>
                </li>
                <li>
                  <Link to="/hr/dashboard" className="footer-link text-sm">HR Portal</Link>
                </li>
                <li>
                  <Link to="/faq" className="footer-link text-sm">FAQs</Link>
                </li>
                <li>
                  <Link to="/data-protection" className="footer-link text-sm">Data Protection</Link>
                </li>
                <li>
                  <a href="https://ncpd.go.ke" target="_blank" rel="noopener noreferrer" className="footer-link text-sm">
                    Main Website
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="footer-heading">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-ncpd-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.414 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Physical Address</p>
                    <p className="text-gray-400 text-sm">NCPD Headquarters</p>
                    <p className="text-gray-400 text-sm">Nairobi, Kenya</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-ncpd-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13 2.257a1 1 0 001.21.502l4.493 1.498a1 1 0 00.684-.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6a5 5 0 015 5z" />
                  </svg>
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Contact</p>
                    <a href="tel:+254202020" className="footer-link text-sm">+254 20 2020</a>
                    <a href="mailto:recruitment@ncpd.go.ke" className="footer-link text-sm block">recruitment@ncpd.go.ke</a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-ncpd-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Office Hours</p>
                    <p className="text-gray-400 text-sm">Monday - Friday: 8:00 AM - 5:00 PM</p>
                    <p className="text-gray-400 text-sm">Saturday: 9:00 AM - 1:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                &copy; 2024 National Council for Population and Development. All rights reserved.
              </div>
              <div className="flex items-center space-x-6">
                <Link to="/privacy-policy" className="footer-link text-sm">Privacy Policy</Link>
                <Link to="/terms" className="footer-link text-sm">Terms of Service</Link>
                <Link to="/accessibility" className="footer-link text-sm">Accessibility</Link>
                <Link to="/sitemap" className="footer-link text-sm">Sitemap</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
