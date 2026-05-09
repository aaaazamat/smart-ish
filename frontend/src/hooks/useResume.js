import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  resumeApi,
  workExperienceApi,
  educationApi,
  certificateApi,
} from '@/api/endpoints'

export function useMyResume() {
  return useQuery({
    queryKey: ['my-resume'],
    queryFn: async () => {
      try {
        return await resumeApi.getMy()
      } catch (error) {
        if (error?.response?.status === 404) return null
        throw error
      }
    },
    retry: false,
  })
}

export function useCreateResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: resumeApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-resume'] }),
  })
}

export function useUpdateResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: resumeApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-resume'] }),
  })
}

function makeCrudHooks(api, queryKey) {
  return {
    useList: () => useQuery({
      queryKey: [queryKey],
      queryFn: api.list,
    }),
    useCreate: () => {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: api.create,
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: [queryKey] })
          qc.invalidateQueries({ queryKey: ['my-resume'] })
        },
      })
    },
    useUpdate: () => {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: ({ id, data }) => api.update(id, data),
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: [queryKey] })
          qc.invalidateQueries({ queryKey: ['my-resume'] })
        },
      })
    },
    useDelete: () => {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: api.remove,
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: [queryKey] })
          qc.invalidateQueries({ queryKey: ['my-resume'] })
        },
      })
    },
  }
}

export const workExperienceHooks = makeCrudHooks(workExperienceApi, 'work-experiences')
export const educationHooks = makeCrudHooks(educationApi, 'educations')
export const certificateHooks = makeCrudHooks(certificateApi, 'certificates')
