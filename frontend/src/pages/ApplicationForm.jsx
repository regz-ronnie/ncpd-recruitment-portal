import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { ChevronRight, ChevronLeft, Upload, FileText, AlertCircle, CheckCircle, Sparkles } from 'lucide-react'
import { useJobDetail } from '../hooks/useJobs'
import { useApplicationSubmit } from '../hooks/useApplications'
import { useCVParser } from '../hooks/useAI'
import { ProgressBar } from '../components/ProgressBar'
import { FormStep } from '../components/FormStep'
import { SkillSelector } from '../components/SkillSelector'
import { ExperienceForm } from '../components/ExperienceForm'
import { EducationForm } from '../components/EducationForm'
import { CVUpload } from '../components/CVUpload'

const ApplicationForm = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { data: job, isLoading: jobLoading } = useJobDetail(jobId)
  const { mutate: submitApplication, isLoading: submitting } = useApplicationSubmit()
  const { mutate: parseCV, isLoading: parsingCV } = useCVParser()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [parsedCV, setParsedCV] = useState(null)
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  
  const totalSteps = 6
  
  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationalId: '',
        dateOfBirth: '',
        gender: '',
        county: '',
        address: '',
      },
      professionalInfo: {
        professionalTitle: '',
        yearsOfExperience: 0,
        currentEmployer: '',
        currentPosition: '',
        linkedinUrl: '',
        githubUrl: '',
        portfolioUrl: '',
      },
      education: [],
      experience: [],
      skills: [],
      certifications: [],
      coverLetter: '',
      additionalInfo: {
        expectedSalary: '',
        availableImmediately: true,
        noticePeriod: 0,
        preferredJobTypes: [],
      },
      documents: {
        resume: null,
        coverLetterFile: null,
        portfolio: null,
      }
    }
  })

  const steps = [
    { id: 1, title: 'Personal Information', description: 'Basic contact and personal details' },
    { id: 2, title: 'Professional Summary', description: 'Career overview and experience' },
    { id: 3, title: 'Education & Qualifications', description: 'Academic background and certifications' },
    { id: 4, title: 'Skills & Expertise', description: 'Technical and professional skills' },
    { id: 5, title: 'Work Experience', description: 'Employment history and achievements' },
    { id: 6, title: 'Application Details', description: 'Cover letter and documents' },
  ]

  const handleCVUpload = async (file) => {
    if (!file) return
    
    try {
      const result = await parseCV({ file, jobId })
      setParsedCV(result.data)
      
      // Auto-populate form fields with parsed data
      if (result.data.personalInfo) {
        Object.entries(result.data.personalInfo).forEach(([key, value]) => {
          setValue(`personalInfo.${key}`, value)
        })
      }
      
      if (result.data.experience) {
        setValue('experience', result.data.experience)
      }
      
      if (result.data.education) {
        setValue('education', result.data.education)
      }
      
      if (result.data.skills) {
        setValue('skills', result.data.skills)
      }
      
      setShowAIAnalysis(true)
    } catch (error) {
      console.error('CV parsing failed:', error)
    }
  }

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data) => {
    try {
      const applicationData = {
        job: jobId,
        ...data,
        aiAnalysis: parsedCV,
      }
      
      await submitApplication(applicationData)
      navigate('/application-success', { 
        state: { 
          applicationId: 'pending', 
          jobTitle: job?.title 
        } 
      })
    } catch (error) {
      console.error('Application submission failed:', error)
    }
  }

  if (jobLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Apply for Position</h1>
              <p className="text-gray-600 mt-1">{job?.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Application Deadline</p>
              <p className="font-semibold text-red-600">
                {job?.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'Open'}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <ProgressBar 
              current={currentStep} 
              total={totalSteps} 
              steps={steps}
            />
          </div>
        </div>

        {/* AI Analysis Banner */}
        {showAIAnalysis && parsedCV && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">AI Analysis Complete</h3>
                <p className="text-blue-700 text-sm mt-1">
                  We've automatically extracted information from your CV. Please review and update any fields as needed.
                </p>
                {parsedCV.matchScore && (
                  <div className="mt-2">
                    <span className="text-sm text-blue-600">
                      Job Match Score: <strong>{parsedCV.matchScore}%</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <FormStep title="Personal Information" description="Please provide your basic contact information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller
                    name="personalInfo.firstName"
                    control={control}
                    rules={{ required: 'First name is required' }}
                    render={({ field }) => (
                      <div>
                        <label className="form-label">First Name *</label>
                        <input {...field} className="form-input" />
                        {errors.personalInfo?.firstName && (
                          <p className="form-error">{errors.personalInfo.firstName.message}</p>
                        )}
                      </div>
                    )}
                  />
                  
                  <Controller
                    name="personalInfo.lastName"
                    control={control}
                    rules={{ required: 'Last name is required' }}
                    render={({ field }) => (
                      <div>
                        <label className="form-label">Last Name *</label>
                        <input {...field} className="form-input" />
                        {errors.personalInfo?.lastName && (
                          <p className="form-error">{errors.personalInfo.lastName.message}</p>
                        )}
                      </div>
                    )}
                  />
                  
                  <Controller
                    name="personalInfo.email"
                    control={control}
                    rules={{ 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    }}
                    render={({ field }) => (
                      <div>
                        <label className="form-label">Email Address *</label>
                        <input {...field} type="email" className="form-input" />
                        {errors.personalInfo?.email && (
                          <p className="form-error">{errors.personalInfo.email.message}</p>
                        )}
                      </div>
                    )}
                  />
                  
                  <Controller
                    name="personalInfo.phone"
                    control={control}
                    rules={{ required: 'Phone number is required' }}
                    render={({ field }) => (
                      <div>
                        <label className="form-label">Phone Number *</label>
                        <input {...field} className="form-input" />
                        {errors.personalInfo?.phone && (
                          <p className="form-error">{errors.personalInfo.phone.message}</p>
                        )}
                      </div>
                    )}
                  />
                  
                  <Controller
                    name="personalInfo.nationalId"
                    control={control}
                    rules={{ required: 'National ID is required' }}
                    render={({ field }) => (
                      <div>
                        <label className="form-label">National ID Number *</label>
                        <input {...field} className="form-input" />
                        {errors.personalInfo?.nationalId && (
                          <p className="form-error">{errors.personalInfo.nationalId.message}</p>
                        )}
                      </div>
                    )}
                  />
                  
                  <Controller
                    name="personalInfo.dateOfBirth"
                    control={control}
                    rules={{ required: 'Date of birth is required' }}
                    render={({ field }) => (
                      <div>
                        <label className="form-label">Date of Birth *</label>
                        <input {...field} type="date" className="form-input" />
                        {errors.personalInfo?.dateOfBirth && (
                          <p className="form-error">{errors.personalInfo.dateOfBirth.message}</p>
                        )}
                      </div>
                    )}
                  />
                  
                  <Controller
                    name="personalInfo.gender"
                    control={control}
                    rules={{ required: 'Gender is required' }}
                    render={({ field }) => (
                      <div>
                        <label className="form-label">Gender *</label>
                        <select {...field} className="form-input">
                          <option value="">Select Gender</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                        {errors.personalInfo?.gender && (
                          <p className="form-error">{errors.personalInfo.gender.message}</p>
                        )}
                      </div>
                    )}
                  />
                  
                  <Controller
                    name="personalInfo.county"
                    control={control}
                    rules={{ required: 'County is required' }}
                    render={({ field }) => (
                      <div>
                        <label className="form-label">County *</label>
                        <select {...field} className="form-input">
                          <option value="">Select County</option>
                          <option value="Nairobi">Nairobi</option>
                          <option value="Mombasa">Mombasa</option>
                          <option value="Kisumu">Kisumu</option>
                          <option value="Nakuru">Nakuru</option>
                          <option value="Eldoret">Eldoret</option>
                          {/* Add more counties */}
                        </select>
                        {errors.personalInfo?.county && (
                          <p className="form-error">{errors.personalInfo.county.message}</p>
                        )}
                      </div>
                    )}
                  />
                  
                  <Controller
                    name="personalInfo.address"
                    control={control}
                    render={({ field }) => (
                      <div className="md:col-span-2">
                        <label className="form-label">Physical Address</label>
                        <textarea {...field} rows={3} className="form-input" />
                      </div>
                    )}
                  />
                </div>
              </FormStep>
            )}

            {/* Step 2: Professional Summary */}
            {currentStep === 2 && (
              <FormStep title="Professional Summary" description="Tell us about your professional background">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Controller
                      name="professionalInfo.professionalTitle"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="form-label">Professional Title</label>
                          <input {...field} className="form-input" placeholder="e.g., Senior Data Analyst" />
                        </div>
                      )}
                    />
                    
                    <Controller
                      name="professionalInfo.yearsOfExperience"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="form-label">Years of Experience</label>
                          <input 
                            {...field} 
                            type="number" 
                            className="form-input" 
                            min="0"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      )}
                    />
                    
                    <Controller
                      name="professionalInfo.currentEmployer"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="form-label">Current Employer</label>
                          <input {...field} className="form-input" />
                        </div>
                      )}
                    />
                    
                    <Controller
                      name="professionalInfo.currentPosition"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="form-label">Current Position</label>
                          <input {...field} className="form-input" />
                        </div>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Controller
                      name="professionalInfo.linkedinUrl"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="form-label">LinkedIn Profile</label>
                          <input {...field} type="url" className="form-input" placeholder="https://linkedin.com/in/..." />
                        </div>
                      )}
                    />
                    
                    <Controller
                      name="professionalInfo.githubUrl"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="form-label">GitHub Profile</label>
                          <input {...field} type="url" className="form-input" placeholder="https://github.com/..." />
                        </div>
                      )}
                    />
                    
                    <Controller
                      name="professionalInfo.portfolioUrl"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="form-label">Portfolio Website</label>
                          <input {...field} type="url" className="form-input" placeholder="https://..." />
                        </div>
                      )}
                    />
                  </div>
                </div>
              </FormStep>
            )}

            {/* Step 3: Education */}
            {currentStep === 3 && (
              <FormStep title="Education & Qualifications" description="Add your educational background">
                <EducationForm control={control} />
              </FormStep>
            )}

            {/* Step 4: Skills */}
            {currentStep === 4 && (
              <FormStep title="Skills & Expertise" description="Select your relevant skills">
                <SkillSelector 
                  control={control}
                  jobRequirements={job?.skills_required || []}
                />
              </FormStep>
            )}

            {/* Step 5: Experience */}
            {currentStep === 5 && (
              <FormStep title="Work Experience" description="Add your work history">
                <ExperienceForm control={control} />
              </FormStep>
            )}

            {/* Step 6: Application Details */}
            {currentStep === 6 && (
              <FormStep title="Application Details" description="Finalize your application">
                <div className="space-y-6">
                  {/* CV Upload with AI Parsing */}
                  <div>
                    <label className="form-label">Resume/CV *</label>
                    <CVUpload 
                      onUpload={handleCVUpload}
                      isLoading={parsingCV}
                      value={watch('documents.resume')}
                      onChange={(file) => setValue('documents.resume', file)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload your CV and we'll automatically extract your information using AI
                    </p>
                  </div>
                  
                  {/* Cover Letter */}
                  <Controller
                    name="coverLetter"
                    control={control}
                    rules={{ required: 'Cover letter is required' }}
                    render={({ field }) => (
                      <div>
                        <label className="form-label">Cover Letter *</label>
                        <textarea 
                          {...field} 
                          rows={6} 
                          className="form-input"
                          placeholder="Why are you interested in this position and why do you believe you're a good fit?"
                        />
                        {errors.coverLetter && (
                          <p className="form-error">{errors.coverLetter.message}</p>
                        )}
                      </div>
                    )}
                  />
                  
                  {/* Additional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Controller
                      name="additionalInfo.expectedSalary"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="form-label">Expected Salary (KES)</label>
                          <input 
                            {...field} 
                            type="number" 
                            className="form-input"
                            placeholder="e.g., 150000"
                          />
                        </div>
                      )}
                    />
                    
                    <Controller
                      name="additionalInfo.noticePeriod"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="form-label">Notice Period (days)</label>
                          <input 
                            {...field} 
                            type="number" 
                            className="form-input"
                            min="0"
                            placeholder="e.g., 30"
                          />
                        </div>
                      )}
                    />
                  </div>
                  
                  <Controller
                    name="additionalInfo.availableImmediately"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="availableImmediately"
                          {...field}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="availableImmediately" className="ml-2 block text-sm text-gray-700">
                          Available to start immediately
                        </label>
                      </div>
                    )}
                  />
                </div>
              </FormStep>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-2 btn-primary"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? (
                    <>
                      <div className="spinner w-4 h-4 mr-2"></div>
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export { ApplicationForm }
