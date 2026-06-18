import { useQuery, useMutation, useQueryClient } from 'react-query'
import api, { jobsAPI } from '../services/api'

export function useJobs() {
  const queryClient = useQueryClient()

  const jobs = useQuery(
    'jobs',
    async () => {
      const response = await jobsAPI.getJobs()
      return response.data
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const useJobDetail = (jobId) => {
    return useQuery(
      ['job', jobId],
      async () => {
        const response = await jobsAPI.getJob(jobId)
        return response.data
      },
      {
        enabled: !!jobId,
        staleTime: 10 * 60 * 1000, // 10 minutes
      }
    )
  }

  const createJob = useMutation(
    async (jobData) => {
      const response = await api.post('/v1/jobs/', jobData)
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
      const response = await api.patch(`/v1/jobs/${id}/`, jobData)
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
