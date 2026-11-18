'use client'

import { useMemo, useState } from 'react'
import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fmtDateTime } from '@/lib/lexigrid/format'
import { useAnalyst } from '../analyst-context'
import { useStore } from '@/lib/lexigrid/store'
import type { HistoryEntry, HistoryType } from '@/lib/lexigrid/types'
import { cn } from '@/lib/utils'
import { DataTable, type Column } from '../data-table'
import { StatusBadge, type Tone } from '../status-badge'
import { useUi } from '../ui-context'

const TYPES: HistoryType[] = ['Corrección', 'Confirmación', 'Comentario', 'Duplicado resuelto', 'Papelera', 'Restauración', 'Envío al CRM', 'Actualización en CRM', 'Unificación de nombres']
const TONE: Partial<Record<HistoryType, Tone>> = { 'Envío al CRM': 'info', 'Actualización en CRM': 'info', Corrección: 'success', Confirmación: 'success', 'Duplicado resuelto': 'warning', Papelera: 'neutral' }

export function HistoryView() {
  const store = useStore()
  const analyst = useAnalyst()
  const { openRecord } = useUi()
  const [type, setType] = useState<HistoryType | null>(null)
  const [user, setUser] = useState('Todos')
  const isAdmin = analyst.role.toLowerCase().includes('administr')
  const users = useMemo(() => ['Todos', ...Array.from(new Set(store.state.history.map((h) => h.user))).sort()], [store.state.history])
  const rows = useMemo(() => store.state.history.filter((h) => (isAdmin || h.user === analyst.name) && (user === 'Todos' || h.user === user) && (!type || h.type === type)), [store.state.history, type, user, analyst.name, isAdmin])

  const columns: Column<HistoryEntry>[] = [
    { id: 'at', header: 'Fecha', sort: (h) => h.at, cell: (h) => <span className="whitespace-nowrap text-muted-foreground">{fmtDateTime(h.at)}</span> },
    { id: 'type', header: 'Acción', sort: (h) => h.type, cell: (h) => <StatusBadge tone={TONE[h.type] ?? 'neutral'}>{h.type}</StatusBadge> },
    { id: 'detail', header: 'Detalle', cell: (h) => <span className="text-[13px]">{h.detail}</span> },
    { id: 'open', header: <span className="sr-only">Abrir</span>, cell: (h) => (h.recordId && store.byId.has(h.recordId) ? <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openRecord(h.recordId!) }}>Abrir</Button> : null) },
  ]

  return (
    <Card className="overflow-hidden py-0">
      <div className="flex flex-wrap gap-1.5 border-b p-3 sm:p-4" role="group" aria-label="Filtrar por acción">
        {isAdmin && (
          <Select value={user} onValueChange={(value) => value && setUser(value)}>
            <SelectTrigger size="sm" className="w-44"><SelectValue placeholder="Usuario" /></SelectTrigger>
            <SelectContent>{users.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent>
          </Select>
        )}
        <button type="button" aria-pressed={!type} onClick={() => setType(null)} className={cn('rounded-full border px-3 py-1 text-xs font-medium', !type ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted')}>Todas</button>
        {TYPES.map((t) => (
          <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(type === t ? null : t)} className={cn('rounded-full border px-3 py-1 text-xs font-medium', type === t ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted')}>{t}</button>
        ))}
      </div>
      <DataTable label="Mi historial" rows={rows} columns={columns} rowKey={(h) => h.id} defaultSort={{ id: 'at', dir: 'desc' }} loading={!store.state.ready} empty={{ icon: History, title: 'Sin actividad', description: 'Tus correcciones, envíos y comentarios quedarán registrados aquí.' }} />
    </Card>
  )
}
