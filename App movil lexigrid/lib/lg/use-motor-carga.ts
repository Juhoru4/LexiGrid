'use client'

import { useEffect, useRef } from 'react'
import { generarCamposOCR } from './seed'
import { useLG } from './store'
import type { DB, Registro } from './types'

const CAUSAS_FALLO = [
  'Tiempo agotado: el servidor tardó demasiado en responder',
  'Error del servidor (500): no se pudo recibir la foto',
]

export function useMotorCarga() {
  const { db, mutate } = useLG()
  const ref = useRef<DB>(db)
  ref.current = db

  useEffect(() => {
    const t = setInterval(() => {
      const d = ref.current
      if (!d.sesionApp) return
      const ahora = Date.now()
      const cola = d.dispositivo.cola
      const viejas = cola.filter((c) => c.estado === 'Subida' && ahora - (c.subidaEn ?? 0) > 2500)
      const subiendo = cola.find((c) => c.estado === 'Subiendo')
      const usuario = d.usuarios.find((u) => u.id === d.sesionApp?.usuarioId)?.nombre ?? 'Embajador'

      if (!d.demo.online) {
        if (subiendo) {
          mutate((dd) => {
            const it = dd.dispositivo.cola.find((c) => c.id === subiendo.id)
            if (it) {
              it.estado = 'Error'
              it.error = 'Sin conexión: se perdió la red durante la carga'
            }
            dd.notificacionApp = { id: crypto.randomUUID(), tipo: 'error', texto: 'Sin conexión: se perdió la red durante la carga' }
          })
        } else if (viejas.length) {
          mutate((dd) => {
            dd.dispositivo.cola = dd.dispositivo.cola.filter((c) => !viejas.some((v) => v.id === c.id))
          })
        }
        return
      }

      if (subiendo) {
        const progreso = subiendo.progreso + 25
        if (progreso < 100) {
          mutate((dd) => {
            const it = dd.dispositivo.cola.find((c) => c.id === subiendo.id)
            if (it) it.progreso = progreso
          })
        } else if (d.demo.falloCarga) {
          const causa = CAUSAS_FALLO[Math.floor(Math.random() * CAUSAS_FALLO.length)]
          mutate(
            (dd) => {
              const it = dd.dispositivo.cola.find((c) => c.id === subiendo.id)
              if (it) {
                it.estado = 'Error'
                it.error = causa
                it.progreso = 0
              }
              dd.notificacionApp = { id: crypto.randomUUID(), tipo: 'error', texto: causa }
            },
            [{ usuario, tipo: 'Error de carga de formulario', registro: subiendo.id, detalle: causa }],
          )
        } else {
          const nuevo: Registro = {
            id: subiendo.id,
            embajador: usuario,
            dispositivo: d.dispositivo.id,
            jornada: subiendo.jornada,
            colegio: subiendo.colegio,
            ciudad: subiendo.ciudad,
            capturadoEn: subiendo.capturadoEn,
            campos: generarCamposOCR(d.registros.length + 50),
            procesando: true,
            procesarEn: ahora + 5000,
            imagen: 'conservada',
            papelera: null,
            dupResueltos: [],
            envio: { estado: 'Pendiente de envío' },
            bloqueo: null,
            comentarios: [],
            historial: [],
          }
          mutate(
            (dd) => {
              const it = dd.dispositivo.cola.find((c) => c.id === subiendo.id)
              if (!it) return
              it.estado = 'Subida'
              it.progreso = 100
              it.subidaEn = ahora
              if (!dd.registros.some((r) => r.id === nuevo.id)) dd.registros.push(nuevo)
              const restantes = dd.dispositivo.cola.filter(
                (c) => c.id !== it.id && c.jornada === it.jornada && c.colegio === it.colegio && c.estado !== 'Subida',
              )
              if (!restantes.length) {
                dd.notificacionApp = {
                  id: crypto.randomUUID(),
                  tipo: 'exito',
                  texto: `Se subieron todas las fotos de ${it.jornada} · ${it.colegio}`,
                }
              }
            },
            [{ usuario, tipo: 'Carga de formulario', registro: subiendo.id, detalle: `${subiendo.jornada} · ${subiendo.colegio}` }],
          )
        }
        return
      }

      const pendiente = cola.find((c) => c.estado === 'Pendiente')
      if (pendiente) {
        mutate((dd) => {
          const it = dd.dispositivo.cola.find((c) => c.id === pendiente.id)
          if (it) {
            it.estado = 'Subiendo'
            it.progreso = 0
            it.error = undefined
          }
        })
      } else if (viejas.length) {
        mutate((dd) => {
          dd.dispositivo.cola = dd.dispositivo.cola.filter((c) => !viejas.some((v) => v.id === c.id))
        })
      }
    }, 400)
    return () => clearInterval(t)
  }, [mutate])
}
