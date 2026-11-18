import type { Campo, DB, FieldKey, MapeoCampo, Registro, Usuario } from './types'
import { CARRERAS, DIA, MIN, uuid, validarFormato } from './utils'

const NOMBRES = [
  'Valentina Ríos Ospina', 'Santiago Mejía Castaño', 'Isabella Cárdenas Paz', 'Juan José Lozano Vélez',
  'Mariana Quintero Rojas', 'Samuel Arango Muñoz', 'Sofía Hurtado Bermúdez', 'Matías Caicedo Rentería',
  'Gabriela Salazar Ortiz', 'Tomás Valencia Gil', 'Luciana Mosquera Angulo', 'Emiliano Patiño Ruiz',
  'Antonella Zapata Díaz', 'Nicolás Ramírez Cuero', 'Daniela Escobar Marín', 'Alejandro Torres Sinisterra',
  'Camila Restrepo Lasso', 'Sebastián Giraldo Mina', 'Manuela Rincón Vivas', 'David Ocampo Banguera',
  'Sara Londoño Pérez', 'Andrés Felipe Gómez Riascos', 'Paula Andrea Moreno Sánchez', 'Felipe Cuéllar Montaño',
  'Laura Sofía Becerra Ibarra', 'Miguel Ángel Rengifo Solís', 'Juliana Prado Velasco', 'Esteban Carabalí Hinestroza',
  'María José Aguirre Lenis', 'Kevin Riascos Obregón', 'Natalia Holguín Tenorio', 'Juan Pablo Murillo Castro',
  'Ana Lucía Viveros Erazo', 'Cristian Andrés Angulo Valencia', 'Valeria Ortega Chará', 'Jerónimo Benítez Arboleda',
  'Salomé Delgado Varela', 'Martín Bonilla Córdoba', 'Mariajosé Lucumí Caicedo', 'Brayan Estupiñán Ruiz',
  'Danna Vásquez Ocoró', 'Simón Peña Grajales',
]
const ACUDIENTES = ['Gloria Ospina', 'Hernán Mejía', 'Patricia Paz', 'Jorge Lozano', 'Luz Marina Rojas', 'Óscar Muñoz', 'Claudia Bermúdez', 'Rubén Rentería']
const GRADOS = ['11', '11', '10', 'Graduado', '9', '11', '12', '10']

export const JORNADAS = [
  'Feria Vocacional Cali 2026',
  'Visita Colegio Berchmans',
  'Feria Universitaria Palmira',
  'Visita Liceo Departamental',
]

export const EMBAJADORES = ['Embajador 1', 'Embajador 2', 'Embajador 3']

const ok = (valor: string): Campo => ({ valor, estado: 'Verificado' })
const revisar = (valor: string, motivo: string): Campo => ({ valor, estado: 'Por revisar', motivo })
const manual = (valor: string): Campo => ({ valor, estado: 'Revisado manualmente' })

function correoDe(nombre: string, i: number) {
  const base = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(' ')
  return `${base[0]}.${base[base.length - 2]}${i}@gmail.com`
}

function camposBase(i: number): Record<FieldKey, Campo> {
  const nombre = NOMBRES[i % NOMBRES.length]
  const grado = GRADOS[i % GRADOS.length]
  return {
    nombre: ok(nombre),
    tipoDoc: ok(grado === 'Graduado' ? 'C.C.' : 'T.I.'),
    documento: ok(String(1006000000 + i * 7919)),
    celular: ok('31' + String(50000000 + i * 104729).slice(0, 8)),
    celularAcudiente: ok(i % 3 === 0 ? '' : '32' + String(10000000 + i * 65537).slice(0, 8)),
    correo: ok(correoDe(nombre, i)),
    acudiente: ok(ACUDIENTES[i % ACUDIENTES.length]),
    grado: ok(grado),
    calendario: ok(i % 4 === 0 ? 'B' : 'A'),
    carreras: ok(i % 5 === 0 ? '' : [CARRERAS[i % CARRERAS.length], ...(i % 2 ? [CARRERAS[(i + 3) % CARRERAS.length]] : [])].join(', ')),
    autorizacion: ok('Sí'),
  }
}

interface Lugar {
  jornada: string
  colegio: string
  ciudad: string
  dias: number
}

const L: Record<string, Lugar> = {
  feriaSL: { jornada: JORNADAS[0], colegio: 'Colegio Santa Librada', ciudad: 'Cali', dias: 9 },
  feriaLD: { jornada: JORNADAS[0], colegio: 'Liceo Departamental', ciudad: 'Cali', dias: 9 },
  feriaGP: { jornada: JORNADAS[0], colegio: 'Gimnasio del Pacífico', ciudad: 'Buenaventura', dias: 9 },
  berch: { jornada: JORNADAS[1], colegio: 'Colegio Berchmans', ciudad: 'Cali', dias: 6 },
  palmNac: { jornada: JORNADAS[2], colegio: 'Colegio Nacional Palmira', ciudad: 'Palmira', dias: 3 },
  palmYum: { jornada: JORNADAS[2], colegio: 'Institución Educativa Yumbo', ciudad: 'Yumbo', dias: 3 },
  liceo: { jornada: JORNADAS[3], colegio: 'Liceo Departamental', ciudad: 'Jamundí', dias: 1 },
}

export function crearRegistro(
  i: number,
  lugar: Lugar,
  ahora: number,
  mod?: (r: Registro) => void,
): Registro {
  const r: Registro = {
    id: uuid(),
    embajador: EMBAJADORES[i % 3],
    dispositivo: i % 3 === 2 ? 'Dispositivo B' : 'Dispositivo A',
    jornada: lugar.jornada,
    colegio: lugar.colegio,
    ciudad: lugar.ciudad,
    capturadoEn: ahora - lugar.dias * DIA + i * 7 * MIN,
    campos: camposBase(i),
    procesando: false,
    imagen: 'no-conservada',
    papelera: null,
    dupResueltos: [],
    envio: { estado: 'Pendiente de envío' },
    bloqueo: null,
    comentarios: [],
    historial: [],
  }
  mod?.(r)
  const tuvoDudas = Object.values(r.campos).some((c) => c.estado !== 'Verificado')
  if (tuvoDudas && r.imagen === 'no-conservada') r.imagen = 'conservada'
  return r
}

function enviar(r: Registro, ahora: number, diasAtras: number, n: number) {
  r.envio = {
    estado: 'Enviado',
    fecha: ahora - diasAtras * DIA,
    crmId: 'CRM-' + String(204310 + n).padStart(7, '0'),
  }
  r.enviadoEn = ahora - diasAtras * DIA
  r.retencionDias = 10
}

export function generarCamposOCR(nombreIdx: number): Record<FieldKey, Campo> {
  const c = camposBase(nombreIdx)
  const dado = () => Math.random()
  if (dado() < 0.35) c.correo = revisar(c.correo.valor.replace('.com', ''), 'Formato de correo inválido')
  if (dado() < 0.25) c.grado = revisar('10, 11', 'Dos casillas marcadas')
  if (dado() < 0.25) c.celular = revisar(c.celular.valor.slice(0, 9), 'Certeza 86 %: el celular tiene 9 dígitos')
  if (dado() < 0.2) c.nombre = revisar(c.nombre.valor, 'Certeza 91 %: letra poco legible')
  if (dado() < 0.15) c.carreras = revisar('', 'Ninguna casilla marcada')
  for (const k of Object.keys(c) as FieldKey[]) {
    const motivo = validarFormato(k, c[k].valor)
    if (motivo && c[k].estado === 'Verificado') c[k] = revisar(c[k].valor, motivo)
  }
  return c
}

export const CAMPOS_CRM = [
  'Nombre_Completo', 'Tipo_Documento', 'Numero_Documento', 'Celular', 'Celular_Acudiente',
  'Correo', 'Nombre_Acudiente', 'Grado', 'Calendario', 'Programas_Interes', 'Autoriza_Datos',
  'Prioridad_Lead', 'Evento', 'Institucion', 'Ciudad', 'Telefono_Fijo', 'Fecha_Nacimiento', 'Origen',
]

function mapeoInicial(): MapeoCampo[] {
  const m = (clave: string, etiqueta: string, campoCrm: string, requerido = false): MapeoCampo => ({
    clave, etiqueta, campoCrm, requerido, siVacio: 'blanco', valorDefecto: '',
  })
  return [
    m('nombre', 'Nombre y apellidos', 'Nombre_Completo', true),
    m('tipoDoc', 'Tipo de documento', 'Tipo_Documento', true),
    m('documento', 'Número de documento', 'Numero_Documento', true),
    m('celular', 'Celular del aspirante', 'Celular'),
    m('celularAcudiente', 'Celular del acudiente', 'Celular_Acudiente'),
    m('correo', 'Correo electrónico', 'Correo'),
    m('acudiente', 'Nombre del acudiente', 'Nombre_Acudiente'),
    m('grado', 'Grado', 'Grado'),
    m('calendario', 'Calendario', 'Calendario'),
    m('carreras', 'Carreras de interés', 'Programas_Interes'),
    m('autorizacion', 'Autorización de tratamiento de datos', 'Autoriza_Datos', true),
    m('prioridad', 'Prioridad', 'Prioridad_Lead'),
    m('jornada', 'Jornada', 'Evento', true),
    m('colegio', 'Colegio', 'Institucion', true),
    m('ciudad', 'Ciudad', 'Ciudad_Residencia'),
  ]
}

function usuariosIniciales(): Usuario[] {
  const emb = (n: number, sesion: string | null = null): Usuario => ({
    id: `emb-${n}`, nombre: `Embajador ${n}`, perfil: 'Operativo', clave: 'Feria2026',
    activo: true, intentos: 0, sesionDispositivo: sesion,
  })
  return [
    emb(1),
    emb(2),
    emb(3, 'Dispositivo B'),
    { id: 'an-1', nombre: 'Carlos Rivera', perfil: 'Analítico', correo: 'carlos.rivera@usbcali.edu.co', clave: 'Analista2026*', activo: true, intentos: 0 },
    { id: 'an-2', nombre: 'Laura Gómez', perfil: 'Analítico', correo: 'laura.gomez@usbcali.edu.co', clave: 'Analista2026*', activo: true, intentos: 0 },
    { id: 'ad-1', nombre: 'Ana Torres', perfil: 'Administrativo', correo: 'ana.torres@usbcali.edu.co', clave: 'Admin2026*Usb', activo: true, intentos: 0 },
  ]
}

export function crearSeed(): DB {
  const ahora = Date.now()
  const R: Registro[] = []
  let i = 0
  const add = (lugar: Lugar, mod?: (r: Registro) => void) => {
    const r = crearRegistro(i++, lugar, ahora, mod)
    R.push(r)
    return r
  }

  // Feria Vocacional Cali 2026 — Santa Librada
  add(L.feriaSL)
  add(L.feriaSL)
  add(L.feriaSL, (r) => { r.campos.correo = revisar('andres.gomez@gmail', 'Formato de correo inválido') })
  add(L.feriaSL, (r) => { r.campos.grado = revisar('10, 11', 'Dos casillas marcadas') })
  add(L.feriaSL, (r) => { r.campos.celular = manual('3156677889') })
  const docEnviado = add(L.feriaSL, (r) => enviar(r, ahora, 7, 1))
  add(L.feriaSL, (r) => {
    r.campos.nombre = manual('Mariana Q. Rojas')
    r.imagen = 'conservada'
    enviar(r, ahora, 4, 2)
  })
  // Col. Santa Librada (variante para unificar nombres)
  add({ ...L.feriaSL, colegio: 'Col. Santa Librada' })
  add({ ...L.feriaSL, colegio: 'Col. Santa Librada' }, (r) => { r.campos.autorizacion = ok('No') })

  // Liceo Departamental (feria)
  add(L.feriaLD)
  add(L.feriaLD, (r) => { r.campos.celular = revisar('31245678', 'Certeza 87 %: el celular tiene 8 dígitos') })
  add(L.feriaLD, (r) => {
    r.campos.nombre = manual('Tomás Valencia Gil')
    r.imagen = 'conservada'
    enviar(r, ahora, 12, 3)
  })
  add(L.feriaLD, (r) => {
    r.forzarErrorCRM = 'Valor no aceptado: el programa "Arquitectura" no existe en el CRM de pruebas'
    r.envio = { estado: 'Error de envío', motivo: r.forzarErrorCRM }
  })

  // Gimnasio del Pacífico
  add(L.feriaGP, (r) => { r.campos.carreras = revisar('', 'Ninguna casilla marcada') })
  add(L.feriaGP)
  add(L.feriaGP, (r) => {
    r.campos.nombre = manual('')
    r.campos.acudiente = manual('Jorge Lozano')
    r.envio = { estado: 'Error de envío', motivo: 'Campo requerido vacío: Nombre y apellidos' }
  })
  add(L.feriaGP, (r) => {
    r.campos.celular = ok('')
    r.campos.celularAcudiente = ok('')
    r.campos.correo = ok('')
    r.papelera = { motivo: 'Incontactable', fecha: ahora - 27 * DIA }
  })

  // Visita Colegio Berchmans
  add(L.berch)
  add(L.berch)
  add(L.berch, (r) => {
    r.campos.correo = revisar('sofia.hurtado@hotmailcom', 'Formato de correo inválido')
    r.campos.grado = revisar('', 'Ninguna casilla marcada')
  })
  add(L.berch, (r) => enviar(r, ahora, 3, 4))
  add(L.berch, (r) => {
    enviar(r, ahora, 5, 5)
    r.envio.estado = 'Pendiente de actualización'
    r.campos.celular = manual('3184455667')
    r.imagen = 'conservada'
  })
  const dupDocA = add(L.berch)
  add(L.berch, (r) => {
    r.campos.celular = ok('3167788990')
    r.campos.celularAcudiente = ok('3167788990')
  })
  add(L.berch, (r) => {
    r.campos.nombre = revisar('Danieia Escobar Marín', 'Certeza 92 %: letra poco legible')
    r.bloqueo = { usuario: 'Laura Gómez', desde: ahora - 18 * MIN }
  })

  // Feria Universitaria Palmira
  add(L.palmNac)
  add(L.palmNac)
  add(L.palmNac, (r) => {
    r.campos.documento = revisar('10O6458821', 'El documento solo admite dígitos')
  })
  add({ ...L.palmNac, ciudad: 'Palmria' })
  add(L.palmYum)
  add(L.palmYum, (r) => {
    r.campos.celular = ok('')
    r.campos.celularAcudiente = ok('')
    r.campos.correo = ok('')
    r.papelera = { motivo: 'Incontactable', fecha: ahora - 5 * DIA }
  })
  const triA = add(L.palmYum)
  add(L.palmYum, (r) => {
    r.campos.documento = ok(dupDocA.campos.documento.valor)
    r.campos.nombre = ok(dupDocA.campos.nombre.valor)
    r.campos.celular = ok('3209988776')
    r.campos.acudiente = ok('')
  })

  // Visita Liceo Departamental
  add(L.liceo)
  add({ ...L.liceo, ciudad: 'Jamundi' })
  const triB = add(L.liceo, (r) => {
    r.campos.documento = ok(triA.campos.documento.valor)
    r.campos.nombre = ok(triA.campos.nombre.valor)
    r.campos.carreras = ok('Derecho')
  })
  add(L.liceo, (r) => {
    r.campos.correo = ok(triB.campos.correo.valor)
    r.campos.nombre = ok(triA.campos.nombre.valor.split(' ').slice(0, 2).join(' '))
    r.campos.grado = ok('Graduado')
  })
  const correoA = add(L.liceo)
  add(L.liceo, (r) => {
    r.campos.correo = ok(correoA.campos.correo.valor)
    r.campos.nombre = ok(correoA.campos.nombre.valor)
    r.campos.celularAcudiente = ok('3001234567')
  })
  add(L.liceo, (r) => {
    r.campos.documento = ok(docEnviado.campos.documento.valor)
    r.campos.nombre = ok(docEnviado.campos.nombre.valor)
    r.campos.correo = ok('nuevo.' + docEnviado.campos.correo.valor)
    r.campos.grado = ok('Graduado')
  })
  add({ ...L.liceo, jornada: 'Visita liceo departamental' })

  return {
    version: 1,
    registros: R,
    usuarios: usuariosIniciales(),
    auditoria: [
      { id: uuid(), fecha: ahora - 2 * DIA, usuario: 'Ana Torres', tipo: 'Cambio de configuración', detalle: 'Plazo de retención de imágenes: 10 días' },
      { id: uuid(), fecha: ahora - 2 * DIA + MIN, usuario: 'Ana Torres', tipo: 'Conexión con el CRM', detalle: 'Prueba de conexión exitosa (Pruebas)' },
      { id: uuid(), fecha: ahora - DIA, usuario: 'Laura Gómez', tipo: 'Envío al CRM', detalle: `${JORNADAS[1]} — Colegio Berchmans: 2 enviados, 0 fallidos` },
    ],
    crm: {
      organizacion: 'Universidad de San Buenaventura Cali',
      ambiente: 'Pruebas',
      credencialesGuardadas: true,
      estado: 'Conectado',
      ultimaVerificacion: ahora - 2 * DIA,
    },
    mapeo: mapeoInicial(),
    equivalencias: {
      tipoDoc: { 'T.I.': 'TI', 'C.C.': 'CC' },
      grado: { '9': 'Noveno', '10': 'Décimo', '11': 'Undécimo', '12': 'Duodécimo', Graduado: 'Bachiller' },
      calendario: { A: 'Calendario A', B: 'Calendario B' },
      autorizacion: { Sí: 'true', No: 'false' },
      carreras: Object.fromEntries(CARRERAS.map((c) => [c, c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3).toUpperCase()])),
    },
    config: { retencionDias: 10, inactividadMin: 15 },
    dispositivo: {
      id: 'Dispositivo A',
      inicializado: false,
      lote: null,
      historialLote: {
        jornada: [JORNADAS[0], JORNADAS[3]],
        colegio: ['Colegio Santa Librada', 'Liceo Departamental'],
        ciudad: ['Cali', 'Jamundí'],
      },
      cola: [],
    },
    sesionApp: null,
    sesionWeb: null,
    cierre: {},
    demo: { online: true, falloCarga: false, crmCaido: false, calidad: 'auto' },
    reset: null,
    alertas: [],
    notificacionApp: null,
    filtrosRegistros: {},
  }
}
