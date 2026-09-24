import React from 'react'

export function Footer() {
  return (
    <footer className="footer footer-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: stacked columns on mobile, 3-column layout on medium/large screens with clean spacing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Organization Intro */}
          <div>
            <h3 className="text-lg font-semibold mb-4">National Council for Population and Development</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Transforming lives through quality population programs and services.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/help" className="footer-link">User Guide</a></li>
              <li><a href="/faq" className="footer-link">How to Apply</a></li>
              <li><a href="/about" className="footer-link">About Us</a></li>
              <li><a href="/privacy" className="footer-link">Privacy Policy</a></li>
              <li><a href="/contact" className="footer-link">Contact Us</a></li>
              <li><span className="text-gray-300 inline-block pt-1">V 1.0.0</span></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2.5 text-sm text-gray-300 leading-relaxed">
              <li>📍 <strong>Address:</strong> Chancery Building, 4th Floor, Valley Road, P. O. Box 48994–00100, Nairobi, Kenya</li>
              <li>📞 <strong>Telephone:</strong> +254 735 700 208</li>
              <li>✉️ <strong>Email:</strong> info@ncpd.go.ke</li>
              <li>🕒 <strong>Working Days/Hours:</strong> Mon - Friday / 8:00 AM - 5:00 PM</li>
            </ul>
          </div>

        </div>
        
        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-xs sm:text-sm text-gray-400">
          <p>&copy; Copyright 2026 | All Rights Reserved | National Council For Population and Development</p>
        </div>
      </div>
    </footer>
  )
}