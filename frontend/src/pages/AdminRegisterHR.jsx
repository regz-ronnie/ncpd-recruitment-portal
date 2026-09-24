import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { PasswordStrength } from '../components/PasswordStrength.jsx'

export function AdminRegisterHR() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'hr', // Default to HR, can also be 'staff'
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState([])
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPasswordErrors([])

    // Client-side validation
    const validationErrors = []
    
    if (formData.password.length < 8) {
      validationErrors.push('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(formData.password)) {
      validationErrors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(formData.password)) {
      validationErrors.push('Password must contain at least one lowercase letter')
    }
    if (!/\d/.test(formData.password)) {
      validationErrors.push('Password must contain at least one number')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(formData.password)) {
      validationErrors.push('Password must contain at least one special character')
    }
    if (formData.password !== formData.confirmPassword) {
      validationErrors.push('Passwords do not match')
    }

    if (validationErrors.length > 0) {
      setPasswordErrors(validationErrors)
      return
    }

    setLoading(true)

    try {
      const result = await register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        role: formData.role
      })
      
      if (result.success) {
        const redirectPath = window.location.pathname.startsWith('/admin') ? '/admin/dashboard' : '/hr/dashboard'
        navigate(redirectPath)
      } else {
        setError(result.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Admin HR registration error:', error)
      setError('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Register HR/Staff
        </h1>
        <p className="text-sm text-gray-600">
          Admin-only registration for HR and Staff accounts
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {passwordErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm font-medium">Please fix the following issues:</p>
          <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
            {passwordErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="hr.staff@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+254 700 000 000"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="hr">HR Officer</option>
            <option value="staff">Staff Member</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            HR Officers can manage vacancies and applications. Staff members have limited access.
          </p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="•••••••••"
          />
          <PasswordStrength 
            password={formData.password}
            confirmPassword={formData.confirmPassword}
            email={formData.email}
            firstName={formData.firstName}
            lastName={formData.lastName}
            showMatch={true}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="•••••••••"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            <strong>Admin Access Only:</strong> This form is for administrators to create HR and Staff accounts. 
            Public registration is restricted to applicants only.
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create HR/Staff Account'}
          </button>
        </div>

        <div className="text-center">
          <Link 
            to="/hr/dashboard" 
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to HR Dashboard
          </Link>
        </div>
      </form>
    </div>
  )
}
