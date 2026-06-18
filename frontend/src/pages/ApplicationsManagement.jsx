import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { hrAPI } from '../services/api'
import { Link } from 'react-router-dom'

export default function ApplicationsManagement() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  const { data: resp, isLoading, error } = useQuery(['hr:applications', page, pageSize, sortBy, sortDir], async () => {
    const ordering = sortBy ? (sortDir === 'desc' ? `-${sortBy}` : sortBy) : undefined
    const res = await hrAPI.listApplications({ page, page_size: pageSize, ordering })
    return res.data
  }, { keepPreviousData: true })

  const applications = resp?.results || resp || []
  const total = resp?.count ?? (Array.isArray(resp) ? resp.length : 0)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const updateStatus = useMutation(({ id, status }) => hrAPI.updateApplicationStatus(id, { status }), {
    onSuccess: () => queryClient.invalidateQueries('hr:applications')
  })

  if (isLoading) return <div className="p-8">Loading applications...</div>
  if (error) return <div className="p-8 text-red-600">Failed to load applications</div>

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-ncpd-primary">Applications</h1>
          <div className="flex items-center space-x-3">
            <label className="text-sm">Sort:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-input">
              <option value="created_at">Date</option>
              <option value="ai_score">AI Score</option>
              <option value="status">Status</option>
            </select>
            <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} className="form-input">
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
            <label className="text-sm">Page size:</label>
            <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1) }} className="form-input">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left">
                <th className="p-2 border">Applicant</th>
                <th className="p-2 border">Vacancy</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications?.map(app => (
                <tr key={app.id} className="align-top">
                  <td className="p-2 border">{app.applicant_name || app.user?.firstName + ' ' + app.user?.lastName}</td>
                  <td className="p-2 border">{app.job?.title || app.vacancy_title}</td>
                  <td className="p-2 border">{new Date(app.created_at).toLocaleDateString()}</td>
                  <td className="p-2 border">{app.status}</td>
                  <td className="p-2 border space-x-2">
                    <Link to={`/hr/applications/${app.id}`} className="text-sm text-blue-600">View</Link>
                    <button onClick={() => updateStatus.mutate({ id: app.id, status: 'shortlisted' })} className="text-sm text-green-600">Shortlist</button>
                    <button onClick={() => updateStatus.mutate({ id: app.id, status: 'rejected' })} className="text-sm text-red-600">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">Showing page {page} of {totalPages} ({total} applications)</div>
          <div className="flex items-center space-x-2">
            <button disabled={page <= 1} onClick={() => setPage(1)} className="px-3 py-1 border rounded">First</button>
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
            {(() => {
              const start = Math.max(1, page - 2)
              const end = Math.min(totalPages, page + 2)
              const pages = []
              for (let i = start; i <= end; i++) pages.push(i)
              return pages.map(pn => (
                <button key={pn} onClick={() => setPage(pn)} className={`px-3 py-1 border rounded ${pn === page ? 'bg-ncpd-primary text-white' : ''}`}>{pn}</button>
              ))
            })()}
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded">Next</button>
            <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-3 py-1 border rounded">Last</button>
          </div>
        </div>
      </div>
    </main>
  )
}
