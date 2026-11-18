'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Trash2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { fmtDate } from '@/lib/lexigrid/format'
import { trashDaysLeft } from '@/lib/lexigrid/rules'
import { useStore } from '@/lib/lexigrid/store'
import type { LexRecord } from '@/lib/lexigrid/types'
import { ConfirmDialog } from '../confirm-dialog'
import { DataTable, type Column } from '../data-table'
import { StatusBadge } from '../status-badge'
import { useUi } from '../ui-context'

export function TrashView() {
  const store = useStore()
  const { openRecord } = useUi()
  const [selected, setSelected] = useState<string[]>([])
  const [confirm, setConfirm] = useState<string[] | null>(null)
  const rows = useMemo(() => store.state.records.filter((r) => r.trash).sort((a, b) => b.trash!.at - a.trash!.at), [store.state.records])
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const columns: Column<LexRecord>[] = [
    { id: 'sel', header: <span className="sr-only">Seleccionar</span>, cell: (r) => <span onClick={(e) => e.stopPropagation()}><Checkbox checked={selected.includes(r.id)} onCheckedChange={() => toggle(r.id)} aria-label={`Seleccionar ${r.fields.name.value}`} /></span>, className: 'w-10' },
    { id: 'name', header: 'Aspirante', sort: (r) => r.fields.name.value, cell: (r) => <div><p className="font-semibold">{r.fields.name.value}</p><p className="text-xs text-muted-foreground">{r.school.trim()}</p></div> },
    { id: 'reason', header: 'Motivo', sort: (r) => r.trash!.reason, cell: (r) => <div><StatusBadge tone="neutral">{r.trash!.reason === 'Duplicado' ? 'Duplicado' : 'Incontactable'}</StatusBadge>{r.trash!.refName && <p className="mt-1 text-xs text-muted-foreground">De {r.trash!.refName}</p>}</div> },
    { id: 'at', header: 'Movido', sort: (r) => r.trash!.at, cell: (r) => fmtDate(r.trash!.at), className: 'hidden md:table-cell' },
    { id: 'left', header: 'Se elimina en', sort: (r) => -r.trash!.at, cell: (r) => { const d = trashDaysLeft(r.trash!.at, store.now); return <StatusBadge tone={d <= 5 ? 'danger' : 'neutral'}>{d} días</StatusBadge> } },
    { id: 'act', header: <span className="sr-only">Acciones</span>, cell: (r) => <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setConfirm([r.id]) }}><Undo2 data-icon="inline-start" />Restaurar</Button> },
  ]

  return (
    <Card className="overflow-hidden py-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3 sm:p-4">
        <p className="text-sm text-muted-foreground">Los registros se eliminan definitivamente a los 30 días.</p>
        <Button size="sm" disabled={selected.length === 0} onClick={() => setConfirm(selected)}><Undo2 data-icon="inline-start" />Restaurar seleccionados ({selected.length})</Button>
      </div>
      <DataTable label="Papelera" rows={rows} columns={columns} rowKey={(r) => r.id} onRowClick={(r) => openRecord(r.id)} loading={!store.state.ready} empty={{ icon: Trash2, title: 'La Papelera está vacía', description: 'Aquí llegan los incontactables y los duplicados descartados.' }} />
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`Restaurar ${confirm?.length ?? 0} registro(s)`}
        description="Volverán a la cola con los campos de contacto o documento marcados Por revisar."
        confirmLabel="Restaurar"
        onConfirm={() => { store.restore(confirm!); setSelected([]); toast.success('Registros restaurados') }}
      />
    </Card>
  )
}
