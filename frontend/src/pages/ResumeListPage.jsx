import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search, ChevronDown, Loader2, AlertCircle, Users, MapPin, User as UserIcon,
} from 'lucide-react'
import { apiClient } from '@/api/client'
import { useRegions, useDistricts, useProfessions } from '@/hooks/useReferences'
import { CAREER_LEVEL_OPTIONS } from '@/lib/constants'
import { formatNumber, formatDate } from '@/lib/format'

function FilterSelect({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className="w-full appearance-none border border-gray-200 rounded-lg pl-3 pr-9 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">{placeholder}</option>
          {options?.map((o) => (
            <option key={o.value || o.id} value={o.value || o.id}>{o.label || o.name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

function PublicResumeCard({ resume }) {
  const location = [resume.region_name, resume.district_name].filter(Boolean).join(', ')
  const fullName = resume.full_name || `${resume.last_name || ''} ${resume.first_name || ''}`.trim() || 'Nomzod'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-brand-300 hover:shadow-sm transition">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
          <UserIcon className="w-6 h-6 text-brand-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
          {resume.profession_name && (
            <p className="text-sm text-brand-500 mt-0.5">{resume.profession_name}</p>
          )}
          {resume.career_level_display && (
            <p className="text-sm text-gray-600 mt-1">{resume.career_level_display}</p>
          )}
          {resume.expected_salary && (
            <p className="text-sm font-medium text-gray-900 mt-2">
              {formatNumber(resume.expected_salary)} so'm
            </p>
          )}
          {location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </div>
          )}
          {resume.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {resume.skills.slice(0, 5).map((s) => (
                <span key={s.id} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {s.name}
                </span>
              ))}
              {resume.skills.length > 5 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  +{resume.skills.length - 5}
                </span>
              )}
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
            Yangilangan: {formatDate(resume.updated_at)}
          </div>
        </div>
      </div>
    </div>
  )
}

function ResumeListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const filters = {
    search: searchParams.get('search') || undefined,
    region: searchParams.get('region') || undefined,
    district: searchParams.get('district') || undefined,
    profession: searchParams.get('profession') || undefined,
    career_level: searchParams.get('career_level') || undefined,
    page: Number(searchParams.get('page') || 1),
  }

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['public-resumes', filters],
    queryFn: () => apiClient.get('/resumes/', { params: filters }).then((r) => r.data),
    placeholderData: (previous) => previous,
  })

  const { data: regions } = useRegions()
  const { data: districts } = useDistricts(filters.region)
  const { data: professions } = useProfessions()

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    if (key === 'region') next.delete('district')
    setSearchParams(next)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setParam('search', searchInput.trim())
  }

  const handleClear = () => {
    setSearchInput('')
    setSearchParams(new URLSearchParams())
  }

  const items = data?.results || []
  const total = data?.count || 0
  const totalPages = Math.ceil(total / 10)
  const hasFilters = !!(filters.search || filters.region || filters.district || filters.profession || filters.career_level)

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Rezyumelar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div>
          <form onSubmit={handleSearch} className="flex gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ism, familiya, kasb bo'yicha qidirish..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 h-14 text-base placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition"
              />
            </div>
            <button
              type="submit"
              className="px-10 h-14 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition shrink-0"
            >
              Izlash
            </button>
          </form>

          <p className="text-sm text-gray-500 mb-4">
            {isLoading ? 'Yuklanmoqda...' : `${total} ta rezyume topildi`}
          </p>

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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Rezyume topilmadi
              </h2>
              <p className="text-gray-500">
                Filterlarni o'zgartirib qayta urinib ko'ring
              </p>
            </div>
          )}

          <div className="space-y-3">
            {items.map((r) => (
              <PublicResumeCard key={r.id} resume={r} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                disabled={filters.page <= 1 || isFetching}
                onClick={() => setParam('page', String(filters.page - 1))}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-white disabled:opacity-40"
              >
                ← Oldingi
              </button>
              <span className="px-4 text-sm text-gray-600">{filters.page} / {totalPages}</span>
              <button
                disabled={filters.page >= totalPages || isFetching}
                onClick={() => setParam('page', String(filters.page + 1))}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-white disabled:opacity-40"
              >
                Keyingi →
              </button>
            </div>
          )}
        </div>

        <aside className="bg-white rounded-2xl border border-gray-200 p-5 h-fit lg:sticky lg:top-28">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Filtrlar</h2>
            <button
              type="button"
              onClick={handleClear}
              disabled={!hasFilters}
              className="text-sm text-red-500 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed font-medium"
            >
              Tozalash
            </button>
          </div>
          <div className="space-y-4">
            <FilterSelect
              label="Hudud"
              placeholder="Barchasi"
              value={filters.region}
              onChange={(e) => setParam('region', e.target.value)}
              options={regions}
            />
            <FilterSelect
              label="Tuman / Shahar"
              placeholder={filters.region ? 'Barchasi' : 'Avval hudud'}
              value={filters.district}
              onChange={(e) => setParam('district', e.target.value)}
              options={districts}
              disabled={!filters.region}
            />
            <FilterSelect
              label="Kasb"
              placeholder="Barchasi"
              value={filters.profession}
              onChange={(e) => setParam('profession', e.target.value)}
              options={professions}
            />
            <FilterSelect
              label="Karyera darajasi"
              placeholder="Barchasi"
              value={filters.career_level}
              onChange={(e) => setParam('career_level', e.target.value)}
              options={CAREER_LEVEL_OPTIONS}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ResumeListPage
