import React, { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import './index.css'
import { Files } from './pages/Files'
import { Help } from './pages/Help'
import { AboutPage } from './pages/AboutPage'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { Contact } from './pages/Contact'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { JobListings } from './pages/JobListings'
import { EducationForm } from './components/EducationForm'
import { ExperienceForm } from './components/ExperienceForm'
import { SkillSelector } from './components/SkillSelector'
import { CVUpload } from './components/CVUpload'

// Import actual components
import { Dashboard } from './pages/Dashboard.jsx'
import { HRDashboard } from './pages/HRDashboard.jsx'
import VacancyManagement from './pages/VacancyManagement.jsx'
import ApplicationsManagement from './pages/ApplicationsManagement.jsx'
import VacancyForm from './pages/VacancyForm.jsx'
import ApplicationDetail from './pages/ApplicationDetail.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { PersonalDetails } from './pages/PersonalDetails.jsx'
import { Education } from './pages/Education.jsx'
import { Trainings } from './pages/Trainings.jsx'
import { ProfessionalMembership } from './pages/ProfessionalMembership.jsx'
import { Employment } from './pages/Employment.jsx'

// NCPD Header Component - Matching Uploaded Image Style
function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/vacancies', label: 'Vacancies' },
    { path: '/help', label: 'User Guide' },
    { path: '/faq', label: 'How to Apply' },
  ]

  if (!isAuthenticated) {
    navItems.push({ path: '/login', label: 'Login' })
    navItems.push({ path: '/register', label: 'Register' })
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-ncpd-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-4">
          <Link to="/" className="flex items-center gap-4">
            <div className="h-24 w-24 rounded-full border-3 border-white bg-white p-1 shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src="/logo.png"
                alt="NCPD logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.32em] font-semibold">NCPD E-Recruitment Portal</p>
              <p className="text-xs opacity-90">National Council for Population and Development</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-white border-b-2 border-white'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-ncpd-primary font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                  <span>{user?.firstName}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/20 bg-white text-gray-900 shadow-2xl">
                    <div className="px-4 py-4 border-b border-gray-200">
                      <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="space-y-1 px-2 py-2">
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/applications"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Applications
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setProfileDropdownOpen(false)
                        }}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-ncpd-secondary bg-opacity-95">
          <div className="space-y-1 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-white/90 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated && (
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="w-full rounded-2xl bg-red-600 px-4 py-3 text-white hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// Navigation Component - NCPD Website Exact Style
function Navigation() {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/vacancies', label: 'Vacancies' },
    { path: '/help', label: 'User Guide' },
    { path: '/faq', label: 'How to Apply' },
  ]

  if (!isAuthenticated) {
    navItems.push({ path: '/login', label: 'Login' })
    navItems.push({ path: '/register', label: 'Register' })
  }

  if (isAuthenticated && (user?.role === 'hr' || user?.is_hr || user?.is_staff)) {
    navItems.push({ path: '/hr/dashboard', label: 'HR Dashboard' })
    navItems.push({ path: '/hr/vacancies', label: 'Vacancies (HR)' })
  }

  return (
    <nav className="bg-ncpd-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`py-3 px-4 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'text-white bg-ncpd-secondary border-l-4 border-white'
                  : 'text-white hover:bg-ncpd-secondary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

// Footer Component
function Footer() {
  return (
    <footer className="footer footer-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">National Council for Population and Development</h3>
            <p className="text-gray-300 text-sm">
              Transforming lives through quality population programs and services.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="footer-link">FAQs</a></li>
              <li><a href="#" className="footer-link">Contact Us</a></li>
              <li><span className="text-gray-300">V 1.0.0</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📍 Nairobi, Kenya</li>
              <li>📞 +254 20 271 7444</li>
              <li>✉️ info@ncpd.go.ke</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; Copyright 2026 | All Rights Reserved | National Council For Population and Development</p>
        </div>
      </div>
    </footer>
  )
}

// Home Page Component - Matching Uploaded Image Style
function HomePage() {
  const vacancyTabs = [
    'Active Job Vacancies',
    'Contract Job Vacancies',
    'Permanent & Pensionable Job Vacancies',
  ]

  const featuredVacancies = [
    {
      reference: 'VN00971',
      title: 'Program Assistant - Nairobi',
      type: 'Contract',
      positions: 1,
      deadline: '06/15/26 • 5:00 PM',
      grade: 'KMR 06',
      status: 'Active',
      id: 1,
    },
    {
      reference: 'VN00972',
      title: 'Research Intern',
      type: 'Internship',
      positions: 2,
      deadline: '06/15/26 • 5:00 PM',
      grade: 'KMR 05',
      status: 'Active',
      id: 2,
    },
    {
      reference: 'VN00973',
      title: 'Assistant Research Officer - Kisumu',
      type: 'Contract',
      positions: 1,
      deadline: '06/14/26 • 2:00 PM',
      grade: 'KMR 07',
      status: 'Active',
      id: 3,
    },
  ]

  return (
    <div className="bg-slate-50 min-h-screen">
      <section
        className="relative overflow-hidden bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 102, 51, 0.82), rgba(0, 119, 60, 0.38)), url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#006633]/90 via-[#008044]/40 to-[#00331a]/90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.32em] text-white/90">NCPD Careers</p>
            <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold tracking-tight text-white">
              National Council for Population and Development
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-8 text-slate-100/90">
              Apply for advertised career opportunities that support sustainable population and development across Kenya.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/vacancies"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#006633] shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-100"
              >
                View Vacancies
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/10 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="rounded-3xl bg-ncpd-light border border-ncpd-primary px-6 py-5 text-center text-sm sm:text-base text-ncpd-primary shadow-sm">
          <span className="font-semibold">NCPD invites all qualified applicants to apply for the following advertised career opportunities!</span>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-sm font-semibold text-white">
          <Link
            to="/vacancies"
            className="rounded-3xl bg-ncpd-primary px-5 py-6 hover:bg-ncpd-secondary transition-colors"
          >
            Active Job Vacancies
          </Link>
          <Link
            to="/vacancies"
            className="rounded-3xl bg-ncpd-accent px-5 py-6 hover:bg-[#009759] transition-colors"
          >
            Contract Job Vacancies
          </Link>
          <Link
            to="/vacancies"
            className="rounded-3xl bg-[#004d26] px-5 py-6 hover:bg-[#00331a] transition-colors"
          >
            Permanent & Pensionable Job Vacancies
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Job Reference</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Job Title/Designation</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Employment Type</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Positions</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Application Deadline</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Job Grade</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {featuredVacancies.map((vacancy, index) => (
                  <tr key={vacancy.reference} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-4 text-slate-700 font-medium">{vacancy.reference}</td>
                    <td className="px-4 py-4 text-slate-700">{vacancy.title}</td>
                    <td className="px-4 py-4 text-slate-700">{vacancy.type}</td>
                    <td className="px-4 py-4 text-slate-700">{vacancy.positions}</td>
                    <td className="px-4 py-4 text-slate-700">{vacancy.deadline}</td>
                    <td className="px-4 py-4 text-slate-700">{vacancy.grade}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {vacancy.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 space-x-2">
                      <Link
                        to="/vacancies"
                        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        to={`/apply/${vacancy.id}`}
                        className="inline-flex items-center rounded-full bg-ncpd-primary px-3 py-1 text-xs font-semibold text-white hover:bg-ncpd-secondary transition-colors"
                      >
                        Apply Now
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}


import { jobsAPI } from './services/api'

function VacanciesPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch jobs from backend API on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await jobsAPI.getJobs()
        setJobs(response.data.results || response.data)
        setLoading(false)
      } catch (err) {
        setError(err.message || 'Failed to fetch jobs')
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading vacancies...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-ncpd-primary text-white px-4 py-2 rounded hover:bg-ncpd-secondary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-ncpd-primary mb-6">
          Available Vacancies
        </h1>
        
        <div className="space-y-8">
          {jobs.map(job => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-ncpd-primary mb-4">
                {job.title} ({job.posts})
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 text-sm text-gray-600">
                <div>
                  <strong>Advert No:</strong> {job.advertNo}
                </div>
                <div>
                  <strong>Job Category:</strong> {job.category}
                </div>
                <div>
                  <strong>Deadline:</strong> {job.deadline}
                </div>
                <div>
                  <strong>Terms:</strong> {job.terms}
                </div>
                <div>
                  <strong>Job Group:</strong> {job.jobGroup}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Qualifications</h3>
                <p className="text-gray-700 mb-4">
                  For appointment to this grade, a candidate must have:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  {job.qualifications && job.qualifications.map((qual, index) => (
                    <li key={index}>{qual}</li>
                  ))}
                </ol>
              </div>
              
              <div className="flex justify-end">
                <a 
                  href={`/apply/${job.id}`}
                  className="bg-ncpd-primary text-white px-6 py-3 rounded hover:bg-ncpd-secondary transition-colors"
                >
                  Apply Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

import { useParams } from 'react-router-dom'
import { applicationsAPI } from './services/api'

function ApplyPage() {
  const { jobId } = useParams()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationData, setApplicationData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nationality: '',
      fullName: '',
      kraPin: '',
      ethnicity: '',
      religion: '',
      shaShif: '',
      nssf: ''
    },
    currentWorkplace: {
      employmentStatus: 'Public Service',
      employerName: '',
      station: '',
      employmentNumber: '',
      substantivePost: '',
      jobGrade: '',
      termsOfService: '',
      dateOfCurrentAppointment: '',
      dateOfPreviousAppointment: '',
      upgradedPost: '',
      secondmentOrganization: '',
      secondmentDesignation: '',
      secondmentJobGroup: '',
      grossSalary: ''
    },
    qualifications: {
      managementExperience: '',
      workExperience: '',
      educationalBackground: [],
      professionalQualifications: [],
      professionalRegistrations: []
    },
    workExperience: [],
    otherDetails: {
      proficientLanguages: '',
      isImpaired: false,
      convictedOnProbation: false,
      dismissedFromEmployment: false,
      ongoingInvestigation: false,
      relativesInPPRA: false,
      taxCompliant: false,
      helbLoan: false
    },
    referees: [],
    documents: {
      cv: null,
      coverLetter: null,
      certificates: []
    }
  })

  // Fetch user data from API and populate form
  useEffect(() => {
    if (user) {
      setApplicationData(prev => ({
        ...prev,
        personalInfo: {
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: user?.phone_number || '',
          dateOfBirth: user?.date_of_birth || '',
          nationality: user?.nationality || '',
          fullName: `${user?.firstName || ''} ${user?.lastName || ''}`,
          kraPin: user?.kra_pin || '',
          ethnicity: user?.ethnicity || '',
          religion: user?.religion || '',
          shaShif: user?.sha_shif || '',
          nssf: user?.nssf || ''
        }
      }))
    }
  }, [user])

  const jobs = [
    {
      id: 1,
      title: 'POPULATION PROGRAMME OFFICER – GRADE NCPD 6',
      posts: '6 post(s)',
      advertNo: 'NCPD/2026/01',
      category: 'Programme Management',
      deadline: '7 Apr 2026',
      terms: 'Permanent and Pensionable',
      jobGroup: 'NCPD 6',
      qualifications: [
        'Served in the grade of Assistant Population Programme Officer, NCPD 7 or in a comparable and relevant position in the Public Service for a minimum period of three (3) years.',
        'Bachelor\'s degree in any of the following disciplines: Population Studies, Demography, Statistics, Economics, Sociology, Geography, Social Sciences or any other equivalent qualification from a university recognized in Kenya.',
        'Master\'s degree in any of the following disciplines: Population Studies, Demography, Statistics, Economics, Sociology, Geography, Social Sciences or any other equivalent qualification from a university recognized in Kenya.',
        'Certificate in Strategic Leadership Development Programme lasting not less than six (6) weeks from a recognized institution.',
        'Certificate in computer application skills.',
        'Demonstrated merit and shown ability and integrity as reflected in work performance and results.'
      ]
    },
    {
      id: 2,
      title: 'ASSISTANT POPULATION PROGRAMME OFFICER – GRADE NCPD 7',
      posts: '4 post(s)',
      advertNo: 'NCPD/2026/02',
      category: 'Programme Management',
      deadline: '7 Apr 2026',
      terms: 'Permanent and Pensionable',
      jobGroup: 'NCPD 7',
      qualifications: [
        'Bachelor\'s degree in any of the following disciplines: Population Studies, Demography, Statistics, Economics, Sociology, Geography, Social Sciences or any other equivalent qualification from a university recognized in Kenya.',
        'Certificate in computer application skills.',
        'Certificate in a management course lasting not less than four (4) weeks from a recognized institution.',
        'Demonstrated merit and shown ability and integrity as reflected in work performance and results.'
      ]
    },
    {
      id: 3,
      title: 'DIRECTOR PLANNING AND RESEARCH – GRADE NCPD 2',
      posts: '1 post(s)',
      advertNo: 'NCPD/2026/03',
      category: 'Planning and Research',
      deadline: '7 Apr 2026',
      terms: 'Permanent and Pensionable',
      jobGroup: 'NCPD 2',
      qualifications: [
        'Served in the grade of Senior Assistant Director, Planning and Research, NCPD 3 or in a comparable and relevant position in the Public Service for a minimum period of three (3) years.',
        'Master\'s degree in any of the following disciplines: Population Studies, Demography, Statistics, Economics, Sociology, Geography, Social Sciences, Planning or any other equivalent qualification from a university recognized in Kenya.',
        'Bachelor\'s degree in any of the following disciplines: Population Studies, Demography, Statistics, Economics, Sociology, Geography, Social Sciences, Planning or any other equivalent qualification from a university recognized in Kenya.',
        'Certificate in Strategic Leadership Development Programme lasting not less than six (6) weeks from a recognized institution.',
        'Certificate in computer application skills.',
        'Demonstrated merit and shown ability and integrity as reflected in work performance and results.'
      ]
    },
    {
      id: 4,
      title: 'SENIOR ASSISTANT DIRECTOR PLANNING AND RESEARCH – GRADE NCPD 3',
      posts: '2 post(s)',
      advertNo: 'NCPD/2026/04',
      category: 'Planning and Research',
      deadline: '7 Apr 2026',
      terms: 'Permanent and Pensionable',
      jobGroup: 'NCPD 3',
      qualifications: [
        'Served in the grade of Assistant Director Planning and Research, NCPD 4 or in a comparable and relevant position in the Public Service for a minimum period of three (3) years.',
        'Master\'s degree in any of the following disciplines: Population Studies, Demography, Statistics, Economics, Sociology, Geography, Social Sciences, Planning or any other equivalent qualification from a university recognized in Kenya.',
        'Bachelor\'s degree in any of the following disciplines: Population Studies, Demography, Statistics, Economics, Sociology, Geography, Social Sciences, Planning or any other equivalent qualification from a university recognized in Kenya.',
        'Certificate in Strategic Leadership Development Programme lasting not less than six (6) weeks from a recognized institution.',
        'Certificate in computer application skills.',
        'Demonstrated merit and shown ability and integrity as reflected in work performance and results.'
      ]
    },
    {
      id: 5,
      title: 'ASSISTANT DIRECTOR PLANNING AND RESEARCH – GRADE NCPD 4',
      posts: '3 post(s)',
      advertNo: 'NCPD/2026/05',
      category: 'Planning and Research',
      deadline: '7 Apr 2026',
      terms: 'Permanent and Pensionable',
      jobGroup: 'NCPD 4',
      qualifications: [
        'Served in the grade of Senior Planning and Research Officer, NCPD 5 or in a comparable and relevant position in the Public Service for a minimum period of three (3) years.',
        'Bachelor\'s degree in any of the following disciplines: Population Studies, Demography, Statistics, Economics, Sociology, Geography, Social Sciences, Planning or any other equivalent qualification from a university recognized in Kenya.',
        'Master\'s degree in any of the following disciplines: Population Studies, Demography, Statistics, Economics, Sociology, Geography, Social Sciences, Planning or any other equivalent qualification from a university recognized in Kenya.',
        'Certificate in management course lasting not less than four (4) weeks from a recognized institution.',
        'Certificate in computer application skills.',
        'Demonstrated merit and shown ability and integrity as reflected in work performance and results.'
      ]
    }
  ]

  const selectedJob = jobs.find(job => job.id === parseInt(jobId)) || jobs[0]
  const totalSteps = 8

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Submit application to backend
      const response = await applicationsAPI.createApplication({
        job: jobId,
        personal_info: applicationData.personalInfo,
        current_workplace: applicationData.currentWorkplace,
        qualifications: applicationData.qualifications,
        work_experience: applicationData.workExperience,
        other_details: applicationData.otherDetails,
        referees: applicationData.referees,
        documents: applicationData.documents
      })
      
      alert('Application submitted successfully! We will review your application and contact you soon.')
      // Navigate to confirmation page or dashboard
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Error submitting application. Please try again.')
    }
  }

  const updatePersonalInfo = (field, value) => {
    setApplicationData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }))
  }

  const updateCurrentWorkplace = (field, value) => {
    setApplicationData(prev => ({
      ...prev,
      currentWorkplace: { ...prev.currentWorkplace, [field]: value }
    }))
  }

  const updateQualifications = (field, value) => {
    setApplicationData(prev => ({
      ...prev,
      qualifications: { ...prev.qualifications, [field]: value }
    }))
  }

  const updateWorkExperience = (newExperience) => {
    setApplicationData(prev => ({ ...prev, workExperience: newExperience }))
  }

  const updateOtherDetails = (field, value) => {
    setApplicationData(prev => ({
      ...prev,
      otherDetails: { ...prev.otherDetails, [field]: value }
    }))
  }

  const updateReferees = (newReferees) => {
    setApplicationData(prev => ({ ...prev, referees: newReferees }))
  }

  const updateDocuments = (field, value) => {
    setApplicationData(prev => ({
      ...prev,
      documents: { ...prev.documents, [field]: value }
    }))
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Job Information */}
        <div className="mb-8 p-6 bg-ncpd-light rounded-lg">
          <h1 className="text-3xl font-bold text-ncpd-primary mb-4">
            Application for: {selectedJob.title}
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div><strong>Category:</strong> {selectedJob.category}</div>
            <div><strong>Deadline:</strong> {selectedJob.deadline}</div>
            <div><strong>Terms:</strong> {selectedJob.terms}</div>
            <div><strong>Job Group:</strong> {selectedJob.jobGroup}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Application Progress</h2>
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-ncpd-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.personalInfo.firstName}
                    onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.personalInfo.lastName}
                    onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.personalInfo.dateOfBirth}
                    onChange={(e) => updatePersonalInfo('dateOfBirth', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationality *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.personalInfo.nationality}
                    onChange={(e) => updatePersonalInfo('nationality', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.personalInfo.idNumber}
                    onChange={(e) => updatePersonalInfo('idNumber', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">KRA PIN</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.personalInfo.kraPin}
                    onChange={(e) => updatePersonalInfo('kraPin', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ethnicity</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.personalInfo.ethnicity}
                    onChange={(e) => updatePersonalInfo('ethnicity', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.personalInfo.religion}
                    onChange={(e) => updatePersonalInfo('religion', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SHA/SHIF</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.personalInfo.shaShif}
                    onChange={(e) => updatePersonalInfo('shaShif', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NSSF</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.personalInfo.nssf}
                    onChange={(e) => updatePersonalInfo('nssf', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Current Workplace Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Workplace Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Employment Status *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.employmentStatus}
                    onChange={(e) => updateCurrentWorkplace('employmentStatus', e.target.value)}
                  >
                    <option value="">Select an option</option>
                    <option value="Public Service">Public Service</option>
                    <option value="Private Sector">Private Sector</option>
                    <option value="Self-Employed">Self-Employed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employer Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.employerName}
                    onChange={(e) => updateCurrentWorkplace('employerName', e.target.value)}
                    placeholder="e.g. Kenya Revenue Authority"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Station</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.station}
                    onChange={(e) => updateCurrentWorkplace('station', e.target.value)}
                    placeholder="e.g. Nairobi"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment/Personal Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.employmentNumber}
                    onChange={(e) => updateCurrentWorkplace('employmentNumber', e.target.value)}
                    placeholder="e.g. 123456"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Present Substantive Post</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.substantivePost}
                    onChange={(e) => updateCurrentWorkplace('substantivePost', e.target.value)}
                    placeholder="e.g. Senior Accountant"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Grade</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.jobGrade}
                    onChange={(e) => updateCurrentWorkplace('jobGrade', e.target.value)}
                    placeholder="Enter your Job Grade"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Terms of Service</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.termsOfService}
                    onChange={(e) => updateCurrentWorkplace('termsOfService', e.target.value)}
                  >
                    <option value="">Select an option</option>
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Current Appointment</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.dateOfCurrentAppointment}
                    onChange={(e) => updateCurrentWorkplace('dateOfCurrentAppointment', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Previous Appointment</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.dateOfPreviousAppointment}
                    onChange={(e) => updateCurrentWorkplace('dateOfPreviousAppointment', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upgraded Post</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.upgradedPost}
                    onChange={(e) => updateCurrentWorkplace('upgradedPost', e.target.value)}
                    placeholder="e.g. Senior Accountant"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondment Organization</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.secondmentOrganization}
                    onChange={(e) => updateCurrentWorkplace('secondmentOrganization', e.target.value)}
                    placeholder="e.g. Kenya Revenue Authority"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondment Designation</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.secondmentDesignation}
                    onChange={(e) => updateCurrentWorkplace('secondmentDesignation', e.target.value)}
                    placeholder="e.g. Senior Accountant"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondment Job Group</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.secondmentJobGroup}
                    onChange={(e) => updateCurrentWorkplace('secondmentJobGroup', e.target.value)}
                    placeholder="e.g. Job Group"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gross Salary</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.currentWorkplace.grossSalary}
                    onChange={(e) => updateCurrentWorkplace('grossSalary', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Educational Background */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Educational Background</h3>
              <p className="text-gray-600 mb-4">List your academic qualifications, such as degrees and diplomas.</p>
              <EducationForm
                education={applicationData.qualifications.educationalBackground}
                onEducationChange={(edu) => updateQualifications('educationalBackground', edu)}
                onEducationAdd={(edu) => updateQualifications('educationalBackground', [...applicationData.qualifications.educationalBackground, edu])}
                onEducationRemove={(id) => updateQualifications('educationalBackground', applicationData.qualifications.educationalBackground.filter(edu => edu.id !== id))}
              />
            </div>
          )}

          {/* Step 4: Professional Qualifications */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Qualifications</h3>
              <p className="text-gray-600 mb-4">List your professional qualifications, such as certifications and licenses.</p>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Registration to professional bodies</h4>
                <p className="text-gray-600 mb-4">Here, you'll add any registrations/associations with professional bodies such as ICPAK, EBK, etc.</p>
                <div className="space-y-4">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    placeholder="Professional Body Registration"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-ncpd-primary text-white rounded-lg hover:bg-ncpd-secondary"
                  >
                    Add Registration
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Work Experience */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Work Experience</h3>
              <p className="text-gray-600 mb-4">List your work experiences, including details and duration.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Management Experience (yrs)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.qualifications.managementExperience}
                    onChange={(e) => updateQualifications('managementExperience', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Experience (yrs)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.qualifications.workExperience}
                    onChange={(e) => updateQualifications('workExperience', e.target.value)}
                  />
                </div>
              </div>
              
              <ExperienceForm
                experiences={applicationData.workExperience}
                onExperienceChange={updateWorkExperience}
                onExperienceAdd={(exp) => updateWorkExperience([...applicationData.workExperience, exp])}
                onExperienceRemove={(id) => updateWorkExperience(applicationData.workExperience.filter(exp => exp.id !== id))}
              />
            </div>
          )}

          {/* Step 6: Other Details */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Other Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proficient Languages *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                    value={applicationData.otherDetails.proficientLanguages}
                    onChange={(e) => updateOtherDetails('proficientLanguages', e.target.value)}
                    placeholder="e.g. English, Swahili"
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={applicationData.otherDetails.isImpaired}
                      onChange={(e) => updateOtherDetails('isImpaired', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Are you impaired?</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={applicationData.otherDetails.convictedOnProbation}
                      onChange={(e) => updateOtherDetails('convictedOnProbation', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Have you been convicted on probation?</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={applicationData.otherDetails.dismissedFromEmployment}
                      onChange={(e) => updateOtherDetails('dismissedFromEmployment', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Have you been dismissed from employment?</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={applicationData.otherDetails.ongoingInvestigation}
                      onChange={(e) => updateOtherDetails('ongoingInvestigation', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Do you have an ongoing investigation?</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={applicationData.otherDetails.relativesInPPRA}
                      onChange={(e) => updateOtherDetails('relativesInPPRA', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Do you have relatives in PPRA?</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={applicationData.otherDetails.taxCompliant}
                      onChange={(e) => updateOtherDetails('taxCompliant', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Are you tax compliant?</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={applicationData.otherDetails.violatedLaws}
                      onChange={(e) => updateOtherDetails('violatedLaws', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Have you violated any laws?</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={applicationData.otherDetails.helbLoan}
                      onChange={(e) => updateOtherDetails('helbLoan', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Do you have a HELB loan?</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Referees */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Referees</h3>
              <p className="text-gray-600 mb-4">List your referees, including their contact information.</p>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Referee 1</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                      placeholder="Full Name"
                    />
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                      placeholder="Position/Title"
                    />
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                      placeholder="Email Address"
                    />
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ncpd-primary focus:border-ncpd-primary"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  className="px-4 py-2 bg-ncpd-primary text-white rounded-lg hover:bg-ncpd-secondary"
                >
                  Add Another Referee
                </button>
              </div>
            </div>
          )}

          {/* Step 8: Documents */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Documents</h3>
              
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h4>
                <CVUpload
                  documents={applicationData.documents}
                  onDocumentsChange={updateDocuments}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-ncpd-primary text-white rounded-md hover:bg-ncpd-secondary"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-ncpd-primary text-white rounded-md hover:bg-ncpd-secondary"
              >
                Submit Application
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}

// Contact Page Component0
function ContactPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-ncpd-primary mb-6">
          Contact Us
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Head Office</h3>
                <p className="text-gray-600">
                  Integrity Centre, Nairobi<br />
                  P.O. Box 28331-00100<br />
                  Nairobi, Kenya
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">Phone</h3>
                <p className="text-gray-600">+254 20 271 7000</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-gray-600">info@ncpd.go.ke</p>
                <p className="text-gray-600">recruitment@ncpd.go.ke</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Send us a Message</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ncpd-primary" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ncpd-primary" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ncpd-primary" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ncpd-primary"></textarea>
              </div>
              
              <button type="submit" className="bg-ncpd-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-ncpd-secondary transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}


// Login Page Component
function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
      <Login />
    </main>
  )
}

// Register Page Component
function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Register />
    </main>
  )
}

// Main App Component
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-2">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/personal-details" element={<PersonalDetails />} />
          <Route path="/education" element={<Education />} />
          <Route path="/trainings" element={<Trainings />} />
          <Route path="/professional-membership" element={<ProfessionalMembership />} />
          <Route path="/employment" element={<Employment />} />
          <Route path="/files" element={<Files />} />
          <Route path="/help" element={<Help />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/vacancies" element={<JobListings />} />
          <Route path="/hr" element={<ProtectedRoute requiredRole={[ 'hr', 'staff' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/dashboard" element={<ProtectedRoute requiredRole={[ 'hr', 'staff' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/vacancies" element={<ProtectedRoute requiredRole={[ 'hr', 'staff' ]}><VacancyManagement /></ProtectedRoute>} />
          <Route path="/hr/vacancies/create" element={<ProtectedRoute requiredRole={[ 'hr', 'staff' ]}><VacancyForm /></ProtectedRoute>} />
          <Route path="/hr/vacancies/:id/edit" element={<ProtectedRoute requiredRole={[ 'hr', 'staff' ]}><VacancyForm /></ProtectedRoute>} />
          <Route path="/hr/applications" element={<ProtectedRoute requiredRole={[ 'hr', 'staff' ]}><ApplicationsManagement /></ProtectedRoute>} />
          <Route path="/hr/applications/:id" element={<ProtectedRoute requiredRole={[ 'hr', 'staff' ]}><ApplicationDetail /></ProtectedRoute>} />
                    <Route path="/apply" element={<ApplyPage />} />
          <Route path="/apply/:jobId" element={<ApplyPage />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  )
}

export default App
