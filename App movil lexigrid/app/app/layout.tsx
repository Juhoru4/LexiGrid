'use client'

import { Camera, CheckCircle2, History, ListOrdered, User, WifiOff, XCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DemoControls } from '@/components/lg/demo-controls'
import { cerrarSesionApp, nombreSesionApp } from '@/lib/lg/sesion'
import { useLG } from '@/lib/lg/store'
import { useInactividad } from '@/lib/lg/use-inactividad'
import { useMotorCarga } from '@/lib/lg/use-motor-carga'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/app/capturar', label: 'Capturar', icono: Camera },
  { href: '/app/cola', label: 'Cola', icono: ListOrdered },
  { href: '/app/historial', label: 'Historial', icono: History },
  { href: '/app/perfil', label: 'Perfil', icono: User },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { db, mutate } = useLG()
  const pathname = usePathname()
  const router = useRouter()
  const enLogin = pathname === '/app/login'
  const conSesion = Boolean(db.sesionApp)

  useMotorCarga()

  useEffect(() => {
    if (!conSesion && !enLogin) router.replace('/app/login')
    if (conSesion && (enLogin || pathname === '/app')) router.replace('/app/capturar')
  }, [conSesion, enLogin, pathname, router])

  useInactividad({
    activo: conSesion,
    minutos: db.config.inactividadMin,
    onCierre: () => {
      const nombre = nombreSesionApp(db)
      mutate((d) => cerrarSesionApp(d, 'inactividad'), [
        { usuario: nombre, tipo: 'Cierre de sesión por inactividad', detalle: 'App móvil' },
      ])
    },
  })

  const noti = db.notificacionApp
  useEffect(() => {
    if (noti?.tipo !== 'exito') return
    const t = setTimeout(() => mutate((d) => { d.notificacionApp = null }), 4500)
    return () => clearTimeout(t)
  }, [noti, mutate])

  const pendientes = db.dispositivo.cola.filter((c) => c.estado !== 'Subida').length

  return (
    <div className="min-h-dvh bg-slate-200 md:flex md:items-center md:justify-center md:py-4">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background [transform:translateZ(0)] md:h-[844px] md:max-h-[calc(100dvh-2rem)] md:w-[390px] md:rounded-[2.75rem] md:border-[10px] md:border-slate-900 md:shadow-2xl">
        <div className="flex h-7 shrink-0 items-center justify-between bg-primary px-6 text-[11px] font-medium text-primary-foreground" aria-hidden="true">
          <span>LexiGrid</span>
          <span>{db.demo.online ? '4G' : 'Sin red'}</span>
        </div>
        {!db.demo.online && (
          <div role="status" className="flex shrink-0 items-start gap-2 bg-slate-800 px-4 py-2 text-xs text-white">
            <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>Sin conexión: las fotos se guardan cifradas en el dispositivo</span>
          </div>
        )}
        {noti && (
          <div
            role={noti.tipo === 'error' ? 'alert' : 'status'}
            className={cn(
              'mx-3 mt-2 flex shrink-0 items-start gap-2 rounded-xl border p-3 text-sm shadow-sm',
              noti.tipo === 'error' ? 'border-red-300 bg-red-50 text-red-900' : 'border-emerald-300 bg-emerald-50 text-emerald-900',
            )}
          >
            {noti.tipo === 'error' ? <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
            <div className="flex-1">
              <p className="font-medium">{noti.tipo === 'error' ? 'Falló la carga' : 'Carga completa'}</p>
              <p>{noti.texto}</p>
              {noti.tipo === 'error' && (
                <button
                  type="button"
                  className="mt-2 min-h-11 rounded-lg bg-red-700 px-4 font-medium text-white"
                  onClick={() =>
                    mutate(
                      (d) => {
                        for (const c of d.dispositivo.cola) if (c.estado === 'Error') { c.estado = 'Pendiente'; c.error = undefined }
                        d.notificacionApp = null
                      },
                      [{ usuario: nombreSesionApp(db), tipo: 'Reintento de carga', detalle: 'Reintentar ahora desde la alerta' }],
                    )
                  }
                >
                  Reintentar ahora
                </button>
              )}
            </div>
            <button type="button" className="rounded p-1 text-xs underline" onClick={() => mutate((d) => { d.notificacionApp = null })}>
              Cerrar
            </button>
          </div>
        )}
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
        {conSesion && !enLogin && (
          <nav aria-label="Navegación principal" className="grid shrink-0 grid-cols-4 border-t bg-card pb-[env(safe-area-inset-bottom)]">
            {TABS.map(({ href, label, icono: Icono }) => {
              const activo = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={activo ? 'page' : undefined}
                  className={cn(
                    'relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium focus-visible:bg-muted focus-visible:outline-none',
                    activo ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <Icono className="size-5" aria-hidden="true" />
                  {label}
                  {href === '/app/cola' && pendientes > 0 && (
                    <span className="absolute right-[22%] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                      {pendientes}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        )}
      </div>
      <DemoControls ambito="app" />
    </div>
  )
}
