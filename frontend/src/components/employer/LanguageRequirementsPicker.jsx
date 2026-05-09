import { Plus, X } from 'lucide-react'
import { LANGUAGE_OPTIONS, LANGUAGE_LEVEL_OPTIONS } from '@/lib/constants'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

function LanguageRequirementsPicker({ value = [], onChange }) {
  const usedLanguages = new Set(value.map((v) => v.language))
  const availableLanguages = LANGUAGE_OPTIONS.filter((o) => !usedLanguages.has(o.value))

  const addRow = () => {
    if (availableLanguages.length === 0) return
    onChange([...value, { language: availableLanguages[0].value, min_level: 'A1' }])
  }

  const updateRow = (idx, field, val) => {
    const next = [...value]
    next[idx] = { ...next[idx], [field]: val }
    onChange(next)
  }

  const removeRow = (idx) => {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-gray-500 italic">Hech qanday til talabi yo'q</p>
      )}

      {value.map((item, idx) => {
        const langOptions = LANGUAGE_OPTIONS.filter(
          (o) => o.value === item.language || !usedLanguages.has(o.value)
        )
        return (
          <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
            <Select
              value={item.language}
              onChange={(e) => updateRow(idx, 'language', e.target.value)}
            >
              {langOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
            <Select
              value={item.min_level}
              onChange={(e) => updateRow(idx, 'min_level', e.target.value)}
            >
              {LANGUAGE_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
            <button
              type="button"
              onClick={() => removeRow(idx)}
              aria-label="O'chirish"
              className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}

      {availableLanguages.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
        >
          <Plus className="w-4 h-4" />
          Til talabi qo'shish
        </Button>
      )}
    </div>
  )
}

export default LanguageRequirementsPicker
