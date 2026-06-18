import React, { useState } from 'react'

export function SkillSelector({ skills, selectedSkills, onSkillToggle, onSkillAdd, onSkillRemove }) {
  const [newSkill, setNewSkill] = useState('')
  const [newLevel, setNewLevel] = useState('beginner')

  const skillLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ]

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onSkillAdd({
        name: newSkill.trim(),
        level: newLevel
      })
      setNewSkill('')
      setNewLevel('beginner')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills
        </label>
        
        {/* Existing Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill, index) => (
            <div
              key={index}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                selectedSkills.some(s => s.name === skill.name)
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              <span>{skill.name}</span>
              <span className="ml-1 text-xs opacity-75">({skill.level})</span>
              <button
                type="button"
                onClick={() => onSkillToggle(skill)}
                className="ml-2 text-xs hover:text-red-600"
              >
                {selectedSkills.some(s => s.name === skill.name) ? '×' : '+'}
              </button>
            </div>
          ))}
        </div>

        {/* Add New Skill */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add new skill"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {skillLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </div>

      {/* Selected Skills Summary */}
      {selectedSkills.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Skills:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill, index) => (
              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {skill.name} ({skill.level})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
