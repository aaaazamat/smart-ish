import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { loginSchema } from '@/lib/schemas'
import { useLogin } from '@/hooks/useAuth'
import { applyApiErrorsToForm, getApiError } from '@/lib/apiError'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/'

  const login = useLogin()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone_number: '+998', password: '' },
  })

  const onSubmit = (values) => {
    login.mutate(values, {
      onSuccess: () => navigate(next, { replace: true }),
      onError: (error) => applyApiErrorsToForm(error, setError),
    })
  }

  const formError = errors.root?.message || (login.isError && getApiError(login.error))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <Link to="/" className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"
               strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <div className="text-2xl font-extrabold text-brand-500">OSON ISH</div>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tizimga kirish</h1>
        <p className="text-sm text-gray-500 mb-6">
          Telefon raqamingiz va parolingizni kiriting
        </p>

        {formError && !errors.phone_number && !errors.password && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Telefon raqami" error={errors.phone_number?.message}>
            <Input
              type="tel"
              autoComplete="tel"
              placeholder="+998901234567"
              error={!!errors.phone_number}
              {...register('phone_number')}
            />
          </FormField>

          <FormField label="Parol" error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="••••••"
              error={!!errors.password}
              {...register('password')}
            />
          </FormField>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-2"
            loading={login.isPending}
          >
            Kirish
          </Button>
        </form>

        <p className="mt-6 text-sm text-gray-600 text-center">
          Akkauntingiz yo'qmi?{' '}
          <Link to="/register" className="text-brand-500 font-medium hover:underline">
            Ro'yxatdan o'ting
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
