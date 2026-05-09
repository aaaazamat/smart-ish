import { forwardRef } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

const Checkbox = forwardRef(function Checkbox(
  { label, description, className, ...props },
  ref
) {
  return (
    <label className={cn('flex items-start gap-3 cursor-pointer group', className)}>
      <span className="relative flex items-center justify-center mt-0.5">
        <input
          ref={ref}
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <span className="w-5 h-5 rounded border-2 border-gray-300 bg-white peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-focus:ring-2 peer-focus:ring-brand-500/30 transition flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 group-has-[:checked]:opacity-100" strokeWidth={3} />
        </span>
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-900">{label}</span>
        {description && (
          <span className="block text-xs text-gray-500 mt-0.5">{description}</span>
        )}
      </span>
    </label>
  )
})

export default Checkbox
