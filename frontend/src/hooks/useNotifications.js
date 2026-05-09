import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/api/endpoints'
import { useAuthStore } from '@/store/authStore'

const NOTIFICATIONS_KEY = ['notifications']
const UNREAD_KEY = ['notifications', 'unread']

export function useNotifications(params) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsApi.list(params),
    placeholderData: (previous) => previous,
  })
}

export function useUnreadCount() {
  const isAuth = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: UNREAD_KEY,
    queryFn: notificationsApi.unreadCount,
    enabled: isAuth,
    refetchInterval: 60_000,
    select: (data) => data.unread_count,
  })
}

function invalidateAll(qc) {
  qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
  qc.invalidateQueries({ queryKey: UNREAD_KEY })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => invalidateAll(qc),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => invalidateAll(qc),
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.remove,
    onSuccess: () => invalidateAll(qc),
  })
}
