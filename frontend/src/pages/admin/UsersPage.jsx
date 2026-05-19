import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search, ChevronDown, Loader2, AlertCircle, Users,
  UserX, UserCheck, Trash2, Building2, ShieldCheck,
  User as UserIcon,
} from 'lucide-react'
import {
  useAdminUsers,
  useToggleUserActive,
  useDeleteUser,
} from '@/hooks/useAdmin'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

const ROLE_OPTIONS = [
  { value: '', label: 'Barcha rollar' },
  { value: 'job_seeker', label: 'Ish izlovchi' },
  { value: 'employer', label: 'Ish beruvchi' },
  { value: 'admin', label: 'Administrator' },
]

const ROLE_BADGE = {
  job_seeker: { color: 'bg-blue-50 text-blue-700', icon: UserIcon },
  employer: { color: 'bg-green-50 text-green-700', icon: Building2 },
  admin: { color: 'bg-purple-50 text-purple-700', icon: ShieldCheck },
}

function UserRow({ user, currentUserId, onToggle, onDelete, isToggling, isDeleting }) {
  const isSelf = user.id === currentUserId
  const badge = ROLE_BADGE[user.role] || ROLE_BADGE.job_seeker
  const RoleIcon = badge.icon

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-2xl p-5',
      !user.is_active && 'opacity-70'
    )}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900">{user.phone_number}</h3>
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', badge.color)}>
              <RoleIcon className="w-3 h-3" />
              {user.role_display}
            </span>
            {user.is_active ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Faol
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                Bloklangan
              </span>
            )}
            {isSelf && (
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Siz
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{user.email}</p>
          {user.organization_name && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {user.organization_name}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Ro'yxatdan o'tilgan: {formatDate(user.created_at)}
            {user.last_login && ` · Oxirgi kirish: ${formatDate(user.last_login)}`}
          </p>
        </div>

        {!isSelf && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggle(user.id)}
              disabled={isToggling}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-40',
                user.is_active
                  ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                  : 'text-green-700 bg-green-50 hover:bg-green-100'
              )}
            >
              {user.is_active ? (
                <><UserX className="w-3.5 h-3.5" /> Bloklash</>
              ) : (
                <><UserCheck className="w-3.5 h-3.5" /> Faollash</>
              )}
            </button>
            <button
              type="button"
              onClick={() => onDelete(user.id)}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              O'chirish
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const currentUser = useAuthStore((s) => s.user)

  const params = {
    search: searchParams.get('search') || undefined,
    role: searchParams.get('role') || undefined,
    is_active: searchParams.get('is_active') || undefined,
    page: Number(searchParams.get('page') || 1),
  }

  const { data, isLoading, isError, error } = useAdminUsers(params)
  const toggle = useToggleUserActive()
  const remove = useDeleteUser()

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value !== undefined && value !== '' && value !== null) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setParam('search', searchInput.trim())
  }

  const handleToggle = (id) => {
    if (!window.confirm('Foydalanuvchi holatini o\'zgartirishni tasdiqlaysizmi?')) return
    toggle.mutate(id)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Foydalanuvchini o\'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo\'lmaydi!')) return
    remove.mutate(id)
  }

  const items = data?.results || []
  const total = data?.count || 0
  const totalPages = Math.ceil(total / 10)

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-2">
        <Users className="w-7 h-7 text-brand-500" />
        <h1 className="text-3xl font-bold text-gray-900">Foydalanuvchilar</h1>
      </div>
      <p className="text-gray-500 mb-6">Tizimdagi barcha foydalanuvchilarni boshqarish</p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Telefon yoki email bo'yicha qidirish..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 h-12 text-base placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        <button
          type="submit"
          className="px-8 h-12 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition shrink-0"
        >
          Izlash
        </button>
      </form>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <select
            value={params.role || ''}
            onChange={(e) => setParam('role', e.target.value)}
            className="appearance-none pr-9 pl-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={params.is_active || ''}
            onChange={(e) => setParam('is_active', e.target.value)}
            className="appearance-none pr-9 pl-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
          >
            <option value="">Barcha holatlar</option>
            <option value="true">Faol</option>
            <option value="false">Bloklangan</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <p className="text-sm text-gray-500 ml-auto self-center">
          {isLoading ? 'Yuklanmoqda...' : `${total} ta foydalanuvchi`}
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Yuklanmoqda...
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error?.message || 'Xato yuz berdi'}</span>
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Users className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Foydalanuvchi topilmadi</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            currentUserId={currentUser?.id}
            onToggle={handleToggle}
            onDelete={handleDelete}
            isToggling={toggle.isPending}
            isDeleting={remove.isPending}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            disabled={params.page <= 1}
            onClick={() => setParam('page', String(params.page - 1))}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-white disabled:opacity-40"
          >
            ← Oldingi
          </button>
          <span className="px-4 text-sm text-gray-600">{params.page} / {totalPages}</span>
          <button
            disabled={params.page >= totalPages}
            onClick={() => setParam('page', String(params.page + 1))}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-white disabled:opacity-40"
          >
            Keyingi →
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage
