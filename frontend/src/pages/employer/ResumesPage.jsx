import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, ChevronDown, Loader2, AlertCircle, Users } from 'lucide-react'
import { useEmployerResumes } from '@/hooks/useEmployer'
import {
  useRegions, useDistricts, useProfessions,
} from '@/hooks/useReferences'
import { CAREER_LEVEL_OPTIONS } from '@/lib/constants'
import ResumeCard from '@/components/employer/ResumeCard'

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

function EmployerResumesPage() {
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

  const { data, isLoading, isError, error, isFetching } = useEmployerResumes(filters)
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
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Rezyumelarni qidirish</h1>
      <p className="text-gray-500 mb-6">Mos nomzodlarni toping va taklif yuboring</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div>
          <form onSubmit={handleSearch} className="flex gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ism, kasb, ko'nikma bo'yicha qidirish..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 h-12 text-base placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition"
              />
            </div>
            <button
              type="submit"
              className="px-8 h-12 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition shrink-0"
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
                {hasFilters ? 'Mos rezyume topilmadi' : 'Rezyumelar yo\'q'}
              </h2>
              <p className="text-gray-500">
                Filterlarni o'zgartiring yoki tozalang
              </p>
            </div>
          )}

          <div className="space-y-3">
            {items.map((r) => (
              <ResumeCard key={r.id} resume={r} />
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

export default EmployerResumesPage
