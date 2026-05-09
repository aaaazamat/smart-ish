import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, AlertCircle, CheckCircle2, Pencil, FileText, EyeOff } from 'lucide-react'
import { resumeSchema } from '@/lib/schemas'
import {
  GENDER_OPTIONS,
  CAREER_LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
} from '@/lib/constants'
import { useMyResume, useCreateResume, useUpdateResume } from '@/hooks/useResume'
import { useRegions, useDistricts, useProfessions } from '@/hooks/useReferences'
import { applyApiErrorsToForm, getApiError } from '@/lib/apiError'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import FormField from '@/components/ui/FormField'
import SkillsPicker from '@/components/resume/SkillsPicker'
import WorkExperienceSection from '@/components/resume/WorkExperienceSection'
import EducationSection from '@/components/resume/EducationSection'
import CertificateSection from '@/components/resume/CertificateSection'

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">{title}</h2>
      {children}
    </div>
  )
}

function ResumeForm({ initialData, onSubmit, isPending, error, onCancel }) {
  const isEdit = !!initialData

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      middle_name: initialData?.middle_name || '',
      phone_number: initialData?.phone_number || '+998',
      email: initialData?.email || '',
      birth_date: initialData?.birth_date || '',
      gender: initialData?.gender || '',
      region: initialData?.region?.id?.toString() || initialData?.region?.toString() || '',
      district: initialData?.district?.id?.toString() || initialData?.district?.toString() || '',
      profession: initialData?.profession?.id?.toString() || initialData?.profession?.toString() || '',
      profession_detail: initialData?.profession_detail || '',
      career_level: initialData?.career_level || '',
      expected_salary: initialData?.expected_salary?.toString() || '',
      employment_type: initialData?.employment_type || '',
      work_mode: initialData?.work_mode || '',
      employment_status: initialData?.employment_status || '',
      skills: initialData?.skills?.map((s) => s.id) || [],
      is_disabled: initialData?.is_disabled || false,
      is_social_registry: initialData?.is_social_registry || false,
      has_driving_license: initialData?.has_driving_license || false,
      driving_license_categories: initialData?.driving_license_categories || '',
      is_published: initialData?.is_published ?? true,
    },
  })

  const regionId = watch('region')
  const hasDrivingLicense = watch('has_driving_license')
  const { data: regions } = useRegions()
  const { data: districts } = useDistricts(regionId)
  const { data: professions } = useProfessions()

  useEffect(() => {
    if (regionId) setValue('district', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId])

  const submit = (values) => {
    const payload = {
      ...values,
      region: values.region ? Number(values.region) : null,
      district: values.district ? Number(values.district) : null,
      profession: values.profession ? Number(values.profession) : null,
      expected_salary: values.expected_salary ? Number(values.expected_salary) : null,
      email: values.email || null,
      middle_name: values.middle_name || '',
      profession_detail: values.profession_detail || '',
      driving_license_categories: values.has_driving_license ? values.driving_license_categories : '',
      skills: (values.skills || []).map(Number),
    }
    onSubmit(payload, setError)
  }

  const formError = error && getApiError(error)

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <Section title="Shaxsiy ma'lumotlar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Familiya *" error={errors.last_name?.message}>
            <Input error={!!errors.last_name} {...register('last_name')} />
          </FormField>
          <FormField label="Ism *" error={errors.first_name?.message}>
            <Input error={!!errors.first_name} {...register('first_name')} />
          </FormField>
          <FormField label="Otasining ismi" error={errors.middle_name?.message}>
            <Input error={!!errors.middle_name} {...register('middle_name')} />
          </FormField>
          <FormField label="Telefon raqami *" error={errors.phone_number?.message}>
            <Input type="tel" error={!!errors.phone_number} {...register('phone_number')} />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <Input type="email" error={!!errors.email} {...register('email')} />
          </FormField>
          <FormField label="Tug'ilgan sana *" error={errors.birth_date?.message}>
            <Input type="date" error={!!errors.birth_date} {...register('birth_date')} />
          </FormField>
          <FormField label="Jins *" error={errors.gender?.message}>
            <Select error={!!errors.gender} {...register('gender')}>
              <option value="">Tanlang</option>
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
        </div>
      </Section>

      <Section title="Yashash joyi">
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
              <option value="">{regionId ? 'Tanlang' : 'Avval hududni tanlang'}</option>
              {districts?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </FormField>
        </div>
      </Section>

      <Section title="Kasb va karyera">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Kasb / Lavozim" error={errors.profession?.message}>
            <Select error={!!errors.profession} {...register('profession')}>
              <option value="">Tanlang</option>
              {professions?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Karyera darajasi *" error={errors.career_level?.message}>
            <Select error={!!errors.career_level} {...register('career_level')}>
              <option value="">Tanlang</option>
              {CAREER_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Kutilayotgan maosh (so'm)" error={errors.expected_salary?.message}>
            <Input
              type="number"
              placeholder="masalan: 5000000"
              error={!!errors.expected_salary}
              {...register('expected_salary')}
            />
          </FormField>
        </div>
        <div className="mt-4">
          <FormField label="Kasb haqida qo'shimcha" error={errors.profession_detail?.message}>
            <Textarea
              rows={3}
              placeholder="Qisqacha o'zingiz haqingizda..."
              error={!!errors.profession_detail}
              {...register('profession_detail')}
            />
          </FormField>
        </div>
      </Section>

      <Section title="Ko'nikmalar">
        <Controller
          name="skills"
          control={control}
          render={({ field }) => (
            <SkillsPicker value={field.value || []} onChange={field.onChange} />
          )}
        />
      </Section>

      <Section title="Ish istaklari">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Bandlik turi *" error={errors.employment_type?.message}>
            <Select error={!!errors.employment_type} {...register('employment_type')}>
              <option value="">Tanlang</option>
              {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Ish rejimi *" error={errors.work_mode?.message}>
            <Select error={!!errors.work_mode} {...register('work_mode')}>
              <option value="">Tanlang</option>
              {WORK_MODE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Ish qidirish holati *" error={errors.employment_status?.message}>
            <Select error={!!errors.employment_status} {...register('employment_status')}>
              <option value="">Tanlang</option>
              {EMPLOYMENT_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
        </div>
      </Section>

      <Section title="Qo'shimcha ma'lumotlar">
        <div className="space-y-4">
          <Checkbox
            label="Nogironligim bor"
            description="Nogironlar uchun mo'ljallangan vakansiyalarda ko'rinasiz"
            {...register('is_disabled')}
          />
          <Checkbox
            label="Ijtimoiy reestrda turaman"
            description="Davlat ijtimoiy yordam reestrida ro'yxatdaman"
            {...register('is_social_registry')}
          />
          <Checkbox
            label="Haydovchilik guvohnomam bor"
            {...register('has_driving_license')}
          />
          {hasDrivingLicense && (
            <div className="ml-8">
              <FormField
                label="Toifalar"
                hint="Masalan: B, C, D yoki BE, CE..."
                error={errors.driving_license_categories?.message}
              >
                <Input
                  placeholder="B, C, D"
                  error={!!errors.driving_license_categories}
                  {...register('driving_license_categories')}
                />
              </FormField>
            </div>
          )}
        </div>
      </Section>

      <Section title="E'lon qilish">
        <Checkbox
          label="Rezyumemni e'lon qilingan deb belgilash"
          description="Yoqilganda ish beruvchilar rezyumengizni ko'ra oladi va sizni taklif qilishi mumkin"
          {...register('is_published')}
        />
      </Section>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Bekor qilish
          </Button>
        )}
        <Button type="submit" loading={isPending}>
          {isEdit ? 'Saqlash' : 'Rezyume yaratish'}
        </Button>
      </div>
    </form>
  )
}

function Pill({ children, color = 'gray' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    brand: 'bg-brand-50 text-brand-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

function ResumeView({ resume, onEdit }) {
  const Item = ({ label, value }) => (
    <div className="py-2.5 border-b border-gray-100 last:border-0">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm text-gray-900">{value || '—'}</div>
    </div>
  )

  const fullName = [resume.last_name, resume.first_name, resume.middle_name].filter(Boolean).join(' ')
  const location = [resume.region?.name, resume.district?.name].filter(Boolean).join(', ')
  const profession = resume.profession?.name || resume.profession_name

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
            <p className="text-base text-brand-500 mt-1">
              {profession || resume.career_level_display || 'Kasb ko\'rsatilmagan'}
            </p>
          </div>
          <Button onClick={onEdit} variant="secondary">
            <Pencil className="w-4 h-4" />
            Tahrirlash
          </Button>
        </div>
        {resume.profession_detail && (
          <p className="text-gray-700 mt-3 whitespace-pre-line">{resume.profession_detail}</p>
        )}
      </div>

      <Section title="Shaxsiy ma'lumotlar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <Item label="Telefon" value={resume.phone_number} />
          <Item label="Email" value={resume.email} />
          <Item label="Tug'ilgan sana" value={resume.birth_date} />
          <Item label="Jins" value={resume.gender_display} />
          <Item label="Hudud" value={location} />
        </div>
      </Section>

      {resume.skills?.length > 0 && (
        <Section title="Ko'nikmalar">
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((s) => (
              <Pill key={s.id} color="brand">{s.name}</Pill>
            ))}
          </div>
        </Section>
      )}

      <Section title="Ish istaklari">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <Item label="Karyera darajasi" value={resume.career_level_display} />
          <Item
            label="Kutilayotgan maosh"
            value={resume.expected_salary ? `${Number(resume.expected_salary).toLocaleString('ru-RU').replace(/,/g, ' ')} so'm` : null}
          />
          <Item label="Bandlik turi" value={resume.employment_type_display} />
          <Item label="Ish rejimi" value={resume.work_mode_display} />
          <Item label="Holat" value={resume.employment_status_display} />
        </div>
      </Section>

      {(resume.is_disabled || resume.is_social_registry || resume.has_driving_license) && (
        <Section title="Qo'shimcha ma'lumotlar">
          <div className="flex flex-wrap gap-2">
            {resume.is_disabled && <Pill color="green">Nogironlik mavjud</Pill>}
            {resume.is_social_registry && <Pill color="green">Ijtimoiy reestrda</Pill>}
            {resume.has_driving_license && (
              <Pill color="amber">
                Haydovchilik guvohnomasi
                {resume.driving_license_categories && ` (${resume.driving_license_categories})`}
              </Pill>
            )}
          </div>
        </Section>
      )}

      <WorkExperienceSection />
      <EducationSection />
      <CertificateSection />
    </div>
  )
}

function MyResumePage() {
  const { data: resume, isLoading } = useMyResume()
  const createMutation = useCreateResume()
  const updateMutation = useUpdateResume()
  const [editing, setEditing] = useState(false)

  const handleCreate = (payload, setError) => {
    createMutation.mutate(payload, {
      onSuccess: () => setEditing(false),
      onError: (error) => applyApiErrorsToForm(error, setError),
    })
  }

  const handleUpdate = (payload, setError) => {
    updateMutation.mutate(payload, {
      onSuccess: () => setEditing(false),
      onError: (error) => applyApiErrorsToForm(error, setError),
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-16 flex items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yuklanmoqda...
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-gray-900">Mening rezyumem</h1>
        {resume && !editing && (
          resume.is_published ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              E'lon qilingan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              <EyeOff className="w-3.5 h-3.5" />
              Yashirilgan
            </span>
          )
        )}
      </div>

      {!resume && !editing && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sizda hali rezyume yo'q
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Vakansiyalarga ariza yuborish va ish beruvchilar sizni topishi uchun rezyume yarating.
          </p>
          <Button onClick={() => setEditing(true)} size="lg">
            Rezyume yaratish
          </Button>
        </div>
      )}

      {!resume && editing && (
        <ResumeForm
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
          error={createMutation.error}
          onCancel={() => setEditing(false)}
        />
      )}

      {resume && !editing && (
        <ResumeView resume={resume} onEdit={() => setEditing(true)} />
      )}

      {resume && editing && (
        <ResumeForm
          initialData={resume}
          onSubmit={handleUpdate}
          isPending={updateMutation.isPending}
          error={updateMutation.error}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  )
}

export default MyResumePage
