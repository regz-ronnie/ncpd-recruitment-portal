import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { authAPI } from '../services/api'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [captchaKey, setCaptchaKey] = useState('')
  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaValue, setCaptchaValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const [pendingUserId, setPendingUserId] = useState(null)
  const { dispatch } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Load CAPTCHA on mount
  useEffect(() => {
    loadCaptcha()
  }, [])

  const loadCaptcha = async () => {
    try {
      const response = await authAPI.getCaptcha()
      setCaptchaKey(response.data.captcha_key)
      // Use the same URL resolution as api.js to work on mobile devices
      const host = window.location.hostname
      const backendUrl = `http://${host}:8000`
      setCaptchaImage(`${backendUrl}${response.data.captcha_image}`)
    } catch (err) {
      console.error('Failed to load CAPTCHA:', err)
    }
  }

  const refreshCaptcha = () => {
    setCaptchaValue('')
    loadCaptcha()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (requires2FA) {
        // Verify OTP and complete login
        const result = await authAPI.verifyOtpAndLogin({
          user_id: pendingUserId,
          otp_code: otpCode,
          email,
          password,
        })

        if (result.data) {
          const data = result.data
          // Update localStorage
          localStorage.setItem('access_token', data.access)
          localStorage.setItem('refresh_token', data.refresh)
          localStorage.setItem('user', JSON.stringify(data.user))
          sessionStorage.setItem('sessionStartTime', Date.now().toString())
          sessionStorage.setItem('lastActivity', Date.now().toString())
          
          // Update AuthContext state
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: data,
          })
          
          const user = data.user
          const role = (user?.user_type && String(user.user_type).toLowerCase())
            || (user?.role && String(user.role).toLowerCase())
            || (user?.is_superuser ? 'admin' : undefined)
            || (user?.is_staff ? 'staff' : undefined)
            || (user?.is_hr ? 'hr' : undefined)
            || 'applicant'

          const requestedPath = location.state?.redirectTo || location.state?.from || ''
          let destination = '/dashboard'

          if (role === 'admin') {
            destination = '/admin/dashboard'
          } else if (role === 'hr' || role === 'staff' || user?.is_hr) {
            destination = '/hr/dashboard'
          }

          if (requestedPath) {
            if (role === 'admin' && requestedPath.startsWith('/admin')) {
              destination = requestedPath
            } else if ((role === 'hr' || role === 'staff' || user?.is_hr) && requestedPath.startsWith('/hr')) {
              destination = requestedPath
            }
          }

          navigate(destination, { replace: true })
        } else {
          setError('OTP verification failed')
        }
      } else {
        // Initial login attempt with CAPTCHA
        const result = await authAPI.login({
          email,
          password,
          captcha_key: captchaKey,
          captcha_value: captchaValue,
        })

        if (result.data?.requires_2fa) {
          // 2FA is required, show OTP input
          setRequires2FA(true)
          setPendingUserId(result.data.user_id)
          setError('')
        } else if (result.data) {
          // Login successful without 2FA
          const data = result.data
          
          // Update localStorage
          localStorage.setItem('access_token', data.access)
          localStorage.setItem('refresh_token', data.refresh)
          localStorage.setItem('user', JSON.stringify(data.user))
          sessionStorage.setItem('sessionStartTime', Date.now().toString())
          sessionStorage.setItem('lastActivity', Date.now().toString())
          
          // Update AuthContext state
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: data,
          })
          
          const user = data.user
          const role = (user?.user_type && String(user.user_type).toLowerCase())
            || (user?.role && String(user.role).toLowerCase())
            || (user?.is_superuser ? 'admin' : undefined)
            || (user?.is_staff ? 'staff' : undefined)
            || (user?.is_hr ? 'hr' : undefined)
            || 'applicant'

          const requestedPath = location.state?.redirectTo || location.state?.from || ''
          let destination = '/dashboard'

          if (role === 'admin') {
            destination = '/admin/dashboard'
          } else if (role === 'hr' || role === 'staff' || user?.is_hr) {
            destination = '/hr/dashboard'
          }

          if (requestedPath) {
            if (role === 'admin' && requestedPath.startsWith('/admin')) {
              destination = requestedPath
            } else if ((role === 'hr' || role === 'staff' || user?.is_hr) && requestedPath.startsWith('/hr')) {
              destination = requestedPath
            }
          }

          navigate(destination, { replace: true })
        } else {
          setError(result.data?.error || 'Login failed')
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred during login'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#006633] to-[#008844] px-8 py-6">
            <h1 className="text-2xl font-bold text-white">
              {requires2FA ? 'Two-Factor Authentication' : 'Welcome Back'}
            </h1>
            <p className="text-green-100 text-sm mt-1">
              {requires2FA ? 'Enter your verification code' : 'Sign in to your account'}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {requires2FA && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      A verification code has been sent to your email. Please enter it below to complete login.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!requires2FA && (
                <>
                  {/* Email Box */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent transition-all"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  {/* Password Box */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* CAPTCHA Box */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Security Check
                    </label>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      {captchaImage && (
                        <div className="flex items-center gap-3 sm:gap-4">
                          <img 
                            src={captchaImage} 
                            alt="CAPTCHA" 
                            className="h-10 sm:h-12 rounded-lg border border-gray-300"
                            onError={(e) => {
                              console.error('CAPTCHA image failed to load')
                              e.target.style.display = 'none'
                            }}
                          />
                          <button
                            type="button"
                            onClick={refreshCaptcha}
                            className="text-[#006633] hover:text-[#008844] transition-colors flex-shrink-0"
                            title="Refresh CAPTCHA"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <input
                        type="text"
                        value={captchaValue}
                        onChange={(e) => setCaptchaValue(e.target.value)}
                        className="w-full mt-2 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent transition-all text-sm sm:text-base"
                        placeholder="Type the characters you see"
                        required
                        autoComplete="off"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter the distorted text shown in the image above (case-insensitive)</p>
                    </div>
                  </div>
                </>
              )}

              {requires2FA && (
                /* OTP Box */
                <div className="space-y-2">
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-center text-2xl tracking-widest transition-all"
                      placeholder="123456"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">Enter the 6-digit code sent to your email</p>
                </div>
              )}

              {!requires2FA && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      className="h-4 w-4 text-[#006633] focus:ring-[#006633] border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-[#006633] hover:text-[#008844] transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#006633] to-[#008844] text-white font-semibold rounded-xl hover:from-[#008844] hover:to-[#006633] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006633] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {requires2FA ? 'Verifying...' : 'Signing in...'}
                  </span>
                ) : (
                  requires2FA ? 'Verify Code' : 'Sign In'
                )}
              </button>

              {!requires2FA && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-[#006633] hover:text-[#008844] transition-colors">
                      Sign up
                    </Link>
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400 text-sm">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Secured with 2FA & CAPTCHA</span>
        </div>
      </div>
    </div>
  )
}
