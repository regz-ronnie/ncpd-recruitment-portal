import { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Award,
  User,
  Calculator,
  Download,
  Filter
} from 'lucide-react'
import api from '../services/api'

export const EligibilityScreening = ({ vacancyId }) => {
  const [selectedApplicant, setSelectedApplicant] = useState(null)

  // Fetch applications for vacancy
  const { data: applications, isLoading } = useQuery(
    ['vacancy-applications', vacancyId],
    () => api.get(`/v1/vacancies/${vacancyId}/applications/`).then(res => res.data),
    { enabled: !!vacancyId }
  )

  // Fetch vacancy details
  const { data: vacancy } = useQuery(
    ['vacancy', vacancyId],
    () => api.get(`/v1/vacancies/${vacancyId}/`).then(res => res.data),
    { enabled: !!vacancyId }
  )

  const calculateEligibilityScore = (applicant, vacancy) => {
    if (!applicant || !vacancy) return 0

    let score = 0
    let totalChecks = 0

    const checks = {
      education: false,
      experience: false,
      certifications: false,
      documents: false,
      age: false,
      skills: false
    }

    // Check education
    totalChecks++
    if (applicant.education_level === vacancy.education_level || 
        applicant.education_level === 'master' && vacancy.education_level === 'bachelor' ||
        applicant.education_level === 'phd' && vacancy.education_level !== 'phd') {
      checks.education = true
      score += 1
    }

    // Check experience
    totalChecks++
    if (applicant.experience_years >= vacancy.experience_years) {
      checks.experience = true
      score += 1
    }

    // Check certifications
    totalChecks++
    if (vacancy.certifications_required && applicant.certifications) {
      const requiredCerts = vacancy.certifications_required.split(',').map(c => c.trim().toLowerCase())
      const applicantCerts = applicant.certifications.map(c => c.toLowerCase())
      const hasRequiredCerts = requiredCerts.every(cert => 
        applicantCerts.some(appCert => appCert.includes(cert))
      )
      if (hasRequiredCerts) {
        checks.certifications = true
        score += 1
      }
    } else if (!vacancy.certifications_required) {
      checks.certifications = true
      score += 1
    }

    // Check documents
    totalChecks++
    const requiredDocs = vacancy.mandatory_documents || []
    const uploadedDocs = applicant.documents || []
    const hasAllDocs = requiredDocs.every(doc => 
      uploadedDocs.some(uploaded => uploaded.type === doc)
    )
    if (hasAllDocs) {
      checks.documents = true
      score += 1
    }

    // Check age limit
    totalChecks++
    if (vacancy.age_limit) {
      const ageRange = vacancy.age_limit.match(/(\d+)-(\d+)/)
      if (ageRange) {
        const minAge = parseInt(ageRange[1])
        const maxAge = parseInt(ageRange[2])
        if (applicant.age >= minAge && applicant.age <= maxAge) {
          checks.age = true
          score += 1
        }
      }
    } else {
      checks.age = true
      score += 1
    }

    // Check skills
    totalChecks++
    if (vacancy.skills && applicant.skills) {
      const requiredSkills = vacancy.skills.map(s => s.toLowerCase())
      const applicantSkills = applicant.skills.map(s => s.toLowerCase())
      const hasRequiredSkills = requiredSkills.every(skill => 
        applicantSkills.some(appSkill => appSkill.includes(skill))
      )
      if (hasRequiredSkills) {
        checks.skills = true
        score += 1
      }
    } else if (!vacancy.skills) {
      checks.skills = true
      score += 1
    }

    return {
      score: Math.round((score / totalChecks) * 100),
      checks,
      totalChecks
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5" />
    if (score >= 60) return <AlertTriangle className="w-5 h-5" />
    return <XCircle className="w-5 h-5" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Eligibility Screening Summary</h3>
          <button className="flex items-center space-x-2 btn-secondary">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-600">
              {applications?.filter(app => calculateEligibilityScore(app, vacancy).score >= 80).length || 0}
            </p>
            <p className="text-sm text-gray-500">Fully Eligible</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold text-yellow-600">
              {applications?.filter(app => {
                const score = calculateEligibilityScore(app, vacancy).score
                return score >= 60 && score < 80
              }).length || 0}
            </p>
            <p className="text-sm text-gray-500">Partially Eligible</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold text-red-600">
              {applications?.filter(app => calculateEligibilityScore(app, vacancy).score < 60).length || 0}
            </p>
            <p className="text-sm text-gray-500">Not Eligible</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Calculator className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">
              {applications?.reduce((sum, app) => sum + calculateEligibilityScore(app, vacancy).score, 0) / (applications?.length || 1) || 0}%
            </p>
            <p className="text-sm text-gray-500">Avg Score</p>
          </div>
        </div>
      </div>

      {/* Eligibility Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Applicant Eligibility Details</h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select className="form-input text-sm">
              <option value="all">All Applicants</option>
              <option value="eligible">Fully Eligible (80%+)</option>
              <option value="partial">Partially Eligible (60-79%)</option>
              <option value="ineligible">Not Eligible (&lt;60%)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Applicant</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Score</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Education</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Experience</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Certifications</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Documents</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Age</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Skills</th>
              </tr>
            </thead>
            <tbody>
              {applications?.map((applicant) => {
                const eligibility = calculateEligibilityScore(applicant, vacancy)
                return (
                  <tr key={applicant.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{applicant.name}</p>
                          <p className="text-sm text-gray-500">{applicant.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full ${getScoreColor(eligibility.score)}`}>
                        {getScoreIcon(eligibility.score)}
                        <span className="ml-2 font-bold">{eligibility.score}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {eligibility.checks.education ? (
                        <CheckCircle className="w-5 h-5 mx-auto text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 mx-auto text-red-600" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {eligibility.checks.experience ? (
                        <CheckCircle className="w-5 h-5 mx-auto text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 mx-auto text-red-600" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {eligibility.checks.certifications ? (
                        <CheckCircle className="w-5 h-5 mx-auto text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 mx-auto text-red-600" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {eligibility.checks.documents ? (
                        <CheckCircle className="w-5 h-5 mx-auto text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 mx-auto text-red-600" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {eligibility.checks.age ? (
                        <CheckCircle className="w-5 h-5 mx-auto text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 mx-auto text-red-600" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {eligibility.checks.skills ? (
                        <CheckCircle className="w-5 h-5 mx-auto text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 mx-auto text-red-600" />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Applicant View */}
      {selectedApplicant && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Applicant Details</h3>
            <button
              onClick={() => setSelectedApplicant(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Personal Information
              </h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Name:</span> {selectedApplicant.name}</p>
                <p><span className="text-gray-500">Email:</span> {selectedApplicant.email}</p>
                <p><span className="text-gray-500">Phone:</span> {selectedApplicant.phone}</p>
                <p><span className="text-gray-500">Age:</span> {selectedApplicant.age} years</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" />
                Education
              </h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Level:</span> {selectedApplicant.education_level}</p>
                <p><span className="text-gray-500">Institution:</span> {selectedApplicant.institution}</p>
                <p><span className="text-gray-500">Year:</span> {selectedApplicant.graduation_year}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Experience
              </h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Years:</span> {selectedApplicant.experience_years}</p>
                <p><span className="text-gray-500">Current Role:</span> {selectedApplicant.current_role}</p>
                <p><span className="text-gray-500">Company:</span> {selectedApplicant.current_company}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Award className="w-4 h-4 mr-2" />
                Certifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedApplicant.certifications?.map((cert, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {selectedApplicant.documents?.map((doc, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <p className="font-medium">{doc.type}</p>
                    <p className="text-gray-500 text-xs">{doc.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
