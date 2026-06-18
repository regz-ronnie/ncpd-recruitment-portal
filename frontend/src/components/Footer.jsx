import React from 'react'

export function Footer() {
  return (
    <footer className="footer footer-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">National Council for Population and Development</h3>
            <p className="text-gray-300 text-sm">
              Transforming lives through quality population programs and services.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="footer-link">FAQs</a></li>
              <li><a href="#" className="footer-link">Contact Us</a></li>
              <li><span className="text-gray-300">V 1.0.0</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📍 Nairobi, Kenya</li>
              <li>📞 +254 20 271 7444</li>
              <li>✉️ info@ncpd.go.ke</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; Copyright 2026 | All Rights Reserved | National Council For Population and Development</p>
        </div>
      </div>
    </footer>
  )
}
