import React, { useEffect, useState } from 'react'
let ReactQuill = null
try {
  // try to load react-quill if installed
  // eslint-disable-next-line global-require
  const rq = require('react-quill')
  ReactQuill = rq && rq.default ? rq.default : rq
  // eslint-disable-next-line global-require
  require('react-quill/dist/quill.snow.css')
} catch (e) {
  ReactQuill = null
}
import ScoringWeightsEditor from '../components/ScoringWeightsEditor.jsx'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { hrAPI } from '../services/api'

export default function VacancyForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: '',
    reference_no: '',
    department: '',
    job_grade: '',
    employment_type: '',
    location: '',
    positions: 1,
    deadline: '',
    description: '',
    requirements: '',
    scoring_matrix: ''
  })
  const [errors, setErrors] = useState({})

  const { data } = useQuery(['hr:vacancy', id], async () => {
    if (!isEdit) return null
    const res = await hrAPI.getVacancy(id)
    return res.data
  }, { enabled: isEdit })

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || '',
        reference_no: data.reference_no || '',
        department: data.department || '',
        job_grade: data.job_grade || '',
        employment_type: data.employment_type || '',
        location: data.location || '',
        positions: data.positions || 1,
        deadline: data.deadline || '',
        description: data.description || '',
        requirements: data.requirements || '',
        scoring_matrix: data.scoring_matrix ? (typeof data.scoring_matrix === 'string' ? data.scoring_matrix : JSON.stringify(data.scoring_matrix)) : ''
      })
    }
  }, [data])

  const createMutation = useMutation((payload) => hrAPI.createVacancy(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries('hr:vacancies')
      navigate('/hr/vacancies')
    }
  })

  const updateMutation = useMutation(({ id, payload }) => hrAPI.updateVacancy(id, payload), {
    onSuccess: () => {
      queryClient.invalidateQueries('hr:vacancies')
      navigate('/hr/vacancies')
    }
  })

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // simple validations
    const errs = {}
    if (!form.title || form.title.trim().length < 3) errs.title = 'Title is required (min 3 chars)'
    if (!form.department) errs.department = 'Department is required'
    if (!form.deadline) errs.deadline = 'Deadline is required'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    // try to parse scoring matrix JSON
    const payload = { ...form }
    if (form.scoring_matrix) {
      try {
        payload.scoring_matrix = JSON.parse(form.scoring_matrix)
      } catch (e) {
        // leave as string if invalid JSON
        payload.scoring_matrix = form.scoring_matrix
      }
    }

    if (isEdit) {
      updateMutation.mutate({ id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded shadow p-6">
        <h1 className="text-xl font-bold text-ncpd-primary mb-4">{isEdit ? 'Edit Vacancy' : 'Create Vacancy'}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
            <input value={form.title} onChange={(e) => handleChange('title', e.target.value)} className="form-input" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Reference Number</label>
              <input value={form.reference_no} onChange={(e) => handleChange('reference_no', e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input value={form.department} onChange={(e) => handleChange('department', e.target.value)} className="form-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Grade</label>
              <input value={form.job_grade} onChange={(e) => handleChange('job_grade', e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Employment Type</label>
              <input value={form.employment_type} onChange={(e) => handleChange('employment_type', e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Positions</label>
              <input type="number" value={form.positions} onChange={(e) => handleChange('positions', parseInt(e.target.value || 1))} className="form-input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input value={form.location} onChange={(e) => handleChange('location', e.target.value)} className="form-input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
            <input type="date" value={form.deadline} onChange={(e) => handleChange('deadline', e.target.value)} className="form-input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job Description</label>
            {ReactQuill ? (
              <ReactQuill value={form.description} onChange={(val) => handleChange('description', val)} theme="snow" />
            ) : (
              <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} className="form-input" rows={6}></textarea>
            )}
            <p className="text-xs text-gray-500 mt-1">Rich editor available when `react-quill` is installed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Scoring Matrix (optional)</label>
            <ScoringWeightsEditor value={form.scoring_matrix} onChange={(v) => handleChange('scoring_matrix', v)} />
            <p className="text-xs text-gray-500 mt-1">Weights will be saved on the vacancy and used by the shortlisting engine.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Requirements</label>
            <textarea value={form.requirements} onChange={(e) => handleChange('requirements', e.target.value)} className="form-input" rows={4}></textarea>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary">{isEdit ? 'Update' : 'Create'}</button>
          </div>
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 text-sm text-red-600">
              {Object.values(errors).map((v, i) => <div key={i}>{v}</div>)}
            </div>
          )}
        </form>
      </div>
    </main>
  )
}
