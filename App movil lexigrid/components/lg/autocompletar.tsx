'use client'

import { useId, useState } from 'react'
import { contiene } from '@/lib/lg/utils'
import { Entrada, Etiqueta } from './ui'

export function Autocompletar({
  etiqueta,
  valor,
  onCambiar,
  sugerencias,
  error,
  placeholder,
  autoFocus,
}: {
  etiqueta: string
  valor: string
  onCambiar: (v: string) => void
  sugerencias: string[]
  error?: string
  placeholder?: string
  autoFocus?: boolean
}) {
  const id = useId()
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(-1)
  const filtradas = sugerencias
    .filter((s) => (valor ? contiene(s, valor) : true) && s !== valor)
    .slice(0, 5)
  const mostrar = abierto && filtradas.length > 0

  return (
    <div className="relative flex flex-col gap-1.5">
      <Etiqueta htmlFor={id}>{etiqueta}</Etiqueta>
      <Entrada
        id={id}
        value={valor}
        autoFocus={autoFocus}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={mostrar}
        aria-controls={`${id}-lista`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-11 text-base"
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        onChange={(e) => {
          onCambiar(e.target.value)
          setAbierto(true)
          setActivo(-1)
        }}
        onKeyDown={(e) => {
          if (!mostrar) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActivo((a) => Math.min(a + 1, filtradas.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActivo((a) => Math.max(a - 1, 0))
          } else if (e.key === 'Enter' && activo >= 0) {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            e.preventDefault()
            onCambiar(filtradas[activo])
            setAbierto(false)
          } else if (e.key === 'Escape') {
            setAbierto(false)
          }
        }}
      />
      {mostrar && (
        <ul id={`${id}-lista`} role="listbox" className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border bg-popover shadow-lg">
          {filtradas.map((s, i) => (
            <li key={s} role="option" aria-selected={i === activo}>
              <button
                type="button"
                className={`flex min-h-11 w-full items-center px-3 text-left text-sm hover:bg-muted ${i === activo ? 'bg-muted' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onCambiar(s)
                  setAbierto(false)
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
