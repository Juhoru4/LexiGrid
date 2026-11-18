'use client'

import { AlertTriangle, Check, ChevronRight, Loader2, Pencil, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { type Lote, LoteForm, recordarLote } from '@/components/lg/app/lote-form'
import { Modal } from '@/components/lg/ui'
import { Button } from '@/components/ui/button'
import { useLG } from '@/lib/lg/store'
import type { MotivoCalidad } from '@/lib/lg/types'
import { cn } from '@/lib/utils'

const MENSAJES: Record<MotivoCalidad, { titulo: string; texto: string }> = {
  borrosa: { titulo: 'La foto está borrosa', texto: 'Mantén el teléfono quieto y enfoca el formulario antes de disparar.' },
  'poca luz': { titulo: 'Hay poca luz', texto: 'Busca un lugar más iluminado o acércate a una ventana.' },
  incompleta: { titulo: 'El formulario está incompleto', texto: 'Asegúrate de que las cuatro esquinas del formulario queden dentro del marco.' },
  reflejos: { titulo: 'Hay reflejos sobre el papel', texto: 'Inclina un poco el teléfono para evitar el brillo de la luz.' },
}

type Fase = { tipo: 'visor' } | { tipo: 'evaluando' } | { tipo: 'rechazada'; motivo: MotivoCalidad } | { tipo: 'previa' }

export default function Capturar() {
  const { db, mutate } = useLG()
  const lote = db.dispositivo.lote
  const [fase, setFase] = useState<Fase>({ tipo: 'visor' })
  const [editar, setEditar] = useState(false)
  const [campoEditar, setCampoEditar] = useState<keyof Lote | null>(null)
  const [enSesion, setEnSesion] = useState(0)
  const [aviso, setAviso] = useState<string | null>(null)
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(temporizador.current), [])
  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 2500)
    return () => clearTimeout(t)
  }, [aviso])

  const guardarLote = (l: Lote) =>
    mutate((d) => {
      d.dispositivo.lote = l
      recordarLote(d.dispositivo.historialLote, l)
    })

  if (!lote) {
    return (
      <div className="flex flex-col gap-5 px-5 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Antes de la primera captura</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Datos del lote</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Se asignan a todas las fotos de esta sesión. Puedes cambiarlos en cualquier momento.
          </p>
        </div>
        <LoteForm onGuardar={guardarLote} textoBoton="Comenzar a capturar" />
      </div>
    )
  }

  const disparar = () => {
    setFase({ tipo: 'evaluando' })
    temporizador.current = setTimeout(() => {
      const motivos: MotivoCalidad[] = ['borrosa', 'poca luz', 'incompleta', 'reflejos']
      const cal = db.demo.calidad
      let motivo: MotivoCalidad | null = null
      if (cal === 'auto') motivo = Math.random() < 0.12 ? motivos[Math.floor(Math.random() * 4)] : null
      else if (cal !== 'buena') motivo = cal
      setFase(motivo ? { tipo: 'rechazada', motivo } : { tipo: 'previa' })
    }, 900)
  }

  const confirmar = () => {
    mutate((d) => {
      d.dispositivo.cola.push({
        id: crypto.randomUUID(),
        jornada: lote.jornada,
        colegio: lote.colegio,
        ciudad: lote.ciudad,
        capturadoEn: Date.now(),
        estado: 'Pendiente',
        progreso: 0,
      })
    })
    setEnSesion((n) => n + 1)
    setAviso(db.demo.online ? 'Foto agregada a la cola de carga' : 'Foto guardada cifrada en el dispositivo')
    setFase({ tipo: 'visor' })
  }

  return (
    <div className="flex flex-1 flex-col">
      <button
        type="button"
        onClick={() => setEditar(true)}
        className="flex min-h-14 items-center gap-3 border-b bg-card px-4 py-2 text-left hover:bg-muted"
        aria-label={`Lote actual: ${lote.jornada}, ${lote.colegio}, ${lote.ciudad}. Tocar para editar`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{lote.colegio}</p>
          <p className="truncate text-xs text-muted-foreground">
            {lote.jornada} · {lote.ciudad}
          </p>
        </div>
        <Pencil className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      <div className="relative flex flex-1 flex-col bg-slate-950">
        <div className="relative m-4 flex-1 overflow-hidden rounded-2xl">
          <Image
            src="/formulario-escaneado.png"
            alt={fase.tipo === 'previa' ? 'Vista previa de la foto del formulario' : 'Visor de cámara apuntando a un formulario'}
            fill
            sizes="390px"
            className={cn('object-cover', fase.tipo === 'visor' && 'opacity-70', fase.tipo === 'rechazada' && fase.motivo === 'borrosa' && 'blur-[3px]', fase.tipo === 'rechazada' && fase.motivo === 'poca luz' && 'brightness-[.35]')}
            priority
          />
          {fase.tipo === 'visor' && (
            <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-white/80" aria-hidden="true" />
          )}
          {fase.tipo === 'evaluando' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/60 text-white" role="status">
              <Loader2 className="size-8 animate-spin" aria-hidden="true" />
              <p className="text-sm font-medium">Evaluando calidad de la foto…</p>
            </div>
          )}
        </div>

        {fase.tipo === 'visor' && (
          <div className="flex flex-col items-center gap-2 pb-5">
            <p className="text-center text-xs text-white/80">
              Encuadra el formulario completo dentro del marco
              {enSesion > 0 && ` · ${enSesion} ${enSesion === 1 ? 'foto' : 'fotos'} en esta sesión`}
            </p>
            <button
              type="button"
              onClick={disparar}
              aria-label="Tomar foto"
              className="flex size-18 items-center justify-center rounded-full border-4 border-white bg-white/20 transition active:scale-95 focus-visible:ring-4 focus-visible:ring-sky-400"
            >
              <span className="size-13 rounded-full bg-white" />
            </button>
          </div>
        )}

        {fase.tipo === 'rechazada' && (
          <div className="mx-4 mb-4 flex flex-col gap-3 rounded-xl bg-amber-50 p-4 text-amber-950" role="alert">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">{MENSAJES[fase.motivo].titulo}</p>
                <p className="text-sm">{MENSAJES[fase.motivo].texto}</p>
              </div>
            </div>
            <Button size="lg" className="h-12 text-base" onClick={() => setFase({ tipo: 'visor' })}>
              <RotateCcw /> Repetir foto
            </Button>
          </div>
        )}

        {fase.tipo === 'previa' && (
          <div className="mx-4 mb-4 flex gap-2">
            <Button size="lg" variant="outline" className="h-12 flex-1 bg-white text-base" onClick={() => setFase({ tipo: 'visor' })}>
              <RotateCcw /> Repetir
            </Button>
            <Button size="lg" className="h-12 flex-1 text-base" onClick={confirmar}>
              <Check /> Confirmar
            </Button>
          </div>
        )}

        {aviso && (
          <div role="status" className="absolute inset-x-4 top-6 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg">
            {aviso}
          </div>
        )}
      </div>

      <Modal
        abierto={editar}
        onCerrar={() => {
          setEditar(false)
          setCampoEditar(null)
        }}
        titulo={campoEditar ? 'Editar dato del lote' : 'Datos del lote'}
        descripcion={campoEditar ? undefined : 'Toca el dato que quieres cambiar. Aplica a las próximas fotos.'}
      >
        {campoEditar ? (
          <LoteForm
            inicial={lote}
            solo={campoEditar}
            textoBoton="Guardar"
            onCancelar={() => setCampoEditar(null)}
            onGuardar={(l) => {
              guardarLote(l)
              setCampoEditar(null)
              setEditar(false)
            }}
          />
        ) : (
          <ul className="flex flex-col divide-y rounded-xl border">
            {(['jornada', 'colegio', 'ciudad'] as const).map((k) => (
              <li key={k}>
                <button type="button" onClick={() => setCampoEditar(k)} className="flex min-h-14 w-full items-center gap-3 px-4 text-left hover:bg-muted">
                  <div className="flex-1">
                    <p className="text-xs font-medium capitalize text-muted-foreground">{k}</p>
                    <p className="text-sm font-medium">{lote[k]}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  )
}
