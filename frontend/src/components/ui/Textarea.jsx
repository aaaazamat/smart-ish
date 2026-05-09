import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

const Textarea = forwardRef(function Textarea(
  { className, error, rows = 4, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full bg-white border rounded-lg px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition resize-y',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
          : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500/20',
        className
      )}
      {...props}
    />
  )
})

export default Textarea
