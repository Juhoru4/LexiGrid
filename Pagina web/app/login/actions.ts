'use server'

import { redirect } from 'next/navigation'
import { authenticate, INSTITUTIONAL_DOMAIN } from '@/lib/auth/analysts'
import { createSession, destroySession } from '@/lib/auth/session'

export type LoginState = { error?: string; email?: string }

const MAX_FAILURES = 3
const LOCK_MS = 10 * 60 * 1000
const failures = new Map<string, { count: number; until: number }>()

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { error: 'Ingresa tu correo institucional y tu contraseña.', email }
  if (!email.endsWith(`@${INSTITUTIONAL_DOMAIN}`)) return { error: `Usa tu correo institucional (@${INSTITUTIONAL_DOMAIN}).`, email }

  const entry = failures.get(email)
  if (entry && entry.until > Date.now() && entry.count >= MAX_FAILURES) {
    return { error: 'Demasiados intentos fallidos. Espera unos minutos e inténtalo de nuevo.', email }
  }

  const analyst = await authenticate(email, password)
  if (!analyst) {
    const count = (entry && entry.until > Date.now() ? entry.count : 0) + 1
    failures.set(email, { count, until: Date.now() + LOCK_MS })
    return { error: 'Correo o contraseña incorrectos.', email }
  }

  failures.delete(email)
  await createSession(analyst.email)
  redirect('/')
}

export async function logout() {
  await destroySession()
  redirect('/login')
}
