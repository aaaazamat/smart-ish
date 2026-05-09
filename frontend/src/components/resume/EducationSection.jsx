import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react'
import { educationHooks } from '@/hooks/useResume'
import { useUniversities, useUniversityDirections } from '@/hooks/useReferences'
import { educationSchema } from '@/lib/schemas'
import { DEGREE_LEVEL_OPTIONS } from '@/lib/constants'
import { applyApiErrorsToForm, getApiError } from '@/lib/apiError'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import FormField from '@/components/ui/FormField'

function ItemForm({ initialData, onSubmit, onCancel, isPending, error }) {
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      degree_level: initialData?.degree_level || '',
      university: initialData?.university?.toString() || '',
      direction: initialData?.direction?.toString() || '',
      start_year: initialData?.start_year || '',
      end_year: initialData?.end_year || '',
      is_studying: initialData?.is_studying || false,
    },
  })

  const universityId = watch('university')
  const isStudying = watch('is_studying')

  const { data: universities } = useUniversities()
  const { data: directions } = useUniversityDirections(universityId)

  const formError = error && getApiError(error)

  const submit = (values) => {
    const payload = {
      degree_level: values.degree_level,
      university: values.university ? Number(values.university) : null,
      direction: values.direction ? Number(values.direction) : null,
      start_year: Number(values.start_year),
      end_year: values.is_studying ? null : Number(values.end_year) || null,
      is_studying: !!values.is_studying,
    }
    onSubmit(payload, setError)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {formError}
        </div>
      )}

      <FormField label="Daraja *" error={errors.degree_level?.message}>
        <Select error={!!errors.degree_level} {...register('degree_level')}>
          <option value="">Tanlang</option>
          {DEGREE_LEVEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="O'quv muassasasi" error={errors.university?.message}>
        <Select error={!!errors.university} {...register('university')}>
          <option value="">Tanlang</option>
          {universities?.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Yo'nalish" error={errors.direction?.message}>
        <Select error={!!errors.direction} disabled={!universityId} {...register('direction')}>
          <option value="">{universityId ? 'Tanlang' : 'Avval universitetni tanlang'}</option>
          {directions?.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Boshlangan yil *" error={errors.start_year?.message}>
          <Input type="number" placeholder="2020" error={!!errors.start_year} {...register('start_year')} />
        </FormField>
        {!isStudying && (
          <FormField label="Tugagan yil" error={errors.end_year?.message}>
            <Input type="number" placeholder="2024" error={!!errors.end_year} {...register('end_year')} />
          </FormField>
        )}
      </div>

      <Checkbox label="Hozir o'qiyapman" {...register('is_studying')} />

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Bekor qilish
        </Button>
        <Button type="submit" size="sm" loading={isPending}>
          Saqlash
        </Button>
      </div>
    </form>
  )
}

function ItemCard({ item, onEdit, onDelete, isDeleting }) {
  const period = item.is_studying
    ? `${item.start_year} — Hozir`
    : `${item.start_year} — ${item.end_year || '—'}`

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900">
            {item.degree_level_display}
            {item.direction_name && ` — ${item.direction_name}`}
          </h3>
          {item.university_name && (
            <p className="text-sm text-gray-600 mt-0.5">{item.university_name}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">{period}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Tahrirlash"
            className="p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-gray-50 transition"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            aria-label="O'chirish"
            className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function EducationSection() {
  const { data: items = [], isLoading } = educationHooks.useList()
  const create = educationHooks.useCreate()
  const update = educationHooks.useUpdate()
  const remove = educationHooks.useDelete()

  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const handleCreate = (payload, setError) => {
    create.mutate(payload, {
      onSuccess: () => setAdding(false),
      onError: (e) => applyApiErrorsToForm(e, setError),
    })
  }

  const handleUpdate = (id) => (payload, setError) => {
    update.mutate({ id, data: payload }, {
      onSuccess: () => setEditingId(null),
      onError: (e) => applyApiErrorsToForm(e, setError),
    })
  }

  const handleDelete = (id) => {
    if (!window.confirm('Ushbu yozuvni o\'chirishni tasdiqlaysizmi?')) return
    remove.mutate(id)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg font-semibold text-gray-900">Ta'lim</h2>
        </div>
        {!adding && (
          <Button size="sm" variant="outline" onClick={() => { setAdding(true); setEditingId(null) }}>
            <Plus className="w-4 h-4" /> Qo'shish
          </Button>
        )}
      </div>

      {isLoading && <p className="text-sm text-gray-500">Yuklanmoqda...</p>}

      {!isLoading && items.length === 0 && !adding && (
        <p className="text-sm text-gray-500 italic">Hali ta'lim ma'lumoti qo'shilmagan</p>
      )}

      <div className="space-y-3">
        {items.map((item) =>
          editingId === item.id ? (
            <ItemForm
              key={item.id}
              initialData={item}
              onSubmit={handleUpdate(item.id)}
              onCancel={() => setEditingId(null)}
              isPending={update.isPending}
              error={update.error}
            />
          ) : (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={() => { setEditingId(item.id); setAdding(false) }}
              onDelete={() => handleDelete(item.id)}
              isDeleting={remove.isPending}
            />
          )
        )}

        {adding && (
          <ItemForm
            onSubmit={handleCreate}
            onCancel={() => setAdding(false)}
            isPending={create.isPending}
            error={create.error}
          />
        )}
      </div>
    </div>
  )
}

export default EducationSection
