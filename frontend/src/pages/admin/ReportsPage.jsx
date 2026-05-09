import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Loader2, AlertCircle, Flag, ExternalLink, CheckCircle2,
  X, ChevronDown, AlertTriangle,
} from 'lucide-react'
import { useAdminReports, useResolveReport } from '@/hooks/useAdmin'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'
import Modal from '@/components/ui/Modal'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

const STATUS_OPTIONS = [
  { value: '', label: 'Barcha holatlar' },
  { value: 'pending', label: "Ko'rib chiqilmoqda" },
  { value: 'resolved', label: 'Hal qilindi' },
  { value: 'rejected', label: 'Rad etildi' },
]

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-gray-100 text-gray-600 border-gray-200',
}

const TARGET_LINKS = {
  vacancy: (id) => `/vacancies/${id}`,
}

function ResolveModal({ open, onClose, report, mode }) {
  const [note, setNote] = useState('')
  const resolve = useResolveReport()

  const handleSubmit = (e) => {
    e.preventDefault()
    resolve.mutate(
      { id: report.id, data: { status: mode, resolution_note: note } },
      {
        onSuccess: () => {
          onClose()
          setNote('')
          resolve.reset()
        },
      }
    )
  }

  const handleClose = () => {
    onClose()
    resolve.reset()
    setNote('')
  }

  if (!report) return null

  const isResolve = mode === 'resolved'

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isResolve ? 'Shikoyatni hal qilish' : 'Shikoyatni rad etish'}
    >
      <div className="mb-4 pb-3 border-b border-gray-100">
        <p className="text-sm text-gray-500">Shikoyat:</p>
        <p className="font-medium text-gray-900 mt-1">{report.reason_display}</p>
        <p className="text-sm text-gray-600 mt-1">{report.target_type_display} #{report.target_id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Izoh {isResolve ? '(qabul qilingan choralar)' : '(rad etish sababi)'}
          </label>
          <Textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isResolve
              ? 'Masalan: vakansiya yopildi, foydalanuvchi ogohlantirildi'
              : 'Masalan: shikoyat asossiz topildi'}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            variant={isResolve ? 'primary' : 'danger'}
            loading={resolve.isPending}
          >
            {isResolve ? 'Hal qilindi' : 'Rad etish'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function ReportCard({ report, onResolve, onReject }) {
  const statusColor = STATUS_COLORS[report.status] || STATUS_COLORS.pending
  const targetLinkFn = TARGET_LINKS[report.target_type]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn(
              'inline-block px-3 py-1 rounded-full text-xs font-medium border',
              statusColor
            )}>
              {report.status_display}
            </span>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {report.target_type_display}
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            {report.reason_display}
          </h3>
          {report.description && (
            <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
              {report.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 flex-wrap">
            <span>Yuborgan: {report.reporter_phone || 'Anonim'}</span>
            <span>·</span>
            <span>{formatDate(report.created_at)}</span>
            {report.resolved_at && (
              <>
                <span>·</span>
                <span>Hal qilingan: {formatDate(report.resolved_at)}</span>
              </>
            )}
            {targetLinkFn && (
              <Link
                to={targetLinkFn(report.target_id)}
                target="_blank"
                className="inline-flex items-center gap-1 text-brand-500 hover:underline ml-auto"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ob'ektni ochish
              </Link>
            )}
          </div>
        </div>
      </div>

      {report.status === 'pending' && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onResolve(report)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Hal qilingan deb belgilash
          </button>
          <button
            type="button"
            onClick={() => onReject(report)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            <X className="w-3.5 h-3.5" />
            Rad etish
          </button>
        </div>
      )}
    </div>
  )
}

function AdminReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') || ''

  const params = {
    status: status || undefined,
    page: Number(searchParams.get('page') || 1),
  }

  const { data, isLoading, isError, error } = useAdminReports(params)
  const [modal, setModal] = useState({ open: false, report: null, mode: null })

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const items = data?.results || []
  const total = data?.count || 0

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Flag className="w-7 h-7 text-brand-500" />
        <h1 className="text-3xl font-bold text-gray-900">Shikoyatlar</h1>
      </div>
      <p className="text-gray-500 mb-6">Foydalanuvchilardan kelgan shikoyatlarni ko'rib chiqish</p>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setParam('status', e.target.value)}
            className="appearance-none pr-9 pl-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <p className="text-sm text-gray-500 ml-auto">{total} ta shikoyat</p>
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
          <AlertTriangle className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {status ? 'Bu holatda shikoyat yo\'q' : 'Shikoyatlar yo\'q'}
          </h2>
          <p className="text-gray-500">
            Foydalanuvchilardan kelgan shikoyatlar shu yerda paydo bo'ladi
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((r) => (
          <ReportCard
            key={r.id}
            report={r}
            onResolve={(rep) => setModal({ open: true, report: rep, mode: 'resolved' })}
            onReject={(rep) => setModal({ open: true, report: rep, mode: 'rejected' })}
          />
        ))}
      </div>

      <ResolveModal
        open={modal.open}
        onClose={() => setModal({ open: false, report: null, mode: null })}
        report={modal.report}
        mode={modal.mode}
      />
    </div>
  )
}

export default AdminReportsPage
