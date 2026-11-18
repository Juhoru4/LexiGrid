'use client'

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { EmptyState } from './empty-state'

export type Column<T> = {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  sort?: (row: T) => string | number
  className?: string
}

type Props<T> = {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  pageSize?: number
  defaultSort?: { id: string; dir: 'asc' | 'desc' }
  loading?: boolean
  error?: string
  onRetry?: () => void
  empty?: { title: string; description?: string; icon?: ComponentType<{ className?: string }>; action?: ReactNode }
  label: string
}

export function Pager({ page, pages, total, pageSize, onPage }: { page: number; pages: number; total: number; pageSize: number; onPage: (p: number) => void }) {
  if (total <= pageSize) return null
  const from = page * pageSize + 1
  const to = Math.min(total, (page + 1) * pageSize)
  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
      <span>
        Mostrando {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon-sm" disabled={page === 0} onClick={() => onPage(page - 1)} aria-label="Página anterior">
          <ChevronLeft />
        </Button>
        <span className="tabular-nums">
          {page + 1} / {pages}
        </span>
        <Button variant="outline" size="icon-sm" disabled={page >= pages - 1} onClick={() => onPage(page + 1)} aria-label="Página siguiente">
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}

export function DataTable<T>({ rows, columns, rowKey, onRowClick, pageSize = 10, defaultSort, loading, error, onRetry, empty, label }: Props<T>) {
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.id === sort?.id)
    if (!col?.sort || !sort) return rows
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const x = col.sort!(a)
      const y = col.sort!(b)
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'es')) * dir
    })
  }, [rows, columns, sort])

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  useEffect(() => {
    if (page > pages - 1) setPage(0)
  }, [page, pages])
  const visible = sorted.slice(page * pageSize, (page + 1) * pageSize)

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No pudimos cargar la lista"
        description={error}
        action={onRetry && <Button variant="outline" onClick={onRetry}><RefreshCw data-icon="inline-start" />Reintentar</Button>}
      />
    )
  }

  return (
    <div>
      <Table aria-label={label}>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((c) => (
              <TableHead key={c.id} className={cn('h-10 text-xs font-semibold text-muted-foreground', c.className)}>
                {c.sort ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-foreground"
                    onClick={() => setSort((s) => (s?.id === c.id ? { id: c.id, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { id: c.id, dir: 'asc' }))}
                  >
                    {c.header}
                    {sort?.id === c.id ? sort.dir === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3 opacity-40" />}
                  </button>
                ) : (
                  c.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell key={c.id}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : visible.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  className={cn(onRowClick && 'cursor-pointer')}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(e) => {
                    if (onRowClick && e.key === 'Enter') onRowClick(row)
                  }}
                >
                  {columns.map((c) => (
                    <TableCell key={c.id} className={cn('py-3 text-[13px]', c.className)}>
                      {c.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {!loading && rows.length === 0 && <EmptyState title={empty?.title ?? 'Sin resultados'} description={empty?.description} icon={empty?.icon} action={empty?.action} />}
      <Pager page={page} pages={pages} total={sorted.length} pageSize={pageSize} onPage={setPage} />
    </div>
  )
}
