import { Link, useSearchParams } from 'react-router-dom'
import {
  Loader2, AlertCircle, Inbox, MapPin, Building2,
  Trash2, Calendar, ChevronDown,
} from 'lucide-react'
import { useMyApplications, useMyApplicationStats, useWithdrawApplication } from '@/hooks/useApplications'
import { APPLICATION_STATUS_OPTIONS, APPLICATION_STATUS_COLORS } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

function StatCard({ label, value, color = 'gray', active, onClick }) {
  const colors = {
    gray: 'border-gray-200',
    amber: 'border-amber-200',
    blue: 'border-blue-200',
    purple: 'border-purple-200',
    green: 'border-green-200',
    red: 'border-red-200',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'bg-white border rounded-xl p-3 text-left transition hover:border-brand-400',
        colors[color],
        active && 'ring-2 ring-brand-500 border-brand-500'
      )}
    >
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </button>
  )
}

function ApplicationCard({ app, onWithdraw, isWithdrawing }) {
  const statusColor = APPLICATION_STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-brand-300 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <Link
            to={`/vacancies/${app.vacancy}`}
            className="text-lg font-semibold text-gray-900 hover:text-brand-500 transition"
          >
            {app.vacancy_title}
          </Link>
          <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            {app.organization_name}
          </p>
          {app.region_name && (
            <p className="text-sm text-brand-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {app.region_name}
            </p>
          )}
        </div>
        <span
          className={cn(
            'inline-block px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap',
            statusColor
          )}
        >
          {app.status_display}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          Yuborilgan: {formatDate(app.applied_at)}
        </span>
        {app.status === 'pending' && (
          <button
            type="button"
            onClick={() => onWithdraw(app.id)}
            disabled={isWithdrawing}
            className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Qaytarib olish
          </button>
        )}
      </div>
    </div>
  )
}

function ApplicationListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') || ''

  const { data: stats } = useMyApplicationStats()
  const { data, isLoading, isError, error } = useMyApplications({
    status: status || undefined,
  })
  const withdraw = useWithdrawApplication()

  const setStatus = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('status', value)
    else next.delete('status')
    setSearchParams(next)
  }

  const handleWithdraw = (id) => {
    if (!window.confirm('Arizani qaytarib olishni tasdiqlaysizmi?')) return
    withdraw.mutate(id)
  }

  const apps = data?.results || []
  const total = data?.count || 0

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mening arizalarim</h1>

      {stats && stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
          <StatCard label="Jami" value={stats.total} active={!status} onClick={() => setStatus('')} />
          <StatCard label="Kutilmoqda" value={stats.pending} color="amber" active={status === 'pending'} onClick={() => setStatus('pending')} />
          <StatCard label="Ko'rildi" value={stats.viewed} color="blue" active={status === 'viewed'} onClick={() => setStatus('viewed')} />
          <StatCard label="Suhbat" value={stats.interview} color="purple" active={status === 'interview'} onClick={() => setStatus('interview')} />
          <StatCard label="Qabul" value={stats.accepted} color="green" active={status === 'accepted'} onClick={() => setStatus('accepted')} />
          <StatCard label="Ishga olindi" value={stats.hired} color="green" active={status === 'hired'} onClick={() => setStatus('hired')} />
          <StatCard label="Rad" value={stats.rejected} color="red" active={status === 'rejected'} onClick={() => setStatus('rejected')} />
        </div>
      )}

      {stats && stats.total > 0 && (
        <div className="lg:hidden mb-4">
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              {APPLICATION_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
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

      {!isLoading && !isError && apps.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Inbox className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {status ? 'Bu holatda ariza topilmadi' : 'Hali ariza yubormaganmsiz'}
          </h2>
          <p className="text-gray-500 mb-6">
            {status
              ? 'Boshqa filterni tanlang yoki "Jami" ni bosing'
              : 'Vakansiyalardan biriga ariza yuborib boshlang'}
          </p>
          {!status && (
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition"
            >
              Vakansiyalarni ko'rish
            </Link>
          )}
        </div>
      )}

      {apps.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {total} ta ariza topildi
          </p>
          <div className="space-y-3">
            {apps.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                onWithdraw={handleWithdraw}
                isWithdrawing={withdraw.isPending}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ApplicationListPage
