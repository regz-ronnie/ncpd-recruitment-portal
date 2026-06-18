import React from 'react'
import { validatePassword, validatePasswordMatch, getPasswordStrengthWidth } from '../utils/passwordValidation'

export function PasswordStrength({ 
  password, 
  confirmPassword, 
  email = '', 
  firstName = '', 
  lastName = '',
  showMatch = true 
}) {
  const passwordValidation = validatePassword(password, email, firstName, lastName)
  const matchValidation = showMatch ? validatePasswordMatch(password, confirmPassword) : { isMatch: true, message: '' }

  if (!password) {
    return null
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Password Strength Indicator */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Password Strength:</span>
        <span className={`text-sm font-medium ${passwordValidation.strengthColor}`}>
          {passwordValidation.strengthText}
        </span>
      </div>
      
      {/* Strength Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            passwordValidation.strength === 0 ? 'bg-red-600' :
            passwordValidation.strength === 1 ? 'bg-red-500' :
            passwordValidation.strength === 2 ? 'bg-orange-600' :
            passwordValidation.strength === 3 ? 'bg-yellow-600' :
            passwordValidation.strength === 4 ? 'bg-green-500' :
            'bg-green-600'
          }`}
          style={{ width: `${getPasswordStrengthWidth(passwordValidation.strength)}%` }}
        />
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        <div className={`flex items-center text-sm ${
          passwordValidation.requirements.length ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="mr-2">
            {passwordValidation.requirements.length ? '✓' : '✗'}
          </span>
          At least 8 characters long
        </div>
        
        <div className={`flex items-center text-sm ${
          passwordValidation.requirements.uppercase ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="mr-2">
            {passwordValidation.requirements.uppercase ? '✓' : '✗'}
          </span>
          Contains uppercase letter (A-Z)
        </div>
        
        <div className={`flex items-center text-sm ${
          passwordValidation.requirements.lowercase ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="mr-2">
            {passwordValidation.requirements.lowercase ? '✓' : '✗'}
          </span>
          Contains lowercase letter (a-z)
        </div>
        
        <div className={`flex items-center text-sm ${
          passwordValidation.requirements.numbers ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="mr-2">
            {passwordValidation.requirements.numbers ? '✓' : '✗'}
          </span>
          Contains number (0-9)
        </div>
        
        <div className={`flex items-center text-sm ${
          passwordValidation.requirements.specialChars ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="mr-2">
            {passwordValidation.requirements.specialChars ? '✓' : '✗'}
          </span>
          Contains special character (!@#$%^&*...)
        </div>
        
        <div className={`flex items-center text-sm ${
          passwordValidation.requirements.notCommon ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="mr-2">
            {passwordValidation.requirements.notCommon ? '✓' : '✗'}
          </span>
          Not a common password
        </div>
        
        <div className={`flex items-center text-sm ${
          passwordValidation.requirements.notSimilar ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="mr-2">
            {passwordValidation.requirements.notSimilar ? '✓' : '✗'}
          </span>
          Not similar to personal info
        </div>
      </div>

      {/* Password Match Indicator */}
      {showMatch && confirmPassword && (
        <div className={`flex items-center text-sm ${
          matchValidation.isMatch ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="mr-2">
            {matchValidation.isMatch ? '✓' : '✗'}
          </span>
          Passwords match
        </div>
      )}

      {/* Error Messages */}
      {passwordValidation.errors.length > 0 && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm font-medium text-red-800">Password Issues:</div>
          <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
            {passwordValidation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warning Messages */}
      {passwordValidation.warnings.length > 0 && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="text-sm font-medium text-yellow-800">Suggestions:</div>
          <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
            {passwordValidation.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
