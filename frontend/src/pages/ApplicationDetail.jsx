import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { hrAPI, aiAPI } from '../services/api'
import ShortlistingScoring from '../components/ShortlistingScoring'

export default function ApplicationDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery(['hr:application', id], async () => {
    const res = await hrAPI.getApplication(id)
    return res.data
  })

  const [parsed, setParsed] = React.useState(null)
  const [parsing, setParsing] = React.useState(false)

  const handleParseCV = async (file) => {
    try {
      setParsing(true)
      const res = await aiAPI.parseCV(file)
      setParsed(res.data)
    } catch (err) {
      console.error('CV parse failed', err)
      alert('CV parsing failed')
    } finally {
      setParsing(false)
    }
  }

  const updateStatus = useMutation(({ id, status }) => hrAPI.updateApplicationStatus(id, { status }), {
    onSuccess: () => queryClient.invalidateQueries('hr:applications')
  })

  if (isLoading) return <div className="p-8">Loading application...</div>
  if (error) return <div className="p-8 text-red-600">Failed to load application</div>

  const app = data

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded shadow p-6">
        <h1 className="text-xl font-bold text-ncpd-primary mb-4">Application Detail</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="font-semibold text-lg">{app.applicant_name || app.user?.firstName + ' ' + app.user?.lastName}</h2>
            <p className="text-sm text-gray-600">Applied for: {app.job?.title || app.vacancy_title}</p>
            <div className="mt-4">
              <h3 className="font-medium">Personal Details</h3>
              <ul className="text-sm text-gray-700 mt-2">
                <li>Email: {app.user?.email}</li>
                <li>Phone: {app.user?.phone_number}</li>
                <li>County: {app.user?.county}</li>
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="font-medium">Education & Experience</h3>
              <pre className="text-sm bg-gray-50 p-3 rounded mt-2">{JSON.stringify(app.profile || app.qualifications || {}, null, 2)}</pre>
            </div>

            <div className="mt-4">
              <h3 className="font-medium">Documents</h3>
              <ul className="text-sm mt-2">
                {app.documents?.cv && <li><a href={app.documents.cv} target="_blank" rel="noreferrer" className="text-blue-600">Download CV</a></li>}
                {app.documents?.cover_letter && <li><a href={app.documents.cover_letter} target="_blank" rel="noreferrer" className="text-blue-600">Download Cover Letter</a></li>}
              </ul>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Upload CV to parse</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && handleParseCV(e.target.files[0])} className="mt-2" />
                {parsing && <div className="text-sm text-gray-600 mt-2">Parsing CV...</div>}
                {parsed && (
                  <div className="mt-3 bg-white p-3 border rounded text-sm">
                    <strong>Parsed CV:</strong>
                    <pre className="whitespace-pre-wrap mt-2 text-xs">{JSON.stringify(parsed, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="p-4 border rounded">
            <h3 className="font-medium">Status</h3>
            <p className="text-sm text-gray-700 mt-2">{app.status}</p>

            <div className="mt-4 space-y-2">
              <button onClick={() => updateStatus.mutate({ id: app.id, status: 'shortlisted' })} className="w-full btn-success">Shortlist</button>
              <button onClick={() => updateStatus.mutate({ id: app.id, status: 'rejected' })} className="w-full btn-danger">Reject</button>
              <button onClick={() => updateStatus.mutate({ id: app.id, status: 'interview_scheduled' })} className="w-full btn-primary">Schedule Interview</button>
            </div>
            
            <div className="mt-4">
              <ShortlistingScoring
                applicant={parsed || app.profile || {}}
                vacancy={app.job || { requirements: app.job?.qualifications || '' }}
                onApplyScore={(score) => {
                  // store score as ai_score via API patch
                  updateStatus.mutate({ id: app.id, status: app.status })
                  // optionally send score to backend using hrAPI.updateApplicationStatus
                  hrAPI.updateApplicationStatus(app.id, { ai_score: score }).then(() => {
                    queryClient.invalidateQueries('hr:applications')
                    alert('Score applied: ' + score)
                  }).catch(() => {})
                }}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
