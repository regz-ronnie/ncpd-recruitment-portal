import React, { useState, useEffect } from 'react'

export const SessionTimeoutWarning = ({ onLogout, onContinue }) => {
  const [timeRemaining, setTimeRemaining] = useState(60) // 60 seconds warning

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onLogout])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Session Expiring Soon
          </h3>
          
          <p className="text-gray-600 mb-4">
            Your session will expire in <span className="font-bold text-red-600">{timeRemaining} seconds</span> due to inactivity.
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            Click "Continue Session" to stay logged in, or you will be automatically logged out.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Logout Now
            </button>
            <button
              onClick={onContinue}
              className="px-4 py-2 bg-[#006633] text-white rounded-lg hover:bg-[#008844] transition-colors font-medium"
            >
              Continue Session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
