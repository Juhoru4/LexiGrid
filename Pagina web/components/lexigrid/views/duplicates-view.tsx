'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Copy, Merge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fmtDate } from '@/lib/lexigrid/format'
import { FIELD_KEYS, FIELD_LABELS } from '@/lib/lexigrid/rules'
import { useStore } from '@/lib/lexigrid/store'
import type { DupGroup, FieldKey } from '@/lib/lexigrid/types'
import { cn } from '@/lib/utils'
import { EmptyState } from '../empty-state'
import { StatusBadge } from '../status-badge'

function Resolver({ group, onClose }: { group: DupGroup; onClose: () => void }) {
  const store = useStore()
  const members = group.memberIds.map((id) => store.byId.get(id)!).filter(Boolean)
  const base = members.find((m) => m.send.state === 'Enviado' || m.send.state === 'Pendiente de actualización') ?? members[0]
  const [choice, setChoice] = useState<Record<FieldKey, string>>(() => {
    const init = {} as Record<FieldKey, string>
    FIELD_KEYS.forEach((k) => {
      init[k] = (base.fields[k].value.trim() ? base : members.find((m) => m.fields[k].value.trim()) ?? base).id
    })
    return init
  })
  const sentBase = base.send.state === 'Enviado' || base.send.state === 'Pendiente de actualización'

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-3 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Resolver duplicado</DialogTitle>
          <DialogDescription>Elige de qué registro tomar cada campo. Se conserva uno y los demás pasan a la Papelera.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-auto rounded-lg border">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-muted text-xs">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Campo</th>
                {members.map((m) => (
                  <th key={m.id} className="px-3 py-2 text-left font-semibold">
                    {m.id === base.id ? 'Se conserva' : 'Pasa a Papelera'}
                    <span className="block font-normal text-muted-foreground">{fmtDate(m.capturedAt)} · {m.send.state}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELD_KEYS.map((k) => (
                <tr key={k} className="border-t">
                  <td className="px-3 py-2 text-xs font-semibold text-muted-foreground">{FIELD_LABELS[k]}</td>
                  {members.map((m) => {
                    const on = choice[k] === m.id
                    return (
                      <td key={m.id} className="p-1">
                        <button type="button" onClick={() => setChoice((c) => ({ ...c, [k]: m.id }))} aria-pressed={on} className={cn('flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left', on ? 'border-brand bg-brand-soft' : 'border-transparent hover:bg-muted')}>
                          <span className="break-all">{m.fields[k].value ? m.fields[k].value.replaceAll(';', ',') : <em className="text-muted-foreground">(vacío)</em>}</span>
                          {on && <Check className="size-4 shrink-0 text-brand" />}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sentBase && <p className="rounded-lg border border-info-border bg-info-soft p-2.5 text-xs text-info">El registro conservado ya está en el CRM: quedará como Pendiente de actualización.</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { store.resolveDuplicate(base.id, group.memberIds, choice); toast.success('Duplicado resuelto', { description: `${members.length - 1} registro(s) pasaron a la Papelera.` }); onClose() }}>
            <Merge data-icon="inline-start" />Unificar y conservar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DuplicatesView() {
  const store = useStore()
  const [open, setOpen] = useState<DupGroup | null>(null)

  if (store.groups.length === 0) return <Card><EmptyState icon={Copy} title="No hay duplicados por resolver" description="Cuando dos registros compartan documento o correo aparecerán aquí." /></Card>

  return (
    <div className="flex flex-col gap-3">
      {store.groups.map((g) => (
        <Card key={g.id}>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              {store.byId.get(g.flaggedId)?.fields.name.value}
              <StatusBadge tone="warning" icon={Copy}>{g.memberIds.length} registros</StatusBadge>
            </CardTitle>
            <CardDescription>Coinciden por {g.matchOn.join(' y ')}: <span className="font-mono">{g.matchValue}</span></CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
              {g.memberIds.map((id) => { const m = store.byId.get(id)!; return <li key={id}>{fmtDate(m.capturedAt)} · {m.journey} · {m.send.state}</li> })}
            </ul>
            <Button onClick={() => setOpen(g)}><Merge data-icon="inline-start" />Resolver</Button>
          </CardContent>
        </Card>
      ))}
      {open && <Resolver group={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
