import React, { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from 'react-query'
import { hrAPI } from '../services/api'
import { BarChart3, FileText, ClipboardList, Activity, ChevronLeft } from 'lucide-react'

const reportTabs = [
  { key: 'recruitment', label: 'Recruitment', description: 'Recruitment KPIs and vacancy performance.', icon: ClipboardList },
  { key: 'applicants', label: 'Applicants', description: 'Applicant analytics, diversity and progress metrics.', icon: FileText },
  { key: 'interviews', label: 'Interviews', description: 'Interview pipeline metrics and rating distribution.', icon: Activity },
  { key: 'analytics', label: 'Analytics', description: 'Portal analytics and summary dashboards.', icon: BarChart3 },
]

export function AdminReportsPage({ defaultView }) {
  const location = useLocation()
  const path = location.pathname.replace(/^\/admin\/reports\/?/, '')
  const activeKey = path || defaultView || 'recruitment'
  const activeTab = reportTabs.find((tab) => tab.key === activeKey) || reportTabs[0]
  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    ['admin-reports', activeKey],
    async () => {
      if (activeKey === 'analytics') {
        const response = await hrAPI.getAnalytics()
        return response.data
      }
      const response = await hrAPI.getReports({ type: activeKey })
      return response.data
    },
    { staleTime: 2 * 60 * 1000 }
  )

  const summary = useMemo(() => {
    if (!analytics) return null
    if (activeKey === 'analytics') {
      return analytics
    }
    return analytics.summary || analytics || null
  }, [analytics, activeKey])

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3 text-slate-600">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[240px_1fr]">
          <aside className="space-y-3 rounded-3xl bg-white p-5 shadow-xl border border-slate-200">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Reports</p>
              <p className="mt-2 text-sm text-slate-600">Choose a report category to review hiring and operational performance.</p>
            </div>
            <div className="mt-4 space-y-2">
              {reportTabs.map((tab) => (
                <Link
                  key={tab.key}
                  to={`/admin/reports/${tab.key}`}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium ${activeTab.key === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </aside>

          <section className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-white">
                  <activeTab.icon className="h-7 w-7" />
                </div>
                <h1 className="mt-6 text-3xl font-bold text-slate-900">{activeTab.label} Reports</h1>
                <p className="mt-3 text-slate-600 max-w-2xl">{activeTab.description}</p>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-900">Report status</p>
                <p className="mt-3 text-sm text-slate-600">{analyticsLoading ? 'Loading report data…' : summary ? 'Report data is available.' : 'No report data found for this category.'}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-900">Updated</p>
                <p className="mt-3 text-sm text-slate-600">{analyticsLoading ? 'Loading…' : analytics?.updated_at || 'Real-time data from the HR service.'}</p>
              </div>
            </div>

            <div className="mt-10 space-y-5">
              {analyticsLoading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading analytics content...</div>
              ) : summary ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
                  <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(summary, null, 2)}</pre>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
                  <p>No report details were returned by the backend.</p>
                  <p className="mt-2 text-slate-500">Try another report category or check the HR reports API.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
