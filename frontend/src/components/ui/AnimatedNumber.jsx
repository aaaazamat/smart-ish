import { useEffect, useState } from 'react'
import { useInView } from '@/hooks/useInView'
import { formatNumber } from '@/lib/format'

/**
 * Raqamlar 0 dan target ga sekin-asta o'sib boradi (counter animation).
 * Scroll'da ko'rinsa boshlanadi.
 */
function AnimatedNumber({ value = 0, duration = 1500, className }) {
  const [ref, inView] = useInView({ threshold: 0.3 })
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const target = Number(value) || 0
    let raf

    const step = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(target * eased))
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className}>
      {formatNumber(current)}
    </span>
  )
}

export default AnimatedNumber
