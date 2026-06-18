import React from 'react'

export function ApplicantDashboard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Applicant Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Applications Submitted
          </h3>
          <p className="text-3xl font-bold text-blue-600">3</p>
          <p className="text-gray-600 text-sm mt-1">Total applications</p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Under Review
          </h3>
          <p className="text-3xl font-bold text-green-600">2</p>
          <p className="text-gray-600 text-sm mt-1">Applications in progress</p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Interviews Scheduled
          </h3>
          <p className="text-3xl font-bold text-purple-600">1</p>
          <p className="text-gray-600 text-sm mt-1">Upcoming interviews</p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Applications
        </h2>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">Senior Investigator</h3>
                <p className="text-gray-600 text-sm">Applied on April 20, 2024</p>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                Under Review
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">Legal Counsel</h3>
                <p className="text-gray-600 text-sm">Applied on April 18, 2024</p>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                Interview Scheduled
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">Data Analyst</h3>
                <p className="text-gray-600 text-sm">Applied on April 15, 2024</p>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                Application Received
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          View All Applications
        </button>
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
          Browse More Jobs
        </button>
      </div>
    </div>
  )
}
