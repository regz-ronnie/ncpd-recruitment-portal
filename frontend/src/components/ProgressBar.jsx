import React from 'react'

export function ProgressBar({ current, total, className = '' }) {
  const percentage = (current / total) * 100

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {current} of {total}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}
