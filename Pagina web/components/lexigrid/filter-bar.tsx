'use client'

import { useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { norm } from '@/lib/lexigrid/format'
import { useStore } from '@/lib/lexigrid/store'
import type { Derived, LexRecord } from '@/lib/lexigrid/types'
import { ALL, EMPTY_FILTERS, useUi, type RecordFilters } from './ui-context'

export function applyFilters(records: LexRecord[], f: RecordFilters, derived: Map<string, Derived>) {
  const q = norm(f.query)
  return records.filter((r) => {
    if (q && !norm(`${r.fields.name.value} ${r.fields.document.value} ${r.fields.email.value} ${r.id}`).includes(q)) return false
    if (f.journey !== ALL && r.journey !== f.journey) return false
    if (f.school !== ALL && r.school.trim() !== f.school) return false
    if (f.city !== ALL && r.city.trim() !== f.city) return false
    if (f.review !== ALL && derived.get(r.id)?.review !== f.review) return false
    if (f.send !== ALL && r.send.state !== f.send) return false
    return true
  })
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? ALL)}>
      <SelectTrigger size="sm" className="w-full min-w-0 bg-card sm:w-auto sm:min-w-36" aria-label={label}>
        <span className="text-muted-foreground">{label}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {[ALL, ...options].map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export function FilterBar({ pool, show = ['journey', 'school', 'city', 'review', 'send'] }: { pool: LexRecord[]; show?: ('journey' | 'school' | 'city' | 'review' | 'send')[] }) {
  const { filters, setFilters, clearFilters } = useUi()
  const store = useStore()
  const uniq = useMemo(() => {
    const u = (fn: (r: LexRecord) => string) => [...new Set(store.state.records.map(fn))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'es'))
    return { journey: u((r) => r.journey), school: u((r) => r.school.trim()), city: u((r) => r.city.trim()) }
  }, [store.state.records])
  const active = (Object.keys(EMPTY_FILTERS) as (keyof RecordFilters)[]).some((k) => filters[k] !== EMPTY_FILTERS[k])
  void pool

  return (
    <div className="flex flex-col gap-3 border-b p-3 sm:p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={filters.query} onChange={(e) => setFilters({ query: e.target.value })} placeholder="Buscar por nombre, documento, correo o ID" className="bg-card pl-9" aria-label="Buscar registros" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {show.includes('journey') && <FilterSelect label="Jornada" value={filters.journey} options={uniq.journey} onChange={(v) => setFilters({ journey: v })} />}
        {show.includes('school') && <FilterSelect label="Colegio" value={filters.school} options={uniq.school} onChange={(v) => setFilters({ school: v })} />}
        {show.includes('city') && <FilterSelect label="Ciudad" value={filters.city} options={uniq.city} onChange={(v) => setFilters({ city: v })} />}
        {show.includes('review') && <FilterSelect label="Revisión" value={filters.review} options={['Por revisar', 'Verificado', 'Revisado']} onChange={(v) => setFilters({ review: v })} />}
        {show.includes('send') && <FilterSelect label="Envío" value={filters.send} options={['Pendiente de envío', 'Enviado', 'Error de envío', 'Pendiente de actualización']} onChange={(v) => setFilters({ send: v })} />}
        {active && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X data-icon="inline-start" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
