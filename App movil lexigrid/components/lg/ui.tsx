'use client'

import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock,
  Copy,
  Inbox,
  Loader2,
  type LucideIcon,
  RefreshCw,
  Send,
  X,
  XCircle,
} from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import type { EstadoCampo, EstadoEnvio, EstadoRevision, Prioridad } from '@/lib/lg/types'
import { cn } from '@/lib/utils'

export type Tono = 'amarillo' | 'verde' | 'rojo' | 'gris' | 'azul'

const TONOS: Record<Tono, string> = {
  amarillo: 'bg-amber-100 text-amber-900 border-amber-300',
  verde: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  rojo: 'bg-red-100 text-red-900 border-red-300',
  gris: 'bg-slate-100 text-slate-700 border-slate-300',
  azul: 'bg-sky-100 text-sky-900 border-sky-300',
}

export function Insignia({
  tono,
  icono: Icono,
  children,
  className,
}: {
  tono: Tono
  icono?: LucideIcon
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium',
        TONOS[tono],
        className,
      )}
    >
      {Icono && <Icono className="size-3.5 shrink-0" aria-hidden="true" />}
      {children}
    </span>
  )
}

export function InsigniaRevision({ estado }: { estado: EstadoRevision }) {
  const m: Record<EstadoRevision, [Tono, LucideIcon]> = {
    'En procesamiento': ['azul', Loader2],
    Verificado: ['verde', CheckCircle2],
    'Por revisar': ['amarillo', AlertTriangle],
    Revisado: ['verde', CheckCircle2],
  }
  const [t, i] = m[estado]
  return <Insignia tono={t} icono={i}>{estado}</Insignia>
}

export function InsigniaCampo({ estado }: { estado: EstadoCampo }) {
  return estado === 'Por revisar' ? (
    <Insignia tono="amarillo" icono={AlertTriangle}>Por revisar</Insignia>
  ) : (
    <Insignia tono="verde" icono={CheckCircle2}>{estado}</Insignia>
  )
}

export function InsigniaPrioridad({ prioridad }: { prioridad: Prioridad | null }) {
  if (!prioridad) return <Insignia tono="gris">Sin prioridad</Insignia>
  const m: Record<Prioridad, string> = {
    Alta: 'bg-primary text-primary-foreground border-primary',
    Media: 'bg-sky-100 text-sky-900 border-sky-300',
    Baja: 'bg-slate-100 text-slate-700 border-slate-300',
    'Pendiente de prioridad': 'bg-amber-50 text-amber-900 border-amber-300 border-dashed',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium', m[prioridad])}>
      {prioridad === 'Pendiente de prioridad' ? <CircleDashed className="size-3.5" aria-hidden="true" /> : null}
      {prioridad === 'Pendiente de prioridad' ? prioridad : `Prioridad ${prioridad.toLowerCase()}`}
    </span>
  )
}

export function InsigniaEnvio({ estado }: { estado: EstadoEnvio }) {
  const m: Record<EstadoEnvio, [Tono, LucideIcon]> = {
    'Pendiente de envío': ['gris', Clock],
    Enviado: ['verde', Send],
    'Error de envío': ['rojo', XCircle],
    'Pendiente de actualización': ['azul', RefreshCw],
  }
  const [t, i] = m[estado]
  return <Insignia tono={t} icono={i}>{estado}</Insignia>
}

export function InsigniaDuplicado() {
  return <Insignia tono="amarillo" icono={Copy}>Por revisar duplicado</Insignia>
}

export function Etiqueta({ htmlFor, children, className }: { htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('text-sm font-medium text-foreground', className)}>
      {children}
    </label>
  )
}

export const claseInput =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:ring-red-200'

export function Entrada(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(claseInput, props.className)} />
}

export function Selector(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(claseInput, 'pr-8', props.className)} />
}

export function AreaTexto(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(claseInput, 'h-auto min-h-20 py-2', props.className)} />
}

export function Tarjeta({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-xl border bg-card p-4 text-card-foreground shadow-xs', className)}>{children}</div>
}

export function EncabezadoPagina({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string
  descripcion?: string
  acciones?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">{titulo}</h1>
        {descripcion && <p className="mt-1 text-pretty text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  )
}

export function EstadoVacio({
  icono: Icono = Inbox,
  titulo,
  texto,
  children,
}: {
  icono?: LucideIcon
  titulo: string
  texto?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center">
      <Icono className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium text-foreground">{titulo}</p>
      {texto && <p className="max-w-sm text-pretty text-sm text-muted-foreground">{texto}</p>}
      {children}
    </div>
  )
}

export function Aviso({
  tono = 'azul',
  icono: Icono,
  titulo,
  children,
  className,
}: {
  tono?: Tono
  icono?: LucideIcon
  titulo?: string
  children?: React.ReactNode
  className?: string
}) {
  const I = Icono ?? (tono === 'rojo' ? XCircle : tono === 'verde' ? CheckCircle2 : tono === 'amarillo' ? AlertTriangle : Clock)
  return (
    <div role={tono === 'rojo' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-lg border p-3 text-sm', TONOS[tono], className)}>
      <I className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        {titulo && <p className="font-semibold">{titulo}</p>}
        {children && <div className={cn(titulo && 'mt-0.5')}>{children}</div>}
      </div>
    </div>
  )
}

export function Modal({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  children,
  pie,
  ancho = 'max-w-lg',
}: {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  descripcion?: string
  children?: React.ReactNode
  pie?: React.ReactNode
  ancho?: string
}) {
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const cerrarRef = useRef(onCerrar)
  cerrarRef.current = onCerrar
  useEffect(() => {
    if (!abierto) return
    const anterior = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && cerrarRef.current()
    window.addEventListener('keydown', tecla)
    return () => {
      window.removeEventListener('keydown', tecla)
      anterior?.focus?.()
    }
  }, [abierto])
  if (!abierto) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4" onClick={onCerrar}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn('flex max-h-[90dvh] w-full flex-col rounded-t-2xl bg-card shadow-xl outline-none sm:rounded-2xl', ancho)}
      >
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <h2 id={id} className="text-lg font-semibold text-foreground">{titulo}</h2>
            {descripcion && <p className="mt-0.5 text-sm text-muted-foreground">{descripcion}</p>}
          </div>
          <button type="button" onClick={onCerrar} className="rounded-md p-1 text-muted-foreground hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
        {pie && <div className="flex flex-wrap justify-end gap-2 border-t p-4">{pie}</div>}
      </div>
    </div>
  )
}

export function Paginacion({
  pagina,
  total,
  porPagina,
  onCambiar,
}: {
  pagina: number
  total: number
  porPagina: number
  onCambiar: (p: number) => void
}) {
  const paginas = Math.max(1, Math.ceil(total / porPagina))
  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-2 border-t px-4 py-3 text-sm">
      <span className="text-muted-foreground">
        Página {pagina} de {paginas}
      </span>
      <div className="flex gap-2">
        <button type="button" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)} className="h-8 rounded-md border px-3 hover:bg-muted disabled:opacity-50">
          Anterior
        </button>
        <button type="button" disabled={pagina >= paginas} onClick={() => onCambiar(pagina + 1)} className="h-8 rounded-md border px-3 hover:bg-muted disabled:opacity-50">
          Siguiente
        </button>
      </div>
    </nav>
  )
}

export function Tabla({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-max text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground [&_thead]:bg-muted/60 [&_tbody_tr]:border-t">
        {children}
      </table>
    </div>
  )
}

export function Interruptor({
  activo,
  onCambiar,
  etiqueta,
}: {
  activo: boolean
  onCambiar: (v: boolean) => void
  etiqueta: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={() => onCambiar(!activo)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus-visible:ring-3 focus-visible:ring-ring/50',
        activo ? 'bg-emerald-600' : 'bg-slate-400',
      )}
    >
      <span className={cn('inline-block size-5 rounded-full bg-white shadow transition', activo ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  )
}
