import type { DB } from './types'

export function cerrarSesionApp(d: DB, motivo?: string) {
  const u = d.usuarios.find((x) => x.id === d.sesionApp?.usuarioId)
  if (u) u.sesionDispositivo = null
  d.sesionApp = null
  d.cierre.app = motivo
}

export function cerrarSesionWeb(d: DB, motivo?: string) {
  const u = d.usuarios.find((x) => x.id === d.sesionWeb?.usuarioId)
  if (u) {
    for (const r of d.registros) if (r.bloqueo?.usuario === u.nombre) r.bloqueo = null
  }
  d.sesionWeb = null
  d.cierre.web = motivo
}

export function nombreSesionApp(d: DB) {
  return d.usuarios.find((x) => x.id === d.sesionApp?.usuarioId)?.nombre ?? 'Embajador'
}

export function nombreSesionWeb(d: DB) {
  return d.usuarios.find((x) => x.id === d.sesionWeb?.usuarioId)?.nombre ?? 'Usuario'
}
