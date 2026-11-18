'use client'

import { CheckCircle2, Clock, Loader2, Pencil, RefreshCw, XCircle } from 'lucide-react'
import { useState } from 'react'
import { LoteForm, recordarLote } from '@/components/lg/app/lote-form'
import { EstadoVacio, Insignia, Modal } from '@/components/lg/ui'
import { Button } from '@/components/ui/button'
import { nombreSesionApp } from '@/lib/lg/sesion'
import { useLG } from '@/lib/lg/store'
import type { ColaItem } from '@/lib/lg/types'
import { fmtHora } from '@/lib/lg/utils'

function InsigniaCola({ item }: { item: ColaItem }) {
  if (item.estado === 'Subiendo') return <Insignia tono="azul" icono={Loader2}>Subiendo {item.progreso}%</Insignia>
  if (item.estado === 'Subida') return <Insignia tono="verde" icono={CheckCircle2}>Subida</Insignia>
  if (item.estado === 'Error') return <Insignia tono="rojo" icono={XCircle}>Error</Insignia>
  return <Insignia tono="gris" icono={Clock}>Pendiente</Insignia>
}

export default function Cola() {
  const { db, mutate } = useLG()
  const cola = db.dispositivo.cola
  const pendientes = cola.filter((c) => c.estado !== 'Subida').length
  const errores = cola.filter((c) => c.estado === 'Error').length
  const [editando, setEditando] = useState<ColaItem | null>(null)

  const reintentar = () =>
    mutate(
      (d) => {
        for (const c of d.dispositivo.cola) if (c.estado === 'Error') { c.estado = 'Pendiente'; c.error = undefined }
        d.notificacionApp = null
      },
      [{ usuario: nombreSesionApp(db), tipo: 'Reintento de carga', detalle: `${errores} foto(s) con error` }],
    )

  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Cola de carga</h1>
        <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
          {pendientes === 0 ? 'No hay fotos pendientes' : `${pendientes} ${pendientes === 1 ? 'foto pendiente' : 'fotos pendientes'}`}
          {!db.demo.online && pendientes > 0 && ' · se subirán al recuperar la conexión'}
        </p>
      </div>

      {errores > 0 && (
        <Button size="lg" className="h-12 text-base" onClick={reintentar} disabled={!db.demo.online}>
          <RefreshCw /> Reintentar {errores} {errores === 1 ? 'foto' : 'fotos'}
        </Button>
      )}

      {cola.length === 0 ? (
        <EstadoVacio titulo="Cola vacía" texto="Las fotos que confirmes aparecerán aquí mientras se suben." />
      ) : (
        <ul className="flex flex-col gap-2">
          {[...cola].reverse().map((c) => (
            <li key={c.id} className="rounded-xl border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.colegio}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.jornada} · {fmtHora(c.capturadoEn)}
                  </p>
                </div>
                <InsigniaCola item={c} />
              </div>
              {c.estado === 'Subiendo' && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={c.progreso} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de carga">
                  <div className="h-full bg-primary transition-all" style={{ width: `${c.progreso}%` }} />
                </div>
              )}
              {c.error && <p className="mt-2 text-xs text-red-700">{c.error}</p>}
              {(c.estado === 'Pendiente' || c.estado === 'Error') && (
                <button type="button" onClick={() => setEditando(c)} className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary">
                  <Pencil className="size-4" aria-hidden="true" /> Editar datos del lote
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal abierto={Boolean(editando)} onCerrar={() => setEditando(null)} titulo="Editar datos de la foto" descripcion="Solo se puede editar mientras la foto no se haya sincronizado.">
        {editando && (
          <LoteForm
            inicial={editando}
            textoBoton="Guardar"
            onCancelar={() => setEditando(null)}
            onGuardar={(l) => {
              mutate((d) => {
                const it = d.dispositivo.cola.find((x) => x.id === editando.id)
                if (it && it.estado !== 'Subida' && it.estado !== 'Subiendo') Object.assign(it, l)
                recordarLote(d.dispositivo.historialLote, l)
              })
              setEditando(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
