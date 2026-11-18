import { DAY, MIN, uid } from './format'
import { crmIdFor, FIELD_LABELS } from './rules'
import {
  TRASH_DUPLICATE,
  TRASH_INCONTACTABLE,
  type AppState,
  type Field,
  type FieldKey,
  type HistoryEntry,
  type HistoryType,
  type LexRecord,
} from './types'

export const ME = 'Laura Mejía'
export const OTHER_ANALYST = 'Camilo Ortiz'

export const JOURNEYS = ['Feria Vocacional Cali 2026', 'Visita Colegio Berchmans', 'Feria Universitaria Palmira', 'Visita Liceo Departamental']
export const SCHOOLS = ['Colegio Santa Librada', 'Liceo Departamental', 'Colegio Berchmans', 'Gimnasio del Pacífico', 'Colegio Bolivariano']

const FIRST = ['Valentina', 'Juan David', 'Mariana', 'Samuel', 'Sofía', 'Nicolás', 'Isabella', 'Tomás', 'Laura', 'Miguel Ángel', 'Gabriela', 'Andrés Felipe', 'Sara', 'Sebastián', 'Manuela', 'Daniela', 'Mateo', 'Ana María', 'Esteban', 'Camila', 'Juliana']
const LAST = ['Rojas', 'Castro', 'Gómez', 'Torres', 'Martínez', 'Cárdenas', 'Ramírez', 'Rodríguez', 'Salazar', 'Pérez', 'Moreno', 'Díaz', 'Burbano', 'López', 'Vargas', 'Quintero', 'Herrera']
const CAREER_POOL = ['Medicina', 'Derecho', 'Ingeniería de Sistemas', 'Psicología', 'Arquitectura', 'Administración de Empresas', 'Comunicación Social', 'Ingeniería Electrónica', 'Contaduría Pública']
const DOMAINS = ['gmail.com', 'hotmail.com', 'outlook.com']
const DEGREES = ['11', '11', '10', '12', 'graduado', '9']

const slug = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '')

const ok = (value: string, photo = value): Field => ({ value, photo, status: 'Verificado', confidence: 100 })
const doubt = (value: string, photo: string, reason: string, confidence: number): Field => ({ value, photo, status: 'Por revisar', reason, confidence })
const manual = (value: string, photo = value): Field => ({ value, photo, status: 'Revisado manualmente', confidence: 100 })

function baseRecord(i: number, now: number): LexRecord {
  const first = FIRST[i % 21]
  const l1 = LAST[(i * 3 + 1) % 17]
  let l2 = LAST[(i * 5 + 4) % 17]
  if (l2 === l1) l2 = LAST[(i * 5 + 5) % 17]
  const name = `${first} ${l1} ${l2}`
  const jIdx = [0, 0, 1, 2, 0, 3, 0, 2, 0, 1][i % 10]
  const school = jIdx === 0 ? [SCHOOLS[0], SCHOOLS[0], SCHOOLS[2]][i % 3] : jIdx === 1 ? SCHOOLS[2] : jIdx === 2 ? [SCHOOLS[4], SCHOOLS[3]][i % 2] : SCHOOLS[1]
  const city = jIdx < 2 ? 'Cali' : jIdx === 2 ? (i % 4 === 0 ? 'Jamundí' : 'Palmira') : ['Jamundí', 'Yumbo', 'Buenaventura'][i % 3]
  const degree = DEGREES[i % 6]
  const c1 = CAREER_POOL[i % 9]
  const c2 = CAREER_POOL[(i + 4) % 9]
  const careers = i % 3 === 0 ? `${c1}; ${c2}` : c1
  const phone = `3${String(10 + ((i * 7) % 80)).padStart(2, '0')}${String(1000000 + ((i * 913571) % 8000000))}`
  const guardianPhone = `3${String(15 + ((i * 11) % 75)).padStart(2, '0')}${String(1000000 + ((i * 457193) % 8000000))}`
  const email = `${slug(first)}.${slug(l1)}${i % 3 === 0 ? i : ''}@${DOMAINS[i % 3]}`
  const document = String(1000000000 + (((i + 3) * 7919317) % 98999999))

  return {
    id: `${(0xa7e2c1b4 + i * 7919).toString(16)}-9f20-4${String(i).padStart(3, '0')}-8d31-${(0x5b3e91c0a000 + i * 131).toString(16)}`,
    journey: JOURNEYS[jIdx],
    school,
    city,
    capturedAt: now - (i * 0.5 + 0.2) * DAY - ((i * 53) % 500) * MIN,
    fields: {
      name: ok(name),
      docType: ok(degree === '9' || degree === '10' ? 'T.I.' : i % 2 ? 'C.C.' : 'T.I.'),
      document: ok(document),
      phone: ok(phone),
      guardianPhone: ok(guardianPhone),
      email: ok(email),
      guardianName: ok(`${FIRST[(i + 7) % 21]} ${l1}`),
      degree: ok(degree),
      calendar: ok(i % 2 ? 'B' : 'A'),
      careers: ok(careers),
      consent: ok('Sí'),
    },
    hadDoubts: false,
    trash: null,
    send: { state: 'Pendiente de envío' },
    lock: null,
    comments: [],
    timeline: [],
  }
}

function set(rec: LexRecord, key: FieldKey, field: Field) {
  rec.fields[key] = field
}

export function buildSeed(now: number): AppState {
  const records: LexRecord[] = Array.from({ length: 42 }, (_, i) => baseRecord(i, now))
  const r = (i: number) => records[i]

  // Por revisar
  set(r(0), 'email', doubt(r(0).fields.email.value.replace('.com', 'com'), r(0).fields.email.value, 'Formato de correo inválido', 100))
  r(0).hadDoubts = true
  set(r(1), 'degree', doubt('11', '11,12', 'Dos casillas marcadas', 100))
  r(1).hadDoubts = true
  r(1).lock = { by: OTHER_ANALYST, since: now - 47 * MIN }
  r(2).hadDoubts = true
  set(r(2), 'name', doubt('Jhon Sebastian Cuarteras Ruiz', 'Jhon Sebastián Cuartas Ruiz', 'Certeza menor al 100 % (87 %)', 87))
  r(3).hadDoubts = true
  set(r(3), 'phone', doubt(r(3).fields.phone.value.slice(0, 9), r(3).fields.phone.value, 'Formato inválido: el celular tiene 9 dígitos', 100))
  r(4).hadDoubts = true
  set(r(4), 'careers', doubt('Medicina', 'Medicina; Derecho', 'Dos casillas marcadas', 100))
  set(r(4), 'email', doubt(r(4).fields.email.value.replace('@', '@@'), r(4).fields.email.value, 'Formato de correo inválido', 100))
  r(5).hadDoubts = true
  set(r(5), 'document', doubt(r(5).fields.document.value.replace('0', 'O'), r(5).fields.document.value, 'Certeza menor al 100 % (92 %)', 92))
  if (!r(5).fields.document.value.includes('O')) set(r(5), 'document', doubt('1OO' + r(5).fields.document.value.slice(3), r(5).fields.document.value, 'Certeza menor al 100 % (92 %)', 92))

  // Revisados manualmente (con foto conservada)
  for (const i of [6, 7, 8, 9, 18, 19, 20, 21]) {
    r(i).hadDoubts = true
    const key: FieldKey = i % 2 ? 'email' : 'phone'
    set(r(i), key, manual(r(i).fields[key].value))
    r(i).fields[key].reason = undefined
    r(i).timeline.push({ id: uid(), user: ME, at: now - (i - 4) * 0.3 * DAY, label: FIELD_LABELS[key], from: `${r(i).fields[key].value}~`, to: r(i).fields[key].value, note: 'Corregido' })
  }

  // Variantes de nombres para "Unificar nombres"
  r(8).school = 'Col. Santa Librada'
  r(9).city = 'cali'
  r(10).city = 'Santiago de Cali'
  r(14).journey = 'Feria vocacional Cali 2026'
  r(12).school = 'Colegio Santa Librada '

  // Trío duplicado por documento (22, 23, 24)
  r(22).capturedAt = now - 1 * DAY
  r(23).capturedAt = now - 6 * DAY
  r(24).capturedAt = now - 9 * DAY
  ;[22, 23, 24].forEach((i) => (r(i).hadDoubts = true))
  r(23).fields.document = ok(r(22).fields.document.value)
  r(24).fields.document = ok(r(22).fields.document.value)
  r(23).fields.name = ok(r(22).fields.name.value)
  r(24).fields.name = ok(r(22).fields.name.value.split(' ').slice(0, 2).join(' '))
  r(24).fields.phone = ok('')
  r(24).fields.guardianName = ok('')
  r(23).fields.email = ok('')
  r(23).journey = JOURNEYS[2]
  r(23).school = SCHOOLS[4]
  r(24).journey = JOURNEYS[3]
  r(24).school = SCHOOLS[1]

  // Duplicado por correo (25, 26)
  r(25).capturedAt = now - 2 * DAY
  r(26).capturedAt = now - 8 * DAY
  r(26).fields.email = ok(r(25).fields.email.value.toUpperCase())
  r(26).fields.name = ok(r(25).fields.name.value)
  r(26).fields.guardianName = ok(r(25).fields.guardianName.value)
  r(26).fields.careers = ok('Psicología')
  r(26).journey = r(25).journey
  r(26).school = r(25).school
  r(26).hadDoubts = r(25).hadDoubts = true

  // Duplicado contra un registro ya Enviado (27 nuevo, 28 enviado)
  r(27).capturedAt = now - 0.6 * DAY
  r(28).capturedAt = now - 11 * DAY
  r(27).fields.document = ok(r(28).fields.document.value)
  r(27).fields.name = ok(r(28).fields.name.value)
  r(27).fields.phone = ok('3187654321')
  r(28).hadDoubts = true
  r(28).send = { state: 'Enviado', at: now - 3 * DAY, crmId: crmIdFor(r(28).id) }

  // Papelera: incontactables
  ;[29, 30, 31].forEach((i, n) => {
    ;(['phone', 'guardianPhone', 'email'] as FieldKey[]).forEach((k) => set(r(i), k, ok('', '')))
    r(i).trash = { reason: TRASH_INCONTACTABLE, at: now - [2, 15, 27][n] * DAY }
  })
  // Papelera: duplicados
  r(32).fields.document = ok(r(22).fields.document.value)
  r(32).trash = { reason: TRASH_DUPLICATE, at: now - 5 * DAY, ref: r(22).id, refName: r(22).fields.name.value }
  r(33).fields.email = ok(r(25).fields.email.value)
  r(33).trash = { reason: TRASH_DUPLICATE, at: now - 20 * DAY, ref: r(25).id, refName: r(25).fields.name.value }

  // Enviados
  ;[34, 35, 36].forEach((i, n) => {
    r(i).send = { state: 'Enviado', at: now - [3, 5, 12][n] * DAY, crmId: crmIdFor(r(i).id) }
  })
  r(34).hadDoubts = true
  r(36).hadDoubts = true
  r(35).journey = JOURNEYS[0]

  // Error de envío
  r(37).fields.document = manual('')
  r(37).hadDoubts = true
  r(37).send = { state: 'Error de envío', error: 'Campo requerido vacío: Documento', at: now - 1 * DAY }
  r(38).fields.phone = manual('2125551234')
  r(38).hadDoubts = true
  r(38).send = { state: 'Error de envío', error: 'Valor no aceptado: Celular del aspirante (debe iniciar en 3)', at: now - 1 * DAY }

  // Pendiente de actualización
  r(39).send = { state: 'Pendiente de actualización', at: now - 8 * DAY, crmId: crmIdFor(r(39).id) }
  r(39).fields.email = manual(r(39).fields.email.value.replace('@', '.nuevo@'))
  r(39).hadDoubts = true

  // Sin autorización de datos
  r(40).fields.consent = ok('No')

  const history = buildHistory(records, now)
  return { ready: true, records, history, integration: { online: true, error: null, dropNext: false } }
}

function buildHistory(records: LexRecord[], now: number): HistoryEntry[] {
  const pool = records.filter((x) => !x.trash)
  const templates: { type: HistoryType; make: (name: string, i: number) => string }[] = [
    { type: 'Corrección', make: (n) => `Corrigió Correo de ${n}: "…gmailcom" → "…gmail.com"` },
    { type: 'Confirmación', make: (n) => `Confirmó Celular del aspirante de ${n}` },
    { type: 'Comentario', make: (n) => `Comentó en el registro de ${n}: "Llamar en horario de la tarde"` },
    { type: 'Corrección', make: (n) => `Corrigió Grado de ${n}: "11" → "10"` },
    { type: 'Duplicado resuelto', make: (n) => `Resolvió el duplicado de ${n} conservando el registro más reciente` },
    { type: 'Papelera', make: (n) => `Movió a la Papelera a ${n} (Incontactable)` },
    { type: 'Restauración', make: (n) => `Restauró a ${n} desde la Papelera` },
    { type: 'Envío al CRM', make: (n) => `Envió a ${n} al CRM` },
    { type: 'Actualización en CRM', make: (n) => `Actualizó en el CRM el registro de ${n}` },
    { type: 'Unificación de nombres', make: () => 'Unificó "Col. Berchmans" y "Colegio Berchmans"' },
  ]
  const entries: HistoryEntry[] = Array.from({ length: 40 }, (_, i) => {
    const rec = pool[(i * 5) % pool.length]
    const t = templates[(i * 7) % templates.length]
    return {
      id: uid() + i,
      user: ME,
      at: now - (i * 0.55 + 0.05) * DAY - ((i * 37) % 300) * MIN,
      type: t.type,
      detail: t.make(rec.fields.name.value, i),
      recordId: t.type === 'Unificación de nombres' ? undefined : rec.id,
    }
  })
  for (let i = 0; i < 6; i++) {
    entries.push({ id: uid() + 'c' + i, user: OTHER_ANALYST, at: now - (i * 1.3 + 0.4) * DAY, type: 'Corrección', detail: `Corrigió Documento de ${pool[(i * 3) % pool.length].fields.name.value}`, recordId: pool[(i * 3) % pool.length].id })
  }
  return entries.sort((a, b) => b.at - a.at)
}
