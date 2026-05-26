import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
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
import Logo from '@/components/ui/Logo'

function RoleTabs({ value, onChange }) {
  const { t } = useTranslation()
  const tabs = [
    { value: 'job_seeker', label: t('auth.job_seeker'), icon: User },
    { value: 'employer', label: t('auth.employer'), icon: Building2 },
  ]
  return (
    <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const active = value === tab.value
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
              active
                ? 'smartish-gradient-bg text-white shadow-lg shadow-purple-500/30 scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

function StepEmail({ onSent }) {
  const { t } = useTranslation()
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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.register_title')}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {t('auth.register_subtitle')}
      </p>

      {formError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label={t('auth.email')} error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="example@mail.com"
            error={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <button
          type="submit"
          disabled={sendOtp.isPending}
          className="w-full h-14 mt-2 smartish-gradient-bg text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {sendOtp.isPending && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {sendOtp.isPending ? t('auth.sending') : t('auth.send_code')}
        </button>
      </form>
    </>
  )
}

function StepJobSeeker({ email, onBack }) {
  const { t } = useTranslation()
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
        <ArrowLeft className="w-4 h-4" /> {t('common.back')}
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.as_job_seeker')}</h1>
      <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-start gap-2 text-sm">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{t('auth.code_sent_to', { email })}</span>
      </div>

      {formError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label={t('auth.email')} error={errors.email?.message}>
          <Input type="email" disabled error={!!errors.email} {...register('email')} />
        </FormField>
        <FormField label={t('auth.verification_code')} error={errors.code?.message}>
          <Input type="text" inputMode="numeric" maxLength={6} placeholder="123456" error={!!errors.code} {...register('code')} />
        </FormField>
        <FormField label={t('auth.phone_number')} error={errors.phone_number?.message}>
          <Input type="tel" autoComplete="tel" placeholder="+998901234567" error={!!errors.phone_number} {...register('phone_number')} />
        </FormField>
        <FormField label={t('auth.password')} error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" placeholder={t('auth.password_placeholder')} error={!!errors.password} {...register('password')} />
        </FormField>
        <FormField label={t('auth.confirm_password')} error={errors.password_confirm?.message}>
          <Input type="password" autoComplete="new-password" placeholder={t('auth.password_again')} error={!!errors.password_confirm} {...register('password_confirm')} />
        </FormField>
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full h-14 mt-2 smartish-gradient-bg text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {registerMutation.isPending && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {registerMutation.isPending ? t('common.saving') : t('auth.register_title')}
        </button>
      </form>
    </>
  )
}

function StepEmployer({ email, onBack }) {
  const { t } = useTranslation()
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
        <ArrowLeft className="w-4 h-4" /> {t('common.back')}
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.as_employer')}</h1>
      <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-start gap-2 text-sm">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{t('auth.code_sent_short', { email })}</span>
      </div>

      {formError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label={t('auth.email')} error={errors.email?.message}>
          <Input type="email" disabled error={!!errors.email} {...register('email')} />
        </FormField>
        <FormField label={t('auth.verification_code')} error={errors.code?.message}>
          <Input type="text" inputMode="numeric" maxLength={6} placeholder="123456" error={!!errors.code} {...register('code')} />
        </FormField>
        <FormField label={t('auth.phone_number')} error={errors.phone_number?.message}>
          <Input type="tel" placeholder="+998901234567" error={!!errors.phone_number} {...register('phone_number')} />
        </FormField>
        <FormField label={t('auth.organization')} error={errors.organization_id?.message}>
          <Select error={!!errors.organization_id} {...register('organization_id')}>
            <option value="">{t('auth.select_organization')}</option>
            {orgList.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('auth.password')} error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" placeholder={t('auth.password_placeholder')} error={!!errors.password} {...register('password')} />
        </FormField>
        <FormField label={t('auth.confirm_password')} error={errors.password_confirm?.message}>
          <Input type="password" autoComplete="new-password" placeholder={t('auth.password_again')} error={!!errors.password_confirm} {...register('password_confirm')} />
        </FormField>
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full h-14 mt-2 smartish-gradient-bg text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {registerMutation.isPending && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {registerMutation.isPending ? t('common.saving') : t('auth.register_title')}
        </button>
      </form>
    </>
  )
}

function RegisterPage() {
  const { t } = useTranslation()
  const [role, setRole] = useState('job_seeker')
  const [email, setEmail] = useState(null)

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setEmail(null)
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animated-gradient-bg opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-transparent to-pink-900/40" />
      <div className="absolute inset-0 bg-grid-dark opacity-30" />

      {/* Floating blobs */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-orange-500/35 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] bg-pink-500/40 rounded-full blur-3xl animate-float-reverse" />
      <div className="absolute top-1/3 right-1/4 w-[280px] h-[280px] bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow" />

      {/* Twinkling stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { top: '8%', left: '20%', delay: '0.2s', size: 4 },
          { top: '15%', left: '75%', delay: '0.9s', size: 3 },
          { top: '50%', left: '8%', delay: '1.4s', size: 4 },
          { top: '70%', left: '92%', delay: '0.5s', size: 3 },
          { top: '85%', left: '40%', delay: '2s', size: 4 },
          { top: '30%', left: '85%', delay: '1.7s', size: 3 },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: s.delay,
              boxShadow: '0 0 12px white',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center animate-fade-in-down">
          <Logo size="lg" invert />
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-900/30 border border-white/40 p-8 animate-bounce-in">
          {!email && <RoleTabs value={role} onChange={handleRoleChange} />}

          <div key={`${role}-${email || 'no-email'}`} className="animate-fade-in-up">
            {!email ? (
              <StepEmail onSent={setEmail} />
            ) : role === 'job_seeker' ? (
              <StepJobSeeker email={email} onBack={() => setEmail(null)} />
            ) : (
              <StepEmployer email={email} onBack={() => setEmail(null)} />
            )}
          </div>

          <p className="mt-6 text-sm text-gray-600 text-center">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="smartish-gradient-text font-bold hover:underline">
              {t('auth.login_cta')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
