import React from 'react'
import { Link } from 'react-router-dom'
import { useJobs } from '../hooks/useJobs'

export function JobListings() {
  const { jobs } = useJobs()

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Current Job Openings
      </h1>

      {jobs.isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading job openings...</p>
        </div>
      ) : jobs.isError ? (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Error loading job openings. Please try again later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.data?.results?.map(job => (
            <div key={job.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {job.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    {job.department && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {job.department}
                      </span>
                    )}
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {job.location}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {job.get_employment_type_display || job.employment_type}
                    </span>
                    {job.is_urgent && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                        Urgent
                      </span>
                    )}
                    {job.is_featured && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Job Description</h4>
                  <p className="text-gray-700 text-sm">
                    {job.description}
                  </p>
                </div>
                
                {job.requirements && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                    <p className="text-gray-700 text-sm">
                      {job.requirements}
                    </p>
                  </div>
                )}
                
                {job.application_deadline && (
                  <div className="text-sm text-gray-600">
                    <strong>Application Deadline:</strong> {new Date(job.application_deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <Link 
                  to={`/jobs/${job.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
                <Link 
                  to={`/apply/${job.id}`}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {jobs.data?.results?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No job openings available at the moment.
          </p>
          <p className="text-gray-400 mt-2">
            Please check back later for new opportunities.
          </p>
        </div>
      )}
    </div>
  )
}
