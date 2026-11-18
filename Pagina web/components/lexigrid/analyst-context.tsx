'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Analyst } from '@/lib/auth/types'

const AnalystContext = createContext<Analyst | null>(null)

export function AnalystProvider({ analyst, children }: { analyst: Analyst; children: ReactNode }) {
  return <AnalystContext.Provider value={analyst}>{children}</AnalystContext.Provider>
}

export function useAnalyst() {
  const ctx = useContext(AnalystContext)
  if (!ctx) throw new Error('useAnalyst debe usarse dentro de AnalystProvider')
  return ctx
}
