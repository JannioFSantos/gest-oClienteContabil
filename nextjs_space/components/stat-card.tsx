'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'text-primary',
  bg = 'bg-primary/10',
  delay = 0,
}: {
  label: string
  value: number
  icon: LucideIcon
  accent?: string
  bg?: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const target = value ?? 0
    if (target === 0) {
      setDisplay(0)
      return
    }
    const duration = 800
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setDisplay(Math.round(p * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl bg-card p-5 shadow-[var(--shadow-sm)] transition-shadow duration-normal hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', bg)}>
          <Icon className={cn('h-5 w-5', accent)} />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">
        {display}
      </p>
    </motion.div>
  )
}
