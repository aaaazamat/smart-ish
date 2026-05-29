import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search, Loader2, AlertCircle, ShieldAlert, Briefcase, FileText,
  Power, Eye, Users, Heart, Flag, ExternalLink, ChevronDown, Pencil,
} from 'lucide-react'
import {
  useAdminVacancies,
  useAdminToggleVacancy,
  useAdminResumes,
  useAdminToggleResumePublished,
} from '@/hooks/useAdmin'
import { formatSalary, formatNumber, formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

function VacancyRow({ v, onToggle, isPending }) {
  return (
    <div className={cn(
      'bg-white border rounded-2xl p-5 transition',
      v.is_active ? 'border-gray-200' : 'border-gray-200 opacity-70'
    )}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900">
              {v.profession_name || 'Kasb belgilanmagan'}
            </h3>
            {v.is_active ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Faol
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                Yopilgan
              </span>
            )}
            {v.reports_count > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                <Flag className="w-3 h-3" />
                {v.reports_count} shikoyat
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{v.organization_name}</p>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {formatSalary(v.salary_from, v.salary_to)}
          </p>
          {v.region_name && (
            <p className="text-xs text-gray-500 mt-1">{v.region_name}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Ish beruvchi: {v.employer_phone} · {formatDate(v.created_at)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {formatNumber(v.views_count || 0)}</span>
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {v.applications_count || 0}</span>
        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {v.likes_count || 0}</span>
        <Link
          to={`/vacancies/${v.id}`}
          target="_blank"
          className="ml-auto inline-flex items-center gap-1 text-xs text-gray-600 hover:text-brand-500 px-3 py-1.5 rounded-lg hover:bg-gray-50"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ochish
        </Link>
        <Link
          to={`/admin/vacancies/${v.id}/edit`}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition"
        >
          <Pencil className="w-3.5 h-3.5" />
          Tahrirlash
        </Link>
        <button
          type="button"
          onClick={() => onToggle(v.id)}
          disabled={isPending}
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-40',
            v.is_active
              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
              : 'text-green-700 bg-green-50 hover:bg-green-100'
          )}
        >
          <Power className="w-3.5 h-3.5" />
          {v.is_active ? 'Yopish' : 'Faollash'}
        </button>
      </div>
    </div>
  )
}

function ResumeRow({ r, onToggle, isPending }) {
  return (
    <div className={cn(
      'bg-white border rounded-2xl p-5 transition',
      r.is_published ? 'border-gray-200' : 'border-gray-200 opacity-70'
    )}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900">{r.full_name}</h3>
            {r.is_published ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                E'lon qilingan
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Yashirilgan
              </span>
            )}
            {r.reports_count > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                <Flag className="w-3 h-3" />
                {r.reports_count} shikoyat
              </span>
            )}
          </div>
          {r.profession_name && (
            <p className="text-sm text-brand-500">{r.profession_name}</p>
          )}
          {r.expected_salary && (
            <p className="text-sm text-gray-700 mt-1">
              {formatNumber(r.expected_salary)} so'm
            </p>
          )}
          {r.region_name && (
            <p className="text-xs text-gray-500 mt-1">{r.region_name}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {r.user_phone} · {r.user_email} · {formatDate(r.updated_at)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <Link
          to={`/admin/resumes/${r.id}/edit`}
          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition"
        >
          <Pencil className="w-3.5 h-3.5" />
          Tahrirlash
        </Link>
        <button
          type="button"
          onClick={() => onToggle(r.id)}
          disabled={isPending}
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-40',
            r.is_published
              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
              : 'text-green-700 bg-green-50 hover:bg-green-100'
          )}
        >
          <Power className="w-3.5 h-3.5" />
          {r.is_published ? 'Yashirish' : 'Tiklash'}
        </button>
      </div>
    </div>
  )
}

function VacanciesTab() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')

  const params = {
    search: searchParams.get('q') || undefined,
    is_active: searchParams.get('active') || undefined,
    page: Number(searchParams.get('page') || 1),
  }

  const { data, isLoading } = useAdminVacancies(params)
  const toggle = useAdminToggleVacancy()

  const setQuery = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const handleToggle = (id) => {
    if (!window.confirm('Vakansiya holatini o\'zgartirishni tasdiqlaysizmi?')) return
    toggle.mutate(id)
  }

  const items = data?.results || []
  const total = data?.count || 0

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); setQuery('q', searchInput.trim()) }} className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Kasb, tashkilot bo'yicha qidirish..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 h-11 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        <button type="submit" className="px-6 h-11 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition">
          Izlash
        </button>
      </form>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <select
            value={params.is_active || ''}
            onChange={(e) => setQuery('active', e.target.value)}
            className="appearance-none pr-9 pl-3 py-2 text-sm bg-white border border-gray-200 rounded-lg"
          >
            <option value="">Barcha holatlar</option>
            <option value="true">Faol</option>
            <option value="false">Yopilgan</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <p className="text-sm text-gray-500 ml-auto">{total} ta vakansiya</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yuklanmoqda...
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Vakansiya topilmadi</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((v) => (
          <VacancyRow key={v.id} v={v} onToggle={handleToggle} isPending={toggle.isPending} />
        ))}
      </div>
    </>
  )
}

function ResumesTab() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')

  const params = {
    search: searchParams.get('q') || undefined,
    is_published: searchParams.get('published') || undefined,
    page: Number(searchParams.get('page') || 1),
  }

  const { data, isLoading } = useAdminResumes(params)
  const toggle = useAdminToggleResumePublished()

  const setQuery = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const handleToggle = (id) => {
    if (!window.confirm('Rezyume holatini o\'zgartirishni tasdiqlaysizmi?')) return
    toggle.mutate(id)
  }

  const items = data?.results || []
  const total = data?.count || 0

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); setQuery('q', searchInput.trim()) }} className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ism, telefon, email bo'yicha qidirish..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 h-11 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        <button type="submit" className="px-6 h-11 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition">
          Izlash
        </button>
      </form>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <select
            value={params.is_published || ''}
            onChange={(e) => setQuery('published', e.target.value)}
            className="appearance-none pr-9 pl-3 py-2 text-sm bg-white border border-gray-200 rounded-lg"
          >
            <option value="">Barchasi</option>
            <option value="true">E'lon qilingan</option>
            <option value="false">Yashirilgan</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <p className="text-sm text-gray-500 ml-auto">{total} ta rezyume</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yuklanmoqda...
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Rezyume topilmadi</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((r) => (
          <ResumeRow key={r.id} r={r} onToggle={handleToggle} isPending={toggle.isPending} />
        ))}
      </div>
    </>
  )
}

function AdminModerationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'vacancies'

  const setTab = (value) => {
    setSearchParams(value === 'vacancies' ? new URLSearchParams() : new URLSearchParams({ tab: value }))
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-2">
        <ShieldAlert className="w-7 h-7 text-brand-500" />
        <h1 className="text-3xl font-bold text-gray-900">Moderatsiya</h1>
      </div>
      <p className="text-gray-500 mb-6">Vakansiya va rezyumelarni boshqarish</p>

      <div className="flex gap-2 mb-5 border-b border-gray-200">
        {[
          { key: 'vacancies', label: 'Vakansiyalar', icon: Briefcase },
          { key: 'resumes', label: 'Rezyumelar', icon: FileText },
        ].map((t) => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition',
                active
                  ? 'text-brand-500 border-brand-500'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'vacancies' ? <VacanciesTab /> : <ResumesTab />}
    </div>
  )
}

export default AdminModerationPage
