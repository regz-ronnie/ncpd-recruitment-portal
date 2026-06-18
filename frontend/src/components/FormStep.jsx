import React from 'react'

export function FormStep({ title, description, children, isActive, stepNumber }) {
  return (
    <div className={`step-container ${isActive ? 'active' : ''}`}>
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            isActive 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-300 text-gray-600'
          }`}>
            {stepNumber}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-gray-600 text-sm mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className={`transition-all duration-300 ${
        isActive ? 'opacity-100 block' : 'opacity-0 hidden'
      }`}>
        {children}
      </div>
    </div>
  )
}
