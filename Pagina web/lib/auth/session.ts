import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { findAnalyst } from './analysts'
import type { Analyst } from './types'

const COOKIE_NAME = 'lexigrid_session'
const MAX_AGE_SECONDS = 60 * 60 * 8

// Sin SESSION_SECRET se usa un valor de desarrollo: define la variable antes de usar el portal con datos reales.
const SECRET = process.env.SESSION_SECRET ?? 'lexigrid-development-secret-change-me'

const sign = (body: string) => createHmac('sha256', SECRET).update(body).digest('base64url')

function encode(email: string) {
  const body = Buffer.from(JSON.stringify({ sub: email, exp: Date.now() + MAX_AGE_SECONDS * 1000 })).toString('base64url')
  return `${body}.${sign(body)}`
}

function decode(token: string): string | null {
  const [body, signature] = token.split('.')
  if (!body || !signature) return null
  const expected = Buffer.from(sign(body))
  const received = Buffer.from(signature)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as { sub?: string; exp?: number }
    if (!payload.sub || !payload.exp || payload.exp < Date.now()) return null
    return payload.sub
  } catch {
    return null
  }
}

export async function createSession(email: string) {
  const store = await cookies()
  store.set(COOKIE_NAME, encode(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 })
}

export async function getSession(): Promise<Analyst | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  const email = decode(token)
  return email ? findAnalyst(email) : null
}
