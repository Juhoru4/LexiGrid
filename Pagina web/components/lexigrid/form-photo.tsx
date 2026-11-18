'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { OPTIONS } from '@/lib/lexigrid/rules'
import type { FieldKey, LexRecord } from '@/lib/lexigrid/types'
import { cn } from '@/lib/utils'

export const PAPER_W = 520
export const PAPER_H = 720

function Ink({ children, rot = 0, className }: { children: ReactNode; rot?: number; className?: string }) {
  return (
    <span className={cn('inline-block font-hand text-[24px] leading-none text-[#1f3a8a]', className)} style={{ transform: `rotate(${rot}deg)` }}>
      {children}
    </span>
  )
}

function Slot({
  rec,
  k,
  label,
  active,
  onSelect,
  className,
  children,
}: {
  rec: LexRecord
  k: FieldKey
  label: string
  active: FieldKey | null
  onSelect?: (k: FieldKey) => void
  className?: string
  children: ReactNode
}) {
  const doubtful = rec.fields[k].status === 'Por revisar'
  return (
    <div
      data-field={k}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(k)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect?.(k)
      }}
      className={cn(
        'relative rounded-sm px-1.5 pt-1 pb-0.5 transition-colors',
        onSelect && 'cursor-pointer',
        doubtful && 'outline-2 outline-dashed outline-amber-500',
        active === k && 'bg-teal-100/70 outline-2 outline-solid outline-teal-600',
        className,
      )}
    >
      <p className="text-[9px] font-semibold tracking-wider text-neutral-500 uppercase">{label}</p>
      <div className="min-h-[30px] border-b border-neutral-400/70 pt-0.5">{children}</div>
      {doubtful && <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">!</span>}
    </div>
  )
}

function Boxes({ photo, options, labels }: { photo: string; options: string[]; labels?: Record<string, string> }) {
  const marks = photo.split(',').filter(Boolean)
  return (
    <div className="flex flex-wrap items-center gap-3 pb-1">
      {options.map((o, i) => (
        <span key={o} className="flex items-center gap-1 text-[11px] text-neutral-600">
          <span className="relative flex size-[18px] items-center justify-center border border-neutral-500 bg-white/60">
            {marks.includes(o) && <X className="absolute size-[22px] text-[#1f3a8a]" strokeWidth={2.5} style={{ transform: `rotate(${(i % 3) * 6 - 6}deg)` }} />}
          </span>
          {labels?.[o] ?? o}
        </span>
      ))}
    </div>
  )
}

export function FormPhoto({ rec, active = null, onSelect }: { rec: LexRecord; active?: FieldKey | null; onSelect?: (k: FieldKey) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!active) return
    ref.current?.querySelector(`[data-field="${active}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [active])

  const p = (k: FieldKey) => rec.fields[k].photo
  const slot = { rec, active, onSelect }

  return (
    <div
      ref={ref}
      className="relative origin-top-left bg-[#fbfaf4] p-7 shadow-[0_10px_30px_rgba(20,30,50,0.28)]"
      style={{ width: PAPER_W, height: PAPER_H, transform: 'rotate(-0.5deg)' }}
    >
      <div className="flex items-center gap-3 border-b-2 border-[#163d66] pb-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-[#163d66] text-[11px] font-bold text-white">USB</div>
        <div className="flex-1">
          <p className="text-[11px] font-bold tracking-wide text-[#163d66] uppercase">Universidad de San Buenaventura · Cali</p>
          <p className="text-[15px] font-extrabold tracking-tight text-neutral-800">Formulario de aspirantes</p>
        </div>
        <p className="text-right text-[9px] leading-tight text-neutral-500">
          Mercadeo
          <br />
          Jornada de captación
        </p>
      </div>
      <p className="mt-2 text-[10px] text-neutral-600">
        <span className="font-semibold">Jornada:</span> {rec.journey} · <span className="font-semibold">Colegio:</span> {rec.school.trim()} · <span className="font-semibold">Ciudad:</span> {rec.city.trim()}
      </p>

      <div className="mt-3 flex flex-col gap-2.5">
        <Slot {...slot} k="name" label="Nombre y apellidos">
          <Ink rot={-0.8}>{p('name')}</Ink>
        </Slot>
        <div className="grid grid-cols-[150px_1fr] gap-3">
          <Slot {...slot} k="docType" label="Tipo de documento">
            <Boxes photo={p('docType')} options={OPTIONS.docType!} />
          </Slot>
          <Slot {...slot} k="document" label="Número de documento">
            <Ink rot={0.6} className="tracking-wider">{p('document')}</Ink>
          </Slot>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Slot {...slot} k="phone" label="Celular del aspirante">
            <Ink rot={-0.5}>{p('phone')}</Ink>
          </Slot>
          <Slot {...slot} k="guardianPhone" label="Celular del acudiente">
            <Ink rot={0.7}>{p('guardianPhone')}</Ink>
          </Slot>
        </div>
        <Slot {...slot} k="email" label="Correo electrónico">
          <Ink rot={-0.4} className="text-[22px]">{p('email')}</Ink>
        </Slot>
        <Slot {...slot} k="guardianName" label="Nombre del acudiente">
          <Ink rot={0.5}>{p('guardianName')}</Ink>
        </Slot>
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <Slot {...slot} k="degree" label="Grado que cursa">
            <Boxes photo={p('degree')} options={OPTIONS.degree!} labels={{ graduado: 'Graduado' }} />
          </Slot>
          <Slot {...slot} k="calendar" label="Calendario">
            <Boxes photo={p('calendar')} options={OPTIONS.calendar!} />
          </Slot>
        </div>
        <Slot {...slot} k="careers" label="Carreras de interés">
          <div className="flex flex-col gap-0.5">
            {p('careers')
              .split(';')
              .filter((c) => c.trim())
              .map((c, i) => (
                <Ink key={c} rot={i % 2 ? 0.6 : -0.6}>
                  {i + 1}. {c.trim()}
                </Ink>
              ))}
          </div>
        </Slot>
        <Slot {...slot} k="consent" label="Autorizo el tratamiento de mis datos personales">
          <Boxes photo={p('consent')} options={OPTIONS.consent!} />
        </Slot>
      </div>

      <svg viewBox="0 0 160 40" className="absolute right-8 bottom-6 h-10 w-40 text-[#1f3a8a]" aria-hidden="true">
        <path d="M5 28 C 20 2, 30 40, 45 18 S 70 4, 80 24 S 110 34, 120 14 S 145 10, 155 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="absolute bottom-6 left-8 text-[9px] text-neutral-400">Firma del aspirante o acudiente</p>
    </div>
  )
}
