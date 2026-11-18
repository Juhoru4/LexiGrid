'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export const SECTIONS = ['Resumen', 'Registros', 'Formularios', 'Duplicados', 'Papelera', 'Enviar al CRM', 'Enviados', 'Unificar nombres', 'Mi historial', 'Administración'] as const
export type Section = (typeof SECTIONS)[number]

export type RecordFilters = {
  query: string
  journey: string
  school: string
  city: string
  review: string
  send: string
}

export const ALL = 'Todos'
export const EMPTY_FILTERS: RecordFilters = { query: '', journey: ALL, school: ALL, city: ALL, review: ALL, send: ALL }
const FILTERS_KEY = 'lexigrid-filters-v2'

type Ui = {
  section: Section
  go: (section: Section, filters?: Partial<RecordFilters>) => void
  filters: RecordFilters
  setFilters: (patch: Partial<RecordFilters>) => void
  clearFilters: () => void
  openId: string | null
  openRecord: (id: string | null) => void
}

const UiContext = createContext<Ui | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [section, setSection] = useState<Section>('Resumen')
  const [filters, setFiltersState] = useState<RecordFilters>(EMPTY_FILTERS)
  const [openId, setOpenId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTERS_KEY)
      if (raw) setFiltersState({ ...EMPTY_FILTERS, ...JSON.parse(raw) })
    } catch {
      /* sin filtros guardados */
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) localStorage.setItem(FILTERS_KEY, JSON.stringify(filters))
  }, [filters, loaded])

  const go = useCallback((next: Section, f?: Partial<RecordFilters>) => {
    if (f) setFiltersState({ ...EMPTY_FILTERS, ...f })
    setSection(next)
    window.scrollTo({ top: 0 })
  }, [])

  const value = useMemo<Ui>(
    () => ({
      section,
      go,
      filters,
      setFilters: (patch) => setFiltersState((s) => ({ ...s, ...patch })),
      clearFilters: () => setFiltersState(EMPTY_FILTERS),
      openId,
      openRecord: setOpenId,
    }),
    [section, go, filters, openId],
  )
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi() {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi debe usarse dentro de UiProvider')
  return ctx
}
