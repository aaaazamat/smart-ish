import { Link, useSearchParams } from 'react-router-dom'
import {
  Loader2, AlertCircle, Inbox, User, Calendar, Briefcase,
  ChevronDown, ExternalLink,
} from 'lucide-react'
import {
  useEmployerApplications,
  useEmployerApplicationStats,
  useUpdateApplicationStatus,
} from '@/hooks/useEmployer'
import { useEmployerVacancies } from '@/hooks/useEmployer'
import {
  EMPLOYER_STATUS_TRANSITIONS,
  APPLICATION_STATUS_COLORS,
} from '@/lib/constants'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

function StatChip({ label, value, color, active, onClick }) {
  const colors = {
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition',
        colors[color] || colors.gray,
        active && 'ring-2 ring-brand-500/40'
      )}
    >
      <span className="font-semibold">{value}</span>
      <span className="text-xs">{label}</span>
    </button>
  )
}

function StatusUpdater({ app, onUpdate, isPending }) {
  const handleChange = (e) => {
    const value = e.target.value
    if (!value || value === app.status) return
    if (window.confirm(`Holatni "${EMPLOYER_STATUS_TRANSITIONS.find(s => s.value === value)?.label}" ga o'zgartirishni tasdiqlaysizmi?`)) {
      onUpdate(app.id, value)
    }
    e.target.value = ''
  }

  return (
    <div className="relative inline-block">
      <select
        onChange={handleChange}
        disabled={isPending}
        defaultValue=""
        className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-brand-400 cursor-pointer disabled:opacity-50"
      >
        <option value="" disabled>Holatni o'zgartirish</option>
        {EMPLOYER_STATUS_TRANSITIONS.filter((s) => s.value !== app.status).map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>
  )
}

function ApplicationCard({ app, onUpdateStatus, isPending }) {
  const statusColor = APPLICATION_STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-brand-300 transition">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-gray-400 shrink-0" />
            <h3 className="font-semibold text-gray-900">
              {app.resume_full_name || 'Nomzod'}
            </h3>
          </div>
          {app.resume_profession && (
            <p className="text-sm text-gray-600 ml-7">{app.resume_profession}</p>
          )}
          <p className="text-sm text-brand-500 mt-1.5 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            <Link to={`/vacancies/${app.vacancy_id}`} target="_blank" className="hover:underline">
              {app.vacancy_title}
            </Link>
          </p>
        </div>
        <span className={cn(
          'inline-block px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap',
          statusColor
        )}>
          {app.status_display}
        </span>
      </div>

      {app.cover_letter && (
        <div className="mt-3 mb-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-line">
          <div className="text-xs text-gray-500 mb-1">Sopromorat xat:</div>
          {app.cover_letter}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-3 flex-wrap">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(app.applied_at)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/employer/applications/${app.id}`}
            className="inline-flex items-center gap-1 text-xs text-brand-500 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Rezyumeni ko'rish
          </Link>
          <StatusUpdater app={app} onUpdate={onUpdateStatus} isPending={isPending} />
        </div>
      </div>
    </div>
  )
}

function EmployerApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') || ''
  const vacancyId = searchParams.get('vacancy') || ''

  const params = {
    direction: 'applied',
    status: status || undefined,
    vacancy: vacancyId || undefined,
  }

  const { data, isLoading, isError, error } = useEmployerApplications(params)
  const { data: stats } = useEmployerApplicationStats()
  const { data: vacancies = [] } = useEmployerVacancies()
  const updateStatus = useUpdateApplicationStatus()

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const handleUpdateStatus = (id, newStatus) => {
    updateStatus.mutate({ id, status: newStatus })
  }

  const items = data?.results || []
  const total = data?.count || 0

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelgan arizalar</h1>
      <p className="text-gray-500 mb-6">Vakansiyalaringizga yuborilgan arizalar</p>

      {stats && stats.applied?.total > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <StatChip label="Jami" value={stats.applied?.total || 0} color="gray" active={!status} onClick={() => setFilter('status', '')} />
          <StatChip label="Kutilmoqda" value={stats.applied?.pending || 0} color="amber" active={status === 'pending'} onClick={() => setFilter('status', 'pending')} />
          <StatChip label="Ko'rildi" value={stats.applied?.viewed || 0} color="blue" active={status === 'viewed'} onClick={() => setFilter('status', 'viewed')} />
          <StatChip label="Suhbat" value={stats.applied?.interview || 0} color="purple" active={status === 'interview'} onClick={() => setFilter('status', 'interview')} />
          <StatChip label="Qabul" value={stats.applied?.accepted || 0} color="green" active={status === 'accepted'} onClick={() => setFilter('status', 'accepted')} />
          <StatChip label="Ishga olindi" value={stats.applied?.hired || 0} color="green" active={status === 'hired'} onClick={() => setFilter('status', 'hired')} />
          <StatChip label="Rad" value={stats.applied?.rejected || 0} color="red" active={status === 'rejected'} onClick={() => setFilter('status', 'rejected')} />
        </div>
      )}

      {vacancies.length > 0 && (
        <div className="mb-5 max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Vakansiya bo'yicha</label>
          <div className="relative">
            <select
              value={vacancyId}
              onChange={(e) => setFilter('vacancy', e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Barcha vakansiyalar</option>
              {vacancies.map((v) => (
                <option key={v.id} value={v.id}>{v.profession_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

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
          <Inbox className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {status || vacancyId ? 'Bu filterda ariza yo\'q' : 'Hali ariza kelmagan'}
          </h2>
          <p className="text-gray-500">
            Vakansiyalaringizga yuborilgan arizalar bu yerda paydo bo'ladi
          </p>
        </div>
      )}

      {items.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} ta ariza</p>
          <div className="space-y-3">
            {items.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                onUpdateStatus={handleUpdateStatus}
                isPending={updateStatus.isPending}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default EmployerApplicationsPage
