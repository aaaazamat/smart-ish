import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/cn'

/**
 * Bola element scrollga ko'rinsa silliq paydo bo'ladi.
 * variant: "up" | "left" | "right" | "scale"
 */
function AnimateOnScroll({
  children,
  variant = 'up',
  delay = 0,
  className,
  as: Component = 'div',
}) {
  const [ref, inView] = useInView()

  const variantClass = {
    up: 'reveal',
    left: 'reveal reveal-left',
    right: 'reveal reveal-right',
    scale: 'reveal reveal-scale',
  }[variant]

  return (
    <Component
      ref={ref}
      className={cn(variantClass, inView && 'is-visible', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  )
}

export default AnimateOnScroll
