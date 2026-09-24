import React, { useState } from 'react'
import { Star, TrendingUp, TrendingDown, Eye, MessageSquare, ChevronDown, ChevronUp, User, Mail, Briefcase, GraduationCap, MapPin, Calendar, CheckCircle, XCircle, Zap, Shield, Award } from 'lucide-react'

export function CandidateScoringTable({ candidates = [], onView = () => {}, onMessage = () => {}, onScoreUpdate, selectedIds = [], bulkSelectMode }) {
  const [sortField, setSortField] = useState('score')
  const [sortDirection, setSortDirection] = useState('desc')

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedCandidates = [...(candidates || [])].sort((a, b) => {
    const aValue = a[sortField] || a.ai_score || a.score || 0
    const bValue = b[sortField] || b.ai_score || b.score || 0
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-600', progress: 'bg-emerald-500' }
    if (score >= 60) return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600', progress: 'bg-blue-500' }
    if (score >= 40) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-600', progress: 'bg-amber-500' }
    return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: 'text-rose-600', progress: 'bg-rose-500' }
  }

  const getScoreIcon = (score) => {
    if (score >= 80) return <TrendingUp className="w-4 h-4" />
    if (score >= 60) return <Star className="w-4 h-4" />
    return <TrendingDown className="w-4 h-4" />
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
      under_review: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      longlisted: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
      shortlisted: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
      interview_scheduled: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      interview_completed: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
      rejected: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
      hired: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
    }
    return statusConfig[status] || statusConfig.submitted
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-gray-100/50">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100/50 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              Candidate Scoring
            </h3>
            <p className="text-sm text-gray-600 mt-1">AI-powered candidate evaluation and ranking</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              {sortedCandidates.length} candidates
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100/50">
          <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
            <tr>
              {bulkSelectMode && (
                <th className="px-4 py-4 text-left">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
              )}
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th 
                className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center gap-2">
                  AI Score
                  {sortField === 'score' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Skills Match
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Experience
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100/50">
            {sortedCandidates.map((candidate, index) => {
              const score = candidate.ai_score || candidate.score || 0
              const scoreColors = getScoreColor(score)
              const statusBadge = getStatusBadge(candidate.status)
              const displayName = candidate.name || candidate.applicant_name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Candidate Name'
              
              return (
                <tr key={candidate.id || index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                  {bulkSelectMode && (
                    <td className="px-4 py-4">
                      <label className="relative cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedIds?.includes(candidate.id)} 
                          onChange={(e) => {
                            // Handle bulk selection
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </td>
                  )}
                  
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${scoreColors.bg} ${scoreColors.border} border-2 flex items-center justify-center flex-shrink-0`}>
                        <User className={`w-5 h-5 ${scoreColors.icon}`} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {displayName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {candidate.email || candidate.applicant_email || 'email@example.com'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${scoreColors.bg} ${scoreColors.border} border-2`}>
                      {getScoreIcon(score)}
                      <span className={scoreColors.text}>{score}%</span>
                    </div>
                  </td>
                  
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {candidate.position || candidate.job?.title || candidate.current_position || 'Position'}
                    </div>
                  </td>
                  
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${scoreColors.progress}`}
                          style={{ width: `${candidate.skills_match || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">{candidate.skills_match || 0}%</span>
                    </div>
                  </td>
                  
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {candidate.experience || (candidate.experience_years ? `${candidate.experience_years} yrs` : 'N/A')}
                    </div>
                  </td>
                  
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} border`}>
                      <Shield className="w-3.5 h-3.5" />
                      {candidate.status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Submitted'}
                    </span>
                  </td>
                  
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView?.(candidate)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all hover:scale-110"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onMessage?.(candidate)}
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all hover:scale-110"
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {(!candidates || candidates.length === 0) && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Candidates Found</h3>
          <p className="text-gray-500">Start reviewing applications to see AI-powered scoring here.</p>
        </div>
      )}
    </div>
  )
}
