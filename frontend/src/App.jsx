import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Navigation } from './components/Navigation'
import { HRHeader } from './components/HRHeader'
import { ProtectedRoute } from './components/ProtectedRoute'
import { initializeJobsIfEmpty } from './utils/seedJobs'

// Import page components
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminRegisterHR } from './pages/AdminRegisterHR'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminUserManagement } from './pages/AdminUserManagement'
import { AdminFeaturePage } from './pages/AdminFeaturePage'
import { AdminLayout } from './components/AdminLayout'
import { AdminReportsPage } from './pages/AdminReportsPage'
import { Dashboard } from './pages/Dashboard'
import { HRDashboard } from './pages/HRDashboard'
import { ProfessionalMembership } from './pages/ProfessionalMembership'
import { Help } from './pages/Help'
import { FAQ } from './pages/FAQ'
import { AboutPage } from './pages/AboutPage'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { Contact } from './pages/Contact'
import { JobListings } from './pages/JobListings'
import { JobDetail } from './pages/JobDetail'
import { ApplicantDashboard } from './pages/ApplicantDashboard'
import ApplicationSuccess from './pages/ApplicationSuccess'
import VacancyManagement from './pages/VacancyManagement'
import ApplicationsManagement from './pages/ApplicationsManagement'
import VacancyForm from './pages/VacancyForm'
import ApplicationDetail from './pages/ApplicationDetail'
import { EducationForm } from './components/EducationForm'
import { ExperienceForm } from './components/ExperienceForm'
import { CVUpload } from './components/CVUpload'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { CandidateProfile } from './pages/CandidateProfile'
import Internships from './pages/Internships'
import AttachmentsPage from './pages/AttachmentsPage'
import Announcements from './pages/Announcements'
import Downloads from './pages/Downloads'
import Chat from './pages/Chat'
import './index.css'

// ApplyPage component (inline for now - should be extracted later)
function ApplyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-ncpd-primary mb-6">Application Form</h1>
        <p className="text-gray-600">Application form component - this should be extracted to a separate file.</p>
      </div>
    </div>
  )
}

// Main App Component
function AppContent() {
  const location = useLocation()
  const isHRRoute = location.pathname.startsWith('/hr')
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Initialize jobs from database on app startup
  useEffect(() => {
    // Disabled auto-seeding to prevent repeated API errors
    // initializeJobsIfEmpty()
  }, [])

  // HR Dashboard action handlers
  const handleRunAIMatching = () => {
    console.log('Run AI Matching')
    // This will be connected to the HRDashboard component
  }

  const handleAutoShortlist = () => {
    console.log('Auto Shortlist')
    // This will be connected to the HRDashboard component
  }

  const handleRefresh = () => {
    console.log('Refresh Data')
    // This will be connected to the HRDashboard component
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isHRRoute ? (
        <HRHeader 
          onRunAIMatching={handleRunAIMatching}
          onAutoShortlist={handleAutoShortlist}
          onRefresh={handleRefresh}
        />
      ) : isAdminRoute ? null : <Header />}
      
      <main className={isHRRoute ? "pt-4" : "pt-2"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/my-profile" element={<ProtectedRoute><CandidateProfile /></ProtectedRoute>} />
          <Route path="/professional-membership" element={<ProtectedRoute><ProfessionalMembership /></ProtectedRoute>} />
          <Route path="/help" element={<Help />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/vacancies" element={<JobListings />} />
          <Route path="/vacancies/:id" element={<JobDetail />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/application-success" element={<ProtectedRoute><ApplicationSuccess /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute><ApplicantDashboard /></ProtectedRoute>} />
          <Route path="/internships" element={<ProtectedRoute><Internships /></ProtectedRoute>} />
          <Route path="/attachments" element={<ProtectedRoute><AttachmentsPage /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
          <Route path="/downloads" element={<ProtectedRoute><Downloads /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/hr" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/dashboard" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/interviews" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/candidates" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/settings" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/eligibility" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/shortlisting" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/longlisting" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/communication" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/pipeline" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/shortlisted" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/hiring" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/reports" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/audit" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/document-verification" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/panel-management" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/approval-workflow" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/register" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><AdminRegisterHR /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole={[ 'admin' ]}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="register" element={<AdminRegisterHR />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="recruitment" element={<VacancyManagement />} />
            <Route path="recruitment/vacancies" element={<VacancyManagement />} />
            <Route path="recruitment/vacancies/create" element={<VacancyForm />} />
            <Route path="recruitment/vacancies/:id/edit" element={<VacancyForm />} />
            <Route path="recruitment/applications" element={<ApplicationsManagement />} />
            <Route path="recruitment/applications/:id" element={<ApplicationDetail />} />
            <Route path="reports" element={<AdminReportsPage defaultView="recruitment" />} />
            <Route path="reports/recruitment" element={<AdminReportsPage defaultView="recruitment" />} />
            <Route path="reports/applicants" element={<AdminReportsPage defaultView="applicants" />} />
            <Route path="reports/interviews" element={<AdminReportsPage defaultView="interviews" />} />
            <Route path="reports/analytics" element={<AdminReportsPage defaultView="analytics" />} />
            <Route path=":section" element={<AdminFeaturePage />} />
            <Route path=":section/:subsection" element={<AdminFeaturePage />} />
          </Route>
          <Route path="/hr/vacancies" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><VacancyManagement /></ProtectedRoute>} />
          <Route path="/hr/vacancies/create" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><VacancyForm /></ProtectedRoute>} />
          <Route path="/hr/vacancies/:id/edit" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><VacancyForm /></ProtectedRoute>} />
          <Route path="/hr/applications" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><ApplicationsManagement /></ProtectedRoute>} />
          <Route path="/hr/applications/:id" element={<ProtectedRoute requiredRole={[ 'hr', 'staff', 'admin' ]}><ApplicationDetail /></ProtectedRoute>} />
        </Routes>
      </main>
      
      {!isHRRoute && <Footer />}
    </div>
  )
}

function App() {
  return (
    <AppContent />
  )
}

export default App
