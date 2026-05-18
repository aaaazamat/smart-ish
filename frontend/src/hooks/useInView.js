import { useEffect, useRef, useState } from 'react'

/**
 * Element ekranga ko'rinsa true qaytaradi (IntersectionObserver).
 * Default: bir marta ko'rsatadi (triggerOnce).
 */
export function useInView({ threshold = 0.15, rootMargin = '0px', triggerOnce = true } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (triggerOnce) observer.unobserve(el)
        } else if (!triggerOnce) {
          setInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce])

  return [ref, inView]
}
