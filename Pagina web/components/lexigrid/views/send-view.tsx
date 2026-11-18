'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, CheckCircle2, CloudOff, Loader2, RefreshCw, RotateCcw, Send, Wifi, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { fmtDate, fmtDateTime } from '@/lib/lexigrid/format'
import { useStore, type SendSummary } from '@/lib/lexigrid/store'
import type { LexRecord } from '@/lib/lexigrid/types'
import { DataTable, type Column } from '../data-table'
import { RecordTags } from '../record-tags'
import { StatusBadge } from '../status-badge'
import { useUi } from '../ui-context'

const SENDABLE = ['Pendiente de envío', 'Error de envío', 'Pendiente de actualización']

export function SendView() {
  const store = useStore()
  const { openRecord, go } = useUi()
  const [selected, setSelected] = useState<string[]>([])
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [summary, setSummary] = useState<SendSummary | null>(null)
  const online = store.state.integration.online
  const sending = progress !== null

  const { ready, blocked } = useMemo(() => {
    const ready: LexRecord[] = []
    let blocked = 0
    store.state.records.forEach((r) => {
      if (r.trash || !SENDABLE.includes(r.send.state)) return
      const d = store.derived.get(r.id)!
      if (d.duplicate || d.noConsent || d.review === 'Por revisar') blocked++
      else ready.push(r)
    })
    return { ready: ready.sort((a, b) => b.capturedAt - a.capturedAt), blocked }
  }, [store.state.records, store.derived])

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const chosen = selected.filter((id) => ready.some((r) => r.id === id))

  const run = async () => {
    setSummary(null)
    setProgress({ done: 0, total: chosen.length })
    const result = await store.sendMany(chosen, (done, total) => setProgress({ done, total }))
    setProgress(null)
    setSelected([])
    setSummary(result)
    store.logBatch(`Envío por lote al CRM: ${result.sent} enviados, ${result.failed.length} con error${result.interrupted ? ', interrumpido por pérdida de conexión' : ''}`)
    if (result.interrupted) toast.error('Se perdió la conexión con el CRM', { description: 'Los registros restantes siguen pendientes.' })
    else if (result.failed.length) toast.warning(`${result.sent} enviados, ${result.failed.length} con error`)
    else toast.success(`${result.sent} registro(s) enviados al CRM`)
  }

  const columns: Column<LexRecord>[] = [
    { id: 'sel', header: <Checkbox checked={ready.length > 0 && chosen.length === ready.length} onCheckedChange={(c) => setSelected(c ? ready.map((r) => r.id) : [])} aria-label="Seleccionar todos" />, cell: (r) => <span onClick={(e) => e.stopPropagation()}><Checkbox checked={selected.includes(r.id)} onCheckedChange={() => toggle(r.id)} aria-label={`Seleccionar ${r.fields.name.value}`} /></span>, className: 'w-10' },
    { id: 'name', header: 'Aspirante', sort: (r) => r.fields.name.value, cell: (r) => <div><p className="font-semibold">{r.fields.name.value}</p><p className="text-xs text-muted-foreground">{r.school.trim()} · {fmtDate(r.capturedAt)}</p></div> },
    { id: 'tags', header: 'Estado', cell: (r) => <div className="flex flex-col gap-1"><RecordTags rec={r} d={store.derived.get(r.id)!} now={store.now} only={['Revisión', 'Envío']} />{r.send.error && <p className="text-xs text-danger">{r.send.error}</p>}</div> },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {online ? <Wifi className="size-5 text-success" /> : <CloudOff className="size-5 text-danger" />}
            Conexión con el CRM
            <StatusBadge tone={online ? 'success' : 'danger'}>{online ? 'Conectado' : 'Sin conexión'}</StatusBadge>
          </CardTitle>
          <CardDescription>Conexión simulada para probar los envíos y sus errores.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!online && (
            <Alert variant="destructive">
              <XCircle />
              <AlertTitle>No se puede enviar</AlertTitle>
              <AlertDescription>
                {store.state.integration.error ?? 'El CRM no responde.'}
                <Button size="sm" variant="outline" className="mt-2 w-fit" onClick={() => store.retryConnection().then(() => toast.success('Conexión restablecida'))}><RefreshCw data-icon="inline-start" />Reintentar conexión</Button>
              </AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <label className="flex items-center gap-2"><Switch checked={online} onCheckedChange={(c) => store.setIntegration({ online: c, error: c ? null : 'Conexión desactivada manualmente para la simulación.' })} aria-label="CRM conectado" />CRM conectado</label>
            <label className="flex items-center gap-2"><Switch checked={store.state.integration.dropNext} onCheckedChange={(c) => store.setIntegration({ dropNext: c })} aria-label="Simular caída durante el envío" />Simular caída a mitad del envío</label>
            <Button size="sm" variant="ghost" onClick={() => { store.resetData(); toast.success('Datos de demostración restablecidos') }}><RotateCcw data-icon="inline-start" />Restablecer datos demo</Button>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <Alert variant={summary.failed.length || summary.interrupted ? 'destructive' : 'default'}>
          {summary.failed.length || summary.interrupted ? <AlertTriangle /> : <CheckCircle2 />}
          <AlertTitle>Resultado del envío: {summary.sent} enviados, {summary.failed.length} con error</AlertTitle>
          <AlertDescription>
            {summary.interrupted && <p>Se interrumpió por pérdida de conexión; el resto sigue pendiente.</p>}
            {summary.failed.map((f) => <p key={f.id}>{store.byId.get(f.id)?.fields.name.value}: {f.error}</p>)}
            {summary.sent > 0 && <Button size="sm" variant="outline" className="mt-2 w-fit" onClick={() => go('Enviados')}>Ver enviados</Button>}
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden py-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3 sm:p-4">
          <div>
            <p className="font-semibold">{ready.length} listos para enviar</p>
            {blocked > 0 && <p className="text-xs text-muted-foreground">{blocked} bloqueados por revisión pendiente, duplicado o falta de autorización de datos.</p>}
          </div>
          <Button disabled={chosen.length === 0 || !online || sending} onClick={run}>
            {sending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Send data-icon="inline-start" />}
            {sending ? 'Enviando...' : `Enviar ${chosen.length} al CRM`}
          </Button>
        </div>
        {progress && <div className="border-b p-3 sm:px-4"><Progress value={(progress.done / progress.total) * 100} aria-label="Progreso del envío" /><p className="mt-1 text-xs text-muted-foreground">{progress.done} de {progress.total}</p></div>}
        <DataTable label="Registros listos para enviar" rows={ready} columns={columns} rowKey={(r) => r.id} onRowClick={(r) => openRecord(r.id)} loading={!store.state.ready} empty={{ icon: CheckCircle2, title: 'No hay registros listos para enviar', description: 'Revisa los pendientes o resuelve los duplicados para habilitarlos.' }} />
      </Card>
    </div>
  )
}

export function SentView() {
  const store = useStore()
  const { openRecord } = useUi()
  const rows = useMemo(() => store.state.records.filter((r) => r.send.state === 'Enviado' || r.send.state === 'Pendiente de actualización').sort((a, b) => (b.send.at ?? 0) - (a.send.at ?? 0)), [store.state.records])
  const columns: Column<LexRecord>[] = [
    { id: 'name', header: 'Aspirante', sort: (r) => r.fields.name.value, cell: (r) => <div><p className="font-semibold">{r.fields.name.value}</p><p className="text-xs text-muted-foreground">{r.school.trim()}</p></div> },
    { id: 'crm', header: 'ID en el CRM', cell: (r) => <span className="font-mono text-xs">{r.send.crmId}</span> },
    { id: 'at', header: 'Enviado', sort: (r) => r.send.at ?? 0, cell: (r) => fmtDateTime(r.send.at!), className: 'hidden md:table-cell' },
    { id: 'tags', header: 'Etiquetas', cell: (r) => <RecordTags rec={r} d={store.derived.get(r.id)!} now={store.now} only={['Envío']} /> },
  ]
  return (
    <Card className="overflow-hidden py-0">
      <p className="border-b p-3 text-sm text-muted-foreground sm:p-4">Las fotos se conservan 10 días después del envío y luego se eliminan.</p>
      <DataTable label="Registros enviados" rows={rows} columns={columns} rowKey={(r) => r.id} onRowClick={(r) => openRecord(r.id)} defaultSort={{ id: 'at', dir: 'desc' }} loading={!store.state.ready} empty={{ icon: Send, title: 'Aún no hay envíos', description: 'Los registros enviados al CRM aparecerán aquí.' }} />
    </Card>
  )
}
