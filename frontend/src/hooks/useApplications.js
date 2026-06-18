import { useQuery, useMutation, useQueryClient } from 'react-query'
import api, { applicationsAPI } from '../services/api'

export function useApplications() {
  const queryClient = useQueryClient()

  const applications = useQuery(
    'applications',
    async () => {
      const response = await applicationsAPI.getMyApplications()
      return response.data
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const submitApplication = useMutation(
    async (applicationData) => {
      const response = await api.post('/v1/applications/', applicationData)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('applications')
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
