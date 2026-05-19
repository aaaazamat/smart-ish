import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useMe } from '@/hooks/useAuth'

function RequireRole({ role }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const { isLoading } = useMe()
  const location = useLocation()

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    )
  }

  if (user.role !== role) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ruxsat etilmagan</h1>
        <p className="text-gray-500">
          Bu sahifa faqat <strong>{role === 'employer' ? 'ish beruvchi' : 'ish izlovchi'}</strong> roli uchun mavjud.
        </p>
      </div>
    )
  }

  return <Outlet />
}

export default RequireRole
