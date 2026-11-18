'use client'

import { Eye, EyeOff, Lock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/lg/logo'
import { Aviso, Entrada, Etiqueta, Selector } from '@/components/lg/ui'
import { Button } from '@/components/ui/button'
import { useAhora, useLG } from '@/lib/lg/store'
import { fmtCuenta, MIN } from '@/lib/lg/utils'

export default function LoginApp() {
  const { db, mutate } = useLG()
  const ahora = useAhora()
  const perfiles = db.usuarios.filter((u) => u.perfil === 'Operativo')
  const [usuarioId, setUsuarioId] = useState(perfiles[0]?.id ?? '')
  const [clave, setClave] = useState('')
  const [ver, setVer] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const usuario = db.usuarios.find((u) => u.id === usuarioId)
  const bloqueado = usuario?.bloqueadoHasta && usuario.bloqueadoHasta > ahora ? usuario.bloqueadoHasta : null
  const pendientes = db.dispositivo.cola.filter((c) => c.estado !== 'Subida').length

  const ingresar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuario) return
    setError(null)
    if (!usuario.activo) return setError('Este perfil está inhabilitado. Comunícate con el administrador.')
    if (bloqueado) return
    if (!db.dispositivo.inicializado && !db.demo.online)
      return setError('El primer ingreso en este dispositivo requiere conexión a internet.')
    if (usuario.sesionDispositivo && usuario.sesionDispositivo !== db.dispositivo.id)
      return setError('Este perfil está en uso en otro dispositivo. Cierra la sesión allí o elige otro perfil.')
    if (!clave) return setError('Ingresa la clave del perfil.')
    if (clave !== usuario.clave) {
      const intentos = usuario.intentos + 1
      if (intentos >= 3) {
        mutate(
          (d) => {
            const u = d.usuarios.find((x) => x.id === usuario.id)!
            u.intentos = 0
            u.bloqueadoHasta = Date.now() + 10 * MIN
          },
          [{ usuario: usuario.nombre, tipo: 'Bloqueo por intentos fallidos', detalle: 'App móvil: 3 intentos fallidos, bloqueo de 10 minutos' }],
        )
        setError(null)
      } else {
        mutate((d) => {
          d.usuarios.find((x) => x.id === usuario.id)!.intentos = intentos
        })
        setError(`Clave incorrecta. Te quedan ${3 - intentos} ${3 - intentos === 1 ? 'intento' : 'intentos'}.`)
      }
      setClave('')
      return
    }
    mutate(
      (d) => {
        const u = d.usuarios.find((x) => x.id === usuario.id)!
        u.intentos = 0
        u.bloqueadoHasta = undefined
        u.sesionDispositivo = d.dispositivo.id
        d.dispositivo.inicializado = true
        d.sesionApp = { usuarioId: u.id, desde: Date.now() }
        d.cierre.app = undefined
      },
      [{ usuario: usuario.nombre, tipo: 'Inicio de sesión', detalle: `App móvil · ${db.dispositivo.id}` }],
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-8">
      <div className="flex flex-col items-start gap-4">
        <Logo />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ingreso de embajador</h1>
          <p className="mt-1 text-sm text-muted-foreground">Elige tu perfil e ingresa la clave de la jornada.</p>
        </div>
      </div>

      {db.cierre.app === 'inactividad' && (
        <Aviso tono="amarillo" titulo="Tu sesión se cerró por inactividad">
          Pasaron {db.config.inactividadMin} minutos sin actividad. Las fotos pendientes siguen guardadas en el dispositivo.
        </Aviso>
      )}
      {pendientes > 0 && (
        <Aviso tono="azul" titulo={`${pendientes} ${pendientes === 1 ? 'foto pendiente' : 'fotos pendientes'} en este dispositivo`}>
          Se subirán automáticamente cuando inicies sesión con conexión.
        </Aviso>
      )}

      <form onSubmit={ingresar} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Etiqueta htmlFor="perfil">Perfil</Etiqueta>
          <Selector
            id="perfil"
            className="h-11 text-base"
            value={usuarioId}
            onChange={(e) => {
              setUsuarioId(e.target.value)
              setError(null)
              setClave('')
            }}
          >
            {perfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
                {!p.activo ? ' (inhabilitado)' : ''}
              </option>
            ))}
          </Selector>
        </div>
        <div className="flex flex-col gap-1.5">
          <Etiqueta htmlFor="clave">Clave</Etiqueta>
          <div className="relative">
            <Entrada
              id="clave"
              type={ver ? 'text' : 'password'}
              className="h-11 pr-12 text-base"
              value={clave}
              autoComplete="current-password"
              disabled={Boolean(bloqueado)}
              aria-invalid={Boolean(error)}
              onChange={(e) => setClave(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setVer((v) => !v)}
              className="absolute right-0 top-0 flex size-11 items-center justify-center text-muted-foreground"
              aria-label={ver ? 'Ocultar clave' : 'Mostrar clave'}
            >
              {ver ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>

        {bloqueado && (
          <Aviso tono="rojo" icono={Lock} titulo="Perfil bloqueado temporalmente">
            Se registraron 3 intentos fallidos. Podrás intentar de nuevo en{' '}
            <span className="font-mono font-semibold tabular-nums">{fmtCuenta(bloqueado - ahora)}</span>.
          </Aviso>
        )}
        {error && <Aviso tono="rojo">{error}</Aviso>}

        <Button type="submit" size="lg" className="h-12 text-base" disabled={Boolean(bloqueado)}>
          Ingresar
        </Button>
      </form>

      <p className="mt-auto text-center text-xs text-muted-foreground">
        <Link href="/" className="underline">Volver al selector de perfiles</Link>
      </p>
    </div>
  )
}
