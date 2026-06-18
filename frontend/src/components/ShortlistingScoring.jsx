import React, { useMemo } from 'react'

// Simple rule-based scoring component
export default function ShortlistingScoring({ applicant = {}, vacancy = {}, onApplyScore }) {
  // applicant: { degree, experience_years, skills: [] }
  // vacancy may provide a scoring_matrix object like { degree:30, experience:30, certifications:20, skills:20 }
  const defaultWeights = { degree: 30, experience: 30, certifications: 20, skills: 20 }
  let weights = defaultWeights
  try {
    if (vacancy?.scoring_matrix) {
      if (typeof vacancy.scoring_matrix === 'string') {
        weights = { ...defaultWeights, ...JSON.parse(vacancy.scoring_matrix) }
      } else if (typeof vacancy.scoring_matrix === 'object') {
        weights = { ...defaultWeights, ...vacancy.scoring_matrix }
      }
    }
  } catch (e) {
    weights = defaultWeights
  }

  const breakdown = useMemo(() => {
    const b = { degree: 0, experience: 0, certifications: 0, skills: 0 }

    // Degree matching (very simple mapping)
    const degree = (applicant.degree || '').toLowerCase()
    if (!degree) b.degree = 0
    else if (degree.includes('population') || degree.includes('demography')) b.degree = weights.degree
    else if (degree.includes('public health')) b.degree = Math.round(weights.degree * 0.8)
    else if (degree.includes('sociology') || degree.includes('statistics')) b.degree = Math.round(weights.degree * 0.6)
    else b.degree = 0

    // Experience
    const exp = Number(applicant.experience_years || 0)
    if (exp >= 6) b.experience = weights.experience
    else if (exp >= 4) b.experience = Math.round(weights.experience * 0.83)
    else if (exp >= 2) b.experience = Math.round(weights.experience * 0.5)
    else b.experience = Math.round(weights.experience * 0.15)

    // Certifications (count)
    const certs = (applicant.certifications || []).length || 0
    b.certifications = Math.min(weights.certifications, certs * Math.round(weights.certifications / 4 || 5))

    // Skills match: count intersection
    const jobSkills = (vacancy?.requirements || '').toLowerCase().split(/\W+/).filter(Boolean)
    const appSkills = (applicant.skills || []).map(s => s.toLowerCase())
    const matched = appSkills.filter(s => jobSkills.includes(s)).length
    b.skills = Math.min(weights.skills, matched * Math.round(weights.skills / 4 || 5))

    const total = b.degree + b.experience + b.certifications + b.skills
    return { breakdown: b, total }
  }, [applicant, vacancy])

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h3 className="font-semibold mb-2">Rule-based Shortlisting</h3>
      <div className="text-sm">
        <div>Degree match: <strong>{breakdown.breakdown.degree}</strong> / {weights.degree}</div>
        <div>Experience: <strong>{breakdown.breakdown.experience}</strong> / {weights.experience}</div>
        <div>Certifications: <strong>{breakdown.breakdown.certifications}</strong> / {weights.certifications}</div>
        <div>Skills match: <strong>{breakdown.breakdown.skills}</strong> / {weights.skills}</div>
        <div className="mt-2">Total score: <strong>{breakdown.total}</strong> / 100</div>
      </div>
      {onApplyScore && (
        <div className="mt-3">
          <button onClick={() => onApplyScore(breakdown.total)} className="btn-primary">Apply Score</button>
        </div>
      )}
    </div>
  )
}
