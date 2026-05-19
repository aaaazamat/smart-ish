import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import { applyApiErrorsToForm, getApiError } from '@/lib/apiError'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

/**
 * Generic CRUD list component for reference data.
 *
 * Props:
 * - title: Section title
 * - hooks: { useList, useCreate, useUpdate, useDelete }
 * - parentField?: string (e.g. "region" for districts)
 * - parentLabel?: string (e.g. "Hudud")
 * - parentOptions?: array of { id, name }
 * - parentDisplayKey?: string (key to show in list, e.g. "region_name")
 * - extraFields?: array of additional fields:
 *     [{ key: "inn", label: "INN", placeholder: "...", required?: bool, type?: "text"|"url" }]
 */
function ReferenceCrud({
  title,
  hooks,
  parentField,
  parentLabel,
  parentOptions = [],
  parentDisplayKey,
  extraFields = [],
}) {
  const { data: items = [], isLoading } = hooks.useList()
  const create = hooks.useCreate()
  const update = hooks.useUpdate()
  const remove = hooks.useDelete()

  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [extraValues, setExtraValues] = useState({})
  const [error, setError] = useState(null)

  const reset = () => {
    setName('')
    setParentId('')
    setExtraValues({})
    setError(null)
    setAdding(false)
    setEditingId(null)
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setAdding(false)
    setName(item.name)
    setParentId(item[parentField]?.toString() || item[parentField + '_id']?.toString() || '')
    // Qo'shimcha maydonlarni mavjud qiymatlar bilan to'ldirish
    const extras = {}
    for (const f of extraFields) {
      extras[f.key] = item[f.key] ?? ''
    }
    setExtraValues(extras)
    setError(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Nom majburiy')
      return
    }
    if (parentField && !parentId) {
      setError(`${parentLabel} tanlash majburiy`)
      return
    }
    // Required extra maydonlarni tekshirish
    for (const f of extraFields) {
      if (f.required && !(extraValues[f.key] || '').toString().trim()) {
        setError(`${f.label} majburiy`)
        return
      }
    }
    const payload = { name: name.trim() }
    if (parentField) payload[parentField] = Number(parentId)
    for (const f of extraFields) {
      const v = extraValues[f.key]
      if (v !== undefined && v !== '') payload[f.key] = v
    }

    const onError = (err) => setError(getApiError(err))

    if (editingId) {
      update.mutate({ id: editingId, data: payload }, {
        onSuccess: reset,
        onError,
      })
    } else {
      create.mutate(payload, {
        onSuccess: reset,
        onError,
      })
    }
  }

  const handleDelete = (id) => {
    if (!window.confirm('Bu yozuvni o\'chirishni tasdiqlaysizmi?\nDiqqat: bog\'liq ma\'lumotlar bo\'lsa, xato yuz berishi mumkin.')) return
    remove.mutate(id)
  }

  const isPending = create.isPending || update.isPending

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          {title} <span className="text-sm font-normal text-gray-500">({items.length})</span>
        </h2>
        {!adding && !editingId && (
          <Button size="sm" variant="outline" onClick={() => { reset(); setAdding(true) }}>
            <Plus className="w-4 h-4" />
            Yangi qo'shish
          </Button>
        )}
      </div>

      {(adding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className={(parentField || extraFields.length > 0) ? 'grid grid-cols-1 md:grid-cols-2 gap-3 mb-3' : 'mb-3'}>
            {parentField && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{parentLabel} *</label>
                <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
                  <option value="">Tanlang</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nomini kiriting"
                autoFocus
              />
            </div>

            {/* Qo'shimcha maydonlar (masalan, tashkilot uchun INN, website) */}
            {extraFields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {f.label}{f.required && ' *'}
                </label>
                <Input
                  type={f.type || 'text'}
                  value={extraValues[f.key] || ''}
                  onChange={(e) => setExtraValues((s) => ({ ...s, [f.key]: e.target.value }))}
                  placeholder={f.placeholder || ''}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={reset}>
              <X className="w-4 h-4" /> Bekor qilish
            </Button>
            <Button type="submit" size="sm" loading={isPending}>
              <Check className="w-4 h-4" /> Saqlash
            </Button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Yuklanmoqda...
        </div>
      )}

      {!isLoading && items.length === 0 && !adding && (
        <p className="text-sm text-gray-500 italic text-center py-6">Hech narsa yo'q. "Yangi qo'shish" tugmasini bosing.</p>
      )}

      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          editingId === item.id ? null : (
            <div key={item.id} className="flex items-center justify-between py-2.5 px-1 hover:bg-gray-50 rounded-lg">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                {parentDisplayKey && item[parentDisplayKey] && (
                  <div className="text-xs text-gray-500">{item[parentDisplayKey]}</div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  aria-label="Tahrirlash"
                  className="p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-white transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={remove.isPending}
                  aria-label="O'chirish"
                  className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-white transition disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

export default ReferenceCrud
