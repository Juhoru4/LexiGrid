import { DAY } from './format'
import type { Derived, DupGroup, FieldKey, ImageState, LexRecord, Priority, ReviewState } from './types'

export const FIELD_KEYS: FieldKey[] = ['name', 'docType', 'document', 'phone', 'guardianPhone', 'email', 'guardianName', 'degree', 'calendar', 'careers', 'consent']

export const FIELD_LABELS: Record<FieldKey, string> = {
  name: 'Nombre y apellidos',
  docType: 'Tipo de documento',
  document: 'Documento',
  phone: 'Celular del aspirante',
  guardianPhone: 'Celular del acudiente',
  email: 'Correo',
  guardianName: 'Nombre del acudiente',
  degree: 'Grado',
  calendar: 'Calendario',
  careers: 'Carreras de interés',
  consent: 'Autorización de datos',
}

export const OPTIONS: Partial<Record<FieldKey, string[]>> = {
  docType: ['T.I.', 'C.C.'],
  degree: ['9', '10', '11', '12', 'graduado'],
  calendar: ['A', 'B'],
  consent: ['Sí', 'No'],
}

export const CAREERS = [
  'Medicina',
  'Derecho',
  'Ingeniería de Sistemas',
  'Psicología',
  'Arquitectura',
  'Administración de Empresas',
  'Comunicación Social',
  'Ingeniería Electrónica',
  'Contaduría Pública',
]

export const PRIORITY_RANK: Record<Priority, number> = { Alta: 0, Media: 1, Baja: 2, 'Pendiente de prioridad': 3 }
export const TRASH_DAYS = 30
export const IMAGE_RETENTION_DAYS = 10

export function validate(key: FieldKey, value: string): string | null {
  const v = value.trim()
  if (!v) return null
  switch (key) {
    case 'document':
      return /^\d+$/.test(v) ? null : 'El documento solo admite dígitos.'
    case 'phone':
    case 'guardianPhone':
      return /^\d{10}$/.test(v) ? null : 'El celular debe tener exactamente 10 dígitos.'
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Usa el formato usuario@dominio.com.'
    case 'docType':
    case 'degree':
    case 'calendar':
    case 'consent':
      return OPTIONS[key]!.includes(v) ? null : 'Selecciona una de las opciones disponibles.'
    default:
      return null
  }
}

export const isValid = (key: FieldKey, value: string) => value.trim() !== '' && validate(key, value) === null

export function pendingFields(rec: LexRecord): FieldKey[] {
  return FIELD_KEYS.filter((k) => rec.fields[k].status === 'Por revisar')
}

export function reviewState(rec: LexRecord): ReviewState {
  if (pendingFields(rec).length > 0) return 'Por revisar'
  return FIELD_KEYS.some((k) => rec.fields[k].status === 'Revisado manualmente') ? 'Revisado' : 'Verificado'
}

export function filledCount(rec: LexRecord) {
  return FIELD_KEYS.filter((k) => rec.fields[k].value.trim() !== '').length
}

export function priorityOf(rec: LexRecord): Priority {
  const f = rec.fields
  if ((['degree', 'phone', 'guardianPhone', 'email', 'careers'] as FieldKey[]).some((k) => f[k].status === 'Por revisar')) {
    return 'Pendiente de prioridad'
  }
  const phoneOk = isValid('phone', f.phone.value) || isValid('guardianPhone', f.guardianPhone.value)
  const emailOk = isValid('email', f.email.value)
  const complete = phoneOk && emailOk
  const hasCareer = f.careers.value.trim() !== ''
  const high = f.degree.value === '11' || f.degree.value === 'graduado'
  if (high && complete && hasCareer) return 'Alta'
  if (high || complete) return 'Media'
  return 'Baja'
}

export function imageState(rec: LexRecord, now: number): ImageState {
  if (!rec.hadDoubts) return 'none-certain'
  const sentAt = rec.send.state !== 'Pendiente de envío' && rec.send.state !== 'Error de envío' ? rec.send.at : undefined
  if (sentAt && now - sentAt > IMAGE_RETENTION_DAYS * DAY) return 'expired'
  return 'available'
}

export function duplicateGroups(records: LexRecord[]): DupGroup[] {
  const live = records.filter((r) => !r.trash)
  const parent = new Map<string, string>()
  const find = (x: string): string => {
    let root = x
    while (parent.get(root) !== root) root = parent.get(root)!
    let cur = x
    while (parent.get(cur) !== root) {
      const next = parent.get(cur)!
      parent.set(cur, root)
      cur = next
    }
    return root
  }
  const union = (a: string, b: string) => parent.set(find(a), find(b))
  live.forEach((r) => parent.set(r.id, r.id))

  const byKey = new Map<string, string[]>()
  live.forEach((r) => {
    const doc = r.fields.document
    if (doc.status !== 'Por revisar' && doc.value.trim()) byKey.set(`documento:${doc.value.trim()}`, [...(byKey.get(`documento:${doc.value.trim()}`) ?? []), r.id])
    const mail = r.fields.email
    const m = mail.value.trim().toLowerCase()
    if (mail.status !== 'Por revisar' && m) byKey.set(`correo:${m}`, [...(byKey.get(`correo:${m}`) ?? []), r.id])
  })
  byKey.forEach((ids) => ids.slice(1).forEach((id) => union(ids[0], id)))

  const members = new Map<string, string[]>()
  live.forEach((r) => {
    const root = find(r.id)
    members.set(root, [...(members.get(root) ?? []), r.id])
  })

  const byId = new Map(live.map((r) => [r.id, r]))
  const groups: DupGroup[] = []
  members.forEach((ids) => {
    if (ids.length < 2) return
    const unsent = ids.map((id) => byId.get(id)!).filter((r) => r.send.state !== 'Enviado' && r.send.state !== 'Pendiente de actualización')
    if (unsent.length === 0) return
    const flagged = unsent.sort((a, b) => b.capturedAt - a.capturedAt)[0]
    const matchOn = new Set<'documento' | 'correo'>()
    let matchValue = ''
    byKey.forEach((keyIds, key) => {
      if (keyIds.length > 1 && ids.includes(keyIds[0])) {
        const [kind, value] = [key.slice(0, key.indexOf(':')) as 'documento' | 'correo', key.slice(key.indexOf(':') + 1)]
        matchOn.add(kind)
        if (!matchValue || kind === 'documento') matchValue = value
      }
    })
    const sorted = [...ids].sort((a, b) => byId.get(b)!.capturedAt - byId.get(a)!.capturedAt)
    groups.push({ id: sorted[0], memberIds: sorted, flaggedId: flagged.id, matchOn: [...matchOn], matchValue })
  })
  return groups.sort((a, b) => byId.get(b.flaggedId)!.capturedAt - byId.get(a.flaggedId)!.capturedAt)
}

export function deriveAll(records: LexRecord[], groups: DupGroup[], now: number): Map<string, Derived> {
  const dup = new Map(groups.map((g) => [g.flaggedId, g.id]))
  const map = new Map<string, Derived>()
  records.forEach((r) =>
    map.set(r.id, {
      review: reviewState(r),
      pending: pendingFields(r),
      priority: priorityOf(r),
      duplicate: dup.has(r.id),
      groupId: dup.get(r.id),
      filled: filledCount(r),
      image: imageState(r, now),
      noConsent: r.fields.consent.value === 'No',
    }),
  )
  return map
}

export function compareQueue(a: LexRecord, b: LexRecord, da: Derived, db: Derived) {
  return PRIORITY_RANK[da.priority] - PRIORITY_RANK[db.priority] || db.filled - da.filled || b.capturedAt - a.capturedAt
}

export function hasNoChannel(rec: LexRecord) {
  const f = rec.fields
  return !f.phone.value.trim() && !f.guardianPhone.value.trim() && !f.email.value.trim()
}

export function contactPending(rec: LexRecord) {
  const f = rec.fields
  return f.phone.status === 'Por revisar' || f.guardianPhone.status === 'Por revisar' || f.email.status === 'Por revisar'
}

export function trashDaysLeft(at: number, now: number) {
  return Math.max(0, TRASH_DAYS - Math.floor((now - at) / DAY))
}

export function isSent(rec: LexRecord) {
  return rec.send.state === 'Enviado' || rec.send.state === 'Pendiente de actualización'
}

export function canSend(rec: LexRecord, d: Derived) {
  return !rec.trash && rec.send.state === 'Pendiente de envío' && !d.duplicate && !d.noConsent && d.review !== 'Por revisar'
}

/** Validación que haría el CRM antes de aceptar un registro. */
export function crmValidate(rec: LexRecord): string | null {
  const f = rec.fields
  if (!f.name.value.trim()) return 'Campo requerido vacío: Nombre y apellidos'
  if (!f.document.value.trim()) return 'Campo requerido vacío: Documento'
  if (!f.degree.value.trim()) return 'Campo requerido vacío: Grado'
  if (f.phone.value && !f.phone.value.startsWith('3')) return 'Valor no aceptado: Celular del aspirante (debe iniciar en 3)'
  if (f.guardianPhone.value && !f.guardianPhone.value.startsWith('3')) return 'Valor no aceptado: Celular del acudiente (debe iniciar en 3)'
  return null
}

export function crmIdFor(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return `CRM-${String(h % 1_000_000).padStart(6, '0')}`
}

export function displayPhotoMarks(key: FieldKey, photo: string) {
  if (!OPTIONS[key]) return photo || '(en blanco)'
  const marks = photo.split(',').filter(Boolean)
  if (marks.length === 0) return '(sin casilla marcada)'
  if (marks.length > 1) return `${marks.join(' y ')} (dos casillas marcadas)`
  return marks[0]
}

export function photoMatches(key: FieldKey, value: string, photo: string) {
  if (OPTIONS[key]) {
    const marks = photo.split(',').filter(Boolean)
    return marks.length === 1 && marks[0] === value
  }
  if (key === 'careers') {
    const a = value.split(';').map((s) => s.trim()).filter(Boolean).sort().join('|')
    const b = photo.split(';').map((s) => s.trim()).filter(Boolean).sort().join('|')
    return a === b
  }
  return value.trim() === photo.trim()
}
