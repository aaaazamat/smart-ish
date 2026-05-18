/**
 * ChangePasswordForm — logged-in foydalanuvchi parolini o'zgartirish formasi.
 *
 * - 3 ta maydon: eski parol, yangi parol, tasdiqlash
 * - Zod orqali client-side validatsiya (tezkor fikr)
 * - Backend ham tekshiradi (xavfsizlik)
 * - Muvaffaqiyatli yangilanganda yashil bildirishnoma chiqadi
 * - Backend xatolari (eski parol noto'g'ri, throttle 429) toza ko'rsatiladi
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound, Lock } from 'lucide-react'
import { useChangePassword } from '@/hooks/useAuth'
import { passwordChangeSchema } from '@/lib/schemas'
import { getApiError } from '@/lib/apiError'
import Button from '@/components/ui/Button'

function PasswordInput({ register, name, error, placeholder, autoFocus = false }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          {...register(name)}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={name === 'old_password' ? 'current-password' : 'new-password'}
          className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg
            focus:outline-none focus:ring-2 transition
            ${error
              ? 'border-red-300 focus:ring-red-200'
              : 'border-gray-300 focus:ring-brand-200 focus:border-brand-400'}`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-start gap-1">
          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
          {error.message}
        </p>
      )}
    </div>
  )
}

function ChangePasswordForm() {
  const [success, setSuccess] = useState(false)
  const changePw = useChangePassword()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'onBlur',
  })

  const onSubmit = (data) => {
    setSuccess(false)
    changePw.mutate(data, {
      onSuccess: () => {
        setSuccess(true)
        reset()
        // 5 sekunddan keyin muvaffaqiyat xabarini olib tashlash
        setTimeout(() => setSuccess(false), 5000)
      },
    })
  }

  const apiError = changePw.error ? getApiError(changePw.error) : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-gray-700">
        <KeyRound className="w-5 h-5 text-brand-500" />
        <h2 className="font-semibold">Parolni o'zgartirish</h2>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg flex items-start gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Parol muvaffaqiyatli yangilandi. Emailingizga xavfsizlik xabari yuborildi.</span>
        </div>
      )}

      {apiError && !success && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Eski parol
        </label>
        <PasswordInput
          register={register}
          name="old_password"
          error={errors.old_password}
          placeholder="Hozirgi parolni kiriting"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Yangi parol
        </label>
        <PasswordInput
          register={register}
          name="new_password"
          error={errors.new_password}
          placeholder="Kamida 6 ta belgi"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Yangi parolni tasdiqlang
        </label>
        <PasswordInput
          register={register}
          name="new_password_confirm"
          error={errors.new_password_confirm}
          placeholder="Yuqoridagi parolni qaytadan kiriting"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          loading={changePw.isPending}
          className="w-full"
        >
          Parolni yangilash
        </Button>
      </div>
    </form>
  )
}

export default ChangePasswordForm
