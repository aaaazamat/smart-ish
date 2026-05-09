import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft, CheckCircle2, User, Building2 } from 'lucide-react'
import { otpSendSchema, registerSchema, registerEmployerSchema } from '@/lib/schemas'
import {
  useSendOtp,
  useRegisterJobSeeker,
  useRegisterEmployer,
} from '@/hooks/useAuth'
import { organizationsApi } from '@/api/endpoints'
import { applyApiErrorsToForm, getApiError } from '@/lib/apiError'
import { cn } from '@/lib/cn'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'

function RoleTabs({ value, onChange }) {
  const tabs = [
    { value: 'job_seeker', label: 'Ish izlovchi', icon: User },
    { value: 'employer', label: 'Ish beruvchi', icon: Building2 },
  ]
  return (
    <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
      {tabs.map((t) => {
        const Icon = t.icon
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              'flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition',
              value === t.value
                ? 'bg-white text-brand-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Icon className="w-4 h-4" />
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

function StepEmail({ onSent }) {
  const sendOtp = useSendOtp()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(otpSendSchema) })

  const onSubmit = (values) => {
    sendOtp.mutate(values.email, {
      onSuccess: () => onSent(values.email),
      onError: (error) => applyApiErrorsToForm(error, setError),
    })
  }

  const formError = sendOtp.isError && !errors.email && getApiError(sendOtp.error)

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Ro'yxatdan o'tish</h1>
      <p className="text-sm text-gray-500 mb-6">
        Emailingizga 6 xonali tasdiqlash kodi yuboramiz
      </p>

      {formError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="example@mail.com"
            error={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <Button type="submit" size="lg" className="w-full mt-2" loading={sendOtp.isPending}>
          Kod yuborish
        </Button>
      </form>
    </>
  )
}

function StepJobSeeker({ email, onBack }) {
  const navigate = useNavigate()
  const registerMutation = useRegisterJobSeeker()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { email, phone_number: '+998', code: '', password: '', password_confirm: '' },
  })

  const onSubmit = (values) => {
    registerMutation.mutate(values, {
      onSuccess: () => navigate('/', { replace: true }),
      onError: (error) => applyApiErrorsToForm(error, setError),
    })
  }

  const formError = registerMutation.isError &&
    !errors.email && !errors.phone_number && !errors.code && !errors.password &&
    getApiError(registerMutation.error)

  return (
    <>
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Orqaga
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Ish izlovchi sifatida</h1>
      <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-start gap-2 text-sm">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Kod <strong>{email}</strong> manziliga yuborildi (Django konsolida ko'rinadi)</span>
      </div>

      {formError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" disabled error={!!errors.email} {...register('email')} />
        </FormField>
        <FormField label="Tasdiqlash kodi" error={errors.code?.message}>
          <Input type="text" inputMode="numeric" maxLength={6} placeholder="123456" error={!!errors.code} {...register('code')} />
        </FormField>
        <FormField label="Telefon raqami" error={errors.phone_number?.message}>
          <Input type="tel" autoComplete="tel" placeholder="+998901234567" error={!!errors.phone_number} {...register('phone_number')} />
        </FormField>
        <FormField label="Parol" error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" placeholder="Kamida 6 ta belgi" error={!!errors.password} {...register('password')} />
        </FormField>
        <FormField label="Parolni takrorlang" error={errors.password_confirm?.message}>
          <Input type="password" autoComplete="new-password" placeholder="Yana bir bor" error={!!errors.password_confirm} {...register('password_confirm')} />
        </FormField>
        <Button type="submit" size="lg" className="w-full mt-2" loading={registerMutation.isPending}>
          Ro'yxatdan o'tish
        </Button>
      </form>
    </>
  )
}

function StepEmployer({ email, onBack }) {
  const navigate = useNavigate()
  const registerMutation = useRegisterEmployer()

  const { data: orgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationsApi.list(),
  })

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerEmployerSchema),
    defaultValues: { email, phone_number: '+998', code: '', organization_id: '', password: '', password_confirm: '' },
  })

  const onSubmit = (values) => {
    const payload = { ...values, organization_id: Number(values.organization_id) }
    registerMutation.mutate(payload, {
      onSuccess: () => navigate('/employer/dashboard', { replace: true }),
      onError: (error) => applyApiErrorsToForm(error, setError),
    })
  }

  const formError = registerMutation.isError &&
    !errors.email && !errors.phone_number && !errors.code && !errors.password && !errors.organization_id &&
    getApiError(registerMutation.error)

  const orgList = orgs?.results || orgs || []

  return (
    <>
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Orqaga
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Ish beruvchi sifatida</h1>
      <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-start gap-2 text-sm">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Kod <strong>{email}</strong> manziliga yuborildi</span>
      </div>

      {formError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" disabled error={!!errors.email} {...register('email')} />
        </FormField>
        <FormField label="Tasdiqlash kodi" error={errors.code?.message}>
          <Input type="text" inputMode="numeric" maxLength={6} placeholder="123456" error={!!errors.code} {...register('code')} />
        </FormField>
        <FormField label="Telefon raqami" error={errors.phone_number?.message}>
          <Input type="tel" placeholder="+998901234567" error={!!errors.phone_number} {...register('phone_number')} />
        </FormField>
        <FormField label="Tashkilot" error={errors.organization_id?.message}>
          <Select error={!!errors.organization_id} {...register('organization_id')}>
            <option value="">Tashkilotni tanlang</option>
            {orgList.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Parol" error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" placeholder="Kamida 6 ta belgi" error={!!errors.password} {...register('password')} />
        </FormField>
        <FormField label="Parolni takrorlang" error={errors.password_confirm?.message}>
          <Input type="password" autoComplete="new-password" placeholder="Yana bir bor" error={!!errors.password_confirm} {...register('password_confirm')} />
        </FormField>
        <Button type="submit" size="lg" className="w-full mt-2" loading={registerMutation.isPending}>
          Ro'yxatdan o'tish
        </Button>
      </form>
    </>
  )
}

function RegisterPage() {
  const [role, setRole] = useState('job_seeker')
  const [email, setEmail] = useState(null)

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setEmail(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <Link to="/" className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <div className="text-2xl font-extrabold text-brand-500">OSON ISH</div>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {!email && <RoleTabs value={role} onChange={handleRoleChange} />}

        {!email ? (
          <StepEmail onSent={setEmail} />
        ) : role === 'job_seeker' ? (
          <StepJobSeeker email={email} onBack={() => setEmail(null)} />
        ) : (
          <StepEmployer email={email} onBack={() => setEmail(null)} />
        )}

        <p className="mt-6 text-sm text-gray-600 text-center">
          Allaqachon akkauntingiz bormi?{' '}
          <Link to="/login" className="text-brand-500 font-medium hover:underline">
            Tizimga kiring
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
