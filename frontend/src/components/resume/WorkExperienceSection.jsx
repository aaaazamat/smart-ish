import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Briefcase, X } from 'lucide-react'
import { workExperienceHooks } from '@/hooks/useResume'
import { workExperienceSchema } from '@/lib/schemas'
import { MONTH_OPTIONS } from '@/lib/constants'
import { applyApiErrorsToForm, getApiError } from '@/lib/apiError'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import FormField from '@/components/ui/FormField'

function formatPeriod(item, nowLabel) {
  const month = (m) => MONTH_OPTIONS.find((o) => o.value === Number(m))?.label || ''
  const start = `${month(item.start_month)} ${item.start_year}`
  const end = item.is_current
    ? nowLabel
    : item.end_year
    ? `${month(item.end_month)} ${item.end_year}`
    : '—'
  return `${start} — ${end}`
}

function ItemForm({ initialData, onSubmit, onCancel, isPending, error }) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      organization_name: initialData?.organization_name || '',
      position: initialData?.position || '',
      start_month: initialData?.start_month || '',
      start_year: initialData?.start_year || '',
      end_month: initialData?.end_month || '',
      end_year: initialData?.end_year || '',
      is_current: initialData?.is_current || false,
      responsibilities: initialData?.responsibilities || '',
    },
  })

  const isCurrent = watch('is_current')
  const formError = error && getApiError(error)

  const submit = (values) => {
    const payload = {
      ...values,
      end_month: values.is_current ? null : Number(values.end_month) || null,
      end_year: values.is_current ? null : Number(values.end_year) || null,
      responsibilities: values.responsibilities || '',
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label={`${t('resume.we_org')} *`} error={errors.organization_name?.message}>
          <Input error={!!errors.organization_name} {...register('organization_name')} />
        </FormField>
        <FormField label={`${t('resume.we_position')} *`} error={errors.position?.message}>
          <Input error={!!errors.position} {...register('position')} />
        </FormField>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{`${t('resume.we_start')} *`}</label>
        <div className="grid grid-cols-2 gap-2">
          <Select error={!!errors.start_month} {...register('start_month')}>
            <option value="">{t('resume.month')}</option>
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </Select>
          <Input type="number" placeholder={t('resume.year')} error={!!errors.start_year} {...register('start_year')} />
        </div>
        {(errors.start_month || errors.start_year) && (
          <p className="mt-1.5 text-sm text-red-500">
            {errors.start_month?.message || errors.start_year?.message}
          </p>
        )}
      </div>

      {!isCurrent && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('resume.we_end')}</label>
          <div className="grid grid-cols-2 gap-2">
            <Select error={!!errors.end_month} {...register('end_month')}>
              <option value="">{t('resume.month')}</option>
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>
            <Input type="number" placeholder={t('resume.year')} error={!!errors.end_year} {...register('end_year')} />
          </div>
          {errors.end_year?.message && (
            <p className="mt-1.5 text-sm text-red-500">{errors.end_year.message}</p>
          )}
        </div>
      )}

      <Checkbox label={t('resume.we_current')} {...register('is_current')} />

      <FormField label={t('resume.we_resp')} error={errors.responsibilities?.message}>
        <Textarea
          rows={3}
          placeholder={t('resume.we_resp_ph')}
          error={!!errors.responsibilities}
          {...register('responsibilities')}
        />
      </FormField>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" size="sm" loading={isPending}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  )
}

function ItemCard({ item, onEdit, onDelete, isDeleting }) {
  const { t } = useTranslation()
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900">{item.position}</h3>
          <p className="text-sm text-gray-600 mt-0.5">{item.organization_name}</p>
          <p className="text-xs text-gray-500 mt-1">{formatPeriod(item, t('resume.we_now'))}</p>
          {item.responsibilities && (
            <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">{item.responsibilities}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            aria-label={t('common.edit')}
            className="p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-gray-50 transition"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            aria-label={t('common.delete')}
            className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function WorkExperienceSection() {
  const { t } = useTranslation()
  const { data: items = [], isLoading } = workExperienceHooks.useList()
  const create = workExperienceHooks.useCreate()
  const update = workExperienceHooks.useUpdate()
  const remove = workExperienceHooks.useDelete()

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
    if (!window.confirm(t('resume.confirm_delete'))) return
    remove.mutate(id)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg font-semibold text-gray-900">{t('resume.we_title')}</h2>
        </div>
        {!adding && (
          <Button size="sm" variant="outline" onClick={() => { setAdding(true); setEditingId(null) }}>
            <Plus className="w-4 h-4" /> {t('resume.btn_add')}
          </Button>
        )}
      </div>

      {isLoading && <p className="text-sm text-gray-500">{t('common.loading')}</p>}

      {!isLoading && items.length === 0 && !adding && (
        <p className="text-sm text-gray-500 italic">{t('resume.we_empty')}</p>
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

export default WorkExperienceSection
