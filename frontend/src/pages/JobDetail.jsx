import React from 'react'
import { useParams, Link } from 'react-router-dom'

export function JobDetail() {
  const { id } = useParams()
  
  // Mock job data - this would normally come from API
  const job = {
    id: parseInt(id),
    title: 'Senior Investigator',
    department: 'Investigations Division',
    location: 'Nairobi',
    type: 'Full-time',
    salary: 'KES 150,000 - 200,000 per month',
    description: 'Lead complex corruption investigations and coordinate with law enforcement agencies.',
    requirements: [
      'Bachelor\'s degree in Law, Criminology, or related field',
      'Minimum 5 years experience in investigations',
      'Strong analytical and problem-solving skills',
      'Excellent communication and report writing skills',
      'Ability to work under pressure and meet deadlines'
    ],
    responsibilities: [
      'Lead and coordinate corruption investigations',
      'Gather and analyze evidence',
      'Prepare comprehensive investigation reports',
      'Work closely with law enforcement agencies',
      'Testify in court when required'
    ]
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="mb-6">
        <Link to="/jobs" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Job Listings
        </Link>
      </div>

      <div className="border-b pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {job.title}
        </h1>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
            {job.department}
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
            {job.location}
          </span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded">
            {job.type}
          </span>
        </div>

        <div className="text-lg font-semibold text-gray-700">
          Salary: {job.salary}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Job Description
          </h2>
          <p className="text-gray-700 mb-6">
            {job.description}
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Key Responsibilities
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            {job.responsibilities.map((resp, index) => (
              <li key={index}>{resp}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Requirements
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Ready to Apply?
            </h3>
            <p className="text-gray-700 mb-4">
              Join our team in the fight against corruption and help build a better future for Kenya.
            </p>
            <Link 
              to={`/apply/${job.id}`}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply for This Position
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
