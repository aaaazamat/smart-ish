import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

const Select = forwardRef(function Select(
  { className, error, children, ...props },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'w-full appearance-none bg-white border rounded-lg pl-4 pr-10 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 transition disabled:bg-gray-50 disabled:text-gray-400',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500/20',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  )
})

export default Select
