import type { ComponentType, ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type Tone = 'warning' | 'success' | 'danger' | 'info' | 'neutral' | 'brand'

const TONES: Record<Tone, string> = {
  warning: 'border-warning-border bg-warning-soft text-warning',
  success: 'border-success-border bg-success-soft text-success',
  danger: 'border-danger-border bg-danger-soft text-danger',
  info: 'border-info-border bg-info-soft text-info',
  brand: 'border-brand/30 bg-brand-soft text-accent-foreground',
  neutral: 'border-border bg-muted text-muted-foreground',
}

export function StatusBadge({
  tone = 'neutral',
  icon: Icon,
  children,
  className,
}: {
  tone?: Tone
  icon?: ComponentType<{ className?: string }>
  children: ReactNode
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn('h-auto gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap', TONES[tone], className)}>
      {Icon && <Icon className="size-3" />}
      {children}
    </Badge>
  )
}
