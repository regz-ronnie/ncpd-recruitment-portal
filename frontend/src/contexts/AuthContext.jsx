import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
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
      }
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
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

  // Load tokens from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    const user = localStorage.getItem('user')

    if (token && refreshToken && user) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: JSON.parse(user),
          access: token,
          refresh: refreshToken,
        }
      })
    }
  }, [])

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      const response = await authAPI.login({ email, password })
      const data = response.data

      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data,
      })
      
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
      
      const response = await authAPI.register(userData)
      const data = response.data

      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: {
          user: data.user,
          token: data.access,
          refreshToken: data.refresh,
        }
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

  const logout = async () => {
    // JWT logout is just clearing tokens from browser
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    
    dispatch({ type: 'LOGOUT' })
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
      
      return { success: true, data }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Profile update failed'
      return { success: false, error: errorMessage }
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    dispatch,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
