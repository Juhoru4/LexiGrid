import type { ComponentType, ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}>
      <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-accent-foreground">
        <Icon className="size-6" />
      </div>
      <h3 className="text-base font-semibold text-balance">{title}</h3>
      {description && <p className="max-w-md text-sm text-pretty text-muted-foreground">{description}</p>}
      {action}
    </div>
  )
}
