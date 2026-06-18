import React from 'react'
import { Users, Briefcase, TrendingUp, Clock, Target, BarChart3 } from 'lucide-react'

export function MetricsOverview({ metrics }) {
  const defaultMetrics = {
    totalApplications: 156,
    activeJobs: 8,
    averageTimeToHire: 24,
    interviewRate: 65,
    offerAcceptanceRate: 78,
    diversityScore: 72
  }

  const displayMetrics = { ...defaultMetrics, ...metrics }

  const metricCards = [
    {
      title: 'Total Applications',
      value: displayMetrics.totalApplications,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Positions',
      value: displayMetrics.activeJobs,
      change: '+2',
      changeType: 'positive',
      icon: Briefcase,
      color: 'green'
    },
    {
      title: 'Avg. Time to Hire',
      value: `${displayMetrics.averageTimeToHire} days`,
      change: '-3 days',
      changeType: 'positive',
      icon: Clock,
      color: 'purple'
    },
    {
      title: 'Interview Rate',
      value: `${displayMetrics.interviewRate}%`,
      change: '+5%',
      changeType: 'positive',
      icon: Target,
      color: 'yellow'
    },
    {
      title: 'Offer Acceptance',
      value: `${displayMetrics.offerAcceptanceRate}%`,
      change: '+8%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Diversity Score',
      value: `${displayMetrics.diversityScore}%`,
      change: '+4%',
      changeType: 'positive',
      icon: BarChart3,
      color: 'indigo'
    }
  ]

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    }
    return colorMap[color] || colorMap.blue
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recruitment Metrics</h3>
        <p className="text-sm text-gray-600 mt-1">Key performance indicators for your recruitment process</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon
          const colorClasses = getColorClasses(metric.color)
          
          return (
            <div key={index} className={`border rounded-lg p-4 ${colorClasses}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-white bg-opacity-50`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium ${
                  metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-600 mt-1">{metric.title}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">Recent Activity</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Applications this week</span>
            <span className="font-medium text-gray-900">23</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Interviews scheduled</span>
            <span className="font-medium text-gray-900">8</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Offers extended</span>
            <span className="font-medium text-gray-900">5</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">New hires this month</span>
            <span className="font-medium text-green-600">3</span>
          </div>
        </div>
      </div>
    </div>
  )
}
