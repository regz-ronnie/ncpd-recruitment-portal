import React from 'react'
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Star, TrendingUp, TrendingDown, Eye, MessageSquare, CheckCircle, XCircle, Calendar, Building2, Clock, Award, ChevronRight, Shield, Zap } from 'lucide-react'

export const ApplicationCard = ({ application, onAction, onSelect, isSelected, onView, bulkSelectMode }) => {
  const { id, name, applicant_name, first_name, last_name, ai_score, matching_result, status, experience_years, education_level, email, phone, county, created_at, applied_date } = application

  const displayName = name || applicant_name || `${first_name || ''} ${last_name || ''}`.trim() || 'Unnamed'
  const position = application.job?.title || application.position || 'Position'
  const score = ai_score != null ? ai_score : 0

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-600', progress: 'bg-emerald-500' }
    if (score >= 60) return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600', progress: 'bg-blue-500' }
    if (score >= 40) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-600', progress: 'bg-amber-500' }
    return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: 'text-rose-600', progress: 'bg-rose-500' }
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

  const scoreColors = getScoreColor(score)
  const statusBadge = getStatusBadge(status)

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-100/50 overflow-hidden">
      {/* Decorative gradient border */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${score >= 80 ? 'from-emerald-500 to-teal-500' : score >= 60 ? 'from-blue-500 to-indigo-500' : score >= 40 ? 'from-amber-500 to-orange-500' : 'from-rose-500 to-pink-500'}`} />
      
      {/* Bulk selection checkbox */}
      {bulkSelectMode && (
        <div className="absolute top-3 right-3 z-10">
          <label className="relative cursor-pointer">
            <input 
              type="checkbox" 
              checked={isSelected} 
              onChange={(e) => onSelect && onSelect(e.target.checked)} 
              className="sr-only peer"
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              isSelected 
                ? 'bg-blue-600 border-blue-600' 
                : 'border-gray-300 peer-hover:border-blue-400'
            }`}>
              {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
            </div>
          </label>
        </div>
      )}

      <div className="p-5 sm:p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${scoreColors.bg} ${scoreColors.border} border-2 flex items-center justify-center flex-shrink-0`}>
            <User className={`w-7 h-7 sm:w-8 sm:h-8 ${scoreColors.icon}`} />
          </div>

          {/* Name and Position */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {displayName}
            </h3>
            <p className="text-sm text-gray-600 truncate mt-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
              {position}
            </p>
          </div>

          {/* AI Score Badge */}
          <div className={`flex-shrink-0 ${scoreColors.bg} ${scoreColors.border} border-2 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2`}>
            <div className="flex items-center gap-1.5">
              {score >= 80 ? <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${scoreColors.icon}`} /> : 
               score >= 60 ? <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${scoreColors.icon}`} /> : 
               <TrendingDown className={`w-4 h-4 sm:w-5 sm:h-5 ${scoreColors.icon}`} />}
              <span className={`text-sm sm:text-base font-bold ${scoreColors.text}`}>
                {score}%
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} border`}>
            <Shield className="w-3.5 h-3.5" />
            {status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Submitted'}
          </span>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <GraduationCap className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span className="truncate">{education_level || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Briefcase className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span>{experience_years ? `${experience_years} yrs` : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span className="truncate">{county || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span>{formatDate(applied_date || created_at)}</span>
          </div>
        </div>

        {/* Skills Match */}
        {matching_result?.matched_skills && matching_result.matched_skills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-gray-700">Matched Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matching_result.matched_skills.slice(0, 4).map((skill, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100"
                >
                  {skill}
                </span>
              ))}
              {matching_result.matched_skills.length > 4 && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                  +{matching_result.matched_skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Score Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-700">Overall Match</span>
            <span className={`text-xs font-bold ${scoreColors.text}`}>{score}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${scoreColors.progress}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView && onView(application)}
            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => onAction && onAction(application, 'shortlisted')}
            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            <CheckCircle className="w-4 h-4" />
            Shortlist
          </button>
          <button
            onClick={() => onAction && onAction(application, 'rejected')}
            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-sm font-semibold rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  )
}

export default ApplicationCard
