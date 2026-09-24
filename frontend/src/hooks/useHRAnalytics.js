import { useQuery } from 'react-query'
import api, { hrAPI, normalizeApplicationList } from '../services/api'

export function useHRAnalytics() {
  // Fetch all applications for HR analytics
  const applications = useQuery(
    'hr-applications',
    async () => {
      const response = await hrAPI.listApplications()
      console.log('HR Applications API response:', response)
      const normalizedData = normalizeApplicationList(response.data)
      return normalizedData
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Fetch all vacancies/jobs for HR analytics
  const vacancies = useQuery(
    'hr-vacancies',
    async () => {
      const response = await hrAPI.listVacancies()
      console.log('HR Vacancies API response:', response)
      return response.data.results || response.data || []
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Fetch HR analytics/metrics from backend
  const metrics = useQuery(
    'hr-metrics',
    async () => {
      try {
        const response = await hrAPI.getAnalytics()
        console.log('HR Metrics API response:', response)
        return response.data
      } catch (error) {
        console.log('HR Metrics endpoint not available, using calculated metrics')
        return null
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Calculate derived metrics if API metrics not available
  const calculatedMetrics = applications.data ? {
    total: applications.data.length,
    activeJobs: vacancies.data?.length || 0,
    avgTimeToHire: calculateAvgTimeToHire(applications.data),
    interviewRate: calculateInterviewRate(applications.data),
    offerAcceptanceRate: calculateOfferAcceptanceRate(applications.data),
    diversityScore: calculateDiversityScore(applications.data),
    conversionRate: calculateConversionRate(applications.data),
    avgScore: calculateAvgScore(applications.data),
  } : {}

  // Normalize education levels from backend display labels
  const normalizedApplications = applications.data ? applications.data.map(app => ({
    ...app,
    highest_education: normalizeEducationLevel(
      app.highest_education_display || app.highest_education,
      app.academic_qualifications || app.academicQualifications || []
    )
  })) : []

  return {
    applications: normalizedApplications,
    vacancies: vacancies.data || [],
    metrics: metrics.data || calculatedMetrics,
    isLoading: applications.isLoading || vacancies.isLoading || metrics.isLoading,
    error: applications.error || vacancies.error || metrics.error,
    refetch: () => {
      applications.refetch()
      vacancies.refetch()
      metrics.refetch()
    }
  }
}

// Helper function to normalize education levels - prioritizes academic qualifications
function normalizeEducationLevel(level, academicQuals = []) {
  if (!level) return 'Other'
  
  // First, check if we have academic qualifications - they take priority
  if (academicQuals && academicQuals.length > 0) {
    const foundLevels = academicQuals
      .map(q => {
        const degreeText = (q.degree || q.qualification || q.level || q.qualification_level || '').trim()
        if (!degreeText) return null
        
        const normalizedText = degreeText.toLowerCase()
        if (normalizedText.includes('phd') || normalizedText.includes('doctorate')) return 'PhD'
        if (normalizedText.includes('master')) return 'Master Degree'
        if (normalizedText.includes('bachelor')) return 'Bachelor Degree'
        if (normalizedText.includes('diploma')) return 'Diploma'
        if (normalizedText.includes('professional certification') || normalizedText.includes('professional')) return 'Professional Certification'
        if (normalizedText.includes('certificate')) return 'Certificate'
        // Skip high school in academic qualifications
        if (normalizedText.includes('high school') || normalizedText.includes('secondary') || normalizedText.includes('kcse')) return null
        return degreeText
      })
      .filter(Boolean)
    
    if (foundLevels.length > 0) {
      const educationPriority = ['PhD', 'Master Degree', 'Bachelor Degree', 'Diploma', 'Professional Certification', 'Certificate']
      for (const priorityLevel of educationPriority) {
        if (foundLevels.some(found => found === priorityLevel)) {
          return priorityLevel
        }
      }
      return foundLevels[0]
    }
  }
  
  // Second, use the personal education field, but exclude high school
  const levelMap = {
    'Diploma': 'Diploma',
    'Bachelor Degree': 'Bachelor Degree',
    'Master Degree': 'Master Degree',
    'PhD': 'PhD',
    'Professional Certification': 'Professional Certification',
    'Certificate': 'Certificate',
    'Other': 'Other',
    'Unknown': 'Other',
    // Exclude high school for high-level recruitment
    'High School': 'Other'
  }
  
  const normalized = levelMap[level] || level
  // Double-check for high school variants
  if (typeof normalized === 'string' && normalized.toLowerCase().includes('high school')) {
    return 'Other'
  }
  
  return normalized
}

// Helper functions to calculate metrics
function calculateAvgTimeToHire(applications) {
  const hiredApps = applications.filter(app => 
    ['offer_accepted', 'hired'].includes(app.status)
  )
  if (hiredApps.length === 0) return 0
  
  const totalDays = hiredApps.reduce((sum, app) => {
    const submitted = new Date(app.submitted_date || app.created_at)
    const hired = new Date(app.updated_at)
    const days = Math.floor((hired - submitted) / (1000 * 60 * 60 * 24))
    return sum + (days > 0 ? days : 0)
  }, 0)
  
  return Math.round(totalDays / hiredApps.length)
}

function calculateInterviewRate(applications) {
  if (applications.length === 0) return 0
  const interviewed = applications.filter(app => 
    ['interview_scheduled', 'interview_completed'].includes(app.status)
  ).length
  return Math.round((interviewed / applications.length) * 100)
}

function calculateOfferAcceptanceRate(applications) {
  const offers = applications.filter(app => 
    ['offer_extended', 'offer_accepted', 'offer_declined'].includes(app.status)
  )
  if (offers.length === 0) return 0
  
  const accepted = offers.filter(app => app.status === 'offer_accepted').length
  return Math.round((accepted / offers.length) * 100)
}

function calculateDiversityScore(applications) {
  if (applications.length === 0) return 0
  
  // Gender diversity (aim for ~50% female)
  const femaleCount = applications.filter(app => app.gender === 'female').length
  const genderScore = 100 - Math.abs(50 - (femaleCount / applications.length) * 100)
  
  // Geographic diversity (unique counties)
  const uniqueCounties = new Set(applications.map(app => app.county).filter(Boolean)).size
  const geoScore = Math.min((uniqueCounties / 10) * 100, 100) // Normalize to 10 counties
  
  // Overall diversity score (average of components)
  return Math.round((genderScore + geoScore) / 2)
}

function calculateConversionRate(applications) {
  if (applications.length === 0) return 0
  const hired = applications.filter(app => 
    ['offer_accepted', 'hired'].includes(app.status)
  ).length
  return Math.round((hired / applications.length) * 100)
}

function calculateAvgScore(applications) {
  const scoredApps = applications.filter(app => app.ai_score || app.total_score)
  if (scoredApps.length === 0) return 0
  
  const totalScore = scoredApps.reduce((sum, app) => {
    return sum + (app.ai_score || app.total_score || 0)
  }, 0)
  
  return Math.round(totalScore / scoredApps.length)
}