import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Award, ExternalLink } from 'lucide-react'
import { certificateHooks } from '@/hooks/useResume'
import { certificateSchema } from '@/lib/schemas'
import { applyApiErrorsToForm, getApiError } from '@/lib/apiError'
import { formatDate } from '@/lib/format'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'

function ItemForm({ initialData, onSubmit, onCancel, isPending, error }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      name: initialData?.name || '',
      issued_date: initialData?.issued_date || '',
      file_url: initialData?.file_url || '',
    },
  })

  const formError = error && getApiError(error)

  const submit = (values) => {
    onSubmit({
      name: values.name,
      issued_date: values.issued_date,
      file_url: values.file_url || null,
    }, setError)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {formError}
        </div>
      )}

      <FormField label="Sertifikat nomi *" error={errors.name?.message}>
        <Input
          placeholder="Masalan: Python Developer Certificate"
          error={!!errors.name}
          {...register('name')}
        />
      </FormField>

      <FormField label="Berilgan sana *" error={errors.issued_date?.message}>
        <Input type="date" error={!!errors.issued_date} {...register('issued_date')} />
      </FormField>

      <FormField label="Fayl yoki link (URL)" error={errors.file_url?.message}>
        <Input
          type="url"
          placeholder="https://..."
          error={!!errors.file_url}
          {...register('file_url')}
        />
      </FormField>

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
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <p className="text-xs text-gray-500 mt-1">
            Berilgan: {formatDate(item.issued_date)}
          </p>
          {item.file_url && (
            <a
              href={item.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-brand-500 hover:underline mt-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Sertifikatga o'tish
            </a>
          )}
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

function CertificateSection() {
  const { data: items = [], isLoading } = certificateHooks.useList()
  const create = certificateHooks.useCreate()
  const update = certificateHooks.useUpdate()
  const remove = certificateHooks.useDelete()

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
    if (!window.confirm('Ushbu sertifikatni o\'chirishni tasdiqlaysizmi?')) return
    remove.mutate(id)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg font-semibold text-gray-900">Sertifikatlar</h2>
        </div>
        {!adding && (
          <Button size="sm" variant="outline" onClick={() => { setAdding(true); setEditingId(null) }}>
            <Plus className="w-4 h-4" /> Qo'shish
          </Button>
        )}
      </div>

      {isLoading && <p className="text-sm text-gray-500">Yuklanmoqda...</p>}

      {!isLoading && items.length === 0 && !adding && (
        <p className="text-sm text-gray-500 italic">Hali sertifikat qo'shilmagan</p>
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

export default CertificateSection
