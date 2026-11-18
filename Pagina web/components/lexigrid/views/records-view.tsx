'use client'

import { useMemo, useState } from 'react'
import { Eye, FileSearch, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { fmtDate } from '@/lib/lexigrid/format'
import { compareQueue, PRIORITY_RANK } from '@/lib/lexigrid/rules'
import { useStore } from '@/lib/lexigrid/store'
import { cn } from '@/lib/utils'
import { useAnalyst } from '../analyst-context'
import { DataTable, Pager, type Column } from '../data-table'
import { EmptyState } from '../empty-state'
import { applyFilters, FilterBar } from '../filter-bar'
import { getTags, RecordTags } from '../record-tags'
import { StatusBadge } from '../status-badge'
import { useUi } from '../ui-context'
import type { LexRecord } from '@/lib/lexigrid/types'

const TAG_FILTERS: { id: string; label: string }[] = [
  { id: 'review:Por revisar', label: 'Por revisar' },
  { id: 'review:Verificado', label: 'Verificado' },
  { id: 'review:Revisado', label: 'Revisado manualmente' },
  { id: 'dup', label: 'Duplicado' },
  { id: 'send:Error de envío', label: 'Error de envío' },
  { id: 'send:Enviado', label: 'Enviado' },
  { id: 'noConsent', label: 'Sin autorización de datos' },
  { id: 'lock', label: 'En revisión' },
]

export function RecordsView({ variant }: { variant: 'queue' | 'forms' }) {
  const store = useStore()
  const analyst = useAnalyst()
  const { filters, openRecord } = useUi()
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [page, setPage] = useState(0)

  const base = useMemo(
    () => store.state.records.filter((r) => !r.trash && (variant === 'forms' || (r.send.state !== 'Enviado'))),
    [store.state.records, variant],
  )
  const filtered = useMemo(() => applyFilters(base, filters, store.derived), [base, filters, store.derived])
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    filtered.forEach((r) => getTags(r, store.derived.get(r.id)!, store.now).forEach((t) => counts.set(t.id, (counts.get(t.id) ?? 0) + 1)))
    return counts
  }, [filtered, store.derived, store.now])

  const rows = useMemo(() => {
    const byTags = filtered.filter((r) => {
      if (tagFilter.length === 0) return true
      const ids = new Set(getTags(r, store.derived.get(r.id)!, store.now).map((t) => t.id))
      return tagFilter.every((t) => ids.has(t))
    })
    return [...byTags].sort((a, b) => (variant === 'queue' ? compareQueue(a, b, store.derived.get(a.id)!, store.derived.get(b.id)!) : b.capturedAt - a.capturedAt))
  }, [filtered, tagFilter, variant, store.derived, store.now])

  const loading = !store.state.ready

  const columns: Column<LexRecord>[] = [
    {
      id: 'priority',
      header: 'Prioridad',
      sort: (r) => PRIORITY_RANK[store.derived.get(r.id)!.priority],
      cell: (r) => {
        const p = store.derived.get(r.id)!.priority
        return <StatusBadge tone={p === 'Alta' ? 'brand' : p === 'Media' ? 'info' : 'neutral'}>{p === 'Pendiente de prioridad' ? 'Pendiente' : p}</StatusBadge>
      },
    },
    {
      id: 'name',
      header: 'Aspirante',
      sort: (r) => r.fields.name.value,
      cell: (r) => (
        <div className="min-w-0">
          <p className="font-semibold">{r.fields.name.value}</p>
          <p className="text-xs text-muted-foreground">Doc. {r.fields.document.value || '—'} · Grado {r.fields.degree.value || '—'}</p>
        </div>
      ),
    },
    { id: 'school', header: 'Colegio', sort: (r) => r.school, cell: (r) => <div><p>{r.school.trim()}</p><p className="text-xs text-muted-foreground">{r.city.trim()}</p></div>, className: 'hidden lg:table-cell' },
    { id: 'tags', header: 'Etiquetas', cell: (r) => <RecordTags rec={r} d={store.derived.get(r.id)!} now={store.now} only={['Revisión', 'Duplicado', 'Envío', 'Datos', 'Bloqueo']} /> },
    { id: 'at', header: 'Capturado', sort: (r) => r.capturedAt, cell: (r) => <span className="text-muted-foreground">{fmtDate(r.capturedAt)}</span>, className: 'hidden md:table-cell' },
    { id: 'open', header: <span className="sr-only">Abrir</span>, cell: (r) => <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openRecord(r.id) }}><FileSearch data-icon="inline-start" />Abrir</Button> },
  ]

  const PAGE = 8
  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  const safePage = Math.min(page, pages - 1)

  return (
    <Card className="overflow-hidden py-0">
      <FilterBar pool={base} show={variant === 'forms' ? ['journey', 'school', 'city', 'send'] : ['journey', 'school', 'city', 'review']} />
      {variant === 'forms' && (
        <div className="flex flex-col gap-2 border-b bg-muted/40 p-3 sm:p-4">
          <p className="text-xs font-semibold text-muted-foreground">Filtrar por etiqueta</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por etiqueta">
            {TAG_FILTERS.map((t) => {
              const on = tagFilter.includes(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => { setPage(0); setTagFilter((s) => (on ? s.filter((x) => x !== t.id) : [...s, t.id])) }}
                  className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors', on ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted')}
                >
                  {t.label} <span className="tabular-nums opacity-70">{tagCounts.get(t.id) ?? 0}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {variant === 'queue' ? (
        <DataTable
          label="Cola de registros"
          rows={rows}
          columns={columns}
          rowKey={(r) => r.id}
          onRowClick={(r) => openRecord(r.id)}
          loading={loading}
          pageSize={8}
          empty={{ title: 'No hay registros con estos filtros', description: 'Prueba limpiando los filtros para ver toda la cola.' }}
        />
      ) : (
        <div>
          {rows.length === 0 && !loading ? (
            <EmptyState icon={FileSearch} title="No hay formularios con estos filtros" description="Quita alguna etiqueta o filtro para ver más formularios." />
          ) : (
            <ul className="grid gap-3 p-3 sm:p-4 xl:grid-cols-2">
              {rows.slice(safePage * PAGE, (safePage + 1) * PAGE).map((r) => {
                const d = store.derived.get(r.id)!
                return (
                  <li key={r.id}>
                    <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
                      <CardContent className="flex h-full flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{r.fields.name.value}</p>
                            <p className="truncate text-xs text-muted-foreground">{r.journey} · {r.school.trim()}</p>
                          </div>
                        </div>
                        <RecordTags rec={r} d={d} now={store.now} />
                        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                          <p className="text-xs text-muted-foreground">{fmtDate(r.capturedAt)}</p>
                          <Button size="sm" variant="outline" onClick={() => openRecord(r.id)}>
                            {r.lock && r.lock.by !== analyst.name ? <Lock data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
                            Ver formulario
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}
          <Pager page={safePage} pages={pages} total={rows.length} pageSize={PAGE} onPage={setPage} />
        </div>
      )}
    </Card>
  )
}
