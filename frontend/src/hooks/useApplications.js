import { useQuery, useMutation, useQueryClient } from 'react-query'
import api, { applicationsAPI } from '../services/api'

export function useApplications() {
  const queryClient = useQueryClient()

  const applications = useQuery(
    'applications',
    async () => {
      const response = await applicationsAPI.getMyApplications()
      console.log('Applications API response:', response)
      console.log('Applications data:', response.data)
      return response.data
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const submitApplication = useMutation(
    async ({ jobId, ...applicationData }) => {
      console.log('submitApplication called with jobId:', jobId, 'and data:', applicationData)
      if (!jobId) {
        throw new Error('jobId is required for application submission')
      }
      const response = await applicationsAPI.applyForJob(jobId, applicationData)
      return response
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('applications')
        queryClient.invalidateQueries('jobs')
      },
    }
  )

  const updateApplicationStatus = useMutation(
    async ({ id, status }) => {
      const response = await api.patch(`/v1/applications/${id}/`, { status })
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('applications')
      },
    }
  )

  return {
    applications,
    submitApplication,
    updateApplicationStatus,
  }
}
