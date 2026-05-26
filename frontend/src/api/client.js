import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// WebSocket bosh URL: VITE_WS_URL yoki API_BASE_URL dan derivatsiya
//   API:  http://localhost:8000/api  →  WS: ws://localhost:8000
//   API: https://api.example.com/api →  WS: wss://api.example.com
export const WS_BASE_URL = (() => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL
  try {
    const url = new URL(API_BASE_URL)
    const proto = url.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${url.host}`
  } catch {
    return 'ws://localhost:8000'
  }
})()

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Til (i18next saqlaydi) — backend Accept-Language orqali aniqlaydi
  const lang = localStorage.getItem('i18n_language') || 'uz'
  config.headers['Accept-Language'] = lang
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
    return Promise.reject(error)
  }
)
