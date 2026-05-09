import { useNavigate } from 'react-router-dom'
import { Loader2, LogOut, Phone, Mail, UserCircle, Calendar } from 'lucide-react'
import { useMe, useLogout } from '@/hooks/useAuth'
import { formatDate } from '@/lib/format'
import Button from '@/components/ui/Button'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div className="text-sm text-gray-900 break-words">{value || '—'}</div>
      </div>
    </div>
  )
}

function ProfilePage() {
  const navigate = useNavigate()
  const { data: user, isLoading } = useMe()
  const logout = useLogout()

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate('/', { replace: true }),
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 flex items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Yuklanmoqda...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mening profilim</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
            <UserCircle className="w-10 h-10 text-brand-500" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold text-gray-900">
              {user?.phone_number}
            </div>
            <div className="text-sm text-brand-500">{user?.role_display}</div>
          </div>
        </div>

        <div className="mt-2">
          <InfoRow icon={Phone} label="Telefon" value={user?.phone_number} />
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow icon={UserCircle} label="Rol" value={user?.role_display} />
          <InfoRow
            icon={Calendar}
            label="Ro'yxatdan o'tilgan sana"
            value={user?.created_at && formatDate(user.created_at)}
          />
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100">
          <Button
            variant="danger"
            onClick={handleLogout}
            loading={logout.isPending}
            className="w-full"
          >
            <LogOut className="w-4 h-4" />
            Tizimdan chiqish
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
