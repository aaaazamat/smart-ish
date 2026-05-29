import { useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, ArrowLeft, ShieldAlert } from 'lucide-react'
import { adminApi } from '@/api/endpoints'
import { useRegions, useDistricts, useProfessions } from '@/hooks/useReferences'
import {
  GENDER_OPTIONS, CAREER_LEVEL_OPTIONS, EMPLOYMENT_TYPE_OPTIONS,
  WORK_MODE_OPTIONS, EMPLOYMENT_STATUS_OPTIONS,
} from '@/lib/constants'
import { applyApiErrorsToForm, getApiError } from '@/lib/apiError'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import FormField from '@/components/ui/FormField'

/**
 * Admin tomonidan har qanday rezyumeni tahrirlash sahifasi.
 * Asosiy maydonlar (ism, kasb, maosh, holat) — ResumeWriteSerializer orqali.
 * Ish tajribasi/ta'lim kabi nested ma'lumotlar alohida boshqariladi.
 */
function AdminResumeEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: resume, isLoading } = useQuery({
    queryKey: ['admin-resume', id],
    queryFn: () => adminApi.resumeDetail(id),
  })

  const { register, handleSubmit, setError, reset, watch, formState: { errors } } = useForm()
  const regionId = watch('region')

  const { data: regions } = useRegions()
  const { data: districts } = useDistricts(regionId)
  const { data: professions } = useProfessions()

  // Rezyume yuklanganda formani to'ldirish (nested obyektlardan ID olamiz)
  useEffect(() => {
    if (!resume) return
    reset({
      first_name: resume.first_name || '',
      last_name: resume.last_name || '',
      middle_name: resume.middle_name || '',
      phone_number: resume.phone_number || '',
      email: resume.email || '',
      birth_date: resume.birth_date || '',
      gender: resume.gender || '',
      region: resume.region?.id || '',
      district: resume.district?.id || '',
      profession: resume.profession?.id || '',
      profession_detail: resume.profession_detail || '',
      career_level: resume.career_level || '',
      expected_salary: resume.expected_salary || '',
      employment_type: resume.employment_type || '',
      work_mode: resume.work_mode || '',
      employment_status: resume.employment_status || '',
      is_published: resume.is_published ?? true,
    })
  }, [resume, reset])

  const update = useMutation({
    mutationFn: (data) => adminApi.resumeUpdate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-resumes'] })
      qc.invalidateQueries({ queryKey: ['admin-resume', id] })
      navigate('/admin/moderation?tab=resumes', { replace: true })
    },
    onError: (e) => applyApiErrorsToForm(e, setError),
  })

  const onSubmit = (values) => {
    // Bo'sh string → null/undefined (PATCH uchun toza payload)
    const payload = {
      ...values,
      region: values.region || null,
      district: values.district || null,
      profession: values.profession || null,
      expected_salary: values.expected_salary ? Number(values.expected_salary) : null,
      is_published: !!values.is_published,
    }
    update.mutate(payload)
  }

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-16 flex items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yuklanmoqda...
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <p className="text-gray-500">Rezyume topilmadi</p>
      </div>
    )
  }

  const formError = update.isError && getApiError(update.error)

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        to="/admin/moderation?tab=resumes"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Moderatsiyaga qaytish
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="w-6 h-6 text-brand-500" />
        <h1 className="text-3xl font-bold text-gray-900">Rezyumeni tahrirlash</h1>
      </div>
      <p className="text-gray-500 mb-6">
        Administrator sifatida tahrirlamoqdasiz
        {resume.user_phone ? ` · ${resume.user_phone}` : ''}
      </p>

      {formError && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        {/* Shaxsiy ma'lumotlar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Familiya" error={errors.last_name?.message}>
            <Input {...register('last_name')} />
          </FormField>
          <FormField label="Ism" error={errors.first_name?.message}>
            <Input {...register('first_name')} />
          </FormField>
          <FormField label="Otasining ismi" error={errors.middle_name?.message}>
            <Input {...register('middle_name')} />
          </FormField>
          <FormField label="Jinsi" error={errors.gender?.message}>
            <Select {...register('gender')}>
              <option value="">Tanlang</option>
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Telefon raqami" error={errors.phone_number?.message}>
            <Input {...register('phone_number')} placeholder="+998901234567" />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <Input type="email" {...register('email')} />
          </FormField>
          <FormField label="Tug'ilgan sana" error={errors.birth_date?.message}>
            <Input type="date" {...register('birth_date')} />
          </FormField>
        </div>

        {/* Kasb va joylashuv */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <FormField label="Kasb" error={errors.profession?.message}>
            <Select {...register('profession')}>
              <option value="">Tanlang</option>
              {professions?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Kutilayotgan maosh (so'm)" error={errors.expected_salary?.message}>
            <Input type="number" {...register('expected_salary')} />
          </FormField>
          <FormField label="Hudud" error={errors.region?.message}>
            <Select {...register('region')}>
              <option value="">Tanlang</option>
              {regions?.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Tuman / Shahar" error={errors.district?.message}>
            <Select {...register('district')} disabled={!regionId}>
              <option value="">Tanlang</option>
              {districts?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Kasb haqida (tavsif)" error={errors.profession_detail?.message}>
          <Textarea rows={4} {...register('profession_detail')} />
        </FormField>

        {/* Karyera */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <FormField label="Karyera darajasi" error={errors.career_level?.message}>
            <Select {...register('career_level')}>
              <option value="">Tanlang</option>
              {CAREER_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Bandlik turi" error={errors.employment_type?.message}>
            <Select {...register('employment_type')}>
              <option value="">Tanlang</option>
              {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Ish rejimi" error={errors.work_mode?.message}>
            <Select {...register('work_mode')}>
              <option value="">Tanlang</option>
              {WORK_MODE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Ish qidirish holati" error={errors.employment_status?.message}>
            <Select {...register('employment_status')}>
              <option value="">Tanlang</option>
              {EMPLOYMENT_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" {...register('is_published')} className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
              E'lon qilingan (ommaviy ko'rinadi)
            </label>
          </div>
        </div>

        {/* Tugmalar */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={update.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition disabled:opacity-50"
          >
            {update.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Saqlash
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/moderation?tab=resumes')}
            className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition"
          >
            Bekor qilish
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminResumeEditPage
