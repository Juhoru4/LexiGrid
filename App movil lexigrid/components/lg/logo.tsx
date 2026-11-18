import { ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ claro = false, className }: { claro?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold tracking-tight', className)}>
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-lg',
          claro ? 'bg-white/15 text-white' : 'bg-primary text-primary-foreground',
        )}
      >
        <ScanLine className="size-4.5" aria-hidden="true" />
      </span>
      <span className={claro ? 'text-white' : 'text-foreground'}>LexiGrid</span>
    </span>
  )
}
