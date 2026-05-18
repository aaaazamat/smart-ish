import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/endpoints'
import { useAuthStore } from '@/store/authStore'

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const data = await authApi.me()
        setUser(data)
        return data
      } catch (error) {
        if (error?.response?.status === 401) logout()
        throw error
      }
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setTokens(data.access, data.refresh)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useSendOtp() {
  return useMutation({
    mutationFn: authApi.sendOtp,
  })
}

export function useRegisterJobSeeker() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: authApi.registerJobSeeker,
    onSuccess: (data) => {
      setTokens(data.access, data.refresh)
      setUser(data.user)
    },
  })
}

export function useRegisterEmployer() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: authApi.registerEmployer,
    onSuccess: (data) => {
      setTokens(data.access, data.refresh)
      setUser(data.user)
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try { await authApi.logout(refresh) } catch { /* ignore */ }
      }
    },
    onSettled: () => {
      logout()
      queryClient.clear()
    },
  })
}

/**
 * Logged-in foydalanuvchi o'z parolini o'zgartiradi.
 * Backend muvaffaqiyatli javob qaytarsa, foydalanuvchi shu sessiyada qoladi.
 * Yangi parol bilan keyingi login'larda foydalaniladi.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
  })
}

/**
 * Avatarni yuklash (rasm fayli) — muvaffaqiyatdan keyin /me qaytadan o'qiladi.
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: (file) => authApi.uploadAvatar(file),
    onSuccess: (data) => {
      setUser(data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

/** Avatarni o'chirish — null qiymat yuboriladi. */
export function useRemoveAvatar() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: authApi.removeAvatar,
    onSuccess: (data) => {
      setUser(data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}
