'use client'

import { FlaskConical, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cerrarSesionApp, cerrarSesionWeb, nombreSesionApp, nombreSesionWeb } from '@/lib/lg/sesion'
import { useLG } from '@/lib/lg/store'
import type { DB } from '@/lib/lg/types'
import { cn } from '@/lib/utils'
import { Interruptor, Modal, Selector } from './ui'

export function DemoControls({ ambito }: { ambito: 'app' | 'web' | 'inicio' }) {
  const { db, mutate, restablecer } = useLG()
  const [abierto, setAbierto] = useState(false)
  const [confirmar, setConfirmar] = useState(false)

  const alternarCrm = () => {
    const caido = !db.demo.crmCaido
    mutate(
      (d: DB) => {
        d.demo.crmCaido = caido
        if (caido) {
          d.crm.estado = 'Con error'
          d.crm.causa = 'Credenciales vencidas: el CRM rechazó la autenticación'
          d.crm.ultimaVerificacion = Date.now()
          d.alertas.unshift({ id: crypto.randomUUID(), fecha: Date.now(), texto: 'Fallo de integración con el CRM: credenciales vencidas', tipo: 'error' })
        }
      },
      caido ? [{ usuario: 'Sistema', tipo: 'Fallo de integración con el CRM', detalle: 'Credenciales vencidas' }] : [],
    )
  }

  const simularInactividad = () => {
    if (ambito === 'app' && db.sesionApp) {
      const nombre = nombreSesionApp(db)
      mutate((d) => cerrarSesionApp(d, 'inactividad'), [
        { usuario: nombre, tipo: 'Cierre de sesión por inactividad', detalle: 'App móvil' },
      ])
    } else if (ambito === 'web' && db.sesionWeb) {
      const nombre = nombreSesionWeb(db)
      mutate((d) => cerrarSesionWeb(d, 'inactividad'), [
        { usuario: nombre, tipo: 'Cierre de sesión por inactividad', detalle: 'Plataforma web' },
      ])
    }
  }

  return (
    <div className={cn('fixed right-3 z-50 print:hidden', ambito === 'app' ? 'top-0 right-14 md:right-3 md:top-auto md:bottom-4' : 'bottom-4')}>
      {abierto ? (
        <div className="w-72 rounded-xl border bg-card p-4 text-card-foreground shadow-2xl" role="region" aria-label="Controles de demo">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <FlaskConical className="size-4 text-primary" aria-hidden="true" />
              Controles de demo
            </p>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar controles de demo" className="rounded p-1 hover:bg-muted">
              <X className="size-4" />
            </button>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span>{db.demo.online ? 'Con conexión' : 'Sin conexión'}</span>
              <Interruptor etiqueta="Conexión a internet" activo={db.demo.online} onCambiar={(v) => mutate((d) => { d.demo.online = v })} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Simular fallo de carga</span>
              <Interruptor etiqueta="Simular fallo de carga" activo={db.demo.falloCarga} onCambiar={(v) => mutate((d) => { d.demo.falloCarga = v })} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Simular caída del CRM</span>
              <Interruptor etiqueta="Simular caída del CRM" activo={db.demo.crmCaido} onCambiar={alternarCrm} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="demo-calidad" className="text-xs font-medium text-muted-foreground">
                Calidad de la próxima foto
              </label>
              <Selector
                id="demo-calidad"
                value={db.demo.calidad}
                onChange={(e) => mutate((d) => { d.demo.calidad = e.target.value as DB['demo']['calidad'] })}
              >
                <option value="auto">Automática (casi siempre buena)</option>
                <option value="buena">Forzar buena</option>
                <option value="borrosa">Forzar: borrosa</option>
                <option value="poca luz">Forzar: poca luz</option>
                <option value="incompleta">Forzar: incompleta</option>
                <option value="reflejos">Forzar: reflejos</option>
              </Selector>
            </div>
            <Button variant="outline" size="lg" onClick={simularInactividad} disabled={ambito === 'inicio'}>
              Simular inactividad
            </Button>
            <Button variant="destructive" size="lg" onClick={() => setConfirmar(true)}>
              <RotateCcw /> Restablecer datos
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="lg"
          onClick={() => setAbierto(true)}
          className={cn(
            'h-11 rounded-full px-4 shadow-lg',
            ambito === 'app' && 'max-md:h-7 max-md:bg-amber-400 max-md:px-3 max-md:text-xs max-md:text-slate-950 max-md:shadow-none max-md:hover:bg-amber-300',
          )}
        >
          <FlaskConical /> Demo
        </Button>
      )}
      <Modal
        abierto={confirmar}
        onCerrar={() => setConfirmar(false)}
        titulo="Restablecer datos de demostración"
        descripcion="Se borran los cambios y se vuelven a cargar los registros de ejemplo. Se cerrarán todas las sesiones."
        pie={
          <>
            <Button variant="outline" size="lg" onClick={() => setConfirmar(false)}>Cancelar</Button>
            <Button size="lg" onClick={() => { restablecer(); setConfirmar(false); setAbierto(false) }}>Restablecer</Button>
          </>
        }
      />
    </div>
  )
}
