import React from 'react'
import { Plus, Trash2, GraduationCap, Calendar } from 'lucide-react'

export function EducationForm({ education = [], onEducationChange, onEducationAdd, onEducationRemove }) {
  const addNewEducation = () => {
    onEducationAdd({
      id: Date.now(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      achievements: []
    })
  }

  const updateEducation = (id, field, value) => {
    onEducationChange(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ))
  }

  const addAchievement = (eduId) => {
    const educationItem = education.find(edu => edu.id === eduId)
    if (educationItem) {
      updateEducation(eduId, 'achievements', [...educationItem.achievements, ''])
    }
  }

  const updateAchievement = (eduId, achievementIndex, value) => {
    const educationItem = education.find(edu => edu.id === eduId)
    if (educationItem) {
      const newAchievements = [...educationItem.achievements]
      newAchievements[achievementIndex] = value
      updateEducation(eduId, 'achievements', newAchievements)
    }
  }

  const removeAchievement = (eduId, achievementIndex) => {
    const educationItem = education.find(edu => edu.id === eduId)
    if (educationItem) {
      const newAchievements = educationItem.achievements.filter((_, index) => index !== achievementIndex)
      updateEducation(eduId, 'achievements', newAchievements)
    }
  }

  const degreeLevels = [
    'High School',
    'Diploma',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Professional Certification'
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Education</h3>
        <button
          type="button"
          onClick={addNewEducation}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </button>
      </div>

      {education.map((edu, index) => (
        <div key={edu.id} className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-md font-medium text-gray-900">Education {index + 1}</h4>
            {education.length > 1 && (
              <button
                type="button"
                onClick={() => onEducationRemove(edu.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution
              </label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                placeholder="University/School name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree Level
              </label>
              <select
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select degree level</option>
                {degreeLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field of Study
              </label>
              <input
                type="text"
                value={edu.field}
                onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                placeholder="e.g., Computer Science, Business Administration"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPA (Optional)
              </label>
              <input
                type="text"
                value={edu.gpa}
                onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                placeholder="e.g., 3.8/4.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="month"
                value={edu.startDate}
                onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="space-y-2">
                <input
                  type="month"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                  disabled={edu.current}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={edu.current}
                    onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Currently studying</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Achievements & Honors
              </label>
              <button
                type="button"
                onClick={() => addAchievement(edu.id)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add Achievement
              </button>
            </div>
            <div className="space-y-2">
              {edu.achievements.map((achievement, achievementIndex) => (
                <div key={achievementIndex} className="flex gap-2">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => updateAchievement(edu.id, achievementIndex, e.target.value)}
                    placeholder="e.g., Dean's List, Summa Cum Laude"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeAchievement(edu.id, achievementIndex)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {education.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Education Added</h3>
          <p className="text-gray-500 mb-4">Add your educational background to complete your profile</p>
          <button
            type="button"
            onClick={addNewEducation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Your First Education
          </button>
        </div>
      )}
    </div>
  )
}
