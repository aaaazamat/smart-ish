import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applicationsApi } from '@/api/endpoints'

export function useMyApplications(params) {
  return useQuery({
    queryKey: ['my-applications', params],
    queryFn: () => applicationsApi.list(params),
    placeholderData: (previous) => previous,
  })
}

export function useMyApplicationStats() {
  return useQuery({
    queryKey: ['my-applications-stats'],
    queryFn: applicationsApi.stats,
  })
}

export function useApplyToVacancy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ vacancyId, data }) => applicationsApi.apply(vacancyId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vacancy', String(variables.vacancyId)] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      queryClient.invalidateQueries({ queryKey: ['my-applications-stats'] })
    },
  })
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: applicationsApi.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      queryClient.invalidateQueries({ queryKey: ['my-applications-stats'] })
    },
  })
}
