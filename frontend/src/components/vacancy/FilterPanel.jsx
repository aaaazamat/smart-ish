import { ChevronDown } from 'lucide-react'
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
  const { data: regions } = useRegions()
  const { data: districts } = useDistricts(filters.region)
  const { data: professions } = useProfessions()
  const { data: industries } = useIndustries()

  const setField = (key) => (e) => {
    const value = e.target.value || undefined
    if (key === 'region') {
      onChange({ ...filters, region: value, district: undefined })
    } else {
      onChange({ ...filters, [key]: value })
    }
  }

  const hasActive = Object.values(filters).some(Boolean)

  return (
    <aside className="bg-white rounded-2xl border border-gray-200 p-6 h-fit lg:sticky lg:top-28">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Filtrlar</h2>
        <button
          type="button"
          onClick={onClear}
          disabled={!hasActive}
          className="text-sm text-red-500 hover:text-red-600 font-medium disabled:text-gray-300 disabled:cursor-not-allowed transition"
        >
          Tozalash
        </button>
      </div>

      <div className="space-y-5">
        <FilterSelect
          label="Hudud"
          placeholder="Barcha hududlar"
          value={filters.region}
          onChange={setField('region')}
          options={regions}
        />
        <FilterSelect
          label="Tuman / Shahar"
          placeholder={filters.region ? 'Barcha tumanlar' : 'Avval hududni tanlang'}
          value={filters.district}
          onChange={setField('district')}
          options={districts}
          disabled={!filters.region}
        />
        <FilterSelect
          label="Lavozim yoki kasb"
          placeholder="Barcha kasblar"
          value={filters.profession}
          onChange={setField('profession')}
          options={professions}
        />
        <FilterSelect
          label="Sohalar"
          placeholder="Barchasi"
          value={filters.industry}
          onChange={setField('industry')}
          options={industries}
        />
      </div>
    </aside>
  )
}

export default FilterPanel
