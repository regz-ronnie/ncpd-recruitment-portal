import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApplications } from '../hooks/useApplications'
import { X, LayoutDashboard, User, Briefcase, FileText, GraduationCap, Paperclip, Bell, Download, MessageCircle, LogOut, ChevronLeft, ChevronRight, Menu, Check, Save, ArrowRight, XCircle, Sun, Moon } from 'lucide-react'
import { AcademicQualificationsForm } from './AcademicQualifications'
import { ProfessionalQualificationsForm } from './ProfessionalQualifications'
import { ProfessionalBodiesForm } from './ProfessionalBodies'
import { ExperienceForm } from './Experience'
import { RefereesForm } from './Referees'
import { AttachmentsForm } from './Attachments'
import { DeclarationForm } from './Declaration'
import { userAPI } from '../services/api'

const steps = [
  { id: 1, label: 'Personal Details' },
  { id: 2, label: 'Academic Qualification(s)' },
  { id: 3, label: 'Professional Qualification(s)' },
  { id: 4, label: 'Professional Body(s)' },
  { id: 5, label: 'Experience' },
  { id: 6, label: 'Referees' },
  { id: 7, label: 'Attachments' },
  { id: 8, label: 'Declaration' },
]

export function CandidateProfile() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showBanner, setShowBanner] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [currentStepCompletion, setCurrentStepCompletion] = useState(0)
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false)
  const [applicationError, setApplicationError] = useState(null)
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false)
  const { user, dispatch, checkProfileCompletion, calculateProfileCompletion, profileCompletion, logout } = useAuth()
  const { submitApplication } = useApplications()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get vacancy ID from location state if user came from applying to a job
  const vacancyId = location.state?.vacancyId || sessionStorage.getItem('pendingVacancyId') || null
  const vacancyTitle = location.state?.vacancyTitle || sessionStorage.getItem('pendingVacancyTitle') || null
  
  console.log('CandidateProfile - vacancyId:', vacancyId, 'vacancyTitle:', vacancyTitle)
  console.log('CandidateProfile - location.state:', location.state)
  console.log('CandidateProfile - sessionStorage pendingVacancyId:', sessionStorage.getItem('pendingVacancyId'))
  
  // Store vacancy info in sessionStorage for persistence across profile completion
  useEffect(() => {
    if (location.state?.vacancyId) {
      console.log('Storing vacancy info in sessionStorage:', location.state.vacancyId, location.state.vacancyTitle)
      sessionStorage.setItem('pendingVacancyId', location.state.vacancyId)
      sessionStorage.setItem('pendingVacancyTitle', location.state.vacancyTitle || '')
    }
  }, [location.state])

  const handleConfirmApplication = async () => {
    if (!vacancyId) {
      console.error('No vacancy ID found for application submission')
      setApplicationError('No vacancy selected. Please select a job to apply for.')
      return
    }

    setIsSubmittingApplication(true)
    setApplicationError(null)

    try {
      // Prepare application data with documents from user profile
      const applicationData = {
        jobId: parseInt(vacancyId),
        cover_letter: `I am applying for the position of ${vacancyTitle || 'this vacancy'}. My profile contains all my qualifications and experience.`
      }

      // Add resume from user profile if available
      if (user?.resume_file) {
        applicationData.resume_file = user.resume_file
      }

      // Add portfolio from user profile if available
      if (user?.portfolio_url) {
        applicationData.portfolio_file = user.portfolio_url
      }

      // Add attachments from user profile as additional_documents
      if (user?.attachments && Array.isArray(user.attachments)) {
        applicationData.additional_documents = user.attachments
      }

      console.log('Submitting application after profile completion:', applicationData)
      console.log('Vacancy ID:', vacancyId, 'Vacancy Title:', vacancyTitle)
      
      await submitApplication.mutateAsync(applicationData)
      
      // Clear sessionStorage after successful application
      sessionStorage.removeItem('pendingVacancyId')
      sessionStorage.removeItem('pendingVacancyTitle')
      
      // Navigate to success page
      navigate('/application-success', {
        state: {
          applicationId: 'pending',
          jobTitle: vacancyTitle
        }
      })
    } catch (error) {
      console.error('Application submission failed:', error)
      console.error('Vacancy ID used:', vacancyId)
      setApplicationError('Failed to submit application. Please try again or contact support.')
    } finally {
      setIsSubmittingApplication(false)
    }
  }

  const handleGoToDashboard = () => {
    setShowCompletionModal(false)
    navigate('/dashboard')
  }

  const handleGoToVacancies = () => {
    setShowCompletionModal(false)
    navigate('/vacancies')
  }

  const calculateCurrentCompletion = () => {
    if (!formData) return 0

    let completedSteps = 0
    const totalSteps = 8

    try {
      // Step 1: Personal Details (at least 7 of 9 required fields)
      const step1 = formData[1] || {}
      const personalFields = ['title', 'firstName', 'surname', 'email', 'phoneNumber', 'idNumber', 'dateOfBirth', 'gender', 'county']
      const filledPersonalFields = personalFields.filter(field => step1[field]).length
      if (filledPersonalFields >= 7) completedSteps++

      // Step 2: Academic Qualifications (at least one)
      const step2 = formData[2] || {}
      if (step2.qualifications && step2.qualifications.length > 0) completedSteps++

      // Step 3: Professional Qualifications (optional - only count if filled)
      const step3 = formData[3] || {}
      if (step3.qualifications && step3.qualifications.length > 0) completedSteps++

      // Step 4: Professional Bodies (optional - only count if filled)
      const step4 = formData[4] || {}
      if (step4.bodies && step4.bodies.length > 0) completedSteps++

      // Step 5: Work Experience (at least one)
      const step5 = formData[5] || {}
      if (step5.experiences && step5.experiences.length > 0) completedSteps++

      // Step 6: Referees (exactly 3)
      const step6 = formData[6] || {}
      if (step6.referees && step6.referees.length >= 3) completedSteps++

      // Step 7: Attachments (at least 3: CV, National ID, Cover Letter)
      const step7 = formData[7] || {}
      if (step7.attachments && step7.attachments.length >= 3) completedSteps++

      // Step 8: Declaration (all checkboxes)
      const step8 = formData[8] || {}
      if (step8.declaration1 && step8.declaration2 && step8.declaration3 && step8.declarationDate && step8.placeOfDeclaration) completedSteps++

      return Math.round((completedSteps / totalSteps) * 100)
    } catch (error) {
      console.error('Error calculating completion:', error)
      return 0
    }
  }

  // Auto-save to database whenever formData changes (but not during initial load)
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0 && currentStep && isInitialDataLoaded) {
      const saveToDatabase = async () => {
        try {
          console.log('Auto-saving complete profile to database at step', currentStep)
          console.log('Only saving data for current step to avoid overwriting other steps')

          // Convert formData to backend format for complete profile save
          const genderMap = { 'Male': 'M', 'Female': 'F', 'Other': 'O' }
          const genderCode = genderMap[formData[1]?.gender] || formData[1]?.gender

          const formatPhoneNumber = (phone) => {
            if (!phone) return null
            const digits = phone.replace(/\D/g, '')
            if (digits.startsWith('0')) {
              return '+254' + digits.substring(1)
            }
            if (digits.startsWith('254')) {
              return '+' + digits
            }
            if (phone.startsWith('+')) {
              return phone
            }
            return '+254' + digits
          }

          // Only save data for the current step to avoid overwriting other steps
          let stepData = {}
          
          // Only save if there's actual user input (not just initial loaded data)
          // Check if the current step has meaningful data beyond defaults
          const hasMeaningfulData = (stepId) => {
            const stepFormData = formData[stepId]
            if (!stepFormData) return false
            
            // For step 1, check if at least some important fields are filled
            if (stepId === 1) {
              // Consider it meaningful if user has filled key fields
              return (stepFormData.firstName && stepFormData.firstName.trim() !== '') ||
                     (stepFormData.surname && stepFormData.surname.trim() !== '') ||
                     (stepFormData.email && stepFormData.email.trim() !== '') ||
                     (stepFormData.phoneNumber && stepFormData.phoneNumber.trim() !== '')
            }
            
            // For other steps, check if arrays have content
            if (stepId >= 2 && stepId <= 7) {
              const arrayField = stepId === 2 ? 'qualifications' :
                                 stepId === 3 ? 'qualifications' :
                                 stepId === 4 ? 'bodies' :
                                 stepId === 5 ? 'experiences' :
                                 stepId === 6 ? 'referees' : 'attachments'
              return stepFormData[arrayField] && stepFormData[arrayField].length > 0
            }
            
            // For step 8, check if declaration has data
            if (stepId === 8) {
              return stepFormData.declarationDate || stepFormData.placeOfDeclaration
            }
            
            return false
          }
          
          if (!hasMeaningfulData(currentStep)) {
            console.log('Skipping auto-save for step', currentStep, '- no meaningful user data to save')
            return
          }
          
          if (currentStep === 1) {
            const genderCode = { 'Male': 'M', 'Female': 'F', 'Other': 'O' }[formData[1]?.gender] || formData[1]?.gender || ''
            stepData = {
              title: formData[1]?.title || '',
              first_name: formData[1]?.firstName || '',
              last_name: formData[1]?.surname || '',
              other_names: formData[1]?.otherNames || '',
              date_of_birth: formData[1]?.dateOfBirth || null,
              gender: genderCode || '',
              nationality: formData[1]?.nationality || '',
              national_id: formData[1]?.idNumber || '',
              passport_no: formData[1]?.passportNo || '',
              phone_number: formatPhoneNumber(formData[1]?.phoneNumber),
              alternative_phone: formatPhoneNumber(formData[1]?.alternativePhone),
              email: formData[1]?.email || '',
              county: formData[1]?.county || '',
              sub_county: formData[1]?.subCounty || '',
              constituency: formData[1]?.constituency || '',
              ward: formData[1]?.ward || '',
              postal_address: formData[1]?.postalAddress || '',
              postal_code: formData[1]?.postalCode || formData[1]?.postCode || '',
              town: formData[1]?.town || '',
              disability: formData[1]?.disability === 'Yes' ? true : (formData[1]?.disability === 'No' ? false : formData[1]?.disability),
              disability_details: formData[1]?.disabilityDetails || '',
              disability_certificate_no: formData[1]?.disabilityCertificateNo || '',
              highest_qualification_description: formData[1]?.highestQualificationDescription || '',
              skills: formData[1]?.skills || '',
              marital_status: formData[1]?.maritalStatus || '',
              religion: formData[1]?.religion || '',
              ethnicity: formData[1]?.ethnicity || '',
              nhif_number: formData[1]?.nhifNumber || '',
              nssf_number: formData[1]?.nssfNumber || '',
              kra_pin: formData[1]?.kraPin || '',
              management_experience: formData[1]?.managementExperience || 0,
              work_experience: formData[1]?.workExperience || 0,
              highest_qualification: formData[1]?.highestQualification || '',
            }
          } else if (currentStep === 2) {
            stepData = {
              academic_qualifications: formData[2]?.qualifications || [],
            }
          } else if (currentStep === 3) {
            stepData = {
              professional_qualifications: formData[3]?.qualifications || [],
            }
          } else if (currentStep === 4) {
            stepData = {
              professional_bodies: formData[4]?.bodies || [],
            }
          } else if (currentStep === 5) {
            stepData = {
              work_experiences_json: formData[5]?.experiences || [],
            }
          } else if (currentStep === 6) {
            stepData = {
              referees: formData[6]?.referees || [],
            }
          } else if (currentStep === 7) {
            stepData = {
              attachments: formData[7]?.attachments || [],
            }
          } else if (currentStep === 8) {
            stepData = {
              declaration1: formData[8]?.declaration1 || false,
              declaration2: formData[8]?.declaration2 || false,
              declaration3: formData[8]?.declaration3 || false,
              declaration_date: formData[8]?.declarationDate || null,
              place_of_declaration: formData[8]?.placeOfDeclaration || '',
            }
          }

          // Remove only undefined and null values, keep empty strings and boolean false
          const cleanProfileData = {}
          Object.entries(stepData).forEach(([key, value]) => {
            // Keep boolean fields even if false
            const booleanFields = ['disability', 'declaration1', 'declaration2', 'declaration3', 'is_verified', 'is_active', 'is_staff', 'is_superuser', 'available_immediately']
            if (booleanFields.includes(key)) {
              if (value !== undefined && value !== null) {
                cleanProfileData[key] = value
              }
            } else {
              // Keep other fields if not undefined/null
              if (value !== undefined && value !== null) {
                cleanProfileData[key] = value
              }
            }
          })

          console.log('Saving step data for step', currentStep, ':', cleanProfileData)
          await userAPI.updateProfile(cleanProfileData)
          console.log('Complete profile saved to database successfully')

          // Update current completion percentage
          const completion = calculateCurrentCompletion()
          setCurrentStepCompletion(completion)
          console.log('Current completion:', completion, '%')
        } catch (error) {
          if (error.response?.status === 401) {
            console.warn('Auto-save failed due to authentication issue - user may need to re-login')
            // Don't interrupt user flow for auth errors during auto-save
          } else {
            console.error('Error auto-saving to database:', error)
          }
        }
      }

      // Debounce the save to avoid too frequent API calls
      const timeoutId = setTimeout(saveToDatabase, 2000)
      return () => clearTimeout(timeoutId)
    }
  }, [formData, currentStep, isInitialDataLoaded])

  // Load profile data on component mount
  useEffect(() => {
    console.log('CandidateProfile mount - user state:', user)
    console.log('localStorage user:', localStorage.getItem('user'))
    console.log('localStorage access_token:', localStorage.getItem('access_token'))

    // Check if attachments should be cleared (when applying for new vacancy)
    const clearAttachmentsFlag = localStorage.getItem('clearAttachmentsOnLoad') === 'true' || location.state?.clearAttachments === true
    if (clearAttachmentsFlag) {
      console.log('Clearing attachments for new vacancy application')
      console.log('clearAttachments from localStorage:', localStorage.getItem('clearAttachmentsOnLoad'))
      console.log('clearAttachments from location.state:', location.state?.clearAttachments)
      localStorage.removeItem('clearAttachmentsOnLoad')
    }

    const loadProfileData = async (clearAttachmentsParam) => {
      try {
        console.log('Loading profile data for user:', user)
        console.log('API endpoint: auth/profile/')

        // Clear any potentially stale localStorage data
        localStorage.removeItem('profileProgress')
        localStorage.removeItem('profileData')
        localStorage.removeItem('profileFormData')

        // ALWAYS load fresh data from server to ensure data integrity
        // This ensures data persists across logout/login sessions

        // Fetch from API
        const response = await userAPI.getProfile()
        const profileData = response.data

        console.log('Profile data loaded from API:', profileData)
        console.log('Profile data keys:', Object.keys(profileData))
        console.log('Profile completion from server:', profileData.profile_completion, '%')
        console.log('Raw gender from DB:', profileData.gender)
        console.log('Raw nationality from DB:', profileData.nationality)
        console.log('Raw national_id from DB:', profileData.national_id)
        console.log('Raw county from DB:', profileData.county)

        // Backend returns User data with field mapping
        // Convert gender codes to full names for frontend display
        const genderCodeMap = { 'M': 'Male', 'F': 'Female', 'O': 'Other' }
        const genderDisplayName = genderCodeMap[profileData.gender] || profileData.gender || 'Male' // Default to Male if empty

        const mappedData = {
          1: {
            title: profileData.title || '',
            firstName: profileData.first_name || profileData.firstName || user?.first_name || user?.firstName || '',
            surname: profileData.last_name || profileData.surname || user?.last_name || user?.lastName || '',
            otherNames: profileData.other_names || profileData.otherNames || '',
            dateOfBirth: profileData.date_of_birth || profileData.dateOfBirth || '',
            gender: genderDisplayName,
            nationality: profileData.nationality || 'Kenyan',
            idNumber: profileData.national_id || profileData.idNumber || '',
            phoneNumber: profileData.phone_number || profileData.phoneNumber || user?.phone_number || user?.phoneNumber || '',
            alternativePhone: profileData.alternative_phone || profileData.alternativePhone || '',
            email: profileData.email || user?.email || '',
            county: profileData.county || '',
            subCounty: profileData.sub_county || profileData.subCounty || '',
            constituency: profileData.constituency || '',
            ward: profileData.ward || '',
            postalAddress: profileData.postal_address || profileData.postalAddress || '',
            postalCode: profileData.postal_code || profileData.postalCode || '',
            postCode: profileData.postal_code || profileData.postalCode || '',
            town: profileData.town || '',
            disability: profileData.disability === true ? 'Yes' : (profileData.disability === false ? 'No' : 'No'),
            disabilityDetails: profileData.disability_details || profileData.disabilityDetails || '',
            highestQualificationDescription: profileData.highest_qualification_description || profileData.highestQualificationDescription || '',
            skills: profileData.skills || '',
            disabilityCertificateNo: profileData.disability_certificate_no || profileData.disabilityCertificateNo || '',
            maritalStatus: profileData.marital_status || profileData.maritalStatus || 'Single',
            religion: profileData.religion || 'Christian',
            passportNo: profileData.passport_no || profileData.passportNo || '',
            ethnicity: profileData.ethnicity || '',
            nhifNumber: profileData.nhif_number || profileData.nhifNumber || '',
            nssfNumber: profileData.nssf_number || profileData.nssfNumber || '',
            kraPin: profileData.kra_pin || profileData.kraPin || '',
            managementExperience: profileData.management_experience || profileData.managementExperience || 0,
            workExperience: profileData.work_experience || profileData.workExperience || 0,
            highestQualification: profileData.highest_qualification || profileData.highestQualification || '',
          },
          2: { qualifications: profileData.academic_qualifications || profileData.academicQualifications || [] },
          3: { qualifications: profileData.professional_qualifications || profileData.professionalQualifications || [] },
          4: { bodies: profileData.professional_bodies || profileData.professionalBodies || [] },
          5: { experiences: profileData.work_experiences_json || profileData.work_experiences || profileData.workExperiences || profileData.experiences || [] },
          6: { referees: profileData.referees || [] },
          7: { attachments: clearAttachmentsParam ? [] : (profileData.attachments || []) },
          8: {
            declaration1: profileData.declaration1 || false,
            declaration2: profileData.declaration2 || false,
            declaration3: profileData.declaration3 || false,
            declarationDate: profileData.declaration_date || profileData.declarationDate || '',
            placeOfDeclaration: profileData.place_of_declaration || profileData.placeOfDeclaration || ''
          }
        }

        console.log('Mapped form data:', mappedData)
        console.log('Clear attachments flag:', clearAttachmentsParam)
        console.log('Personal info loaded:', mappedData[1].firstName, mappedData[1].surname)
        console.log('Academic qualifications loaded:', mappedData[2].qualifications.length)
        console.log('Work experience loaded:', mappedData[5].experiences.length)
        console.log('Referees loaded:', mappedData[6].referees.length)
        console.log('Attachments before clear logic:', mappedData[7].attachments)
        
        // Force clear attachments if flag is set
        if (clearAttachmentsParam) {
          mappedData[7].attachments = []
          console.log('Attachments force-cleared to empty array')
        }
        
        console.log('Attachments after clear logic:', mappedData[7].attachments)
        setFormData(mappedData)
        
        // Mark that initial data has been loaded to enable auto-save
        setTimeout(() => {
          setIsInitialDataLoaded(true)
          console.log('Initial data loaded, auto-save now enabled')
        }, 500)

        // Show alert if attachments were cleared
        if (clearAttachmentsParam) {
          alert('Please upload new attachments (CV, Cover Letter, and other required documents) specific to this vacancy before proceeding.')
        }

        // Calculate and set current completion percentage
        const completion = calculateCurrentCompletion()
        setCurrentStepCompletion(completion)
        console.log('Initial profile completion from server:', completion, '%')

        // Sync with auth context completion
        dispatch({
          type: 'UPDATE_PROFILE_COMPLETION',
          payload: completion
        })

        // REMOVED: localStorage progress restoration to prevent cross-user data contamination
      } catch (error) {
        console.error('Failed to load profile data:', error)
        console.error('Error response:', error.response)
        console.error('Error status:', error.response?.status)
        console.error('Error data:', error.response?.data)

        // Handle different error scenarios
        if (error.response?.status === 401) {
          console.warn('Authentication error - user may need to login again')
          // Don't pre-populate on auth errors, let the auth system handle it
        } else if (error.response?.status === 404) {
          console.log('Profile not found (404) - creating new profile for user')
          // Profile doesn't exist yet, pre-populate with user data from auth context
          if (user) {
            const initialData = {
              1: {
                title: '',
                firstName: user.first_name || user.firstName || '',
                surname: user.last_name || user.lastName || '',
                otherNames: '',
                dateOfBirth: '',
                gender: '',
                nationality: '',
                idNumber: '',
                phoneNumber: user.phone_number || user.phoneNumber || '',
                alternativePhone: '',
                email: user.email || '',
                county: '',
                subCounty: '',
                constituency: '',
                ward: '',
                postalAddress: '',
                postalCode: '',
                town: '',
                disability: '',
                disabilityDetails: '',
                highestQualificationDescription: '',
                skills: '',
                disabilityCertificateNo: '',
                maritalStatus: '',
                religion: '',
                passportNo: '',
                ethnicity: '',
                nhifNumber: '',
                nssfNumber: '',
                kraPin: '',
                managementExperience: 0,
                workExperience: 0,
                highestQualification: '',
              },
              2: { qualifications: [] },
              3: { qualifications: [] },
              4: { bodies: [] },
              5: { experiences: [] },
              6: { referees: [] },
              7: { attachments: [] },
              8: {
                declaration1: false,
                declaration2: false,
                declaration3: false,
                declarationDate: '',
                placeOfDeclaration: ''
              }
            }
            console.log('Pre-populating form with user data:', initialData)
            setFormData(initialData)
          }
        } else {
          console.error('Unexpected error loading profile:', error.message)
          // For other errors, still try to pre-populate with user data if available
          if (user) {
            const initialData = {
              1: {
                title: '',
                firstName: user.first_name || user.firstName || '',
                surname: user.last_name || user.lastName || '',
                otherNames: '',
                dateOfBirth: '',
                gender: '',
                nationality: '',
                idNumber: '',
                phoneNumber: user.phone_number || user.phoneNumber || '',
                alternativePhone: '',
                email: user.email || '',
                county: '',
                subCounty: '',
                constituency: '',
                ward: '',
                postalAddress: '',
                postalCode: '',
                town: '',
                disability: '',
                disabilityDetails: '',
                highestQualificationDescription: '',
                skills: '',
                disabilityCertificateNo: '',
                maritalStatus: '',
                religion: '',
                passportNo: '',
                ethnicity: '',
                nhifNumber: '',
                nssfNumber: '',
                kraPin: '',
                managementExperience: 0,
                workExperience: 0,
                highestQualification: '',
              },
              2: { qualifications: [] },
              3: { qualifications: [] },
              4: { bodies: [] },
              5: { experiences: [] },
              6: { referees: [] },
              7: { attachments: [] },
              8: {
                declaration1: false,
                declaration2: false,
                declaration3: false,
                declarationDate: '',
                placeOfDeclaration: ''
              }
            }
            console.log('Fallback: Pre-populating form with user data:', initialData)
            setFormData(initialData)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadProfileData(clearAttachmentsFlag)
    } else {
      console.log('No user logged in, skipping profile load')
      setLoading(false)
    }
  }, [user])

  const validateStep = (stepId) => {
    const stepData = formData[stepId] || {}
    const errors = []

    switch (stepId) {
      case 1: // Personal Details
        if (!stepData.title) errors.push('Title is required')
        if (!stepData.firstName) errors.push('First Name is required')
        if (!stepData.surname) errors.push('Surname is required')
        if (!stepData.gender) errors.push('Gender is required')
        if (!stepData.dateOfBirth) errors.push('Date of Birth is required')
        if (!stepData.nationality) errors.push('Nationality is required')
        if (!stepData.idNumber) errors.push('ID Number is required')
        if (!stepData.phoneNumber) errors.push('Phone Number is required')
        if (!stepData.email) errors.push('Email is required')
        if (!stepData.county) errors.push('County is required')
        if (stepData.disability === undefined || stepData.disability === null || stepData.disability === '' || stepData.disability === 'Select') {
          errors.push('Disability status is required')
        }
        break
      case 2: // Academic Qualifications
        if (!stepData.qualifications || stepData.qualifications.length === 0) {
          errors.push('At least one Academic Qualification is required')
        }
        break
      case 5: // Experience
        if (!stepData.experiences || stepData.experiences.length === 0) {
          errors.push('At least one Work Experience is required')
        }
        break
      case 6: // Referees
        if (!stepData.referees || stepData.referees.length === 0) {
          errors.push('Exactly 3 Referees are required')
        } else if (stepData.referees.length < 3) {
          errors.push('Exactly 3 Referees are required (currently have ' + stepData.referees.length + ')')
        }
        break
      case 7: // Attachments
        if (!stepData.attachments || stepData.attachments.length === 0) {
          errors.push('At least one Attachment is required')
        } else {
          // Check for required document types using partial matching
          const requiredDocs = [
            { name: 'CV', keywords: ['cv', 'curriculum', 'resume'] },
            { name: 'National ID', keywords: ['national', 'id', 'identity'] },
            { name: 'Cover Letter', keywords: ['cover', 'letter'] }
          ]
          const uploadedDocTypes = stepData.attachments.map(a => a.documentType?.toLowerCase() || '')

          requiredDocs.forEach(doc => {
            const hasDoc = uploadedDocTypes.some(uploadedType =>
              doc.keywords.some(keyword => uploadedType.includes(keyword))
            )
            if (!hasDoc) {
              errors.push(`${doc.name} is required as an attachment`)
            }
          })
        }
        break
      case 8: // Declaration
        if (!stepData.declaration1 || !stepData.declaration2 || !stepData.declaration3) {
          errors.push('You must agree to all declaration statements')
        }
        if (!stepData.declarationDate) {
          errors.push('Declaration Date is required')
        }
        if (!stepData.placeOfDeclaration) {
          errors.push('Place of Declaration is required')
        }
        break
      default:
        // Steps 3 and 4 are optional
        break
    }

    return errors
  }

  const handleStepClick = (stepId) => {
    // Validate current step before allowing navigation forward
    if (stepId > currentStep) {
      setShowValidationErrors(true)
      const currentStepErrors = validateStep(currentStep)
      if (currentStepErrors.length > 0) {
        // Show validation errors as alert
        alert('Please complete all required fields:\n' + currentStepErrors.join('\n'))
        return
      }
    }
    setShowValidationErrors(false)
    setCurrentStep(stepId)
  }

  const handleFormChange = (step, data) => {
    const newFormData = {
      ...formData,
      [step]: data
    }
    setFormData(newFormData)

    // Update current completion percentage immediately for real-time feedback
    const completion = calculateCurrentCompletion()
    setCurrentStepCompletion(completion)
  }

  const getStepData = (step) => {
    return formData[step] || {}
  }

  const validateRequiredFields = () => {
    const errors = []
    
    // Step 1: Personal Details - Required fields
    const step1 = formData[1] || {}
    if (!step1.title) errors.push('Title is required')
    if (!step1.firstName) errors.push('First Name is required')
    if (!step1.surname) errors.push('Surname is required')
    if (!step1.gender) errors.push('Gender is required')
    if (!step1.dateOfBirth) errors.push('Date of Birth is required')
    if (!step1.nationality) errors.push('Nationality is required')
    if (!step1.idNumber) errors.push('ID Number is required')
    if (!step1.phoneNumber) errors.push('Phone Number is required')
    if (!step1.email) errors.push('Email is required')
    if (!step1.county) errors.push('County is required')
    if (!step1.disability) errors.push('Disability status is required')
    
    // Step 2: Academic Qualifications - At least one required
    const step2 = formData[2] || {}
    if (!step2.qualifications || step2.qualifications.length === 0) {
      errors.push('At least one Academic Qualification is required')
    }
    
    // Step 3: Professional Qualifications - Optional
    // Step 4: Professional Bodies - Optional
    
    // Step 5: Experience - At least one required
    const step5 = formData[5] || {}
    if (!step5.experiences || step5.experiences.length === 0) {
      errors.push('At least one Work Experience is required')
    }
    
    // Step 6: Referees - Exactly 3 required
    const step6 = formData[6] || {}
    if (!step6.referees || step6.referees.length === 0) {
      errors.push('Exactly 3 Referees are required')
    } else if (step6.referees.length < 3) {
      errors.push('Exactly 3 Referees are required (currently have ' + step6.referees.length + ')')
    }
    
    // Step 7: Attachments - Required documents
    const step7 = formData[7] || {}
    if (!step7.attachments || step7.attachments.length === 0) {
      errors.push('At least one Attachment is required')
    } else {
      // Check for required document types using partial matching
      const requiredDocs = [
        { name: 'CV', keywords: ['cv', 'curriculum', 'resume'] },
        { name: 'National ID', keywords: ['national', 'id', 'identity'] },
        { name: 'KRA PIN', keywords: ['kra', 'pin', 'tax'] }
      ]
      const uploadedDocTypes = step7.attachments.map(a => a.documentType?.toLowerCase() || '')

      requiredDocs.forEach(doc => {
        const hasDoc = uploadedDocTypes.some(uploadedType =>
          doc.keywords.some(keyword => uploadedType.includes(keyword))
        )
        if (!hasDoc) {
          errors.push(`${doc.name} is required as an attachment`)
        }
      })
    }
    
    // Step 8: Declaration - Required
    const step8 = formData[8] || {}
    if (!step8.declaration1 || !step8.declaration2 || !step8.declaration3) {
      errors.push('You must agree to all declaration statements')
    }
    if (!step8.declarationDate) {
      errors.push('Declaration Date is required')
    }
    if (!step8.placeOfDeclaration) {
      errors.push('Place of Declaration is required')
    }

    return errors
  }

  const handleSaveProfile = async (showAlert = true) => {
    try {
      setSubmitting(true)

      // Prepare data for backend
      // Convert gender from full name to code
      const genderMap = { 'Male': 'M', 'Female': 'F', 'Other': 'O' }
      const genderCode = genderMap[formData[1]?.gender] || formData[1]?.gender

      // Format phone number for Kenya (+254)
      const formatPhoneNumber = (phone) => {
        if (!phone) return null
        // Remove all non-digit characters
        const digits = phone.replace(/\D/g, '')
        // If starts with 0, replace with +254
        if (digits.startsWith('0')) {
          return '+254' + digits.substring(1)
        }
        // If starts with 254, add +
        if (digits.startsWith('254')) {
          return '+' + digits
        }
        // If already has +, return as is
        if (phone.startsWith('+')) {
          return phone
        }
        // Otherwise assume Kenya and add +254
        return '+254' + digits
      }

      // Filter out undefined values
      const cleanProfileData = {
        title: formData[1]?.title,
        first_name: formData[1]?.firstName,
        last_name: formData[1]?.surname,
        other_names: formData[1]?.otherNames,
        date_of_birth: formData[1]?.dateOfBirth,
        gender: genderCode,
        nationality: formData[1]?.nationality,
        national_id: formData[1]?.idNumber,
        passport_no: formData[1]?.passportNo,
        phone_number: formatPhoneNumber(formData[1]?.phoneNumber),
        alternative_phone: formatPhoneNumber(formData[1]?.alternativePhone),
        email: formData[1]?.email,
        county: formData[1]?.county,
        sub_county: formData[1]?.subCounty,
        constituency: formData[1]?.constituency,
        ward: formData[1]?.ward,
        postal_address: formData[1]?.postalAddress,
        postal_code: formData[1]?.postalCode || formData[1]?.postCode,
        town: formData[1]?.town,
        disability: formData[1]?.disability === 'Yes' ? true : (formData[1]?.disability === 'No' ? false : formData[1]?.disability),
        disability_details: formData[1]?.disabilityDetails,
        disability_certificate_no: formData[1]?.disabilityCertificateNo,
        highest_qualification_description: formData[1]?.highestQualificationDescription,
        skills: formData[1]?.skills,
        marital_status: formData[1]?.maritalStatus,
        religion: formData[1]?.religion,
        ethnicity: formData[1]?.ethnicity,
        nhif_number: formData[1]?.nhifNumber,
        nssf_number: formData[1]?.nssfNumber,
        kra_pin: formData[1]?.kraPin,
        management_experience: formData[1]?.managementExperience || 0,
        work_experience: formData[1]?.workExperience || 0,
        highest_qualification: formData[1]?.highestQualification,
        county_of_residence: formData[1]?.countyOfResidence,
        academic_qualifications: formData[2]?.qualifications || [],
        professional_qualifications: formData[3]?.qualifications || [],
        professional_bodies: formData[4]?.bodies || [],
        work_experiences_json: formData[5]?.experiences || [],  // Use snake_case to match backend field
        referees: formData[6]?.referees || [],
        attachments: formData[7]?.attachments || [],
        // Flatten declaration fields for profile completion calculation
        declaration1: formData[8]?.declaration1,
        declaration2: formData[8]?.declaration2,
        declaration3: formData[8]?.declaration3,
        declaration_date: formData[8]?.declarationDate || null,
        place_of_declaration: formData[8]?.placeOfDeclaration || null,
      }

      // Remove undefined values and non-model fields
      const profileData = Object.fromEntries(
        Object.entries(cleanProfileData)
          .filter(([_, value]) => value !== undefined)
          .filter(([key]) => !['profile_status', 'last_saved_at'].includes(key))
      )

      console.log('Saving profile data:', profileData)
      console.log('API endpoint: auth/profile/update/')
      console.log('User data:', user)

      // Check if there are files to upload
      const attachments = formData[7]?.attachments || []
      const hasFiles = attachments.some(att => att.file instanceof File)
      
      let response
      if (hasFiles) {
        // Use FormData for file uploads
        const formDataWithFiles = new FormData()

        // Add all profile data including attachments (as JSON string)
        Object.keys(profileData).forEach(key => {
          if (typeof profileData[key] === 'object') {
            formDataWithFiles.append(key, JSON.stringify(profileData[key]))
          } else {
            formDataWithFiles.append(key, profileData[key])
          }
        })

        // Add files with their document types
        attachments.forEach((attachment, index) => {
          if (attachment.file instanceof File) {
            formDataWithFiles.append(`file_${index}`, attachment.file)
            formDataWithFiles.append(`document_type_${index}`, attachment.documentType)
          }
        })

        response = await userAPI.updateProfile(formDataWithFiles)
      } else {
        // Regular JSON request
        response = await userAPI.updateProfile(profileData)
      }
      console.log('Profile save response:', response)
      console.log('Response data:', response.data)
      
      // Update user object in localStorage with profile data for completion calculation
      const updatedUser = {
        ...user,
        ...profileData
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      console.log('Updated user in localStorage:', updatedUser)

      // REMOVED: profileData storage and localStorage persistence
      // This causes cross-user data contamination - profile data should only come from server

      // Update auth context with new user data
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: updatedUser
      })

      // Calculate current completion based on form data
      const currentCompletion = calculateCurrentCompletion()
      console.log('Current profile completion:', currentCompletion, '%')

      // Update profile completion in auth context
      dispatch({
        type: 'UPDATE_PROFILE_COMPLETION',
        payload: currentCompletion
      })

      // Show success message only if showAlert is true
      if (showAlert) {
        alert(`Profile saved successfully! Your progress: ${currentCompletion}% complete`)
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      alert(`Failed to save profile: ${error.response?.data?.detail || error.message || 'Please try again.'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitProfile = async () => {
    // Validate required fields before submission
    const validationErrors = validateRequiredFields()
    if (validationErrors.length > 0) {
      alert('Please complete all required fields:\n\n' + validationErrors.join('\n'))
      return
    }
    
    try {
      setSubmitting(true)
      
      // Prepare data for backend
      // Convert gender from full name to code
      const genderMap = { 'Male': 'M', 'Female': 'F', 'Other': 'O' }
      const genderCode = genderMap[formData[1]?.gender] || formData[1]?.gender

      // Format phone number for Kenya (+254)
      const formatPhoneNumber = (phone) => {
        if (!phone) return null
        // Remove all non-digit characters
        const digits = phone.replace(/\D/g, '')
        // If starts with 0, replace with +254
        if (digits.startsWith('0')) {
          return '+254' + digits.substring(1)
        }
        // If starts with 254, add +
        if (digits.startsWith('254')) {
          return '+' + digits
        }
        // If already has +, return as is
        if (phone.startsWith('+')) {
          return phone
        }
        // Otherwise assume Kenya and add +254
        return '+254' + digits
      }

      // Filter out undefined values
      const cleanProfileData = {
        title: formData[1]?.title,
        first_name: formData[1]?.firstName,
        last_name: formData[1]?.surname,
        other_names: formData[1]?.otherNames,
        date_of_birth: formData[1]?.dateOfBirth,
        gender: genderCode,
        nationality: formData[1]?.nationality,
        national_id: formData[1]?.idNumber,
        passport_no: formData[1]?.passportNo,
        phone_number: formatPhoneNumber(formData[1]?.phoneNumber),
        alternative_phone: formatPhoneNumber(formData[1]?.alternativePhone),
        email: formData[1]?.email,
        county: formData[1]?.county,
        sub_county: formData[1]?.subCounty,
        constituency: formData[1]?.constituency,
        ward: formData[1]?.ward,
        postal_address: formData[1]?.postalAddress,
        postal_code: formData[1]?.postalCode || formData[1]?.postCode,
        town: formData[1]?.town,
        disability: formData[1]?.disability === 'Yes' ? true : (formData[1]?.disability === 'No' ? false : formData[1]?.disability),
        disability_details: formData[1]?.disabilityDetails,
        disability_certificate_no: formData[1]?.disabilityCertificateNo,
        highest_qualification_description: formData[1]?.highestQualificationDescription,
        skills: formData[1]?.skills,
        marital_status: formData[1]?.maritalStatus,
        religion: formData[1]?.religion,
        ethnicity: formData[1]?.ethnicity,
        nhif_number: formData[1]?.nhifNumber,
        nssf_number: formData[1]?.nssfNumber,
        kra_pin: formData[1]?.kraPin,
        management_experience: formData[1]?.managementExperience || 0,
        work_experience: formData[1]?.workExperience || 0,
        highest_qualification: formData[1]?.highestQualification,
        county_of_residence: formData[1]?.countyOfResidence,
        academic_qualifications: formData[2]?.qualifications || [],
        professional_qualifications: formData[3]?.qualifications || [],
        professional_bodies: formData[4]?.bodies || [],
        work_experiences_json: formData[5]?.experiences || [],  // Use snake_case to match backend field
        referees: formData[6]?.referees || [],
        attachments: formData[7]?.attachments || [],
        // Flatten declaration fields for profile completion calculation
        declaration1: formData[8]?.declaration1,
        declaration2: formData[8]?.declaration2,
        declaration3: formData[8]?.declaration3,
        declaration_date: formData[8]?.declarationDate || null,
        place_of_declaration: formData[8]?.placeOfDeclaration || null,
        // Profile status tracking for HR dashboard
        profile_status: 'confirmed',
        profile_submitted_at: new Date().toISOString(),
      }

      // Remove undefined values but preserve boolean fields even if false
      const profileData = {}
      Object.entries(cleanProfileData).forEach(([key, value]) => {
        // Keep boolean fields even if false
        const booleanFields = ['disability', 'declaration1', 'declaration2', 'declaration3', 'is_verified', 'is_active', 'is_staff', 'is_superuser', 'available_immediately']
        if (booleanFields.includes(key)) {
          if (value !== undefined && value !== null) {
            profileData[key] = value
          }
        } else {
          // Keep other fields if not undefined/null
          if (value !== undefined && value !== null) {
            profileData[key] = value
          }
        }
      })

      console.log('Submitting profile data:', profileData)
      console.log('API endpoint: auth/profile/update/')
      console.log('User data:', user)

      const response = await userAPI.updateProfile(profileData)
      console.log('Profile submission response:', response)
      console.log('Response data:', response.data)
      
      // Update user object in localStorage with profile data for completion calculation
      const updatedUser = {
        ...user,
        ...profileData
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      console.log('Updated user in localStorage:', updatedUser)

      // REMOVED: profileData storage and localStorage persistence
      // This causes cross-user data contamination - profile data should only come from server

      // Update auth context with new user data
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: updatedUser
      })

      // Force profile completion to 100% for confirmed profiles
      dispatch({
        type: 'UPDATE_PROFILE_COMPLETION',
        payload: 100
      })

      // Recalculate profile completion after successful update
      const completion = checkProfileCompletion(100)
      console.log('Profile completion after submission:', completion)

      // Show success message with completion status
      if (completion === 100) {
        // If user came from applying to a specific vacancy, show application confirmation
        if (vacancyId) {
          setShowCompletionModal(true)
        } else {
          // Regular profile completion - show dashboard/logout options
          setShowCompletionModal(true)
        }
      } else {
        alert(`Profile submitted successfully! Your profile is ${completion}% complete. Please complete remaining sections to apply for jobs.`)
        // Add a small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate('/dashboard')
        }, 100)
      }
    } catch (error) {
      console.error('Failed to submit profile:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      alert(`Failed to submit profile: ${error.response?.data?.detail || error.message || 'Please try again.'}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006633] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-200px)] relative">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <div className="md:hidden bg-gray-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <span className="font-semibold text-sm">Menu</span>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-white hover:bg-gray-700 rounded p-1"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-64 ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'} bg-white border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto transition-transform duration-300 md:transition-none`}>
        
        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end p-2 border-b border-gray-200">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Collapse Button */}
        <div className="hidden md:flex justify-end p-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="p-3 space-y-1">
          <ul className="space-y-1">
              <li>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${sidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={sidebarCollapsed ? 'Dashboard' : ''}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <LayoutDashboard className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>Dashboard</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/my-profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    true 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${sidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={sidebarCollapsed ? 'My Profile' : ''}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <User className={`w-5 h-5 ${true ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>My Profile</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/vacancies"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${sidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={sidebarCollapsed ? 'Job Vacancies' : ''}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Briefcase className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>Job Vacancies</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/my-applications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${sidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={sidebarCollapsed ? 'Job Applications' : ''}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <FileText className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>My Applications</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/professional-membership"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${sidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={sidebarCollapsed ? 'Professional Membership' : ''}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <GraduationCap className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>Professional Membership</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/attachments"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${sidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={sidebarCollapsed ? 'Attachments' : ''}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Paperclip className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>Attachments</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/announcements"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${sidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={sidebarCollapsed ? 'Announcements' : ''}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Bell className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>Announcements</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/downloads"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${sidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={sidebarCollapsed ? 'Downloads' : ''}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Download className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>Downloads</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${sidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={sidebarCollapsed ? 'Chat with Us' : ''}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <MessageCircle className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>Chat with Us</span>
                  </div>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-[#006633]' : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'} ${sidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={sidebarCollapsed ? 'Toggle Dark Mode' : ''}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    {darkMode ? <Sun className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`} /> : <Moon className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`} />}
                    <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-[#006633]' : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'} ${sidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={sidebarCollapsed ? 'Logout' : ''}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <LogOut className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`} />
                    <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>Logout</span>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 bg-gray-100 overflow-x-auto">
          <div className="w-full max-w-[1400px] mx-auto">
            {/* Welcome Section */}
            <div className="mb-3 sm:mb-4 md:mb-6">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                Welcome to the E-Recruitment Portal, Complete your Profile
              </h1>
              
              {/* Profile Completion Indicator */}
              <div className="mt-3 sm:mt-4 bg-white rounded-lg shadow-sm p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">Profile Completion</span>
                  <span className={`text-xs sm:text-sm font-bold ${currentStepCompletion === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {currentStepCompletion}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                  <div
                    className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${currentStepCompletion === 100 ? 'bg-green-600' : 'bg-yellow-600'}`}
                    style={{ width: `${currentStepCompletion}%` }}
                  ></div>
                </div>
                {currentStepCompletion === 100 ? (
                  <p className="text-[10px] sm:text-xs text-green-600 mt-2">✓ Your profile is complete! You can now apply for jobs.</p>
                ) : (
                  <p className="text-[10px] sm:text-xs text-yellow-600 mt-2">Complete all required sections to apply for jobs.</p>
                )}
              </div>
            </div>

            {/* Green Alert Banner */}
            {showBanner && (
              <div className="bg-[#006633] text-white rounded-lg p-2.5 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6 flex items-start justify-between">
                <div className="min-w-0 pr-8">
                  <p className="font-semibold text-xs sm:text-sm md:text-base">
                    Dear {user?.firstName || user?.first_name} {user?.lastName || user?.last_name}!
                  </p>
                  <p className="text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1 opacity-90">
                    Kindly ensure you complete your profile before applying for any Open Positions.
                  </p>
                </div>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-white hover:bg-white/20 rounded p-1 flex-shrink-0"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>
              </div>
            )}

            {/* Stepper */}
            <div className="bg-white rounded-lg shadow-md p-2 sm:p-3 md:p-6 mb-3 sm:mb-4 md:mb-6">
              <div className="flex items-center justify-between overflow-x-auto scrollbar-hide pb-1">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-shrink-0">
                    <button
                      onClick={() => handleStepClick(step.id)}
                      className={`flex items-center gap-1.5 sm:gap-2 md:gap-3 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg text-[10px] sm:text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                        currentStep === step.id
                          ? 'bg-blue-600 text-white'
                          : currentStep > step.id
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-bold ${
                        currentStep === step.id ? 'bg-white text-blue-600' : ''
                      }`}>
                        {currentStep > step.id ? '✓' : step.id}
                      </span>
                      <span className="hidden sm:inline">{step.label}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className={`w-3 sm:w-4 md:w-8 h-0.5 mx-1 sm:mx-2 md:mx-3 ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-gray-200 bg-blue-50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                  <h2 className="text-sm sm:text-base md:text-lg font-semibold text-blue-900">
                    Personal Details (Kindly fill all the fields with Asteriks(*))
                  </h2>
                  <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">
                    Step {currentStep} of {steps.length}
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-4 md:p-6">
                {currentStep === 1 && <PersonalDetailsForm data={getStepData(1)} onChange={(data) => handleFormChange(1, data)} showValidationErrors={showValidationErrors} onSave={handleSaveProfile} />}
                {currentStep === 2 && <AcademicQualificationsForm data={getStepData(2)} onChange={(data) => handleFormChange(2, data)} onSave={handleSaveProfile} />}
                {currentStep === 3 && <ProfessionalQualificationsForm data={getStepData(3)} onChange={(data) => handleFormChange(3, data)} onSave={handleSaveProfile} />}
                {currentStep === 4 && <ProfessionalBodiesForm data={getStepData(4)} onChange={(data) => handleFormChange(4, data)} onSave={handleSaveProfile} />}
                {currentStep === 5 && <ExperienceForm data={getStepData(5)} onChange={(data) => handleFormChange(5, data)} onSave={handleSaveProfile} />}
                {currentStep === 6 && <RefereesForm data={getStepData(6)} onChange={(data) => handleFormChange(6, data)} onSave={handleSaveProfile} />}
                {currentStep === 7 && <AttachmentsForm data={getStepData(7)} onChange={(data) => handleFormChange(7, data)} onSave={handleSaveProfile} />}
                {currentStep === 8 && <DeclarationForm data={getStepData(8)} onChange={(data) => handleFormChange(8, data)} onSave={handleSaveProfile} />}
              </div>

              {/* Navigation Buttons */}
              <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                {/* Progress Indicator */}
                <div className="mb-4 sm:mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Step Progress</span>
                    <span className="text-xs sm:text-sm font-bold text-[#006633]">{currentStep} of {steps.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#006633] via-[#007744] to-[#008844] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(currentStep / steps.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch justify-between gap-3 sm:gap-4 md:gap-6">
                  {/* Previous Button - no validation required for going back */}
                  <button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className="group relative flex-1 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:border-[#006633] hover:text-[#006633] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700 transition-all duration-300 ease-out text-sm sm:text-base md:text-lg shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform group-hover:-translate-x-1" />
                    <span className="relative z-10">Previous</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>

                  {/* Next/Submit Button */}
                  <button
                    onClick={async () => {
                      if (currentStep === steps.length) {
                        // Show confirmation modal instead of direct submission
                        setShowConfirmModal(true)
                      } else {
                        // Validate current step before allowing navigation to next
                        setShowValidationErrors(true)
                        const currentStepErrors = validateStep(currentStep)
                        if (currentStepErrors.length > 0) {
                          // Show validation errors as alert
                          alert('Please complete all required fields:\n' + currentStepErrors.join('\n'))
                          return
                        }
                        setShowValidationErrors(false)

                        // Save current step data before moving to next step
                        try {
                          await handleSaveProfile(false)
                        } catch (error) {
                          console.error('Error saving before navigation:', error)
                          // Continue with navigation even if save fails
                        }

                        setCurrentStep(currentStep + 1)
                      }
                    }}
                    disabled={submitting}
                    className="group relative flex-1 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl bg-gradient-to-r from-[#006633] via-[#007744] to-[#008844] text-white font-semibold hover:from-[#005522] hover:via-[#006633] hover:to-[#007744] disabled:opacity-40 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 ease-out text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    <span className="relative z-10">{submitting ? 'Saving...' : (currentStep === steps.length ? 'Review & Submit' : 'Next')}</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* REMOVED: Data Restore Notification - localStorage restoration disabled to prevent cross-user contamination */}
      {/* Profile Submission Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 transform animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Review Your Profile
              </h2>
              <p className="text-gray-600">
                Please review your profile information before final submission. Once confirmed, your profile will be available for HR review.
              </p>
            </div>

            {/* Profile Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">
                      {formData[1]?.title} {formData[1]?.firstName} {formData[1]?.surname}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 font-medium">{formData[1]?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 font-medium">{formData[1]?.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">ID Number:</span>
                    <span className="ml-2 font-medium">{formData[1]?.idNumber}</span>
                  </div>
                </div>
              </div>

              {/* Academic Qualifications */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Academic Qualifications
                </h3>
                <div className="text-sm">
                  {formData[2]?.qualifications?.length > 0 ? (
                    <ul className="space-y-1">
                      {formData[2].qualifications.map((qual, index) => (
                        <li key={index} className="text-gray-700">
                          {qual.degree} - {qual.institution} ({qual.year})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500">No qualifications added</span>
                  )}
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Work Experience
                </h3>
                <div className="text-sm">
                  {formData[5]?.experiences?.length > 0 ? (
                    <ul className="space-y-1">
                      {formData[5].experiences.map((exp, index) => (
                        <li key={index} className="text-gray-700">
                          {exp.position} at {exp.employer} ({exp.years} years)
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500">No experience added</span>
                  )}
                </div>
              </div>

              {/* Completion Status */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Profile Completion:</span>
                  <span className="text-sm font-bold text-green-600">{currentStepCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-green-600 transition-all duration-300"
                    style={{ width: `${currentStepCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important Notice</p>
                  <p>By confirming, you declare that all information provided is accurate and complete. Your profile will be submitted for HR review and will be used for job applications.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  <X className="w-4 h-4" />
                  Make Changes
                </span>
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  handleSubmitProfile()
                }}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#006633] to-[#008844] text-white font-semibold hover:from-[#004d26] hover:to-[#006633] transition-all shadow-md hover:shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Confirm & Submit
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion Celebration Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 text-center transform animate-in fade-in zoom-in duration-300">
            {/* Celebration Icon */}
            <div className="mx-auto mb-4 flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>

            {/* Success Message */}
            {vacancyId ? (
              <>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Profile Complete!
                </h2>
                <p className="text-gray-600 mb-2">
                  Your profile is now 100% complete. Ready to apply for:
                </p>
                <p className="text-[#006633] font-semibold mb-6">
                  {vacancyTitle || 'this position'}
                </p>

                {/* Application Confirmation */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 mb-6 text-left border border-green-100">
                  <h3 className="font-semibold text-green-800 mb-2">Confirm your application:</h3>
                  <p className="text-sm text-green-700 mb-4">
                    Your profile information will be submitted along with this application. You can track the status in your dashboard.
                  </p>
                  {applicationError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-600 text-sm">{applicationError}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleGoToVacancies}
                    disabled={isSubmittingApplication}
                    className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmApplication}
                    disabled={isSubmittingApplication}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#006633] to-[#008844] text-white font-semibold hover:from-[#004d26] hover:to-[#006633] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmittingApplication ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Profile Complete!
                </h2>
                <p className="text-gray-600 mb-6">
                  Congratulations! Your profile is now 100% complete. All your information has been saved securely.
                </p>

                {/* Success Features */}
                <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-green-800 mb-2">You can now:</h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Apply for job vacancies
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Track your applications
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Your profile is confirmed and available for HR review
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowCompletionModal(false)
                      logout()
                    }}
                    className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                  <button
                    onClick={handleGoToDashboard}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#006633] to-[#008844] text-white font-semibold hover:from-[#004d26] hover:to-[#006633] transition-all shadow-md hover:shadow-lg"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Personal Details Form Component
function PersonalDetailsForm({ data = {}, onChange, showValidationErrors = false, onSave }) {
  const [localData, setLocalData] = useState(data)
  const [errors, setErrors] = useState({})

  const validateField = (field, value) => {
    const requiredFields = ['title', 'firstName', 'surname', 'gender', 'dateOfBirth', 'nationality', 'idNumber', 'phoneNumber', 'email', 'county', 'disability']
    if (requiredFields.includes(field) && !value) {
      return 'This field is required'
    }

    // Phone number validation
    if (field === 'phoneNumber' && value) {
      const phoneRegex = /^\+?[0-9]{10,15}$/
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        return 'Please enter a valid phone number (10-15 digits)'
      }
    }

    // Email validation
    if (field === 'email' && value) {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address'
      }
    }

    // ID number validation
    if (field === 'idNumber' && value) {
      const idRegex = /^[0-9]+$/
      if (!idRegex.test(value)) {
        return 'ID number should contain only digits'
      }
      if (value.length < 7 || value.length > 10) {
        return 'ID number should be 7-10 digits'
      }
    }

    // Date of birth validation
    if (field === 'dateOfBirth' && value) {
      const dob = new Date(value)
      const today = new Date()
      const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
      if (dob > minAge) {
        return 'You must be at least 18 years old'
      }
    }

    return ''
  }

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onChange(newData)
    
    // Validate field on change
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const validateAllFields = () => {
    const newErrors = {}
    const requiredFields = ['title', 'firstName', 'surname', 'gender', 'dateOfBirth', 'nationality', 'idNumber', 'phoneNumber', 'email', 'county', 'disability']
    requiredFields.forEach(field => {
      const error = validateField(field, localData[field])
      if (error) newErrors[field] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  React.useEffect(() => {
    setLocalData(data)
  }, [data])

  React.useEffect(() => {
    if (showValidationErrors) {
      validateAllFields()
    }
  }, [showValidationErrors])

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Personal Information
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Title */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            value={localData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
          >
            <option value="">Select Title</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Miss">Miss</option>
            <option value="Dr">Dr</option>
            <option value="Prof">Prof</option>
            <option value="Eng">Eng</option>
          </select>
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* First Name */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={localData.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>

        {/* Surname */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Surname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={localData.surname || ''}
            onChange={(e) => handleChange('surname', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base ${errors.surname ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.surname && <p className="text-red-500 text-xs mt-1">{errors.surname}</p>}
        </div>

        {/* Other Names */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Other Names
          </label>
          <input
            type="text"
            value={localData.otherNames || ''}
            onChange={(e) => handleChange('otherNames', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
            value={localData.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
        </div>

        {/* Marital Status */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Marital Status
          </label>
          <select
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
            value={localData.maritalStatus || ''}
            onChange={(e) => handleChange('maritalStatus', e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div className="relative z-10">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={localData.dateOfBirth || ''}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white relative z-20 text-sm sm:text-base ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
            style={{ position: 'relative', zIndex: 20 }}
          />
          {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
        </div>

        {/* ID Number */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            ID Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={localData.idNumber || ''}
            onChange={(e) => handleChange('idNumber', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base ${errors.idNumber ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
        </div>

        {/* Religion */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Religion
          </label>
          <select
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
            value={localData.religion || ''}
            onChange={(e) => handleChange('religion', e.target.value)}
          >
            <option value="">Select Religion</option>
            <option value="Christianity">Christianity</option>
            <option value="Islam">Islam</option>
            <option value="Hinduism">Hinduism</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Passport No */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Passport No
          </label>
          <input
            type="text"
            value={localData.passportNo || ''}
            onChange={(e) => handleChange('passportNo', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={localData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Postal Address */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Postal Address
          </label>
          <input
            type="text"
            value={localData.postalAddress || ''}
            onChange={(e) => handleChange('postalAddress', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Nationality <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base ${errors.nationality ? 'border-red-500' : 'border-gray-300'}`}
            value={localData.nationality || ''}
            onChange={(e) => handleChange('nationality', e.target.value)}
          >
            <option value="">Select Nationality</option>
            <option value="Kenyan">Kenyan</option>
            <option value="Other">Other</option>
          </select>
          {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
        </div>

        {/* Post Code */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Post Code
          </label>
          <input
            type="text"
            value={localData.postalCode || localData.postCode || ''}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* City/Town */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            City/Town
          </label>
          <input
            type="text"
            value={localData.town || ''}
            onChange={(e) => handleChange('town', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* County of Residence */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            County of Residence <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base ${errors.county ? 'border-red-500' : 'border-gray-300'}`}
            value={localData.county || ''}
            onChange={(e) => handleChange('county', e.target.value)}
          >
            <option value="">Select County</option>
            <option value="Nairobi">Nairobi</option>
            <option value="Mombasa">Mombasa</option>
            <option value="Kwale">Kwale</option>
            <option value="Kilifi">Kilifi</option>
            <option value="Tana River">Tana River</option>
            <option value="Lamu">Lamu</option>
            <option value="Taita-Taveta">Taita-Taveta</option>
            <option value="Garissa">Garissa</option>
            <option value="Wajir">Wajir</option>
            <option value="Mandera">Mandera</option>
            <option value="Marsabit">Marsabit</option>
            <option value="Isiolo">Isiolo</option>
            <option value="Meru">Meru</option>
            <option value="Tharaka-Nithi">Tharaka-Nithi</option>
            <option value="Embu">Embu</option>
            <option value="Kitui">Kitui</option>
            <option value="Machakos">Machakos</option>
            <option value="Makueni">Makueni</option>
            <option value="Nyandarua">Nyandarua</option>
            <option value="Nyeri">Nyeri</option>
            <option value="Kirinyaga">Kirinyaga</option>
            <option value="Murang'a">Murang'a</option>
            <option value="Kiambu">Kiambu</option>
            <option value="Turkana">Turkana</option>
            <option value="West Pokot">West Pokot</option>
            <option value="Samburu">Samburu</option>
            <option value="Trans Nzoia">Trans Nzoia</option>
            <option value="Uasin Gishu">Uasin Gishu</option>
            <option value="Elgeyo-Marakwet">Elgeyo-Marakwet</option>
            <option value="Nandi">Nandi</option>
            <option value="Baringo">Baringo</option>
            <option value="Laikipia">Laikipia</option>
            <option value="Nakuru">Nakuru</option>
            <option value="Narok">Narok</option>
            <option value="Kajiado">Kajiado</option>
            <option value="Kericho">Kericho</option>
            <option value="Bomet">Bomet</option>
            <option value="Kakamega">Kakamega</option>
            <option value="Vihiga">Vihiga</option>
            <option value="Bungoma">Bungoma</option>
            <option value="Busia">Busia</option>
            <option value="Siaya">Siaya</option>
            <option value="Kisumu">Kisumu</option>
            <option value="Homa Bay">Homa Bay</option>
            <option value="Migori">Migori</option>
            <option value="Kisii">Kisii</option>
            <option value="Nyamira">Nyamira</option>
            <option value="Other">Other</option>
          </select>
          {errors.county && <p className="text-red-500 text-xs mt-1">{errors.county}</p>}
        </div>

        {/* Ethnicity */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Ethnicity
          </label>
          <select
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
            value={localData.ethnicity || ''}
            onChange={(e) => handleChange('ethnicity', e.target.value)}
          >
            <option value="">Select Ethnicity</option>
            <option value="Kikuyu">Kikuyu</option>
            <option value="Luhya">Luhya</option>
            <option value="Luo">Luo</option>
            <option value="Kamba">Kamba</option>
            <option value="Kalenjin">Kalenjin</option>
            <option value="Kipsigis">Kipsigis</option>
            <option value="Nandi">Nandi</option>
            <option value="Keiyo">Keiyo</option>
            <option value="Marakwet">Marakwet</option>
            <option value="Tugen">Tugen</option>
            <option value="Sabaot">Sabaot</option>
            <option value="Pokot">Pokot</option>
            <option value="Meru">Meru</option>
            <option value="Embu">Embu</option>
            <option value="Mbeere">Mbeere</option>
            <option value="Kisii">Kisii (Abagusii)</option>
            <option value="Kuria">Kuria</option>
            <option value="Mijikenda">Mijikenda</option>
            <option value="Digo">Digo</option>
            <option value="Duruma">Duruma</option>
            <option value="Giriama">Giriama</option>
            <option value="Chonyi">Chonyi</option>
            <option value="Rabai">Rabai</option>
            <option value="Ribe">Ribe</option>
            <option value="Swahili">Swahili</option>
            <option value="Kenyan Arab">Kenyan Arab</option>
            <option value="Somali">Somali</option>
            <option value="Borana">Borana</option>
            <option value="Gabra">Gabra</option>
            <option value="Rendille">Rendille</option>
            <option value="Turkana">Turkana</option>
            <option value="Burji">Burji</option>
            <option value="El Molo">El Molo</option>
            <option value="Pokomo">Pokomo</option>
            <option value="Orma">Orma</option>
            <option value="Wardei">Wardei</option>
            <option value="Malakote">Malakote</option>
            <option value="Bajuni">Bajuni</option>
            <option value="Boni">Boni (Aweer)</option>
            <option value="Taita">Taita</option>
            <option value="Taveta">Taveta</option>
            <option value="Tharaka">Tharaka</option>
            <option value="Chuka">Chuka</option>
            <option value="Mwimbi">Mwimbi</option>
            <option value="Suba">Suba</option>
            <option value="Ilchamus">Ilchamus (Njemps)</option>
            <option value="Maasai">Maasai</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* NHIF Number */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            N.H.I.F Number
          </label>
          <input
            type="text"
            value={localData.nhifNumber || ''}
            onChange={(e) => handleChange('nhifNumber', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* NSSF Number */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            N.S.S.F Number
          </label>
          <input
            type="text"
            value={localData.nssfNumber || ''}
            onChange={(e) => handleChange('nssfNumber', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Mobile Phone Number */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Mobile Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={localData.phoneNumber || ''}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
        </div>

        {/* Alternative Phone Number */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Alternative Phone Number
          </label>
          <input
            type="text"
            value={localData.alternativePhone || ''}
            onChange={(e) => handleChange('alternativePhone', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* KRA Pin */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            KRA Pin <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={localData.kraPin || ''}
            onChange={(e) => handleChange('kraPin', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Disability */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Are you a person Living with Disability <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base ${errors.disability ? 'border-red-500' : 'border-gray-300'}`}
            value={localData.disability || ''}
            onChange={(e) => handleChange('disability', e.target.value)}
          >
            <option value="">Select</option>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
          {errors.disability && <p className="text-red-500 text-xs mt-1">{errors.disability}</p>}
        </div>

        {/* Description of Disability - Only show if disability is Yes */}
        {localData.disability === 'Yes' && (
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              Description of Disability
            </label>
            <textarea
              rows="2"
              value={localData.disabilityDetails || ''}
              onChange={(e) => handleChange('disabilityDetails', e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        )}

        {/* Disability Certificate No - Only show if disability is Yes */}
        {localData.disability === 'Yes' && (
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              Disability Certificate No.
            </label>
            <input
              type="text"
              value={localData.disabilityCertificateNo || ''}
              onChange={(e) => handleChange('disabilityCertificateNo', e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        )}

        {/* Years of Management Experience */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Years of Experience in Management Position or Leading Teams (Enter 0 if not Applicable)
          </label>
          <input
            type="number"
            value={localData.managementExperience || ''}
            onChange={(e) => handleChange('managementExperience', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Years of Relevant Work Experience */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Years of Relevant Work Experience <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={localData.workExperience || ''}
            onChange={(e) => handleChange('workExperience', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Highest Academic Qualifications */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Highest Academic Qualifications <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
            value={localData.highestQualification || ''}
            onChange={(e) => handleChange('highestQualification', e.target.value)}
          >
            <option value="">Select</option>
            <option value="Degree">Degree</option>
            <option value="Masters">Masters</option>
            <option value="PhD">PhD</option>
            <option value="Diploma">Diploma</option>
            <option value="Certificate">Certificate</option>
          </select>
        </div>

        {/* Highest Academic Qualification Description */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Highest Academic Qualification Description e.g PhD in BioInformatics <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={localData.highestQualificationDescription || ''}
            onChange={(e) => handleChange('highestQualificationDescription', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Skills and Competencies */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
            Skills and Competencies (Not more than 2048 Characters) <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="6 sm:rows-8"
            value={localData.skills || ''}
            onChange={(e) => handleChange('skills', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
          />
          <p className="text-xs text-gray-500 mt-1">Character count: {(localData.skills || '').length}/2048</p>
        </div>

        {/* Save Button */}
        <div className="mt-4 sm:mt-6">
          <button
            onClick={() => {
              onChange(localData)
              if (onSave) onSave()
            }}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all text-xs sm:text-sm md:text-base shadow-md hover:shadow-lg"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
            Save Personal Details
          </button>
        </div>
      </div>
    </div>
  )
}

