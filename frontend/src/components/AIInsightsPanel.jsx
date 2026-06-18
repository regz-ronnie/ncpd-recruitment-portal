import React from 'react'

export const AIInsightsPanel = ({ insights }) => {
  if (!insights) return null

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-3">AI Insights</h3>
      <div className="space-y-2 text-sm text-gray-700">
        {insights.summary && <div>{insights.summary}</div>}
        {insights.top_skills && (
          <div>
            <div className="text-xs text-gray-500">Top Skills</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {insights.top_skills.map((s) => (
                <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{s}</span>
              ))}
            </div>
          </div>
        )}
        {insights.recommendations && (
          <div>
            <div className="text-xs text-gray-500">Recommendations</div>
            <ul className="list-disc list-inside mt-1 text-gray-600">
              {insights.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIInsightsPanel
