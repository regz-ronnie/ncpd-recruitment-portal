import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../services/api'

export function useAIInsights() {
  const queryClient = useQueryClient()

  const insights = useQuery(
    'ai-insights',
    async () => {
      const response = await api.get('/ai-engine/insights/')
      return response.data
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  const generateInsights = useMutation(
    async (data) => {
      const response = await api.post('/ai-engine/insights/', data)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ai-insights')
      },
    }
  )

  return {
    insights,
    generateInsights,
  }
}

export function useCVParser() {
  const queryClient = useQueryClient()

  const parseCV = useMutation(
    async (file) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/ai-engine/cv-parsing/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cv-parsing')
      },
    }
  )

  return {
    parseCV,
  }
}

export function useAIMatching() {
  const queryClient = useQueryClient()

  const getMatchingResults = useQuery(
    'matching-results',
    async () => {
      const response = await api.get('/ai-engine/matching-results/')
      return response.data
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  const triggerMatching = useMutation(
    async (data) => {
      const response = await api.post('/ai-engine/matching-results/', data)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('matching-results')
      },
    }
  )

  return {
    getMatchingResults,
    triggerMatching,
  }
}
