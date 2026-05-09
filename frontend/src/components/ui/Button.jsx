import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const VARIANTS = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-300',
  secondary:
    'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50',
  outline:
    'bg-transparent text-brand-500 border border-brand-500 hover:bg-brand-50 disabled:opacity-50',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 disabled:opacity-50',
  danger:
    'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
}

const SIZES = {
  sm: 'h-9 px-4 text-sm rounded-lg',
  md: 'h-11 px-6 text-base rounded-lg',
  lg: 'h-14 px-8 text-base rounded-xl',
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    className,
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
})

export default Button
