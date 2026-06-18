import React from 'react'

export default function ScoringWeightsEditor({ value = '', onChange }) {
  let parsed = {}
  try {
    parsed = value ? (typeof value === 'string' ? JSON.parse(value) : value) : {}
  } catch (e) {
    parsed = {}
  }

  const handle = (key, v) => {
    const next = { ...parsed, [key]: Number(v) }
    onChange(JSON.stringify(next))
  }

  return (
    <div className="p-3 border rounded bg-gray-50">
      <h4 className="font-medium mb-2">Scoring Weights (per vacancy)</h4>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">Degree</label>
        <input className="form-input" type="number" value={parsed.degree || 30} onChange={(e) => handle('degree', e.target.value)} />
        <label className="text-sm">Experience</label>
        <input className="form-input" type="number" value={parsed.experience || 30} onChange={(e) => handle('experience', e.target.value)} />
        <label className="text-sm">Certifications</label>
        <input className="form-input" type="number" value={parsed.certifications || 20} onChange={(e) => handle('certifications', e.target.value)} />
        <label className="text-sm">Skills</label>
        <input className="form-input" type="number" value={parsed.skills || 20} onChange={(e) => handle('skills', e.target.value)} />
      </div>
    </div>
  )
}
