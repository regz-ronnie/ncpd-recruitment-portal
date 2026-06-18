import React from 'react'

export const ApplicationCard = ({ application, onAction, onSelect, isSelected }) => {
  const { id, candidate_name, ai_score, matching_result } = application

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{candidate_name || application.applicant?.name || 'Unnamed'}</h3>
          <p className="text-sm text-gray-500">{application.job?.title || application.position || 'Position'}</p>
          <div className="mt-2 text-sm text-gray-600">
            <strong>Score:</strong> {ai_score != null ? ai_score : 'N/A'}
          </div>
          {matching_result?.matched_skills && (
            <div className="mt-2">
              <div className="text-xs text-gray-500">Matched skills:</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {matching_result.matched_skills.map(skill => (
                  <span key={skill} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end space-y-2">
          <label className="inline-flex items-center">
            <input type="checkbox" checked={isSelected} onChange={(e) => onSelect && onSelect(e.target.checked)} className="form-checkbox" />
          </label>

          <div className="flex flex-col space-y-2">
            <button onClick={() => onAction && onAction(application, 'shortlisted')} className="btn-success text-sm">Shortlist</button>
            <button onClick={() => onAction && onAction(application, 'rejected')} className="btn-danger text-sm">Reject</button>
            <a href={`/applications/${id}`} className="text-sm text-blue-600 hover:underline">View</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationCard
