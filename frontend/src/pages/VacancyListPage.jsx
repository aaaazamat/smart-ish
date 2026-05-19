import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, ChevronDown, AlertCircle } from 'lucide-react'
import { SkeletonList, VacancyCardSkeleton } from '@/components/ui/Skeletons'
import { useVacancies } from '@/hooks/useVacancies'
import { useAuthStore } from '@/store/authStore'
import { useMyResume } from '@/hooks/useResume'
import VacancyCard from '@/components/vacancy/VacancyCard'
import FilterPanel from '@/components/vacancy/FilterPanel'
import AiRecommendedVacancies from '@/components/ai/AiRecommendedVacancies'

const ORDERING_OPTIONS = [
  { value: '-salary_from', label: 'Ish haqi kamayish tartibida' },
  { value: 'salary_from', label: 'Ish haqi o\'sish tartibida' },
  { value: '-created_at', label: 'Yangilari avval' },
  { value: '-views_count', label: 'Eng ko\'p ko\'rilganlar' },
]

const FILTER_KEYS = ['region', 'district', 'profession', 'industry']

function VacancyListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const user = useAuthStore((s) => s.user)
  const isJobSeeker = user?.role === 'job_seeker'
  const { data: myResume } = useMyResume()
  const showRecommendations = isJobSeeker && !!myResume

  const currentPage = Number(searchParams.get('page') || 1)
  const ordering = searchParams.get('ordering') || '-salary_from'

  const filters = FILTER_KEYS.reduce((acc, key) => {
    acc[key] = searchParams.get(key) || undefined
    return acc
  }, {})

  const params = {
    search: searchParams.get('search') || undefined,
    ordering,
    page: currentPage,
    ...filters,
  }

  const { data, isLoading, isError, error, isFetching } = useVacancies(params)

  const updateParams = (mutate) => {
    const next = new URLSearchParams(searchParams)
    mutate(next)
    setSearchParams(next)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateParams((next) => {
      if (searchInput.trim()) next.set('search', searchInput.trim())
      else next.delete('search')
      next.delete('page')
    })
  }

  const handleOrdering = (value) => {
    updateParams((next) => {
      next.set('ordering', value)
      next.delete('page')
    })
  }

  const handlePage = (page) => {
    updateParams((next) => {
      if (page <= 1) next.delete('page')
      else next.set('page', String(page))
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFiltersChange = (newFilters) => {
    updateParams((next) => {
      FILTER_KEYS.forEach((key) => {
        const value = newFilters[key]
        if (value) next.set(key, value)
        else next.delete(key)
      })
      next.delete('page')
    })
  }

  const handleFiltersClear = () => {
    updateParams((next) => {
      FILTER_KEYS.forEach((key) => next.delete(key))
      next.delete('page')
    })
  }

  const totalCount = data?.count || 0
  const pageSize = 10
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Vakansiyalar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">
        <div>
          {/* Mobile'da filter tugmasi yuqorida — desktop'da yon panel ko'rinadi */}
          <div className="lg:hidden mb-4">
            <FilterPanel
              filters={filters}
              onChange={handleFiltersChange}
              onClear={handleFiltersClear}
            />
          </div>

          {showRecommendations && <AiRecommendedVacancies />}

          <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Kasb, lavozim nomi"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 sm:pl-12 pr-4 h-12 sm:h-14 text-sm sm:text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
              />
            </div>
            <button
              type="submit"
              className="px-4 sm:px-8 lg:px-10 h-12 sm:h-14 bg-brand-500 text-white rounded-xl text-sm sm:text-base font-medium hover:bg-brand-600 transition shrink-0"
            >
              Izlash
            </button>
          </form>

          <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
            <p className="text-sm text-gray-500">
              {isLoading ? (
                'Yuklanmoqda...'
              ) : (
                <>
                  <span className="font-semibold text-gray-700">{totalCount}</span>
                  {' '}ta vakansiya topildi
                </>
              )}
            </p>

            <div className="relative">
              <select
                value={ordering}
                onChange={(e) => handleOrdering(e.target.value)}
                className="appearance-none pr-8 pl-3 py-1.5 text-sm font-medium text-brand-500 bg-transparent hover:text-brand-600 cursor-pointer focus:outline-none"
              >
                {ORDERING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="text-gray-900">
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none" />
            </div>
          </div>

          {isLoading && (
            <SkeletonList count={5} Component={VacancyCardSkeleton} className="space-y-3" />
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium mb-1">Xatolik yuz berdi</div>
                <div className="text-sm">
                  {error?.message || 'Backend bilan ulana olmadi. Server ishlayotganini tekshiring.'}
                </div>
              </div>
            </div>
          )}

          {!isLoading && !isError && data?.results?.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Vakansiya topilmadi</p>
            </div>
          )}

          <div className="space-y-3">
            {data?.results?.map((v) => (
              <VacancyCard key={v.id} vacancy={v} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                disabled={currentPage <= 1 || isFetching}
                onClick={() => handlePage(currentPage - 1)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Oldingi
              </button>
              <span className="px-4 text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages || isFetching}
                onClick={() => handlePage(currentPage + 1)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Keyingi →
              </button>
            </div>
          )}
        </div>

        {/* Desktop'da yonda */}
        <div className="hidden lg:block">
          <FilterPanel
            filters={filters}
            onChange={handleFiltersChange}
            onClear={handleFiltersClear}
          />
        </div>
      </div>
    </div>
  )
}

export default VacancyListPage
