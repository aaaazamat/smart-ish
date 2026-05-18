import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { employerApi } from '@/api/endpoints'

const VACANCIES_KEY = ['employer-vacancies']
const ORG_KEY = ['employer-organization']

/** Employer'ning tashkilot ma'lumotlari (logo va h.k.) */
export function useEmployerOrganization() {
  return useQuery({
    queryKey: ORG_KEY,
    queryFn: employerApi.getOrganization,
  })
}

/** Tashkilot ma'lumotlarini tahrirlash (logo bilan birga ham) */
export function useUpdateEmployerOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: employerApi.updateOrganization,
    onSuccess: (data) => {
      qc.setQueryData(ORG_KEY, data)
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useEmployerVacancies() {
  return useQuery({
    queryKey: VACANCIES_KEY,
    queryFn: employerApi.vacancies.list,
  })
}

export function useEmployerVacancy(id) {
  return useQuery({
    queryKey: ['employer-vacancy', id],
    queryFn: async () => {
      const list = await employerApi.vacancies.list()
      return list.find((v) => String(v.id) === String(id)) || null
    },
    enabled: !!id,
  })
}

function useInvalidateAll() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: VACANCIES_KEY })
    qc.invalidateQueries({ queryKey: ['employer-dashboard'] })
  }
}

export function useCreateVacancy() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: employerApi.vacancies.create,
    onSuccess: invalidate,
  })
}

export function useUpdateVacancy() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: ({ id, data }) => employerApi.vacancies.update(id, data),
    onSuccess: invalidate,
  })
}

export function useDeleteVacancy() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: employerApi.vacancies.remove,
    onSuccess: invalidate,
  })
}

export function useToggleVacancyActive() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: employerApi.vacancyToggleActive,
    onSuccess: invalidate,
  })
}

// ─── applications (employer side) ─────────────
const APPS_KEY = ['employer-applications']

export function useEmployerApplications(params) {
  return useQuery({
    queryKey: ['employer-applications', params],
    queryFn: () => employerApi.applications(params),
    placeholderData: (previous) => previous,
  })
}

export function useEmployerApplicationDetail(id) {
  return useQuery({
    queryKey: ['employer-application', id],
    queryFn: () => employerApi.applicationDetail(id),
    enabled: !!id,
  })
}

export function useEmployerApplicationStats() {
  return useQuery({
    queryKey: ['employer-application-stats'],
    queryFn: employerApi.applicationStats,
  })
}

// ─── resumes (search) ─────────────────────────
export function useEmployerResumes(params) {
  return useQuery({
    queryKey: ['employer-resumes', params],
    queryFn: () => employerApi.resumes(params),
    placeholderData: (previous) => previous,
  })
}

export function useEmployerResumeDetail(id) {
  return useQuery({
    queryKey: ['employer-resume', id],
    queryFn: () => employerApi.resumeDetail(id),
    enabled: !!id,
  })
}

export function useInviteToVacancy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ resumeId, data }) => employerApi.inviteToVacancy(resumeId, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['employer-resumes'] })
      qc.invalidateQueries({ queryKey: ['employer-resume', String(vars.resumeId)] })
    },
  })
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => employerApi.applicationStatusUpdate(id, status),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: APPS_KEY })
      qc.invalidateQueries({ queryKey: ['employer-application', String(vars.id)] })
      qc.invalidateQueries({ queryKey: ['employer-application-stats'] })
      qc.invalidateQueries({ queryKey: ['employer-dashboard'] })
    },
  })
}
