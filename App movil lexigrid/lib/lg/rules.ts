import type { Auditoria, DB, EstadoRevision, FieldKey, Prioridad, Registro } from './types'
import { DIA, ORDEN_CAMPOS, uuid, validarFormato } from './utils'

export const PLAZO_PAPELERA_DIAS = 30

export function estadoRevision(r: Registro): EstadoRevision {
  if (r.procesando) return 'En procesamiento'
  const pendientes = ORDEN_CAMPOS.some((k) => r.campos[k].estado === 'Por revisar')
  if (pendientes || r.revisionPendiente) return 'Por revisar'
  const manual = ORDEN_CAMPOS.some((k) => r.campos[k].estado === 'Revisado manualmente')
  return manual ? 'Revisado' : 'Verificado'
}

export function camposPendientes(r: Registro) {
  return ORDEN_CAMPOS.filter((k) => r.campos[k].estado === 'Por revisar').length
}

export function camposDiligenciados(r: Registro) {
  return ORDEN_CAMPOS.filter((k) => r.campos[k].valor.trim() !== '').length
}

export function fueEnviado(r: Registro) {
  return Boolean(r.envio.crmId)
}

const valido = (r: Registro, k: FieldKey) => {
  const c = r.campos[k]
  return c.valor.trim() !== '' && c.estado !== 'Por revisar' && !validarFormato(k, c.valor)
}

export function sinCanales(r: Registro) {
  const c = r.campos
  return (
    !c.celular.valor.trim() &&
    !c.celularAcudiente.valor.trim() &&
    !c.correo.valor.trim() &&
    c.celular.estado !== 'Por revisar' &&
    c.celularAcudiente.estado !== 'Por revisar' &&
    c.correo.estado !== 'Por revisar'
  )
}

export function firmaContacto(r: Registro) {
  return [r.campos.celular.valor, r.campos.celularAcudiente.valor, r.campos.correo.valor].join('|')
}

export function prioridad(r: Registro): Prioridad | null {
  if (r.papelera || r.procesando) return null
  const c = r.campos
  const claves: FieldKey[] = ['grado', 'celular', 'celularAcudiente', 'correo', 'carreras']
  if (claves.some((k) => c[k].estado === 'Por revisar')) return 'Pendiente de prioridad'
  const celular = valido(r, 'celular') || valido(r, 'celularAcudiente')
  const correo = valido(r, 'correo')
  const completo = celular && correo
  const carrera = c.carreras.valor.trim() !== ''
  const alto = c.grado.valor === '11' || c.grado.valor === 'Graduado'
  if (alto) return completo && carrera ? 'Alta' : 'Media'
  return completo ? 'Media' : 'Baja'
}

const PESO: Record<string, number> = { Alta: 0, Media: 1, Baja: 2, 'Pendiente de prioridad': 3 }

export function ordenarPorPrioridad(a: Registro, b: Registro) {
  const pa = PESO[prioridad(a) ?? 'Pendiente de prioridad']
  const pb = PESO[prioridad(b) ?? 'Pendiente de prioridad']
  if (pa !== pb) return pa - pb
  const da = camposDiligenciados(a)
  const dbb = camposDiligenciados(b)
  if (da !== dbb) return dbb - da
  return b.capturadoEn - a.capturadoEn
}

export interface InfoDuplicado {
  casoId: string
  rol: 'nuevo' | 'anterior'
  miembros: string[]
  coincidencias: { a: string; b: string; campo: 'documento' | 'correo'; valor: string }[]
}

export function detectarDuplicados(registros: Registro[]) {
  const candidatos = registros.filter((r) => !r.papelera && !r.purgado && !r.procesando)
  const padre = new Map<string, string>()
  const find = (x: string): string => {
    const p = padre.get(x) ?? x
    if (p === x) return x
    const raiz = find(p)
    padre.set(x, raiz)
    return raiz
  }
  const union = (a: string, b: string) => padre.set(find(a), find(b))
  const indice = new Map<string, Registro[]>()
  for (const r of candidatos) {
    padre.set(r.id, r.id)
    const doc = r.campos.documento
    if (doc.valor.trim() && doc.estado !== 'Por revisar') {
      const k = 'documento:' + doc.valor.trim()
      indice.set(k, [...(indice.get(k) ?? []), r])
    }
    const mail = r.campos.correo
    if (mail.valor.trim() && mail.estado !== 'Por revisar') {
      const k = 'correo:' + mail.valor.trim().toLowerCase()
      indice.set(k, [...(indice.get(k) ?? []), r])
    }
  }
  const aristas: InfoDuplicado['coincidencias'] = []
  for (const [k, lista] of indice) {
    if (lista.length < 2) continue
    const corte = k.indexOf(':')
    const campo = k.slice(0, corte) as 'documento' | 'correo'
    const valor = k.slice(corte + 1)
    for (let i = 0; i < lista.length; i++) {
      for (let j = i + 1; j < lista.length; j++) {
        const a = lista[i]
        const b = lista[j]
        if (a.dupResueltos.includes(b.id) || b.dupResueltos.includes(a.id)) continue
        union(a.id, b.id)
        aristas.push({ a: a.id, b: b.id, campo, valor })
      }
    }
  }
  const grupos = new Map<string, string[]>()
  for (const r of candidatos) {
    const raiz = find(r.id)
    grupos.set(raiz, [...(grupos.get(raiz) ?? []), r.id])
  }
  const porId = new Map(candidatos.map((r) => [r.id, r]))
  const resultado = new Map<string, InfoDuplicado>()
  for (const miembros of grupos.values()) {
    if (miembros.length < 2) continue
    const ordenados = [...miembros].sort(
      (x, y) => porId.get(x)!.capturadoEn - porId.get(y)!.capturadoEn,
    )
    const casoId = 'caso-' + ordenados[0].slice(0, 8)
    const coincidencias = aristas.filter((e) => miembros.includes(e.a))
    ordenados.forEach((id, i) => {
      resultado.set(id, {
        casoId,
        rol: i === 0 ? 'anterior' : 'nuevo',
        miembros: ordenados,
        coincidencias,
      })
    })
  }
  return resultado
}

export function esElegibleLote(r: Registro, dups: Map<string, InfoDuplicado>) {
  const estado = estadoRevision(r)
  return (
    !r.papelera &&
    !r.purgado &&
    !fueEnviado(r) &&
    (estado === 'Verificado' || estado === 'Revisado') &&
    dups.get(r.id)?.rol !== 'nuevo' &&
    r.campos.autorizacion.valor === 'Sí'
  )
}

export function normalizarDB(db: DB, ahora = Date.now()): Auditoria[] {
  const logs: Auditoria[] = []
  const sistema = (tipo: string, registro: string, detalle?: string) =>
    logs.push({ id: uuid(), fecha: ahora, usuario: 'Sistema', tipo, registro, detalle })

  for (const r of db.registros) {
    if (r.purgado || r.procesando) continue
    const c = r.campos
    if (
      c.celular.estado !== 'Por revisar' &&
      c.celularAcudiente.estado !== 'Por revisar' &&
      c.celular.valor.trim() &&
      c.celular.valor.trim() === c.celularAcudiente.valor.trim()
    ) {
      c.celularAcudiente.valor = ''
      sistema('Celular repetido unificado', r.id, 'Celular del acudiente igual al del aspirante: se conservó un solo número')
    }

    if (!r.papelera && sinCanales(r) && r.restauradoFirma !== firmaContacto(r)) {
      r.papelera = { motivo: 'Incontactable', fecha: ahora }
      r.bloqueo = null
      sistema('Movimiento automático a papelera', r.id, 'Incontactable (sin canal de contacto)')
    } else if (r.papelera?.motivo === 'Incontactable' && !sinCanales(r) && firmaContacto(r) !== '||') {
      r.papelera = null
      if (fueEnviado(r)) r.envio = { ...r.envio, estado: 'Pendiente de actualización' }
      sistema('Recuperación automática', r.id, 'Se registró un canal de contacto: vuelve a la fila')
    }

    if (r.papelera && ahora - r.papelera.fecha > PLAZO_PAPELERA_DIAS * DIA) {
      r.purgado = true
      r.purgadoEn = ahora
      r.imagen = 'eliminada-plazo'
      for (const k of ORDEN_CAMPOS) r.campos[k] = { valor: '', estado: 'Verificado' }
      r.comentarios = []
      r.historial = []
      sistema('Purga definitiva', r.id, 'Cumplió 30 días en papelera: registro e imagen eliminados')
    }

    if (
      r.imagen === 'conservada' &&
      r.enviadoEn &&
      ahora - r.enviadoEn > (r.retencionDias ?? db.config.retencionDias) * DIA
    ) {
      r.imagen = 'eliminada-plazo'
      sistema('Eliminación de imagen', r.id, 'Plazo de retención cumplido tras el envío al CRM')
    }
  }
  return logs
}
