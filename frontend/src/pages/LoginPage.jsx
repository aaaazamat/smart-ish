import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Sparkles, Mail } from 'lucide-react'
import { loginSchema } from '@/lib/schemas'
import { useLogin } from '@/hooks/useAuth'
import { applyApiErrorsToForm, getApiError } from '@/lib/apiError'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'
import Logo from '@/components/ui/Logo'

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
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (values) => {
    login.mutate(values, {
      onSuccess: () => navigate(next, { replace: true }),
      onError: (error) => applyApiErrorsToForm(error, setError),
    })
  }

  const formError = errors.root?.message || (login.isError && getApiError(login.error))

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animated-gradient-bg opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-transparent to-pink-900/40" />
      <div className="absolute inset-0 bg-grid-dark opacity-30" />

      {/* Floating blobs */}
      <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-pink-500/40 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-orange-500/35 rounded-full blur-3xl animate-float-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow" />

      {/* Twinkling stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { top: '12%', left: '15%', delay: '0s', size: 3 },
          { top: '20%', left: '80%', delay: '0.7s', size: 4 },
          { top: '65%', left: '10%', delay: '1.2s', size: 3 },
          { top: '80%', left: '85%', delay: '0.4s', size: 4 },
          { top: '40%', left: '92%', delay: '1.8s', size: 3 },
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
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-brand-500 animate-twinkle" />
              <h1 className="text-2xl font-bold text-gray-900">Tizimga kirish</h1>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Email va parolingizni kiriting
            </p>
          </div>

          {formError && !errors.email && !errors.password && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm animate-fade-in-up">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="animate-fade-in-up stagger-2" style={{ animationFillMode: 'backwards' }}>
              <FormField label="Email" error={errors.email?.message}>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="example@gmail.com"
                  error={!!errors.email}
                  {...register('email')}
                />
              </FormField>
            </div>

            <div className="animate-fade-in-up stagger-3" style={{ animationFillMode: 'backwards' }}>
              <FormField label="Parol" error={errors.password?.message}>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••"
                  error={!!errors.password}
                  {...register('password')}
                />
              </FormField>
            </div>

            <div className="animate-fade-in-up stagger-4" style={{ animationFillMode: 'backwards' }}>
              <button
                type="submit"
                disabled={login.isPending}
                className="w-full h-14 mt-2 smartish-gradient-bg text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {login.isPending && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {login.isPending ? 'Kirilmoqda...' : 'Kirish'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-gray-600 text-center animate-fade-in-up stagger-5" style={{ animationFillMode: 'backwards' }}>
            Akkauntingiz yo'qmi?{' '}
            <Link
              to="/register"
              className="smartish-gradient-text font-bold hover:underline"
            >
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
