'use client'

import { CheckCircle2, Upload, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EstadoVacio, Etiqueta, Insignia, InsigniaRevision, Selector } from '@/components/lg/ui'
import { estadoRevision } from '@/lib/lg/rules'
import { useAhora, useLG, useUsuarioApp } from '@/lib/lg/store'
import { fmtFechaHora } from '@/lib/lg/utils'

interface Fila {
  id: string
  jornada: string
  colegio: string
  fecha: number
  estado: React.ReactNode
}

export default function Historial() {
  const { db } = useLG()
  const usuario = useUsuarioApp()
  const ahora = useAhora(1000)
  const [jornada, setJornada] = useState('')
  const [colegio, setColegio] = useState('')

  const filas = useMemo<Fila[]>(() => {
    const propias = db.registros
      .filter((r) => r.embajador === usuario?.nombre && !r.purgado)
      .map((r) => {
        const recien = r.procesando && (r.procesarEn ?? 0) - ahora > 3500
        return {
          id: r.id,
          jornada: r.jornada,
          colegio: r.colegio,
          fecha: r.capturadoEn,
          estado: recien ? <Insignia tono="verde" icono={Upload}>Subida</Insignia> : <InsigniaRevision estado={estadoRevision(r)} />,
        }
      })
    const conError = db.dispositivo.cola
      .filter((c) => c.estado === 'Error')
      .map((c) => ({
        id: c.id,
        jornada: c.jornada,
        colegio: c.colegio,
        fecha: c.capturadoEn,
        estado: <Insignia tono="rojo" icono={XCircle}>Con error de carga</Insignia>,
      }))
    return [...conError, ...propias].sort((a, b) => b.fecha - a.fecha)
  }, [db, usuario, ahora])

  const jornadas = [...new Set(filas.map((f) => f.jornada))]
  const colegios = [...new Set(filas.filter((f) => !jornada || f.jornada === jornada).map((f) => f.colegio))]
  const visibles = filas.filter((f) => (!jornada || f.jornada === jornada) && (!colegio || f.colegio === colegio))

  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Historial de capturas</h1>
        <p className="mt-1 text-sm text-muted-foreground">{visibles.length} formularios</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <Etiqueta htmlFor="f-jornada" className="text-xs">Jornada</Etiqueta>
          <Selector id="f-jornada" className="h-11" value={jornada} onChange={(e) => { setJornada(e.target.value); setColegio('') }}>
            <option value="">Todas</option>
            {jornadas.map((j) => <option key={j}>{j}</option>)}
          </Selector>
        </div>
        <div className="flex flex-col gap-1">
          <Etiqueta htmlFor="f-colegio" className="text-xs">Colegio</Etiqueta>
          <Selector id="f-colegio" className="h-11" value={colegio} onChange={(e) => setColegio(e.target.value)}>
            <option value="">Todos</option>
            {colegios.map((c) => <option key={c}>{c}</option>)}
          </Selector>
        </div>
      </div>
      {visibles.length === 0 ? (
        <EstadoVacio icono={CheckCircle2} titulo="Sin capturas" texto="Aún no hay formularios para estos filtros." />
      ) : (
        <ul className="flex flex-col gap-2">
          {visibles.map((f) => (
            <li key={f.id} className="flex items-start justify-between gap-2 rounded-xl border bg-card p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{f.colegio}</p>
                <p className="truncate text-xs text-muted-foreground">{f.jornada}</p>
                <p className="text-xs text-muted-foreground">{fmtFechaHora(f.fecha)}</p>
              </div>
              {f.estado}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
