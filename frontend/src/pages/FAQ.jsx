import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  QuestionMarkCircleIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  UserIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/outline'

export function FAQ() {
  const [openItems, setOpenItems] = useState({})

  const faqData = [
    {
      id: 1,
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an account on the NCPD Recruitment Portal?",
          a: "To create an account, click on the 'Register' button on the homepage. Fill in your personal details, create a secure password, and verify your email address. The process takes approximately 5-10 minutes."
        },
        {
          q: "What documents do I need to register?",
          a: "You will need: National ID/Passport, CV/Resume, academic certificates, professional certificates, and a recent passport-size photograph. All documents should be scanned and uploaded in PDF format."
        },
        {
          q: "Is there an age requirement for applicants?",
          a: "Yes, applicants must be at least 18 years old to apply for positions at NCPD. Some positions may have specific age requirements as stated in the job descriptions."
        }
      ]
    },
    {
      id: 2,
      category: "Application Process",
      questions: [
        {
          q: "How do I apply for a vacancy?",
          a: "Browse available vacancies on the portal, select a position that matches your qualifications, and click 'Apply Now'. Complete the application form and upload required documents. You will receive an email confirmation."
        },
        {
          q: "Can I apply for multiple positions at once?",
          a: "Yes, you can apply for multiple positions. However, we recommend focusing on positions that best match your qualifications and experience for better chances of success."
        },
        {
          q: "How will I know if my application is received?",
          a: "You will receive an automatic email confirmation within 24 hours of submitting your application. You can also track your application status in your candidate dashboard."
        }
      ]
    },
    {
      id: 3,
      category: "Technical Support",
      questions: [
        {
          q: "I forgot my password. How do I reset it?",
          a: "Click on 'Forgot Password' on the login page. Enter your registered email address, and we will send you a password reset link. The link expires after 24 hours for security reasons."
        },
        {
          q: "What browsers are supported by the portal?",
          a: "The NCPD Recruitment Portal supports modern browsers including Chrome, Firefox, Safari, and Edge. For best experience, we recommend using the latest version of your preferred browser."
        },
        {
          q: "Who do I contact for technical assistance?",
          a: "For technical support, email us at recruitment@ncpd.go.ke or call +254 20 2020 during office hours (Monday-Friday, 8:00 AM - 5:00 PM)."
        }
      ]
    },
    {
      id: 4,
      category: "Recruitment Process",
      questions: [
        {
          q: "How long does the recruitment process take?",
          a: "The recruitment process typically takes 4-6 weeks from application deadline to final selection. Shortlisted candidates will be contacted for interviews within 2-3 weeks."
        },
        {
          q: "What types of interviews does NCPD conduct?",
          a: "We conduct various types of interviews including technical assessments, panel interviews, and practical exercises depending on the position. All interviews are conducted either virtually or in-person."
        },
        {
          q: "Will I receive feedback if not selected?",
          a: "Yes, all applicants receive notification of the final decision. While we cannot provide individual feedback due to volume, we encourage you to apply for future opportunities."
        }
      ]
    }
  ]

  const toggleItem = (categoryId) => {
    setOpenItems(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

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
              <Link to="/faq" className="gov-nav-link-active">FAQs</Link>
              <Link to="/data-protection" className="gov-nav-link">Data Protection</Link>
              <Link to="/contact" className="gov-nav-link">Contact Us</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="responsive-container py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <QuestionMarkCircleIcon className="w-16 h-16 text-ncpd-primary mx-auto mb-4" />
          <h1 className="section-title">Frequently Asked Questions</h1>
          <p className="section-subtitle">
            Find answers to common questions about the NCPD Recruitment Portal
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-8">
          {faqData.map((category) => (
            <div key={category.id} className="card">
              <div className="card-header">
                <button
                  onClick={() => toggleItem(category.id)}
                  className="w-full flex items-center justify-between text-left p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <QuestionMarkCircleIcon className="w-6 h-6 text-ncpd-primary mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category.category}
                    </h3>
                  </div>
                  {openItems[category.id] ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>

              {openItems[category.id] && (
                <div className="px-6 pb-6">
                  <div className="space-y-6">
                    {category.questions.map((item, index) => (
                      <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-start space-x-3 mb-2">
                          <QuestionMarkCircleIcon className="w-5 h-5 text-ncpd-primary flex-shrink-0 mt-0.5" />
                          <h4 className="text-md font-semibold text-gray-900 flex-1">
                            {item.q}
                          </h4>
                        </div>
                      </div>
                      <p className="text-gray-700 pl-8 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-start space-x-4">
              <ShieldCheckIcon className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Still Need Help?
                </h3>
                <p className="text-blue-800 mb-4">
                  Can't find the answer you're looking for? Our support team is here to help you with any questions about the recruitment process.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/contact" className="btn-primary flex items-center justify-center">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Contact Support Team
                  </Link>
                  <Link to="/data-protection" className="btn-outline flex items-center justify-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Data Protection Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
