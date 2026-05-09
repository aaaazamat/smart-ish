import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Sparkles } from 'lucide-react'
import { employerVacancySchema } from '@/lib/schemas'
import {
  PAYMENT_TYPE_OPTIONS,
  EXPERIENCE_REQUIRED_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  VACANCY_EMPLOYMENT_TYPE_OPTIONS,
  VACANCY_WORK_MODE_OPTIONS,
  WORK_SCHEDULE_OPTIONS,
  VACANCY_GENDER_OPTIONS,
} from '@/lib/constants'
import {
  useRegions, useDistricts, useProfessions, useIndustries,
} from '@/hooks/useReferences'
import { applyApiErrorsToForm, getApiError } from '@/lib/apiError'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import FormField from '@/components/ui/FormField'
import LanguageRequirementsPicker from '@/components/employer/LanguageRequirementsPicker'
import AiDescriptionModal from '@/components/employer/AiDescriptionModal'

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function VacancyForm({ initialData, onSubmit, onCancel, isPending, error }) {
  const isEdit = !!initialData
  const [aiOpen, setAiOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employerVacancySchema),
    defaultValues: {
      profession: initialData?.profession?.toString() || '',
      industry: initialData?.industry?.toString() || '',
      description: initialData?.description || '',
      region: initialData?.region?.toString() || '',
      district: initialData?.district?.toString() || '',
      payment_type: initialData?.payment_type || 'monthly',
      salary_from: initialData?.salary_from?.toString() || '',
      salary_to: initialData?.salary_to?.toString() || '',
      experience_required: initialData?.experience_required || 'no_req',
      education_level: initialData?.education_level || 'any',
      employment_type: initialData?.employment_type || 'permanent',
      work_mode: initialData?.work_mode || 'office',
      work_schedule: initialData?.work_schedule || '',
      gender: initialData?.gender || 'any',
      age_from: initialData?.age_from?.toString() || '',
      age_to: initialData?.age_to?.toString() || '',
      for_disabled: initialData?.for_disabled || false,
      for_graduates: initialData?.for_graduates || false,
      for_students: initialData?.for_students || false,
      is_active: initialData?.is_active ?? true,
      expires_at: initialData?.expires_at?.slice(0, 10) || '',
      language_requirements: initialData?.language_requirements?.map((l) => ({
        language: l.language,
        min_level: l.min_level,
      })) || [],
    },
  })

  const regionId = watch('region')
  const { data: regions } = useRegions()
  const { data: districts } = useDistricts(regionId)
  const { data: professions } = useProfessions()
  const { data: industries } = useIndustries()

  useEffect(() => {
    if (regionId && initialData?.region?.toString() !== regionId) {
      setValue('district', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId])

  const submit = (values) => {
    const num = (v) => (v === '' || v == null ? null : Number(v))
    const payload = {
      profession: num(values.profession),
      industry: num(values.industry),
      description: values.description || '',
      region: num(values.region),
      district: num(values.district),
      payment_type: values.payment_type,
      salary_from: num(values.salary_from),
      salary_to: num(values.salary_to),
      experience_required: values.experience_required,
      education_level: values.education_level,
      employment_type: values.employment_type,
      work_mode: values.work_mode,
      work_schedule: values.work_schedule || '',
      gender: values.gender,
      age_from: num(values.age_from),
      age_to: num(values.age_to),
      for_disabled: !!values.for_disabled,
      for_graduates: !!values.for_graduates,
      for_students: !!values.for_students,
      is_active: !!values.is_active,
      expires_at: values.expires_at || null,
      language_requirements: values.language_requirements || [],
    }
    onSubmit(payload, setError)
  }

  const formError = error && getApiError(error)

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <Section title="Asosiy ma'lumotlar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Kasb / Lavozim *" error={errors.profession?.message}>
            <Select error={!!errors.profession} {...register('profession')}>
              <option value="">Tanlang</option>
              {professions?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Soha" error={errors.industry?.message}>
            <Select error={!!errors.industry} {...register('industry')}>
              <option value="">Tanlang</option>
              {industries?.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </Select>
          </FormField>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Vakansiya tavsifi
            </label>
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 transition border border-brand-200"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI bilan yozish
            </button>
          </div>
          <Textarea
            rows={6}
            placeholder="Vakansiya, kompaniya va ish vazifalari haqida..."
            error={!!errors.description}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1.5 text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>
      </Section>

      <AiDescriptionModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        profession={watch('profession')}
        industry={watch('industry')}
        onApply={(text) => setValue('description', text)}
      />

      <Section title="Joylashuv">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Hudud" error={errors.region?.message}>
            <Select error={!!errors.region} {...register('region')}>
              <option value="">Tanlang</option>
              {regions?.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Tuman / Shahar" error={errors.district?.message}>
            <Select error={!!errors.district} disabled={!regionId} {...register('district')}>
              <option value="">{regionId ? 'Tanlang' : 'Avval hudud'}</option>
              {districts?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </FormField>
        </div>
      </Section>

      <Section title="Maosh">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="To'lov turi *" error={errors.payment_type?.message}>
            <Select error={!!errors.payment_type} {...register('payment_type')}>
              {PAYMENT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Maosh dan (so'm)" error={errors.salary_from?.message}>
            <Input type="number" placeholder="5000000" error={!!errors.salary_from} {...register('salary_from')} />
          </FormField>
          <FormField label="Maosh gacha (so'm)" error={errors.salary_to?.message}>
            <Input type="number" placeholder="10000000" error={!!errors.salary_to} {...register('salary_to')} />
          </FormField>
        </div>
      </Section>

      <Section title="Talablar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tajriba *" error={errors.experience_required?.message}>
            <Select error={!!errors.experience_required} {...register('experience_required')}>
              {EXPERIENCE_REQUIRED_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Ta'lim darajasi" error={errors.education_level?.message}>
            <Select error={!!errors.education_level} {...register('education_level')}>
              {EDUCATION_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
        </div>
      </Section>

      <Section title="Ish sharoiti">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Bandlik turi *" error={errors.employment_type?.message}>
            <Select error={!!errors.employment_type} {...register('employment_type')}>
              {VACANCY_EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Ish rejimi *" error={errors.work_mode?.message}>
            <Select error={!!errors.work_mode} {...register('work_mode')}>
              {VACANCY_WORK_MODE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Ish jadvali" error={errors.work_schedule?.message}>
            <Select error={!!errors.work_schedule} {...register('work_schedule')}>
              <option value="">Tanlang</option>
              {WORK_SCHEDULE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
        </div>
      </Section>

      <Section title="Nomzod talablari">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Jins" error={errors.gender?.message}>
            <Select error={!!errors.gender} {...register('gender')}>
              {VACANCY_GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Yosh dan" error={errors.age_from?.message}>
            <Input type="number" placeholder="18" error={!!errors.age_from} {...register('age_from')} />
          </FormField>
          <FormField label="Yosh gacha" error={errors.age_to?.message}>
            <Input type="number" placeholder="65" error={!!errors.age_to} {...register('age_to')} />
          </FormField>
        </div>
        <div className="mt-4 space-y-3">
          <Checkbox label="Nogironlar uchun" {...register('for_disabled')} />
          <Checkbox label="Bitiruvchilar uchun" {...register('for_graduates')} />
          <Checkbox label="Talabalar uchun" {...register('for_students')} />
        </div>
      </Section>

      <Section title="Til talablari">
        <Controller
          name="language_requirements"
          control={control}
          render={({ field }) => (
            <LanguageRequirementsPicker
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </Section>

      <Section title="E'lon qilish">
        <div className="space-y-4">
          <FormField
            label="Amal qilish muddati"
            error={errors.expires_at?.message}
            hint="Bo'sh qoldirilsa, vakansiya muddatsiz bo'ladi"
          >
            <Input type="date" error={!!errors.expires_at} {...register('expires_at')} />
          </FormField>
          <Checkbox
            label="Vakansiya faol"
            description="Yoqilganda foydalanuvchilar vakansiyani ko'rishi va ariza yuborishi mumkin"
            {...register('is_active')}
          />
        </div>
      </Section>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Bekor qilish
          </Button>
        )}
        <Button type="submit" loading={isPending}>
          {isEdit ? 'Saqlash' : 'Vakansiya yaratish'}
        </Button>
      </div>
    </form>
  )
}

export default VacancyForm
