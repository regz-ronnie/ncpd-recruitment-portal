import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Help() {
  const location = useLocation()
  const [expandedFaq, setExpandedFaq] = useState(null)

  const faqs = [
    {
      id: 1,
      question: 'How do I create an account?',
      answer: 'Click on the "Register" button in the top navigation and fill in your personal details. You will receive a confirmation email to verify your account.'
    },
    {
      id: 2,
      question: 'How do I apply for a job?',
      answer: 'After logging in, navigate to the "Advertised Jobs" section, select a position you\'re interested in, and click "Apply Now". Complete the application form and submit your documents.'
    },
    {
      id: 3,
      question: 'What documents do I need to upload?',
      answer: 'You will need to upload your CV, academic certificates, professional certificates, and any other relevant supporting documents.'
    },
    {
      id: 4,
      question: 'How can I check my application status?',
      answer: 'Go to "My Applications" in the dashboard to view the status of all your submitted applications.'
    },
    {
      id: 5,
      question: 'Can I edit my application after submission?',
      answer: 'Applications can only be edited before the final submission. Once submitted, you cannot make changes.'
    }
  ]

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Help Center</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-6 py-4 border-t border-gray-200">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Email Support</h4>
                  <p className="text-gray-600 mb-4">Get help via email</p>
                  <a href="mailto:support@ncpd.go.ke" className="text-blue-600 hover:text-blue-700">support@ncpd.go.ke</a>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Phone Support</h4>
                  <p className="text-gray-600 mb-4">Call us for assistance</p>
                  <a href="tel:+254202717444" className="text-blue-600 hover:text-blue-700">+254 20 271 7444</a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Office Hours</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">Monday - Friday</p>
                    <p className="text-gray-600">8:00 AM - 5:00 PM</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Saturday - Sunday</p>
                    <p className="text-gray-600">Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
