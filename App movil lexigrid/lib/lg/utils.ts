import type { FieldKey } from './types'

export const DIA = 24 * 60 * 60 * 1000
export const MIN = 60 * 1000

export function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

const pad = (n: number) => String(n).padStart(2, '0')

export function fmtFecha(ts?: number) {
  if (!ts) return '—'
  const d = new Date(ts)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function fmtHora(ts?: number) {
  if (!ts) return '—'
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fmtFechaHora(ts?: number) {
  if (!ts) return '—'
  return `${fmtFecha(ts)} ${fmtHora(ts)}`
}

export function fmtCuenta(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`
}

export function normalizar(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function contiene(valor: string, busqueda: string) {
  return normalizar(valor).includes(normalizar(busqueda))
}

export function limpiarEspacios(s: string) {
  return s.replace(/\s+/g, ' ').trim()
}

export const ETIQUETAS: Record<FieldKey, string> = {
  nombre: 'Nombre y apellidos',
  tipoDoc: 'Tipo de documento',
  documento: 'Número de documento',
  celular: 'Celular del aspirante',
  celularAcudiente: 'Celular del acudiente',
  correo: 'Correo electrónico',
  acudiente: 'Nombre del acudiente',
  grado: 'Grado',
  calendario: 'Calendario',
  carreras: 'Carreras de interés',
  autorizacion: 'Autorización de tratamiento de datos',
}

export const ORDEN_CAMPOS: FieldKey[] = [
  'nombre',
  'tipoDoc',
  'documento',
  'celular',
  'celularAcudiente',
  'correo',
  'acudiente',
  'grado',
  'calendario',
  'carreras',
  'autorizacion',
]

export const OPCIONES: Partial<Record<FieldKey, string[]>> = {
  tipoDoc: ['T.I.', 'C.C.'],
  grado: ['9', '10', '11', '12', 'Graduado'],
  calendario: ['A', 'B'],
  autorizacion: ['Sí', 'No'],
}

export const CARRERAS = [
  'Psicología',
  'Derecho',
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Administración de Empresas',
  'Contaduría Pública',
  'Arquitectura',
  'Comunicación Social',
  'Licenciatura en Educación',
  'Economía',
]

export function validarFormato(clave: FieldKey, valor: string): string | null {
  const v = valor.trim()
  if (!v) return null
  if (clave === 'documento' && !/^\d+$/.test(v)) return 'El documento solo admite dígitos'
  if ((clave === 'celular' || clave === 'celularAcudiente') && !/^\d{10}$/.test(v))
    return 'El celular debe tener exactamente 10 dígitos'
  if (clave === 'correo' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    return 'Formato de correo inválido (usuario@dominio)'
  return null
}

export function requisitosClave(clave: string) {
  return [
    { ok: clave.length >= 10, texto: 'Mínimo 10 caracteres' },
    { ok: /[A-Z]/.test(clave), texto: 'Una letra mayúscula' },
    { ok: /[a-z]/.test(clave), texto: 'Una letra minúscula' },
    { ok: /\d/.test(clave), texto: 'Un número' },
    { ok: /[^A-Za-z0-9]/.test(clave), texto: 'Un símbolo (por ejemplo * o #)' },
  ]
}

export const DOMINIO = '@usbcali.edu.co'
