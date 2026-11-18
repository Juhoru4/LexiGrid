'use client'

import type { ComponentType } from 'react'
import { AlertTriangle, ArrowRight, Copy, FileSearch, Send, Trash2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtDate } from '@/lib/lexigrid/format'
import { compareQueue } from '@/lib/lexigrid/rules'
import { useStore } from '@/lib/lexigrid/store'
import { EmptyState } from '../empty-state'
import { RecordTags } from '../record-tags'
import { useUi, type RecordFilters, type Section } from '../ui-context'

function Stat({ icon: Icon, label, value, hint, onClick }: { icon: ComponentType<{ className?: string }>; label: string; value: number; hint: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex flex-col gap-2 rounded-xl border bg-card p-4 text-left transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring">
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-accent-foreground"><Icon className="size-4" /></span>
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="text-3xl font-extrabold tracking-tight tabular-nums">{value}</p>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </button>
  )
}

export function OverviewView() {
  const store = useStore()
  const { go, openRecord } = useUi()
  const recs = store.state.records
  const live = recs.filter((r) => !r.trash)
  const count = (fn: (id: string) => boolean) => live.filter((r) => fn(r.id)).length
  const toReview = live.filter((r) => store.derived.get(r.id)!.review === 'Por revisar' && r.send.state !== 'Enviado')
  const queue = [...toReview].sort((a, b) => compareQueue(a, b, store.derived.get(a.id)!, store.derived.get(b.id)!)).slice(0, 5)

  if (!store.state.ready) return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>

  const stats: { icon: ComponentType<{ className?: string }>; label: string; value: number; hint: string; to: Section; filters?: Partial<RecordFilters> }[] = [
    { icon: AlertTriangle, label: 'Por revisar', value: toReview.length, hint: 'Campos dudosos esperando corrección', to: 'Registros', filters: { review: 'Por revisar' } },
    { icon: Copy, label: 'Posibles duplicados', value: store.groups.length, hint: 'Grupos por documento o correo', to: 'Duplicados' },
    { icon: Send, label: 'Listos para enviar', value: count((id) => { const d = store.derived.get(id)!; const r = store.byId.get(id)!; return r.send.state === 'Pendiente de envío' && !d.duplicate && !d.noConsent && d.review !== 'Por revisar' }), hint: 'Sin pendientes ni duplicados', to: 'Enviar al CRM' },
    { icon: XCircle, label: 'Errores de envío', value: live.filter((r) => r.send.state === 'Error de envío').length, hint: 'El CRM rechazó el registro', to: 'Enviar al CRM' },
    { icon: Trash2, label: 'En la Papelera', value: recs.filter((r) => r.trash).length, hint: 'Se eliminan a los 30 días', to: 'Papelera' },
    { icon: FileSearch, label: 'Formularios', value: live.length, hint: 'Todos con sus etiquetas', to: 'Formularios' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => <Stat key={s.label} icon={s.icon} label={s.label} value={s.value} hint={s.hint} onClick={() => go(s.to, s.filters)} />)}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Siguientes para revisar</CardTitle>
          <CardDescription>Ordenados por prioridad, campos completos y fecha de captura.</CardDescription>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <EmptyState title="No hay registros por revisar" description="Todo está verificado. Puedes pasar a enviar al CRM." action={<Button onClick={() => go('Enviar al CRM')}>Ir a Enviar al CRM</Button>} />
          ) : (
            <ul className="flex flex-col divide-y">
              {queue.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{r.fields.name.value}</p>
                    <p className="mb-1.5 text-xs text-muted-foreground">{r.school.trim()} · {fmtDate(r.capturedAt)}</p>
                    <RecordTags rec={r} d={store.derived.get(r.id)!} now={store.now} only={['Revisión', 'Prioridad', 'Duplicado']} />
                  </div>
                  <Button size="sm" onClick={() => openRecord(r.id)}>Revisar</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
