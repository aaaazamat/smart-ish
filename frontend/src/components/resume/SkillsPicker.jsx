import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { referenceApi } from '@/api/endpoints'
import { cn } from '@/lib/cn'

function SkillsPicker({ value = [], onChange }) {
  const [search, setSearch] = useState('')
  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: referenceApi.skills,
    staleTime: 60 * 60 * 1000,
  })

  const selectedIds = new Set(value.map(Number))

  const selected = useMemo(
    () => skills.filter((s) => selectedIds.has(s.id)),
    [skills, value] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return skills
      .filter((s) => !selectedIds.has(s.id))
      .filter((s) => !q || s.name.toLowerCase().includes(q))
      .slice(0, 30)
  }, [skills, search, value]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id) => {
    if (selectedIds.has(id)) {
      onChange(value.filter((v) => Number(v) !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition"
            >
              {s.name}
              <X className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Ko'nikma qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
        />
      </div>

      <div className="border border-gray-100 rounded-lg p-3 max-h-48 overflow-y-auto">
        {isLoading && <div className="text-sm text-gray-500">Yuklanmoqda...</div>}
        {!isLoading && filtered.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            {search ? 'Hech narsa topilmadi' : 'Barcha ko\'nikmalar tanlangan'}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={cn(
                'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition',
                'bg-white border-gray-200 text-gray-700 hover:border-brand-500 hover:text-brand-500'
              )}
            >
              + {s.name}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Tanlangan: {selected.length} ta ko'nikma
      </p>
    </div>
  )
}

export default SkillsPicker
