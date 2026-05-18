/**
 * useNotificationsWS — Real-time bildirishnomalar uchun WebSocket hook.
 *
 * Vazifalar:
 *  - JWT bilan ulanish (token query string'da)
 *  - Avtomatik qayta ulanish (exponential backoff: 1s → 2s → 4s → 8s → 30s)
 *  - Ping/pong heartbeat har 25 sekundda (proxy timeoutlardan saqlanish)
 *  - Yangi bildirishnoma kelganda TanStack Query cache yangilanadi
 *  - Yangi bildirishnoma uchun callback chaqiriladi (masalan, toast ko'rsatish)
 *
 * Foydalanish:
 *   useNotificationsWS({
 *     onNotification: (data) => showToast(data.title),
 *   })
 */
import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { WS_BASE_URL } from '@/api/client'

const PING_INTERVAL_MS = 25_000
const MAX_RECONNECT_DELAY = 30_000

export function useNotificationsWS({ onNotification, onUnreadCount } = {}) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const queryClient = useQueryClient()

  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const pingTimerRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const shouldReconnectRef = useRef(true)

  // Callback'larni ref'da saqlash — har render'da hook qayta ishlamasligi uchun
  const callbacksRef = useRef({ onNotification, onUnreadCount })
  useEffect(() => {
    callbacksRef.current = { onNotification, onUnreadCount }
  }, [onNotification, onUnreadCount])

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current)
      pingTimerRef.current = null
    }
    if (wsRef.current) {
      try {
        wsRef.current.close(1000, 'cleanup')
      } catch {
        /* ignore */
      }
      wsRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!accessToken) return

    const wsUrl = `${WS_BASE_URL}/ws/notifications/?token=${encodeURIComponent(accessToken)}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0
      // Heartbeat — har 25 sekundda ping yuboramiz
      pingTimerRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, PING_INTERVAL_MS)
    }

    ws.onmessage = (event) => {
      let msg
      try {
        msg = JSON.parse(event.data)
      } catch {
        return
      }

      if (msg.type === 'notification') {
        // Yangi bildirishnoma — cache'ni invalidatsiya qilish
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] })
        callbacksRef.current.onNotification?.(msg.data)
      } else if (msg.type === 'unread_count') {
        // Badge counter — to'g'ridan-to'g'ri cache'ga yozish
        queryClient.setQueryData(['notification-unread-count'], {
          unread_count: msg.count,
        })
        callbacksRef.current.onUnreadCount?.(msg.count)
      }
      // pong, connection_established — sukut bilan o'tadi
    }

    ws.onerror = () => {
      // onclose chaqiriladi keyin, shuning uchun bu yerda hech narsa qilmaymiz
    }

    ws.onclose = (event) => {
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current)
        pingTimerRef.current = null
      }

      // 4001 — autentifikatsiya muvaffaqiyatsiz (token noto'g'ri).
      // Bu holda qayta ulanish foydasiz — login kerak.
      if (event.code === 4001) {
        shouldReconnectRef.current = false
        return
      }

      if (!shouldReconnectRef.current) return

      // Exponential backoff: 1s → 2s → 4s → 8s → 16s → 30s (cap)
      const attempts = reconnectAttemptsRef.current++
      const delay = Math.min(1000 * 2 ** attempts, MAX_RECONNECT_DELAY)
      reconnectTimerRef.current = setTimeout(connect, delay)
    }
  }, [accessToken, queryClient])

  useEffect(() => {
    shouldReconnectRef.current = true
    if (accessToken) {
      connect()
    }
    return () => {
      shouldReconnectRef.current = false
      cleanup()
    }
  }, [accessToken, connect, cleanup])
}
