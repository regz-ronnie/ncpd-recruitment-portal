/**
 * Password validation utilities for NCPD Recruitment Portal
 */

export const passwordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  commonPasswords: [
    'password', '12345678', '123456789', 'qwerty123', 
    'abc12345', 'password123', 'admin123', 'letmein123',
    'welcome123', 'monkey123', 'dragon123', 'master123',
    'hello123', 'charlie123', 'aa12345678', 'password1'
  ]
}

/**
 * Validate password against all requirements
 * @param {string} password - Password to validate
 * @param {string} email - User email (for similarity check)
 * @param {string} firstName - User first name (for similarity check)
 * @param {string} lastName - User last name (for similarity check)
 * @returns {Object} Validation result with errors and strength
 */
export const validatePassword = (password, email = '', firstName = '', lastName = '') => {
  const errors = []
  const warnings = []
  let strength = 0

  // Length validation
  if (password.length < passwordRequirements.minLength) {
    errors.push(`Password must be at least ${passwordRequirements.minLength} characters long`)
  } else {
    strength += 1
  }

  if (password.length > passwordRequirements.maxLength) {
    errors.push(`Password must not exceed ${passwordRequirements.maxLength} characters`)
  }

  // Character type validation
  if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else if (/[A-Z]/.test(password)) {
    strength += 1
  }

  if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else if (/[a-z]/.test(password)) {
    strength += 1
  }

  if (passwordRequirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else if (/\d/.test(password)) {
    strength += 1
  }

  if (passwordRequirements.requireSpecialChars && !new RegExp(`[${passwordRequirements.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
    errors.push(`Password must contain at least one special character (${passwordRequirements.specialChars.substring(0, 10)}...)`)
  } else if (new RegExp(`[${passwordRequirements.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
    strength += 1
  }

  // Similarity validation
  const emailUsername = email.split('@')[0]
  if (emailUsername && password.toLowerCase().includes(emailUsername.toLowerCase())) {
    errors.push('Password cannot be similar to your email username')
  }

  if (firstName && password.toLowerCase().includes(firstName.toLowerCase())) {
    errors.push('Password cannot contain your first name')
  }

  if (lastName && password.toLowerCase().includes(lastName.toLowerCase())) {
    errors.push('Password cannot contain your last name')
  }

  // Common password validation
  if (passwordRequirements.commonPasswords.includes(password.toLowerCase())) {
    errors.push('Please choose a more secure password')
  }

  // Numeric password validation
  if (/^\d+$/.test(password)) {
    errors.push('Password cannot be entirely numeric')
  }

  // Calculate strength
  let strengthText = 'Weak'
  let strengthColor = 'text-red-600'
  
  if (strength >= 5) {
    strengthText = 'Very Strong'
    strengthColor = 'text-green-600'
  } else if (strength >= 4) {
    strengthText = 'Strong'
    strengthColor = 'text-green-500'
  } else if (strength >= 3) {
    strengthText = 'Medium'
    strengthColor = 'text-yellow-600'
  } else if (strength >= 2) {
    strengthText = 'Fair'
    strengthColor = 'text-orange-600'
  }

  // Add warnings for improvement
  if (strength < 3 && errors.length === 0) {
    warnings.push('Consider adding more character types for a stronger password')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strength,
    strengthText,
    strengthColor,
    requirements: {
      length: password.length >= passwordRequirements.minLength,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      specialChars: new RegExp(`[${passwordRequirements.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password),
      notCommon: !passwordRequirements.commonPasswords.includes(password.toLowerCase()),
      notNumeric: !/^\d+$/.test(password),
      notSimilar: !(
        (emailUsername && password.toLowerCase().includes(emailUsername.toLowerCase())) ||
        (firstName && password.toLowerCase().includes(firstName.toLowerCase())) ||
        (lastName && password.toLowerCase().includes(lastName.toLowerCase()))
      )
    }
  }
}

/**
 * Check if two passwords match
 * @param {string} password - First password
 * @param {string} confirmPassword - Password confirmation
 * @returns {Object} Match result
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  return {
    isMatch: password === confirmPassword,
    message: password !== confirmPassword ? 'Passwords do not match' : ''
  }
}

/**
 * Get password strength indicator width percentage
 * @param {number} strength - Strength score (0-5)
 * @returns {number} Width percentage for progress bar
 */
export const getPasswordStrengthWidth = (strength) => {
  return (strength / 5) * 100
}
