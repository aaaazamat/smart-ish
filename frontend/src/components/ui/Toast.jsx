/**
 * Toast — qisqa muddatli bildirishnoma kartochkalari (chap pastda).
 *
 * Foydalanish:
 *   const { showToast } = useToast()
 *   showToast({ title: '...', message: '...', icon: Bell })
 *
 * 5 sekunddan keyin avtomatik yo'qoladi yoki "X" tugmasi orqali.
 * Animatsiyalari toza, brand rangi (#149AAB) bilan moslangan.
 */
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { Bell, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const DEFAULT_DURATION = 5000

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((toast) => {
    const id = ++idRef.current
    const fullToast = {
      id,
      title: 'Yangi bildirishnoma',
      duration: DEFAULT_DURATION,
      ...toast,
    }
    setToasts((items) => [...items, fullToast])

    if (fullToast.duration > 0) {
      setTimeout(() => dismiss(id), fullToast.duration)
    }
    return id
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  )
}

function ToastCard({ toast, onDismiss }) {
  const Icon = toast.icon || Bell
  const linkTo = toast.linkTo || '/notifications'

  return (
    <div
      className="pointer-events-auto bg-white border border-gray-200 rounded-xl shadow-lg
        max-w-sm w-[360px] overflow-hidden animate-in slide-in-from-right
        transition-all"
      style={{ animation: 'slideInRight 0.3s ease-out' }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-brand-500" />
        </div>

        <Link
          to={linkTo}
          className="flex-1 min-w-0 hover:opacity-80 transition"
          onClick={onDismiss}
        >
          <div className="text-sm font-semibold text-gray-900 line-clamp-1">
            {toast.title}
          </div>
          {toast.message && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
              {toast.message}
            </div>
          )}
        </Link>

        <button
          onClick={onDismiss}
          className="p-1 text-gray-400 hover:text-gray-600 rounded transition shrink-0"
          aria-label="Yopish"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar — vaqt o'tishini ko'rsatadi */}
      {toast.duration > 0 && (
        <div className="h-0.5 bg-brand-500/20 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-brand-500"
            style={{
              animation: `toastProgress ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  )
}
