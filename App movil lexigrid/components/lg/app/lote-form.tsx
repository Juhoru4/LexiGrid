'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLG } from '@/lib/lg/store'
import { limpiarEspacios } from '@/lib/lg/utils'
import { Autocompletar } from '../autocompletar'

export type Lote = { jornada: string; colegio: string; ciudad: string }
const CAMPOS: { k: keyof Lote; etiqueta: string; placeholder: string }[] = [
  { k: 'jornada', etiqueta: 'Jornada', placeholder: 'Ej. Feria Universitaria Cali 2026' },
  { k: 'colegio', etiqueta: 'Colegio', placeholder: 'Ej. Colegio Berchmans' },
  { k: 'ciudad', etiqueta: 'Ciudad', placeholder: 'Ej. Cali' },
]

export function LoteForm({
  inicial,
  solo,
  textoBoton = 'Guardar datos del lote',
  onGuardar,
  onCancelar,
}: {
  inicial?: Lote | null
  solo?: keyof Lote
  textoBoton?: string
  onGuardar: (l: Lote) => void
  onCancelar?: () => void
}) {
  const { db } = useLG()
  const [valores, setValores] = useState<Lote>(inicial ?? { jornada: '', colegio: '', ciudad: '' })
  const [errores, setErrores] = useState<Partial<Record<keyof Lote, string>>>({})
  const campos = solo ? CAMPOS.filter((c) => c.k === solo) : CAMPOS

  const guardar = (e: React.FormEvent) => {
    e.preventDefault()
    const limpio: Lote = {
      jornada: limpiarEspacios(valores.jornada),
      colegio: limpiarEspacios(valores.colegio),
      ciudad: limpiarEspacios(valores.ciudad),
    }
    const err: Partial<Record<keyof Lote, string>> = {}
    for (const c of campos) if (!limpio[c.k]) err[c.k] = `${c.etiqueta} es obligatoria`
    if (c0(err)) {
      setErrores(err)
      return
    }
    onGuardar(limpio)
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-4" noValidate>
      {campos.map((c, i) => (
        <Autocompletar
          key={c.k}
          etiqueta={c.k === 'colegio' ? 'Colegio' : c.etiqueta}
          placeholder={c.placeholder}
          valor={valores[c.k]}
          autoFocus={Boolean(solo) && i === 0}
          sugerencias={db.dispositivo.historialLote[c.k]}
          error={errores[c.k]}
          onCambiar={(v) => {
            setValores((s) => ({ ...s, [c.k]: v }))
            setErrores((s) => ({ ...s, [c.k]: undefined }))
          }}
        />
      ))}
      <div className="flex gap-2">
        {onCancelar && (
          <Button type="button" variant="outline" size="lg" className="h-12 flex-1" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
        <Button type="submit" size="lg" className="h-12 flex-1 text-base">
          {textoBoton}
        </Button>
      </div>
    </form>
  )
}

function c0(o: object) {
  return Object.values(o).some(Boolean)
}

export function recordarLote(historial: { jornada: string[]; colegio: string[]; ciudad: string[] }, l: Lote) {
  for (const k of ['jornada', 'colegio', 'ciudad'] as const) {
    if (!historial[k].some((v) => v.toLowerCase() === l[k].toLowerCase())) historial[k].unshift(l[k])
  }
}
