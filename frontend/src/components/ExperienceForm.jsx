import React from 'react'
import { Plus, Trash2, Calendar, Briefcase } from 'lucide-react'

export function ExperienceForm({ experiences, onExperienceChange, onExperienceAdd, onExperienceRemove }) {
  const addNewExperience = () => {
    onExperienceAdd({
      id: Date.now(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    })
  }

  const updateExperience = (id, field, value) => {
    onExperienceChange(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ))
  }

  const addAchievement = (expId) => {
    const experience = experiences.find(exp => exp.id === expId)
    if (experience) {
      updateExperience(expId, 'achievements', [...experience.achievements, ''])
    }
  }

  const updateAchievement = (expId, achievementIndex, value) => {
    const experience = experiences.find(exp => exp.id === expId)
    if (experience) {
      const newAchievements = [...experience.achievements]
      newAchievements[achievementIndex] = value
      updateExperience(expId, 'achievements', newAchievements)
    }
  }

  const removeAchievement = (expId, achievementIndex) => {
    const experience = experiences.find(exp => exp.id === expId)
    if (experience) {
      const newAchievements = experience.achievements.filter((_, index) => index !== achievementIndex)
      updateExperience(expId, 'achievements', newAchievements)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
        <button
          type="button"
          onClick={addNewExperience}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </button>
      </div>

      {experiences.map((experience, index) => (
        <div key={experience.id} className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-md font-medium text-gray-900">Experience {index + 1}</h4>
            {experiences.length > 1 && (
              <button
                type="button"
                onClick={() => onExperienceRemove(experience.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company/Organization
              </label>
              <input
                type="text"
                value={experience.company}
                onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                placeholder="Company name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position/Title
              </label>
              <input
                type="text"
                value={experience.position}
                onChange={(e) => updateExperience(experience.id, 'position', e.target.value)}
                placeholder="Job title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={experience.startDate}
                onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={experience.endDate}
                  onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                  disabled={experience.current}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={experience.current}
                    onChange={(e) => updateExperience(experience.id, 'current', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Currently working here</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              value={experience.description}
              onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
              placeholder="Describe your responsibilities and achievements"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Key Achievements
              </label>
              <button
                type="button"
                onClick={() => addAchievement(experience.id)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add Achievement
              </button>
            </div>
            <div className="space-y-2">
              {experience.achievements.map((achievement, achievementIndex) => (
                <div key={achievementIndex} className="flex gap-2">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => updateAchievement(experience.id, achievementIndex, e.target.value)}
                    placeholder="Describe a key achievement"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeAchievement(experience.id, achievementIndex)}
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

      {experiences.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Experience Added</h3>
          <p className="text-gray-500 mb-4">Add your work experience to strengthen your application</p>
          <button
            type="button"
            onClick={addNewExperience}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Your First Experience
          </button>
        </div>
      )}
    </div>
  )
}
