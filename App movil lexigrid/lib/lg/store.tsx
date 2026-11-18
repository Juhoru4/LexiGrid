'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { detectarDuplicados, normalizarDB, type InfoDuplicado } from './rules'
import { crearSeed } from './seed'
import type { Auditoria, DB, Usuario } from './types'
import { uuid } from './utils'

const CLAVE_STORAGE = 'lexigrid-db-v1'

export type AuditInput = Omit<Auditoria, 'id' | 'fecha'>

interface Contexto {
  db: DB
  dups: Map<string, InfoDuplicado>
  mutate: (fn: (d: DB) => void, audits?: AuditInput[]) => void
  restablecer: () => void
}

const Ctx = createContext<Contexto | null>(null)

function aplicar(prev: DB, fn: (d: DB) => void, audits: AuditInput[] = []): DB {
  const d = structuredClone(prev)
  fn(d)
  const ahora = Date.now()
  const antes = detectarDuplicados(prev.registros)
  const logs = normalizarDB(d, ahora)
  const despues = detectarDuplicados(d.registros)
  for (const [id, info] of despues) {
    if (info.rol === 'nuevo' && antes.get(id)?.rol !== 'nuevo') {
      const campos = [...new Set(info.coincidencias.filter((c) => c.a === id || c.b === id).map((c) => c.campo))]
      logs.push({
        id: uuid(),
        fecha: ahora,
        usuario: 'Sistema',
        tipo: 'Detección de duplicado',
        registro: id,
        detalle: `Coincidencia por ${campos.join(' y ') || 'documento o correo'} (${info.casoId})`,
      })
    }
  }
  d.auditoria = [
    ...d.auditoria,
    ...audits.map((a) => ({ ...a, id: uuid(), fecha: ahora })),
    ...logs,
  ]
  return d
}

export function LexiGridProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB | null>(null)
  const dbRef = useRef<DB | null>(null)
  dbRef.current = db

  useEffect(() => {
    let inicial: DB
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE)
      inicial = guardado ? (JSON.parse(guardado) as DB) : crearSeed()
    } catch {
      inicial = crearSeed()
    }
    setDb(aplicar(inicial, () => {}))
  }, [])

  useEffect(() => {
    if (db) localStorage.setItem(CLAVE_STORAGE, JSON.stringify(db))
  }, [db])

  const mutate = useCallback((fn: (d: DB) => void, audits?: AuditInput[]) => {
    setDb((prev) => (prev ? aplicar(prev, fn, audits) : prev))
  }, [])

  const restablecer = useCallback(() => {
    localStorage.removeItem(CLAVE_STORAGE)
    setDb(aplicar(crearSeed(), () => {}))
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      const actual = dbRef.current
      if (!actual) return
      const ahora = Date.now()
      const listos = actual.registros.filter((r) => r.procesando && (r.procesarEn ?? 0) <= ahora)
      if (!listos.length) return
      const ids = new Set(listos.map((r) => r.id))
      const audits: AuditInput[] = []
      mutate((d) => {
        for (const r of d.registros) {
          if (!ids.has(r.id)) continue
          r.procesando = false
          const dudas = Object.values(r.campos).filter((c) => c.estado === 'Por revisar').length
          r.imagen = dudas ? 'conservada' : 'no-conservada'
        }
      }, (() => {
        for (const r of listos) {
          const dudas = Object.values(r.campos).filter((c) => c.estado === 'Por revisar').length
          audits.push({
            usuario: 'Sistema',
            tipo: 'Procesamiento OCR',
            registro: r.id,
            detalle: dudas ? `${dudas} campo(s) Por revisar; imagen conservada` : 'Todos los campos verificados',
          })
          if (!dudas)
            audits.push({
              usuario: 'Sistema',
              tipo: 'Eliminación de imagen',
              registro: r.id,
              detalle: 'Todos los campos identificados con certeza del 100 %',
            })
        }
        return audits
      })())
    }, 1000)
    return () => clearInterval(t)
  }, [mutate])

  const dups = useMemo(() => (db ? detectarDuplicados(db.registros) : new Map()), [db])

  if (!db) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground" role="status">
        Cargando LexiGrid…
      </div>
    )
  }

  return <Ctx.Provider value={{ db, dups, mutate, restablecer }}>{children}</Ctx.Provider>
}

export function useLG() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useLG fuera de LexiGridProvider')
  return c
}

export function useUsuarioWeb(): Usuario | null {
  const { db } = useLG()
  return db.usuarios.find((u) => u.id === db.sesionWeb?.usuarioId) ?? null
}

export function useUsuarioApp(): Usuario | null {
  const { db } = useLG()
  return db.usuarios.find((u) => u.id === db.sesionApp?.usuarioId) ?? null
}

export function useAhora(intervalo = 1000) {
  const [ahora, setAhora] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), intervalo)
    return () => clearInterval(t)
  }, [intervalo])
  return ahora
}
