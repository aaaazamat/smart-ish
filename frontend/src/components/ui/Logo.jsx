import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * SmartIsh logosi: gradient (pink → purple → orange) doira + ✨ + nom
 * size: 'sm' (kichik), 'md' (default), 'lg' (katta)
 */
function Logo({ to = '/', size = 'md', invert = false, className }) {
  const sizes = {
    sm: { box: 'w-9 h-9', icon: 'w-4 h-4', name: 'text-lg', tag: 'text-[8px]' },
    md: { box: 'w-11 h-11', icon: 'w-5 h-5', name: 'text-xl', tag: 'text-[9px]' },
    lg: { box: 'w-14 h-14', icon: 'w-6 h-6', name: 'text-2xl', tag: 'text-[10px]' },
  }[size]

  const content = (
    <div className={cn('flex items-center gap-3 shrink-0', className)}>
      <div
        className={cn(
          sizes.box,
          'rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 relative overflow-hidden',
          'smartish-gradient-bg'
        )}
      >
        <Sparkles className={cn(sizes.icon, 'text-white relative z-10')} strokeWidth={2.5} />
        {/* Inner shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
      </div>
      <div className="leading-tight">
        <div
          className={cn(
            sizes.name,
            'font-extrabold tracking-tight',
            invert ? 'text-white' : 'smartish-gradient-text'
          )}
        >
          SmartIsh
        </div>
        <div
          className={cn(
            sizes.tag,
            'tracking-[0.18em] mt-0.5 uppercase',
            invert ? 'text-white/60' : 'text-gray-400'
          )}
        >
          AI yordamida ish topish
        </div>
      </div>
    </div>
  )

  if (to) {
    return <Link to={to}>{content}</Link>
  }
  return content
}

export default Logo
