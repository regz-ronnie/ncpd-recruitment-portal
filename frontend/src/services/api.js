import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.95:8000/api/'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  'Accept': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401) {
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          })
          
          const { access } = response.data
          localStorage.setItem('access_token', access)
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api

// API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  profile: () => api.get('/auth/profile/'),
  updateProfile: (userData) => api.put('/auth/profile/update/', userData),
}

export const jobsAPI = {
  getJobs: (params = {}) => api.get('/v1/jobs/', { params }),
  getJob: (id) => api.get(`/v1/jobs/${id}/`),
  applyForJob: (jobId) => api.post(`/v1/jobs/${jobId}/apply/`),
}

export const applicationsAPI = {
  getMyApplications: () => api.get('/v1/applications/'),
  getApplication: (id) => api.get(`/v1/applications/${id}/`),
  updateApplication: (id, data) => api.put(`/v1/applications/${id}/`, data),
}

export const userAPI = {
  getProfile: () => api.get('/v1/auth/profile/'),
  updateProfile: (data) => api.put('/v1/auth/profile/update/', data),
  getSkills: () => api.get('/v1/users/skills/'),
  addSkill: (data) => api.post('/v1/users/skills/', data),
  updateSkill: (id, data) => api.put(`/v1/users/skills/${id}/`, data),
  deleteSkill: (id) => api.delete(`/v1/users/skills/${id}/`),
  getExperience: () => api.get('/v1/users/experience/'),
  addExperience: (data) => api.post('/v1/users/experience/', data),
  updateExperience: (id, data) => api.put(`/v1/users/experience/${id}/`, data),
  deleteExperience: (id) => api.delete(`/v1/users/experience/${id}/`),
  getCertifications: () => api.get('/v1/users/certifications/'),
  addCertification: (data) => api.post('/v1/users/certifications/', data),
  updateCertification: (id, data) => api.put(`/v1/users/certifications/${id}/`, data),
  deleteCertification: (id) => api.delete(`/v1/users/certifications/${id}/`),
}

// AI Engine endpoints
export const aiAPI = {
  // Insights
  getInsights: () => api.get('/ai-engine/insights/'),
  generateInsights: (data) => api.post('/ai-engine/insights/', data),
  
  // CV Parsing
  parseCV: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/ai-engine/cv-parsing/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  // AI Matching
  getMatchingResults: () => api.get('/ai-engine/matching-results/'),
  triggerMatching: (data) => api.post('/ai-engine/matching-results/', data),
}

// HR / Admin endpoints
export const hrAPI = {
  // Dashboard summary
  getSummary: () => api.get('/hr/summary/'),

  // Vacancy management
  listVacancies: (params = {}) => api.get('/hr/vacancies/', { params }),
  getVacancy: (id) => api.get(`/hr/vacancies/${id}/`),
  createVacancy: (data) => api.post('/hr/vacancies/', data),
  updateVacancy: (id, data) => api.put(`/hr/vacancies/${id}/`, data),
  publishVacancy: (id) => api.post(`/hr/vacancies/${id}/publish/`),
  closeVacancy: (id) => api.post(`/hr/vacancies/${id}/close/`),
  archiveVacancy: (id) => api.post(`/hr/vacancies/${id}/archive/`),

  // Application management
  listApplications: (params = {}) => api.get('/hr/applications/', { params }),
  getApplication: (id) => api.get(`/hr/applications/${id}/`),
  updateApplicationStatus: (id, data) => api.patch(`/hr/applications/${id}/`, data),

  // Shortlisting / scoring
  triggerShortlist: (vacancyId) => api.post(`/hr/vacancies/${vacancyId}/shortlist/`),
  getShortlist: (vacancyId) => api.get(`/hr/vacancies/${vacancyId}/shortlist/`),

  // Interviews
  listInterviews: (params = {}) => api.get('/hr/interviews/', { params }),
  createInterview: (data) => api.post('/hr/interviews/', data),
  getInterview: (id) => api.get(`/hr/interviews/${id}/`),

  // Reports & audit
  getReports: (params = {}) => api.get('/hr/reports/', { params }),
  getAuditLogs: (params = {}) => api.get('/hr/audit-logs/', { params }),
}
