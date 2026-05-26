import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import {
  useRegions,
  useDistricts,
  useProfessions,
  useIndustries,
} from '@/hooks/useReferences'

function FilterSelect({ label, value, onChange, options, disabled, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className="w-full appearance-none border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition"
        >
          <option value="">{placeholder}</option>
          {options?.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

function FilterPanel({ filters, onChange, onClear }) {
  const { t } = useTranslation()
  const { data: regions } = useRegions()
  const { data: districts } = useDistricts(filters.region)
  const { data: professions } = useProfessions()
  const { data: industries } = useIndustries()
  // Mobile'da panel default yashirin; "Filtr" tugmasi ostida ochiladi
  const [mobileOpen, setMobileOpen] = useState(false)

  const setField = (key) => (e) => {
    const value = e.target.value || undefined
    if (key === 'region') {
      onChange({ ...filters, region: value, district: undefined })
    } else {
      onChange({ ...filters, [key]: value })
    }
  }

  const hasActive = Object.values(filters).some(Boolean)
  const activeCount = Object.values(filters).filter(Boolean).length

  const filterContent = (
    <>
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('vacancy.filters')}</h2>
        <button
          type="button"
          onClick={onClear}
          disabled={!hasActive}
          className="text-sm text-red-500 hover:text-red-600 font-medium disabled:text-gray-300 disabled:cursor-not-allowed transition"
        >
          {t('common.clear')}
        </button>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <FilterSelect
          label={t('filter.region')}
          placeholder={t('filter.all_regions')}
          value={filters.region}
          onChange={setField('region')}
          options={regions}
        />
        <FilterSelect
          label={t('filter.district')}
          placeholder={filters.region ? t('filter.all_districts') : t('filter.select_region_first')}
          value={filters.district}
          onChange={setField('district')}
          options={districts}
          disabled={!filters.region}
        />
        <FilterSelect
          label={t('filter.profession')}
          placeholder={t('filter.all_professions')}
          value={filters.profession}
          onChange={setField('profession')}
          options={professions}
        />
        <FilterSelect
          label={t('filter.industry')}
          placeholder={t('filter.all')}
          value={filters.industry}
          onChange={setField('industry')}
          options={industries}
        />
      </div>
    </>
  )

  return (
    <>
      {/* Mobile (< lg): "Filtr" tugmasi va drawer */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-500" />
            {t('vacancy.filters')}
          </span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-xs font-semibold">
              {activeCount}
            </span>
          )}
        </button>

        {/* Bottom-sheet drawer */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                <h3 className="text-base font-semibold text-gray-900">{t('vacancy.filters')}</h3>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                  aria-label={t('common.close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {filterContent}
              </div>
              <div className="border-t border-gray-100 p-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition"
                >
                  {t('common.show')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop (lg+): yon panel */}
      <aside className="hidden lg:block bg-white rounded-2xl border border-gray-200 p-6 h-fit sticky top-28">
        {filterContent}
      </aside>
    </>
  )
}

export default FilterPanel
