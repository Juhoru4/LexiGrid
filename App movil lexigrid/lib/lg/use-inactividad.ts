'use client'

import { useEffect, useRef, useState } from 'react'

interface Opciones {
  activo: boolean
  minutos: number
  avisoSegundos?: number
  onCierre: () => void
}

export function useInactividad({ activo, minutos, avisoSegundos = 0, onCierre }: Opciones) {
  const ultima = useRef(Date.now())
  const cierreRef = useRef(onCierre)
  cierreRef.current = onCierre
  const [restante, setRestante] = useState<number | null>(null)

  useEffect(() => {
    if (!activo) return
    ultima.current = Date.now()
    const marcar = () => {
      ultima.current = Date.now()
    }
    const eventos = ['pointerdown', 'keydown', 'wheel', 'touchstart']
    eventos.forEach((e) => window.addEventListener(e, marcar, { passive: true }))
    const t = setInterval(() => {
      const limite = minutos * 60_000
      const transcurrido = Date.now() - ultima.current
      if (transcurrido >= limite) {
        setRestante(null)
        cierreRef.current()
      } else if (avisoSegundos && transcurrido >= limite - avisoSegundos * 1000) {
        setRestante(limite - transcurrido)
      } else {
        setRestante(null)
      }
    }, 1000)
    return () => {
      eventos.forEach((e) => window.removeEventListener(e, marcar))
      clearInterval(t)
    }
  }, [activo, minutos, avisoSegundos])

  return {
    restante,
    seguir: () => {
      ultima.current = Date.now()
      setRestante(null)
    },
  }
}
