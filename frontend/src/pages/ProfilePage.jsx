import { Link, useNavigate } from 'react-router-dom'
import {
  LogOut, Phone, Mail, UserCircle, Calendar, Eye, Building2, ArrowRight,
} from 'lucide-react'
import { useMe, useLogout } from '@/hooks/useAuth'
import { formatDate } from '@/lib/format'
import Button from '@/components/ui/Button'
import ChangePasswordForm from '@/components/auth/ChangePasswordForm'
import AvatarUploader from '@/components/auth/AvatarUploader'
import { StatCardSkeleton } from '@/components/ui/Skeletons'

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

function QuickAction({ icon: Icon, title, description, to }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl
        hover:border-brand-300 hover:shadow-sm transition group"
    >
      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-brand-500" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-gray-900 text-sm">{title}</div>
        <div className="text-xs text-gray-500 mt-0.5">{description}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" />
    </Link>
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
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  const displayName = user?.phone_number || 'Foydalanuvchi'
  const isJobSeeker = user?.role === 'job_seeker'
  const isEmployer = user?.role === 'employer'

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Mening profilim</h1>

      {/* Avatar + asosiy ma'lumotlar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <AvatarUploader
          currentAvatarUrl={user?.avatar}
          name={displayName}
        />

        <div className="mt-5 pt-5 border-t border-gray-100">
          <InfoRow icon={Phone} label="Telefon" value={user?.phone_number} />
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow icon={UserCircle} label="Rol" value={user?.role_display} />
          {user?.organization_name && (
            <InfoRow
              icon={Building2}
              label="Tashkilot"
              value={user.organization_name}
            />
          )}
          <InfoRow
            icon={Calendar}
            label="Ro'yxatdan o'tilgan sana"
            value={user?.created_at && formatDate(user.created_at)}
          />
        </div>
      </div>

      {/* Tezkor harakatlar (rol bo'yicha) */}
      {(isJobSeeker || isEmployer) && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 px-1">Tezkor harakatlar</h2>

          {isJobSeeker && (
            <QuickAction
              icon={Eye}
              title="Rezyumemni kim ko'rdi"
              description="Ish beruvchilar tomonidan ko'rilgan tarixi"
              to="/resumes/my/views"
            />
          )}

          {isEmployer && (
            <QuickAction
              icon={Building2}
              title="Tashkilot sozlamalari"
              description="Logo, tavsif va boshqa ma'lumotlarni tahrirlash"
              to="/employer/organization"
            />
          )}
        </div>
      )}

      {/* Xavfsizlik — parol o'zgartirish */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <ChangePasswordForm />
      </div>

      {/* Tizimdan chiqish */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
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
  )
}

export default ProfilePage
