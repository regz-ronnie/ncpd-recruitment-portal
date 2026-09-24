import axios from 'axios'

// Point directly to backend server (port 8000) instead of frontend dev server (port 3000)
// Get the host from current location and replace port with backend port
const getBackendURL = () => {
  const host = window.location.hostname
  const backendPort = 8000
  return `http://${host}:${backendPort}/api/v1/`
}

const API_BASE_URL = import.meta.env.VITE_API_URL || getBackendURL()

console.log('API Base URL:', API_BASE_URL)

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
    // Public endpoints that don't require authentication (more specific matching)
    const publicEndpoints = [
      'jobs/', 
      'vacancies/', 
      'register', 
      'login',
      'auth/token/'
    ]
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint) && !config.url?.includes('hr/')
    )
    
    // Only add auth token for protected endpoints
    const token = localStorage.getItem('access_token')
    if (token && !isPublicEndpoint) {
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
  (response) => {
    // Log response data for debugging
    console.log('✅ API Response:', response.config.url, response.data)
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    console.log('❌ API Error:', error.config?.url, error.response?.status, error.message)
    
    // Prevent infinite refresh loops
    if (originalRequest.__isRetry) {
      return Promise.reject(error)
    }
    
    if (error.response?.status === 401) {
      const isPublicRequest = ['/v1/jobs/', '/v1/jobs', '/v1/vacancies/', '/v1/vacancies'].some((route) =>
        originalRequest.url?.includes(route)
      )

      if (isPublicRequest) {
        return Promise.reject(error)
      }

      // Allow token refresh for profile update requests (but not GET profile requests during initial load)
      const isProfileUpdateRequest = originalRequest.url?.includes('auth/profile/update/')
      const isProfileGetRequest = originalRequest.url?.includes('auth/profile/') && originalRequest.method === 'get'

      if (isProfileGetRequest) {
        console.log('⚠️ Profile GET request failed - will not auto-redirect to preserve auth state')
        return Promise.reject(error)
      }

      // Allow auto-refresh for profile update requests
      if (isProfileUpdateRequest) {
        console.log('🔄 Profile update request failed - attempting token refresh')
      }

      console.log('🔄 Attempting token refresh...')
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          // Use full backend URL for token refresh
          const refreshResponse = await axios.post(`${API_BASE_URL}auth/token/refresh/`, {
            refresh: refreshToken
          })
          
          const { access } = refreshResponse.data
          localStorage.setItem('access_token', access)
          console.log('✅ Token refresh successful')
          
          // Mark request as retry to prevent infinite loops
          originalRequest.__isRetry = true
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.log('❌ Token refresh failed:', refreshError)
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        sessionStorage.removeItem('sessionStartTime')
        sessionStorage.removeItem('lastActivity')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api

// API endpoints
export const authAPI = {
  getCaptcha: () => api.get('auth/captcha/'),
  register: (userData) => api.post('auth/register/', userData),
  login: (credentials) => api.post('auth/login/', credentials),
  verifyOtpAndLogin: (data) => api.post('auth/verify-otp-login/', data),
  profile: () => api.get('auth/profile/'),
  updateProfile: (userData) => api.put('auth/profile/update/', userData),
  enable2FA: () => api.post('auth/2fa/enable/'),
  disable2FA: () => api.post('auth/2fa/disable/'),
  verify2FASetup: (otpCode) => api.post('auth/2fa/verify-setup/', { otp_code: otpCode }),
  forgotPassword: (email) => api.post('auth/forgot-password/', { email }),
  resetPassword: (data) => api.post('auth/reset-password/', data),
}

export const jobsAPI = {
  getJobs: (params = {}) => {
    const endpoint = 'jobs/'
    console.log('API Call:', API_BASE_URL + endpoint, params)
    return api.get(endpoint, { params }).catch(error => {
      console.error(`Failed to fetch jobs from ${endpoint}:`, error.response?.status, error.message)
      throw error
    })
  },
  getJob: (id) => {
    const endpoint = `jobs/${id}/`
    console.log('API Call:', API_BASE_URL + endpoint)
    return api.get(endpoint).catch(error => {
      console.error(`Failed to fetch job ${id} from ${endpoint}:`, error.response?.status, error.message)
      throw error
    })
  },
  applyForJob: (jobId) => {
    const endpoint = `jobs/${jobId}/apply/`
    console.log('API Call:', API_BASE_URL + endpoint)
    return api.post(endpoint).catch(error => {
      console.error(`Failed to apply for job ${jobId}:`, error.response?.status, error.message)
      throw error
    })
  },
  createJob: (jobData) => {
    const endpoint = 'jobs/'
    console.log('API Call:', API_BASE_URL + endpoint, 'POST', jobData)
    return api.post(endpoint, jobData).catch(error => {
      console.error(`Failed to create job:`, error.response?.status, error.message)
      throw error
    })
  },
  updateJob: (id, jobData) => {
    const endpoint = `jobs/${id}/`
    console.log('API Call:', API_BASE_URL + endpoint, 'PUT', jobData)
    return api.put(endpoint, jobData).catch(error => {
      console.error(`Failed to update job ${id}:`, error.response?.status, error.message)
      throw error
    })
  },
  deleteJob: (id) => {
    const endpoint = `jobs/${id}/`
    console.log('API Call:', API_BASE_URL + endpoint, 'DELETE')
    return api.delete(endpoint).catch(error => {
      console.error(`Failed to delete job ${id}:`, error.response?.status, error.message)
      throw error
    })
  },
}

export const applicationsAPI = {
  getMyApplications: () => api.get('applications/my_applications/'),
  getApplication: (id) => api.get(`applications/${id}/`),
  updateApplication: (id, data) => api.put(`applications/${id}/`, data),
  submitApplication: (data) => api.post('applications/', data),
  applyForJob: (jobId, data) => api.post(`jobs/${jobId}/apply/`, data),
}

export const userAPI = {
  getProfile: () => api.get('auth/profile/'),
  updateProfile: (data) => api.put('auth/profile/update/', data),
  getSkills: () => api.get('users/skills/'),
  addSkill: (data) => api.post('users/skills/', data),
  updateSkill: (id, data) => api.put(`users/skills/${id}/`, data),
  deleteSkill: (id) => api.delete(`users/skills/${id}/`),
  getExperience: () => api.get('users/experience/'),
  addExperience: (data) => api.post('users/experience/', data),
  updateExperience: (id, data) => api.put(`users/experience/${id}/`, data),
  deleteExperience: (id) => api.delete(`users/experience/${id}/`),
  getCertifications: () => api.get('users/certifications/'),
  addCertification: (data) => api.post('users/certifications/', data),
  updateCertification: (id, data) => api.put(`users/certifications/${id}/`, data),
  deleteCertification: (id) => api.delete(`users/certifications/${id}/`),
}

// Admin access API
export const adminAPI = {
  checkAdminAccess: () => api.get('users/admin-access/'),
  listUsers: (params = {}) => api.get('users/admin/users/', { params }),
  getUser: (id) => api.get(`users/admin/users/${id}/`),
  createUser: (data) => api.post('users/admin/users/', data),
  updateUser: (id, data) => api.put(`users/admin/users/${id}/`, data),
  partialUpdateUser: (id, data) => api.patch(`users/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`users/admin/users/${id}/`),
}

// AI Engine endpoints
export const aiAPI = {
  // Insights
  getInsights: () => api.get('ai-engine/insights/'),
  generateInsights: (data) => api.post('ai-engine/insights/', data),
  
  // CV Parsing
  parseCV: (file, jobId) => {
    const formData = new FormData()
    formData.append('file', file)
    if (jobId) {
      formData.append('job_id', jobId)
    }
    return api.post('ai-engine/cv-parsing/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  // AI Matching
  getMatchingResults: () => api.get('ai-engine/matching-results/'),
  triggerMatching: (data) => api.post('ai-engine/matching-results/', data),
}

export const normalizeApplicationRecord = (application) => {
  if (!application || typeof application !== 'object') {
    return application
  }

  const applicant = application.applicant || application.user || application.profile || {}
  
  // Handle both snake_case and camelCase field names from backend
  const firstName = applicant.first_name || applicant.firstName || ''
  const lastName = applicant.last_name || applicant.lastName || applicant.surname || ''
  const applicantName = application.applicant_name || application.name || 
    [firstName, lastName].filter(Boolean).join(' ') || 'Unnamed applicant'

  // Get highest education from academic_qualifications if available, otherwise use highest_education field
  const academicQuals = applicant.academic_qualifications || applicant.academicQualifications || []
  let highestEduLevel = applicant.highest_education || applicant.highestEducation || applicant.education_level || 'N/A'
  
  // If academic qualifications exist and have data, use the highest level from there
  if (academicQuals && academicQuals.length > 0) {
    const educationLevels = ['phd', 'doctorate', 'master', 'bachelor', 'diploma', 'certificate', 'high school', 'professional certification']
    const foundLevels = academicQuals
      .map(q => {
        // Check for the 'degree' field which contains the actual education level
        const degreeText = (q.degree || q.qualification || q.level || q.qualification_level || '').toLowerCase()
        return degreeText
      })
      .filter(level => educationLevels.some(eduLevel => level.includes(eduLevel)))
    
    if (foundLevels.length > 0) {
      // Get the highest education level found
      for (const level of educationLevels) {
        if (foundLevels.some(found => found.includes(level))) {
          highestEduLevel = level
          break
        }
      }
    }
  }

  return {
    ...application,
    ...applicant, // Spread applicant fields to get all user data
    id: application.id,
    name: applicantName,
    applicant_name: application.applicant_name || applicantName,
    first_name: firstName,
    last_name: lastName,
    email: application.email || applicant.email || applicant.user?.email || '',
    phone: application.phone || applicant.phone_number || applicant.phone || applicant.phoneNumber || '',
    location: application.location || [applicant.city, applicant.county].filter(Boolean).join(', ') || '',
    status: application.status || application.application_status || 'submitted',
    submitted_date: application.submitted_date || application.created_at || application.updated_at || null,
    timeline: Array.isArray(application.timeline) ? application.timeline : [],
    days_in_status: application.days_in_status ?? 0,
    total_days: application.total_days ?? 0,
    // Education and experience fields - prioritize academic_qualifications data
    education_level: highestEduLevel,
    experience_years: applicant.years_of_experience || applicant.yearsOfExperience || applicant.work_experience || applicant.workExperience || 0,
    county: applicant.county || applicant.county_of_residence || applicant.countyOfResidence || 'N/A',
    gender: applicant.gender === 'M' ? 'male' : applicant.gender === 'F' ? 'female' : applicant.gender === 'O' ? 'other' : applicant.gender?.toLowerCase() || 'N/A',
    disability_status: applicant.disability ? 'yes' : 'no',
    certifications: applicant.professional_qualifications || applicant.professionalQualifications || [],
    employment_type: application.employment_type || application.job?.employment_type || 'N/A',
    // Normalized education level for filtering
    education_level_normalized: highestEduLevel.toLowerCase().replace(/[_\s]/g, ''),
    // Normalized employment type for filtering
    employment_type_normalized: (application.employment_type || application.job?.employment_type || '').toLowerCase().replace(/[_\s]/g, ''),
    academic_qualifications: applicant.academic_qualifications || applicant.academicQualifications || [],
    work_experiences: applicant.work_experiences_json || applicant.workExperiences || applicant.work_experiences || [],
    referees: applicant.referees || [],
    attachments: applicant.attachments || [],
    // ID/Passport fields - check both snake_case and camelCase
    national_id: applicant.national_id || applicant.id_number || applicant.idNumber || applicant.nationalId || '',
    passport_no: applicant.passport_no || applicant.passportNo || '',
    date_of_birth: applicant.date_of_birth || applicant.dateOfBirth || null,
    age: applicant.date_of_birth || applicant.dateOfBirth ? 
      (() => {
        const dob = new Date(applicant.date_of_birth || applicant.dateOfBirth)
        const today = new Date()
        return today.getFullYear() - dob.getFullYear() - 
          ((today.getMonth() < dob.getMonth() || 
           (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) ? 1 : 0)
      })() : null,
  }
}

export const normalizeApplicationList = (payload) => {
  if (Array.isArray(payload)) {
    return payload.map(normalizeApplicationRecord)
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  const list = payload.results || payload.applications || payload.data || []
  if (Array.isArray(list)) {
    return list.map(normalizeApplicationRecord)
  }

  return []
}

export const normalizeUserRecord = (user) => {
  if (!user || typeof user !== 'object') {
    return user
  }

  const fullName = [
    user.first_name,
    user.last_name,
    user.firstName,
    user.lastName,
    user.name,
    user.username,
  ].filter(Boolean).join(' ') || 'Unnamed user'

  // Handle date fields - Django AbstractUser has date_joined, our custom model has created_at
  const dateJoined = user.date_joined || user.created_at || user.submitted_date || null
  const dob = user.date_of_birth || user.dateOfBirth || null

  return {
    ...user,
    id: user.id,
    name: fullName,
    first_name: user.first_name || user.firstName || '',
    last_name: user.last_name || user.lastName || '',
    email: user.email || '',
    phone_number: user.phone_number || user.phone || '',
    county: user.county || user.location || '',
    status: user.status || 'submitted',
    ai_score: user.ai_score || 0,
    experience_years: user.experience_years || user.experience || 0,
    education_level: user.education_level || '',
    gender: user.gender === 'M' ? 'male' : user.gender === 'F' ? 'female' : user.gender === 'O' ? 'other' : user.gender?.toLowerCase() || '',
    disability_status: user.disability_status || '',
    submitted_date: dateJoined,
    date_joined: dateJoined, // Explicitly include date_joined for the table
    date_of_birth: dob,
    age: dob ? (() => {
      const birthDate = new Date(dob)
      const today = new Date()
      return today.getFullYear() - birthDate.getFullYear() - 
        ((today.getMonth() < birthDate.getMonth() || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) ? 1 : 0)
    })() : null,
    job: user.job || user.current_job || {},
  }
}

export const normalizeUserList = (payload) => {
  if (Array.isArray(payload)) {
    return payload.map(normalizeUserRecord)
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  const list = payload.results || payload.users || payload.data || []
  if (Array.isArray(list)) {
    return list.map(normalizeUserRecord)
  }

  return []
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
  deleteVacancy: (id) => api.delete(`/hr/vacancies/${id}/`),
  cloneVacancy: (id) => api.post(`/hr/vacancies/${id}/clone/`),
  publishVacancy: (id) => api.patch(`/hr/vacancies/${id}/`, { status: 'published' }).then(async (response) => {
    // After publishing to HR, also sync to public jobs API
    try {
      const vacancyData = response.data
      // Map HR vacancy fields to public job fields
      const jobData = {
        title: vacancyData.title,
        description: vacancyData.description,
        department: vacancyData.department,
        location: vacancyData.location,
        employment_type: vacancyData.employment_type,
        positions: vacancyData.positions,
        application_deadline: vacancyData.application_deadline || vacancyData.deadline,
        requirements: vacancyData.requirements,
        responsibilities: vacancyData.responsibilities,
        qualifications: vacancyData.qualifications,
        reference_no: vacancyData.reference_no,
        job_grade: vacancyData.job_grade,
        status: vacancyData.status,
        hr_vacancy_id: vacancyData.id // Link back to HR vacancy
      }
      // Try to sync, but don't fail if it doesn't work
      // The backend should handle this automatically or jobs API might not support POST
      try {
        await api.post('jobs/', jobData)
        console.log('Successfully synced vacancy to public jobs API')
      } catch (syncError) {
        console.warn('Sync to public jobs API failed (this may be expected):', syncError.response?.status)
        // Continue without failing the publish operation
      }
    } catch (error) {
      console.error('Error during vacancy sync process:', error)
    }
    return response
  }),
  closeVacancy: (id) => api.patch(`/hr/vacancies/${id}/`, { status: 'closed' }).then(async (response) => {
    // Sync status change to public jobs API
    try {
      const vacancyData = response.data
      // Find and update corresponding job by hr_vacancy_id
      const jobsResp = await api.get('jobs/', { params: { hr_vacancy_id: id } })
      const jobs = jobsResp.data?.results || []
      if (jobs.length > 0) {
        await api.patch(`jobs/${jobs[0].id}/`, { status: 'closed' })
        console.log('Successfully synced vacancy status to public jobs API')
      }
    } catch (error) {
      console.error('Failed to sync vacancy status to public jobs API:', error)
    }
    return response
  }),
  archiveVacancy: (id) => api.patch(`/hr/vacancies/${id}/`, { status: 'archived' }).then(async (response) => {
    // Sync status change to public jobs API
    try {
      const vacancyData = response.data
      const jobsResp = await api.get('jobs/', { params: { hr_vacancy_id: id } })
      const jobs = jobsResp.data?.results || []
      if (jobs.length > 0) {
        await api.patch(`jobs/${jobs[0].id}/`, { status: 'archived' })
        console.log('Successfully synced vacancy status to public jobs API')
      }
    } catch (error) {
      console.error('Failed to sync vacancy status to public jobs API:', error)
    }
    return response
  }),

  // User management
  listUsers: async (params = {}) => {
    try {
      return await api.get('/hr/users/', { params })
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        return api.get('/users/', { params })
      }
      throw error
    }
  },

  // Application management
  listApplications: async (params = {}) => {
    try {
      return await api.get('/hr/applications/', { params })
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        return api.get('/applications/', { params })
      }
      throw error
    }
  },
  getApplication: (id) => api.get(`/hr/applications/${id}/`),
  createApplication: async (data) => {
    try {
      return await api.post('/hr/applications/', data)
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        return api.post('/applications/', data)
      }
      throw error
    }
  },
  updateApplication: async (id, data) => {
    try {
      return await api.put(`/hr/applications/${id}/`, data)
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        return api.put(`/applications/${id}/`, data)
      }
      throw error
    }
  },
  deleteApplication: async (id) => {
    try {
      return await api.delete(`/hr/applications/${id}/`)
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        return api.delete(`/applications/${id}/`)
      }
      throw error
    }
  },
  updateApplicationStatus: async (id, data) => {
    try {
      return await api.patch(`/hr/applications/${id}/`, data)
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        return api.patch(`/applications/${id}/status/`, data)
      }
      throw error
    }
  },
  
  // Recruitment workflow actions
  shortlistApplication: (id, data = {}) => api.post(`/applications/${id}/shortlist/`, data),
  moveToInterview: (id, data = {}) => api.post(`/applications/${id}/move_to_interview/`, data),
  completeInterview: (id, data = {}) => api.post(`/applications/${id}/complete_interview/`, data),
  extendOffer: (id, data = {}) => api.post(`/applications/${id}/extend_offer/`, data),
  acceptOffer: (id, data = {}) => api.post(`/applications/${id}/accept_offer/`, data),
  declineOffer: (id, data = {}) => api.post(`/applications/${id}/decline_offer/`, data),
  rejectApplication: (id, data = {}) => api.post(`/applications/${id}/reject/`, data),
  getPipeline: () => api.get('/applications/by_status/'),
  addTimelineEvent: async (applicationId, data) => {
    try {
      return await api.post(`/hr/applications/${applicationId}/timeline/`, data)
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        return api.post(`/applications/${applicationId}/timeline/`, data)
      }
      throw error
    }
  },
  bulkUpdateStatus: (data) => api.post('/hr/applications/bulk-update/', data),

  // Shortlisting / scoring
  triggerShortlist: (vacancyId) => api.post(`/hr/vacancies/${vacancyId}/shortlist/`),
  getShortlist: (vacancyId) => api.get(`/hr/vacancies/${vacancyId}/shortlist/`),
  updateCriteriaWeights: (vacancyId, data) => api.put(`/hr/vacancies/${vacancyId}/criteria/`, data),
  exportLonglist: (vacancyId, format = 'excel') => api.get(`/hr/vacancies/${vacancyId}/longlist/export/?format=${format}`, { responseType: 'blob' }),

  // Eligibility screening
  screenEligibility: (applicationId) => api.post(`/hr/applications/${applicationId}/screen-eligibility/`),
  getEligibilityReport: (vacancyId) => api.get(`/hr/vacancies/${vacancyId}/eligibility-report/`),

  // Document verification
  verifyDocuments: (applicationId) => api.post(`/hr/applications/${applicationId}/verify-documents/`),
  getDocumentStatus: (applicationId) => api.get(`/hr/applications/${applicationId}/documents/`),
  requestDocument: (applicationId, data) => api.post(`/hr/applications/${applicationId}/request-document/`, data),

  // Interviews
  listInterviews: (params = {}) => api.get('/hr/interviews/', { params }),
  createInterview: (data) => api.post('/hr/interviews/', data),
  getInterview: (id) => api.get(`/hr/interviews/${id}/`),
  updateInterview: (id, data) => api.put(`/hr/interviews/${id}/`, data),
  submitInterviewScore: (interviewId, data) => api.post(`/hr/interviews/${interviewId}/submit-score/`, data),
  scheduleInterview: (data) => api.post('/hr/interviews/schedule/', data),

  // Panel management
  listPanels: async (params = {}) => {
    try {
      return await api.get('/hr/panels/', { params })
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        return api.get('/panels/', { params })
      }
      throw error
    }
  },
  createPanel: (data) => api.post('/hr/panels/', data),
  getPanel: (id) => api.get(`/hr/panels/${id}/`),
  updatePanel: (id, data) => api.put(`/hr/panels/${id}/`),
  deletePanel: (id) => api.delete(`/hr/panels/${id}/`),
  addPanelMember: (panelId, data) => api.post(`/hr/panels/${panelId}/members/`, data),
  removePanelMember: (panelId, memberId) => api.delete(`/hr/panels/${panelId}/members/${memberId}/`),

  // Approval workflow
  submitForApproval: (vacancyId, data) => api.post(`/hr/vacancies/${vacancyId}/submit-approval/`, data),
  approveVacancy: (vacancyId, data) => api.post(`/hr/vacancies/${vacancyId}/approve/`, data),
  rejectVacancy: (vacancyId, data) => api.post(`/hr/vacancies/${vacancyId}/reject/`, data),
  getApprovalStatus: (vacancyId) => api.get(`/hr/vacancies/${vacancyId}/approval-status/`),

  // Bulk communication
  sendBulkEmail: (data) => api.post('/hr/communication/send-bulk/', data),
  getEmailTemplates: () => api.get('/hr/communication/templates/'),
  getEmailTemplate: (id) => api.get(`/hr/communication/templates/${id}/`),
  updateEmailTemplate: (id, data) => api.put(`/hr/communication/templates/${id}/`, data),

  // Reports & audit
  getReports: (params = {}) => api.get('/hr/reports/', { params }),
  getAuditLogs: (params = {}) => api.get('/hr/audit-logs/', { params }),
  getAnalytics: (params = {}) => api.get('/hr/analytics/', { params }),
  exportReport: (reportType, params) => api.get(`/hr/reports/${reportType}/export/`, { params, responseType: 'blob' }),
}
