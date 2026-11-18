'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react'
import { login, type LoginState } from '@/app/login/actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

type DemoAccount = { name: string; role: string; email: string; password: string }

export function LoginForm({ accounts }: { accounts: readonly DemoAccount[] }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {})
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [lastError, setLastError] = useState<string | undefined>()

  if (state.error !== lastError) {
    setLastError(state.error)
    if (state.error) setPassword('')
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-5" noValidate>
        <FieldGroup>
          <Field data-invalid={!!state.error}>
            <FieldLabel htmlFor="email">Correo institucional</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="nombre.apellido@lexigrid.edu.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!state.error}
              required
            />
          </Field>
          <Field data-invalid={!!state.error}>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={visible ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!state.error}
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-1/2 right-1 -translate-y-1/2"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={visible}
              >
                {visible ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </Field>
        </FieldGroup>

        {state.error && (
          <Alert variant="destructive" role="alert">
            <AlertCircle />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Spinner data-icon="inline-start" /> : <LogIn data-icon="inline-start" />}
          {pending ? 'Verificando' : 'Iniciar sesión'}
        </Button>
      </form>

      <div className="flex flex-col gap-2 rounded-xl border bg-muted/40 p-3">
        <p className="text-xs font-semibold text-muted-foreground">Cuentas de demostración</p>
        <ul className="flex flex-col gap-1">
          {accounts.map((a) => (
            <li key={a.email}>
              <button
                type="button"
                onClick={() => {
                  setEmail(a.email)
                  setPassword(a.password)
                }}
                className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="text-sm font-semibold">{a.name}</span>
                <span className="truncate text-xs text-muted-foreground">{a.role} · {a.email}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-muted-foreground">Toca una cuenta para rellenar el formulario.</p>
      </div>
    </div>
  )
}
