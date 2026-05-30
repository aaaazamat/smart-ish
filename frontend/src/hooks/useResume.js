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

/**
 * Mening rezyumemni kim ko'rgan — statistika va oxirgi 50 ta ko'rilish.
 * Har 30 sekundda yangilanadi (real-time deyarli).
 */
export function useMyResumeViews() {
  return useQuery({
    queryKey: ['my-resume-views'],
    queryFn: resumeApi.getMyViews,
    refetchInterval: 30_000,
    staleTime: 15_000,
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

/**
 * Word (.docx) dan rezyume import — qoralama rezyume yaratadi.
 * Muvaffaqiyatda 'my-resume' qayta yuklanadi (forma to'ladi).
 */
export function useImportResumeDocx() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file) => resumeApi.importDocx(file),
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
