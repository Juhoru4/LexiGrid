import 'server-only'
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { Analyst } from './types'

const scryptAsync = promisify(scrypt) as (password: string, salt: string, keylen: number) => Promise<Buffer>

export const INSTITUTIONAL_DOMAIN = 'lexigrid.edu.co'

type AnalystRecord = Analyst & { passwordHash: string }

// Contraseñas guardadas como "sal:hash" (scrypt). Para agregar o cambiar un analista,
// genera un nuevo valor con scrypt y reemplázalo aquí.
const ANALYSTS: AnalystRecord[] = [
  {
    email: `laura.mejia@${INSTITUTIONAL_DOMAIN}`,
    name: 'Laura Mejía',
    initials: 'LM',
    role: 'Analista de mercadeo',
    passwordHash:
      'ae66faf007fdc29b7b6d45e4638db7b0:6da3d03f08e51909f75528ee2f1af9b35355be15011df5dee5f9d9cf25315c9d1e7a8c654683197cd4eadfbf91d2a1d43ac56986ea74a2845fb155bcc7fc2e9b',
  },
  {
    email: `camilo.ortiz@${INSTITUTIONAL_DOMAIN}`,
    name: 'Camilo Ortiz',
    initials: 'CO',
    role: 'Analista de mercadeo',
    passwordHash:
      'f77cf9168e77590efb901a35d89af386:6c583f41823b89fbda685464461217f57dac239da6463ca736ce9cc6b6571c0296dea9da9ae3e45c4a0398173261a220a8d5b7017fe22926a04e903bb5472f42',
  },
  {
    email: `paola.restrepo@${INSTITUTIONAL_DOMAIN}`,
    name: 'Paola Restrepo',
    initials: 'PR',
    role: 'Administradora del sistema',
    passwordHash:
      '1f3aa2ed51108df0723a2740a708f7fb:30f8308f4cd86bc1d2b817e89e50cb2326b0344c33bc0424393eb22aa96e30d0cf4d691e72ecf1bd893a39ac30d01af30c6e8d8abadb6b666ae303d50fe39c50',
  },
]

const DUMMY_HASH = `${randomBytes(16).toString('hex')}:${randomBytes(64).toString('hex')}`

const toPublic = ({ passwordHash: _hash, ...analyst }: AnalystRecord): Analyst => analyst

async function matches(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  const expected = Buffer.from(hash, 'hex')
  const actual = await scryptAsync(password, salt, expected.length)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function findAnalyst(email: string): Analyst | null {
  const found = ANALYSTS.find((a) => a.email === email.trim().toLowerCase())
  return found ? toPublic(found) : null
}

export async function authenticate(email: string, password: string): Promise<Analyst | null> {
  const found = ANALYSTS.find((a) => a.email === email.trim().toLowerCase())
  // Se calcula el hash aunque el correo no exista para que el tiempo de respuesta no revele cuentas válidas.
  const ok = await matches(password, found?.passwordHash ?? DUMMY_HASH)
  return found && ok ? toPublic(found) : null
}
