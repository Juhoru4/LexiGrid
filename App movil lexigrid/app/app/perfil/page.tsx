'use client'

import { LogOut, Smartphone, User } from 'lucide-react'
import { useState } from 'react'
import { Aviso, Modal, Tarjeta } from '@/components/lg/ui'
import { Button } from '@/components/ui/button'
import { cerrarSesionApp } from '@/lib/lg/sesion'
import { useLG, useUsuarioApp } from '@/lib/lg/store'
import { fmtFechaHora } from '@/lib/lg/utils'

export default function Perfil() {
  const { db, mutate } = useLG()
  const usuario = useUsuarioApp()
  const [confirmar, setConfirmar] = useState(false)
  const pendientes = db.dispositivo.cola.filter((c) => c.estado !== 'Subida').length

  const salir = () =>
    mutate((d) => cerrarSesionApp(d), [{ usuario: usuario?.nombre ?? 'Embajador', tipo: 'Cierre de sesión', detalle: 'App móvil' }])

  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      <h1 className="text-xl font-semibold tracking-tight">Perfil</h1>
      <Tarjeta className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
            <User className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold">{usuario?.nombre}</p>
            <p className="text-sm text-muted-foreground">Perfil operativo</p>
          </div>
        </div>
        <dl className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Smartphone className="size-4 text-muted-foreground" aria-hidden="true" />
            <dt className="sr-only">Dispositivo</dt>
            <dd>{db.dispositivo.id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Sesión iniciada</dt>
            <dd>{fmtFechaHora(db.sesionApp?.desde)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Cierre por inactividad</dt>
            <dd>{db.config.inactividadMin} min</dd>
          </div>
        </dl>
      </Tarjeta>
      <Button variant="outline" size="lg" className="h-12 text-base" onClick={() => (pendientes ? setConfirmar(true) : salir())}>
        <LogOut /> Cerrar sesión
      </Button>
      <Modal
        abierto={confirmar}
        onCerrar={() => setConfirmar(false)}
        titulo="¿Cerrar sesión?"
        pie={
          <>
            <Button variant="outline" size="lg" onClick={() => setConfirmar(false)}>Cancelar</Button>
            <Button size="lg" onClick={salir}>Cerrar sesión</Button>
          </>
        }
      >
        <Aviso tono="amarillo">
          Tienes {pendientes} {pendientes === 1 ? 'foto pendiente' : 'fotos pendientes'}. Quedan guardadas cifradas en el dispositivo y se subirán en tu próximo ingreso.
        </Aviso>
      </Modal>
    </div>
  )
}
