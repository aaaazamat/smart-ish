import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/endpoints'

const USERS_KEY = ['admin-users']

export function useAdminStatsOverview() {
  return useQuery({
    queryKey: ['admin-stats-overview'],
    queryFn: adminApi.statsOverview,
  })
}

// ─── users ────────────────────────────────────
export function useAdminUsers(params) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminApi.users(params),
    placeholderData: (previous) => previous,
  })
}

export function useToggleUserActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.userToggleActive,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      qc.invalidateQueries({ queryKey: ['admin-stats-overview'] })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.userDelete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      qc.invalidateQueries({ queryKey: ['admin-stats-overview'] })
    },
  })
}

// ─── moderation: vacancies ────────────────────
const ADMIN_VACS_KEY = ['admin-vacancies']

export function useAdminVacancies(params) {
  return useQuery({
    queryKey: ['admin-vacancies', params],
    queryFn: () => adminApi.vacancies(params),
    placeholderData: (previous) => previous,
  })
}

export function useAdminToggleVacancy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.vacancyToggleActive,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_VACS_KEY })
      qc.invalidateQueries({ queryKey: ['admin-stats-overview'] })
    },
  })
}

// ─── moderation: resumes ──────────────────────
const ADMIN_RESUMES_KEY = ['admin-resumes']

export function useAdminResumes(params) {
  return useQuery({
    queryKey: ['admin-resumes', params],
    queryFn: () => adminApi.resumes(params),
    placeholderData: (previous) => previous,
  })
}

export function useAdminToggleResumePublished() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.resumeTogglePublished,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_RESUMES_KEY })
      qc.invalidateQueries({ queryKey: ['admin-stats-overview'] })
    },
  })
}

// ─── reports ──────────────────────────────────
const REPORTS_KEY = ['admin-reports']

export function useAdminReports(params) {
  return useQuery({
    queryKey: ['admin-reports', params],
    queryFn: () => adminApi.reports(params),
    placeholderData: (previous) => previous,
  })
}

export function useResolveReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => adminApi.reportResolve(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: REPORTS_KEY }),
  })
}
