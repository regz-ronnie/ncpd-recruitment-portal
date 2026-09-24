import { useQuery, useMutation, useQueryClient } from 'react-query'
import api, { jobsAPI, hrAPI } from '../services/api'

export function useJobs() {
  const queryClient = useQueryClient()

  const jobs = useQuery(
    'jobs',
    async () => {
      try {
        // First try to get from public jobs API
        const response = await jobsAPI.getJobs()
        return response.data
      } catch (error) {
        console.log('Public jobs API failed, trying HR vacancies endpoint')
        // Fallback to HR vacancies endpoint for published vacancies
        try {
          const response = await api.get('hr/vacancies/', { 
            params: { status: 'published' } 
          })
          // Transform HR vacancy data to match job data structure
          const vacancies = response.data?.results || response.data || []
          return {
            results: vacancies.map(v => ({
              id: v.id,
              title: v.title,
              description: v.description,
              department: v.department,
              location: v.location,
              employment_type: v.employment_type,
              positions: v.positions,
              application_deadline: v.application_deadline || v.deadline,
              requirements: v.requirements,
              responsibilities: v.responsibilities,
              qualifications: v.qualifications,
              reference_no: v.reference_no,
              job_grade: v.job_grade,
              status: v.status,
              hr_vacancy_id: v.id
            })),
            count: response.data?.count || vacancies.length
          }
        } catch (hrError) {
          console.error('Both APIs failed:', hrError)
          return { results: [], count: 0 }
        }
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const useJobDetail = (jobId) => {
    return useQuery(
      ['job', jobId],
      async () => {
        try {
          // First try to get from public jobs API
          const response = await jobsAPI.getJob(jobId)
          return response.data
        } catch (error) {
          console.log('Public job detail API failed, trying HR vacancies endpoint')
          // Fallback to HR vacancies endpoint
          try {
            const response = await api.get(`hr/vacancies/${jobId}/`)
            // Transform HR vacancy data to match job data structure
            const vacancy = response.data
            return {
              id: vacancy.id,
              title: vacancy.title,
              description: vacancy.description,
              department: vacancy.department,
              location: vacancy.location,
              employment_type: vacancy.employment_type,
              positions: vacancy.positions,
              application_deadline: vacancy.application_deadline || vacancy.deadline,
              requirements: vacancy.requirements,
              responsibilities: vacancy.responsibilities,
              qualifications: vacancy.qualifications,
              reference_no: vacancy.reference_no,
              job_grade: vacancy.job_grade,
              status: vacancy.status,
              hr_vacancy_id: vacancy.id
            }
          } catch (hrError) {
            console.error('Both APIs failed for job detail:', hrError)
            throw hrError
          }
        }
      },
      {
        enabled: !!jobId,
        staleTime: 10 * 60 * 1000, // 10 minutes
      }
    )
  }

  const createJob = useMutation(
    async (jobData) => {
      const response = await api.post('jobs/', jobData)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('jobs')
      },
    }
  )

  const updateJob = useMutation(
    async ({ id, ...jobData }) => {
      const response = await api.patch(`jobs/${id}/`, jobData)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('jobs')
      },
    }
  )

  return {
    jobs,
    useJobDetail,
    createJob,
    updateJob,
  }
}
