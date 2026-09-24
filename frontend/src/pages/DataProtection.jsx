import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ShieldCheckIcon, 
  LockClosedIcon,
  CheckCircleIcon,
  UserIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export function DataProtection() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gov-header">
        <div className="responsive-container">
          <div className="gov-nav py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-ncpd-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">NCPD</h1>
                  <p className="text-xs text-gray-600">Recruitment Portal</p>
                </div>
              </Link>
            </div>
            <nav className="hidden lg:flex items-center space-x-1">
              <Link to="/" className="gov-nav-link">Home</Link>
              <Link to="/faq" className="gov-nav-link">FAQs</Link>
              <Link to="/data-protection" className="gov-nav-link-active">Data Protection</Link>
              <Link to="/contact" className="gov-nav-link">Contact Us</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="responsive-container py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <ShieldCheckIcon className="w-16 h-16 text-ncpd-primary mx-auto mb-4" />
          <h1 className="section-title">Data Protection Policy</h1>
          <p className="section-subtitle">
            Your privacy and data security are our top priorities
          </p>
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Introduction */}
          <section className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <LockClosedIcon className="w-6 h-6 text-ncpd-primary mr-3" />
                Introduction
              </h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                This Data Protection Statement provides information about how the National Council for Population and Development (NCPD) 
                collects, stores, and uses personal data relating to individuals (data Subjects) who interact with our 
                Recruitment Portal. This policy applies to all job applicants, registered candidates, and users of our platform.
              </p>
              <p className="text-gray-700">
                At NCPD, we are committed to protecting your personal data and ensuring compliance with the 
                <strong>Kenya Data Protection Act, 2019</strong> and other applicable data protection laws.
              </p>
            </div>
          </section>

          {/* Data We Collect */}
          <section className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="w-6 h-6 text-ncpd-primary mr-3" />
                What Personal Data We Collect
              </h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Identity Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-6">
                  <li>Full name (first name, middle name, last name)</li>
                  <li>National ID number or Passport number</li>
                  <li>Date of birth</li>
                  <li>Gender</li>
                  <li>Nationality</li>
                  <li>Passport-size photograph</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-6">
                  <li>Physical address</li>
                  <li>Postal address</li>
                  <li>Mobile phone number</li>
                  <li>Email address</li>
                  <li>Emergency contact details</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-6">
                  <li>Curriculum Vitae (CV)/Resume</li>
                  <li>Educational qualifications and certificates</li>
                  <li>Professional certifications</li>
                  <li>Work experience and employment history</li>
                  <li>Professional references</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-6">
                  <li>KRA PIN (Tax Identification Number)</li>
                  <li>NSSF and NHIF numbers</li>
                  <li>Ethnicity and religion</li>
                  <li>Disability status (if applicable)</li>
                  <li>Criminal record declaration</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <EyeIcon className="w-6 h-6 text-ncpd-primary mr-3" />
                How We Use Your Personal Data
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Recruitment Processing</h4>
                  <p className="text-gray-700">
                    To process your job applications, assess your qualifications, verify your credentials, 
                    and communicate with you throughout the recruitment process.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Candidate Management</h4>
                  <p className="text-gray-700">
                    To create and maintain your candidate profile, track application status, 
                    and provide you with personalized job recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Compliance</h4>
                  <p className="text-gray-700">
                    To comply with legal obligations, maintain records for statutory purposes, 
                    and ensure transparency in our recruitment processes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Platform Improvement</h4>
                  <p className="text-gray-700">
                    To analyze usage patterns, improve user experience, and enhance our 
                    recruitment platform and services.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Your Data Rights */}
          <section className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <UserIcon className="w-6 h-6 text-ncpd-primary mr-3" />
                Your Data Protection Rights
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 mb-6">
                Under the Kenya Data Protection Act, 2019, you have the following rights regarding your personal data:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Right to be Informed</h4>
                  <p className="text-green-800 text-sm">
                    You have the right to know what personal data we collect, why we collect it, 
                    and how we use it.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Right of Access</h4>
                  <p className="text-blue-800 text-sm">
                    You can request access to your personal data held by NCPD.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Right to Rectification</h4>
                  <p className="text-yellow-800 text-sm">
                    You can request correction of inaccurate personal data.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Right to Erasure</h4>
                  <p className="text-red-800 text-sm">
                    You can request deletion of your personal data in certain circumstances.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Security Measures */}
          <section className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ShieldCheckIcon className="w-6 h-6 text-ncpd-primary mr-3" />
                Data Security Measures
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 mb-4">
                NCPD implements robust security measures to protect your personal data:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Technical Security</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• SSL/TLS encryption for data transmission</li>
                    <li>• Secure servers with limited access</li>
                    <li>• Regular security audits and penetration testing</li>
                    <li>• Multi-factor authentication for sensitive operations</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Organizational Security</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Staff training on data protection</li>
                    <li>• Strict access controls and authorization</li>
                    <li>• Confidentiality agreements with all personnel</li>
                    <li>• Incident response procedures</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="card bg-gradient-to-r from-ncpd-light to-white">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ArrowRightIcon className="w-6 h-6 text-ncpd-primary mr-3" />
                Contact Our Data Protection Officer
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 mb-6">
                If you have any questions, concerns, or requests regarding this Data Protection Policy 
                or your personal data, please contact our Data Protection Officer:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Email Contact</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>General Inquiries:</strong><br />
                      <a href="mailto:info@ncpd.go.ke" className="text-ncpd-primary hover:underline">
                        info@ncpd.go.ke
                      </a>
                    </p>
                    <p className="text-gray-700">
                      <strong>Data Protection Issues:</strong><br />
                      <a href="mailto:dpo@ncpd.go.ke" className="text-ncpd-primary hover:underline">
                        dpo@ncpd.go.ke
                      </a>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Physical Contact</h4>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>NCPD Headquarters</strong><br />
                      Nairobi, Kenya<br />
                      P.O. Box 30533-00100<br />
                      Tel: +254 20 2020
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                      Office Hours: Monday - Friday (8:00 AM - 5:00 PM)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
