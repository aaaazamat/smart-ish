import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Bell, Check, CheckCheck, Trash2, Inbox,
  Briefcase, FileText, UserPlus, AlertCircle, Heart,
} from 'lucide-react'
import { SkeletonList, NotificationItemSkeleton } from '@/components/ui/Skeletons'
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/hooks/useNotifications'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'

const TYPE_ICONS = {
  application_received: FileText,
  application_status_changed: Briefcase,
  invitation_received: UserPlus,
  invitation_accepted: CheckCheck,
  vacancy_liked: Heart,
  system: Bell,
}

function getTargetLink(n, role) {
  if (n.application) {
    return role === 'employer'
      ? `/employer/applications/${n.application}`
      : `/applications`
  }
  if (n.vacancy) {
    return role === 'employer'
      ? `/employer/vacancies/${n.vacancy}/edit`
      : `/vacancies/${n.vacancy}`
  }
  if (n.resume) {
    return role === 'employer'
      ? `/employer/resumes/${n.resume}`
      : `/resumes/my`
  }
  return null
}

function NotificationCard({ n, role, onRead, onDelete, isDeleting }) {
  const navigate = useNavigate()
  const Icon = TYPE_ICONS[n.notification_type] || Bell
  const link = getTargetLink(n, role)

  const handleClick = () => {
    if (!n.is_read) onRead(n.id)
    if (link) navigate(link)
  }

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-5 rounded-2xl border transition cursor-pointer hover:border-brand-300',
        n.is_read
          ? 'bg-white border-gray-200'
          : 'bg-brand-50/40 border-brand-200'
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
          n.is_read ? 'bg-gray-100 text-gray-500' : 'bg-brand-100 text-brand-600'
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn('text-sm', n.is_read ? 'font-medium text-gray-900' : 'font-semibold text-gray-900')}>
            {n.title}
          </h3>
          {!n.is_read && (
            <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />
          )}
        </div>
        {n.message && (
          <p className="text-sm text-gray-600 mt-1">{n.message}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">{formatDate(n.created_at)}</p>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(n.id) }}
        disabled={isDeleting}
        aria-label="O'chirish"
        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

function NotificationListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = searchParams.get('filter') || 'all'
  const role = useAuthStore((s) => s.user?.role)

  const params = filter === 'unread' ? { is_read: 'false' } : {}
  const { data, isLoading, isError, error } = useNotifications(params)
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const remove = useDeleteNotification()

  const setFilter = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'all') next.delete('filter')
    else next.set('filter', value)
    setSearchParams(next)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Bildirishnomani o\'chirishni tasdiqlaysizmi?')) return
    remove.mutate(id)
  }

  const items = data?.results || []
  const total = data?.count || 0
  const hasUnread = items.some((n) => !n.is_read)

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bildirishnomalar</h1>
        {hasUnread && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllRead.mutate()}
            loading={markAllRead.isPending}
          >
            <Check className="w-4 h-4" /> Barchasini o'qildi deb belgilash
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-5 border-b border-gray-200">
        {[
          { key: 'all', label: 'Barchasi' },
          { key: 'unread', label: 'O\'qilmagan' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition',
              filter === tab.key
                ? 'text-brand-500 border-brand-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <SkeletonList count={4} Component={NotificationItemSkeleton} className="space-y-2" />
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error?.message || 'Xato yuz berdi'}</span>
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Inbox className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'unread' ? 'O\'qilmagan bildirishnoma yo\'q' : 'Bildirishnoma yo\'q'}
          </h2>
          <p className="text-gray-500">
            Yangi bildirishnomalar shu yerda paydo bo'ladi
          </p>
        </div>
      )}

      {items.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-3">{total} ta bildirishnoma</p>
          <div className="space-y-3">
            {items.map((n) => (
              <NotificationCard
                key={n.id}
                n={n}
                role={role}
                onRead={(id) => markRead.mutate(id)}
                onDelete={handleDelete}
                isDeleting={remove.isPending}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationListPage
