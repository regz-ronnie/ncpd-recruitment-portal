import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react'
import { authAPI } from '../services/api'
import { SessionTimeoutWarning } from '../components/SessionTimeoutWarning'

const AuthContext = createContext()

// Session timeout configuration (in milliseconds)
const IDLE_TIMEOUT = 30 * 60 * 1000 // 30 minutes of inactivity
const HARD_SESSION_TIMEOUT = 8 * 60 * 60 * 1000 // 8 hours maximum session duration
const WARNING_TIMEOUT = 5 * 60 * 1000 // Show warning 5 minutes before timeout

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  profileCompletion: 0,
  sessionStartTime: null,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.access,
        refreshToken: action.payload.refresh,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionStartTime: Date.now(),
      }
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload || null,
      }
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        profileCompletion: 0,  // Reset profile completion on logout
      }
    
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.access,
        refreshToken: action.payload.refresh,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        profileCompletion: action.payload.profileCompletion || state.profileCompletion,
      }

    case 'UPDATE_PROFILE_COMPLETION':
      localStorage.setItem('profileCompletion', action.payload)
      return {
        ...state,
        profileCompletion: action.payload,
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const [showWarning, setShowWarning] = useState(false)

  // Activity tracking for idle timeout
  const resetIdleTimer = useCallback(() => {
    sessionStorage.setItem('lastActivity', Date.now().toString())
  }, [])

  // Check session expiration
  const checkSessionExpiration = useCallback(() => {
    const sessionStartTime = sessionStorage.getItem('sessionStartTime')
    const lastActivity = sessionStorage.getItem('lastActivity')
    
    // If session data is missing (browser was closed), treat as expired
    if (!sessionStartTime || !lastActivity) {
      console.log('⏰ Session data missing (browser likely closed)')
      return true
    }

    const now = Date.now()
    const sessionAge = now - parseInt(sessionStartTime)
    const idleTime = now - parseInt(lastActivity)

    // Check hard session timeout
    if (sessionAge > HARD_SESSION_TIMEOUT) {
      console.log('⏰ Hard session timeout reached')
      return true
    }

    // Check idle timeout
    if (idleTime > IDLE_TIMEOUT) {
      console.log('⏰ Idle timeout reached')
      return true
    }

    return false
  }, [])

  // Logout function (defined early to avoid circular dependency)
  const logout = async () => {
    // JWT logout is just clearing tokens from browser
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('profileCompletion')
    sessionStorage.removeItem('sessionStartTime')
    sessionStorage.removeItem('lastActivity')

    // Clean up ALL contaminated localStorage data
    const keysToRemove = ['profileData', 'profileProgress', 'profileFormData']
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log('🧹 Cleaned up all localStorage data on logout')

    dispatch({ type: 'LOGOUT' })
  }

  // Session timeout effect
  useEffect(() => {
    if (!state.isAuthenticated) {
      return
    }

    // Set initial activity timestamp
    resetIdleTimer()

    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    const handleActivity = () => {
      resetIdleTimer()
      setShowWarning(false) // Hide warning on activity
    }

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity)
    })

    // Check session expiration every minute
    const checkInterval = setInterval(() => {
      const sessionStartTime = sessionStorage.getItem('sessionStartTime')
      const lastActivity = sessionStorage.getItem('lastActivity')
      
      if (!sessionStartTime || !lastActivity) {
        logout()
        return
      }

      const now = Date.now()
      const idleTime = now - parseInt(lastActivity)
      const sessionAge = now - parseInt(sessionStartTime)

      // Check if we should show warning (5 minutes before timeout)
      const timeUntilIdleTimeout = IDLE_TIMEOUT - idleTime
      const timeUntilHardTimeout = HARD_SESSION_TIMEOUT - sessionAge
      const timeUntilTimeout = Math.min(timeUntilIdleTimeout, timeUntilHardTimeout)

      if (timeUntilTimeout <= WARNING_TIMEOUT && timeUntilTimeout > 0 && !showWarning) {
        setShowWarning(true)
      }

      // Check if session has expired
      if (checkSessionExpiration()) {
        console.log('🔒 Session expired, logging out...')
        logout()
      }
    }, 60 * 1000) // Check every minute

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      clearInterval(checkInterval)
    }
  }, [state.isAuthenticated, resetIdleTimer, checkSessionExpiration, showWarning, logout])

  // Load tokens from localStorage on mount
  useEffect(() => {
    const loadUserData = async () => {
      console.log('🔄 Starting authentication restoration...')

      // Clean up ALL contaminated localStorage data from previous bug
      const keysToRemove = ['profileData', 'profileProgress', 'profileFormData', 'profileCompletion']
      keysToRemove.forEach(key => localStorage.removeItem(key))
      console.log('🧹 Cleaned up contaminated localStorage keys')

      dispatch({ type: 'LOGIN_START' }) // Set loading to true
      
      const token = localStorage.getItem('access_token')
      const refreshToken = localStorage.getItem('refresh_token')
      const user = localStorage.getItem('user')
      const sessionStartTime = sessionStorage.getItem('sessionStartTime')

      console.log('📦 localStorage data:', { 
        hasToken: !!token, 
        hasRefreshToken: !!refreshToken, 
        hasUser: !!user,
        hasSessionStartTime: !!sessionStartTime
      })

      if (token && refreshToken && user) {
        // Check if session has expired (including browser close)
        if (checkSessionExpiration()) {
          console.log('⏰ Session expired on load, clearing tokens')
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          sessionStorage.removeItem('sessionStartTime')
          sessionStorage.removeItem('lastActivity')
          dispatch({ type: 'LOGIN_FAILURE', payload: null })
          return
        }

        console.log('✅ Found tokens in localStorage, restoring authentication...')
        const parsedUser = JSON.parse(user)
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: parsedUser,
            access: token,
            refresh: refreshToken,
          }
        })
        
        // NOTE: Don't fetch profile data during initial restoration to avoid
        // potential 401 errors that could trigger unwanted redirects to login.
        // Profile data will be fetched when needed by specific components.
        console.log('✅ Authentication restored from localStorage')
        
        // Calculate profile completion from stored data
        const completion = calculateProfileCompletion(parsedUser)
        dispatch({
          type: 'UPDATE_PROFILE_COMPLETION',
          payload: completion,
        })
      } else {
        // No tokens found, set loading to false
        console.log('❌ No tokens found in localStorage')
        dispatch({ type: 'LOGIN_FAILURE', payload: null })
      }
    }
    
    loadUserData()
  }, [checkSessionExpiration])

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' })

      // Clean up ALL contaminated localStorage data before login
      const keysToRemove = ['profileData', 'profileProgress', 'profileFormData', 'profileCompletion']
      keysToRemove.forEach(key => localStorage.removeItem(key))
      console.log('🧹 Cleaned up contaminated localStorage before login')

      const response = await authAPI.login({ email, password })
      const data = response.data

      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('user', JSON.stringify(data.user))
      sessionStorage.setItem('sessionStartTime', Date.now().toString())
      sessionStorage.setItem('lastActivity', Date.now().toString())

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data,
      })

      // Load full profile data after login to get all profile fields
      try {
        const profileResponse = await authAPI.profile()
        let profileData = profileResponse.data
        
        console.log('Profile data fetched after login:', profileData)
        console.log('Profile data keys:', Object.keys(profileData))
        
        // Handle if data is wrapped in a 'user' object
        if (profileData.user) {
          console.log('Data wrapped in user object, unwrapping...')
          profileData = profileData.user
        }
        
        console.log('Profile data after unwrapping:', profileData)
        console.log('Profile data keys after unwrapping:', Object.keys(profileData))
        
        // Handle both snake_case and camelCase field names from backend
        const academicQualifications = profileData.academic_qualifications || profileData.academicQualifications
        const workExperiences = profileData.work_experiences || profileData.workExperiences || profileData.work_experiences_json
        const referees = profileData.referees
        const attachments = profileData.attachments
        
        console.log('Academic qualifications:', academicQualifications)
        console.log('Work experiences:', workExperiences)
        console.log('Referees:', referees)
        console.log('Attachments:', attachments)
        console.log('Declaration fields:', {
          declaration1: profileData.declaration1,
          declaration2: profileData.declaration2,
          declaration3: profileData.declaration3,
          declarationDate: profileData.declaration_date || profileData.declarationDate,
          placeOfDeclaration: profileData.place_of_declaration || profileData.placeOfDeclaration
        })
        
        // Normalize field names to snake_case for consistency
        const normalizedProfileData = {
          ...profileData,
          academic_qualifications: academicQualifications,
          work_experiences: workExperiences,
          referees: referees,
          attachments: attachments,
          declaration_date: profileData.declaration_date || profileData.declarationDate,
          place_of_declaration: profileData.place_of_declaration || profileData.placeOfDeclaration
        }
        
        // Update user with full profile data
        const updatedUser = { ...data.user, ...normalizedProfileData }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: updatedUser,
        })
        
        // Use profile completion from API if available, otherwise calculate
        const apiCompletion = profileData.profile_completion || profileData.profileCompletion
        const calculatedCompletion = calculateProfileCompletion(updatedUser)
        // Prefer API value, fall back to calculated
        const completion = apiCompletion || calculatedCompletion
        console.log('Profile completion on login:', { api: apiCompletion, calculated: calculatedCompletion, final: completion })
        dispatch({
          type: 'UPDATE_PROFILE_COMPLETION',
          payload: completion,
        })
      } catch (profileError) {
        console.error('Failed to load profile data after login:', profileError)
        
        // If API call fails, calculate with whatever data we have
        const completion = calculateProfileCompletion(data.user)
        dispatch({
          type: 'UPDATE_PROFILE_COMPLETION',
          payload: completion,
        })
      }
      
      return { success: true, data }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed'
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      })
      
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'REGISTER_START' })

      // Clean up ALL contaminated localStorage data before registration
      const keysToRemove = ['profileData', 'profileProgress', 'profileFormData', 'profileCompletion']
      keysToRemove.forEach(key => localStorage.removeItem(key))
      console.log('🧹 Cleaned up contaminated localStorage before registration')

      const response = await authAPI.register(userData)
      const data = response.data

      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('user', JSON.stringify(data.user))
      sessionStorage.setItem('sessionStartTime', Date.now().toString())
      sessionStorage.setItem('lastActivity', Date.now().toString())

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: {
          user: data.user,
          token: data.access,
          refreshToken: data.refresh,
        }
      })

      // DO NOT merge stored profile data - this causes cross-user data contamination
      // New users should start with clean profiles
      const completion = calculateProfileCompletion(data.user)
      dispatch({
        type: 'UPDATE_PROFILE_COMPLETION',
        payload: completion,
      })

      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: errorMessage,
      })
      
      return { success: false, error: errorMessage }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      const data = response.data

      localStorage.setItem('user', JSON.stringify(data))
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: data,
      })

      // Use profile completion from API response
      const apiCompletion = data.profile_completion || data.profileCompletion
      const completion = apiCompletion || calculateProfileCompletion(data)
      dispatch({
        type: 'UPDATE_PROFILE_COMPLETION',
        payload: completion,
      })

      return { success: true, data }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Profile update failed'
      return { success: false, error: errorMessage }
    }
  }

  const calculateProfileCompletion = (user) => {
    if (!user) return 0

    console.log('Calculating profile completion for user:', user)

    let completedSteps = 0
    const totalSteps = 8

    // Step 1: Personal Details (9 required fields - at least 7 must be filled)
    const personalFields = [
      'title', 'first_name', 'last_name', 'email', 'phone_number',
      'national_id', 'date_of_birth', 'gender', 'county'
    ]
    const filledPersonalFields = personalFields.filter(field => user[field]).length
    console.log(`Personal details: ${filledPersonalFields}/9 fields filled`)
    if (filledPersonalFields >= 7) completedSteps++

    // Step 2: Academic Qualifications (required - at least one)
    const hasAcademicQualifications = user.academic_qualifications && user.academic_qualifications.length > 0
    console.log(`Academic qualifications: ${hasAcademicQualifications ? 'present' : 'missing'}`)
    if (hasAcademicQualifications) completedSteps++

    // Step 3: Professional Qualifications (optional - only count if filled)
    const hasProfessionalQualifications = user.professional_qualifications && user.professional_qualifications.length > 0
    console.log(`Professional qualifications: ${hasProfessionalQualifications ? 'present' : 'missing'}`)
    if (hasProfessionalQualifications) completedSteps++

    // Step 4: Professional Bodies (optional - only count if filled)
    const hasProfessionalBodies = user.professional_bodies && user.professional_bodies.length > 0
    console.log(`Professional bodies: ${hasProfessionalBodies ? 'present' : 'missing'}`)
    if (hasProfessionalBodies) completedSteps++

    // Step 5: Work Experience (required - at least one)
    // Check for JSON field work_experiences/workExperiences or related model data
    const hasExperience = (user.work_experiences && user.work_experiences.length > 0) ||
                          (user.workExperiences && user.workExperiences.length > 0) ||
                          (user.experiences && user.experiences.length > 0) ||
                          (user.work_experience > 0) || // Check if work_experience years > 0
                          (user.workExperience > 0) // Check camelCase version
    console.log(`Work experience: ${hasExperience ? 'present' : 'missing'}`, {
      work_experiences: user.work_experiences,
      workExperiences: user.workExperiences,
      experiences: user.experiences,
      work_experience: user.work_experience,
      workExperience: user.workExperience
    })
    if (hasExperience) completedSteps++

    // Step 6: Referees (required - exactly 3)
    const hasReferees = user.referees && user.referees.length >= 3
    console.log(`Referees: ${hasReferees ? '3 or more' : 'less than 3'}`)
    if (hasReferees) completedSteps++

    // Step 7: Attachments (required - CV, National ID, KRA PIN)
    const hasAttachments = user.attachments && user.attachments.length >= 3
    console.log(`Attachments: ${hasAttachments ? '3 or more' : 'less than 3'}`)
    if (hasAttachments) completedSteps++

    // Step 8: Declaration (required - all checkboxes)
    const hasDeclaration = (user.declaration1 || user.declaration?.declaration1) && 
                          (user.declaration2 || user.declaration?.declaration2) && 
                          (user.declaration3 || user.declaration?.declaration3) &&
                          (user.declaration_date || user.declarationDate || user.declaration?.declarationDate) && 
                          (user.place_of_declaration || user.placeOfDeclaration || user.declaration?.placeOfDeclaration)
    console.log(`Declaration: ${hasDeclaration ? 'complete' : 'incomplete'}`, {
      declaration1: user.declaration1,
      declaration2: user.declaration2,
      declaration3: user.declaration3,
      declaration_date: user.declaration_date,
      declarationDate: user.declarationDate,
      place_of_declaration: user.place_of_declaration,
      placeOfDeclaration: user.placeOfDeclaration
    })
    if (hasDeclaration) completedSteps++

    const percentage = Math.round((completedSteps / totalSteps) * 100)
    console.log(`Profile completion: ${completedSteps}/${totalSteps} = ${percentage}%`)

    return percentage
  }

  const checkProfileCompletion = (minCompletion = 100) => {
    const completion = calculateProfileCompletion(state.user)
    dispatch({
      type: 'UPDATE_PROFILE_COMPLETION',
      payload: completion,
    })
    return completion
  }

  const isProfileComplete = (minCompletion = 100) => {
    const completion = checkProfileCompletion(minCompletion)
    // Also check if profile has been confirmed/submitted
    const isConfirmed = state.user?.profile_status === 'confirmed'
    console.log('Profile completion check:', { completion, minCompletion, isConfirmed, passes: completion >= minCompletion && isConfirmed })
    return completion >= minCompletion && isConfirmed
  }

  const getSectionCompletion = (section) => {
    if (!state.user) return 0

    const user = state.user
    
    switch (section) {
      case 'personal':
        const personalFields = ['first_name', 'last_name', 'email', 'phone', 'national_id', 'date_of_birth', 'gender', 'county', 'address']
        const completedPersonal = personalFields.filter(field => user[field]).length
        return Math.round((completedPersonal / personalFields.length) * 100)
      
      case 'education':
        const educationFields = ['education']
        const hasEducation = user.education && user.education.length > 0
        return hasEducation ? 100 : 0
      
      case 'documents':
        const requiredDocuments = ['cv', 'national_id', 'degree_certificate']
        const userDocuments = user.documents || []
        const completedDocs = requiredDocuments.filter(docType => 
          userDocuments.some(doc => doc.category === docType || doc.type === docType)
        ).length
        return Math.round((completedDocs / requiredDocuments.length) * 100)
      
      default:
        return 0
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    calculateProfileCompletion,
    checkProfileCompletion,
    isProfileComplete,
    getSectionCompletion,
    dispatch,
  }

  const handleContinueSession = () => {
    resetIdleTimer()
    setShowWarning(false)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showWarning && (
        <SessionTimeoutWarning
          onLogout={logout}
          onContinue={handleContinueSession}
        />
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
