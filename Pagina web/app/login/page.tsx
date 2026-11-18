import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { DEMO_ACCOUNTS } from '@/lib/auth/demo-credentials'
import { getSession } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Iniciar sesión · LexiGrid',
  description: 'Accede al portal del analista con tu correo institucional.',
}

export default async function LoginPage() {
  if (await getSession()) redirect('/')

  return (
    <main className="flex min-h-screen">
      <section
        aria-hidden="true"
        className="relative hidden w-1/2 max-w-xl flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex"
      >
        <div className="absolute inset-0 bg-[url('/desk-surface.png')] bg-cover bg-center opacity-20" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground text-sm font-extrabold text-primary">LG</div>
          <p className="text-lg font-extrabold tracking-tight">LexiGrid</p>
        </div>
        <div className="relative flex flex-col gap-3">
          <p className="text-3xl leading-tight font-extrabold tracking-tight text-balance">Cada formulario, comparado con su foto original.</p>
          <p className="max-w-sm text-sm text-primary-foreground/80">Revisa, corrige y envía al CRM los registros de tus aspirantes con trazabilidad por analista.</p>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground">LG</div>
              <p className="text-base font-extrabold tracking-tight">LexiGrid</p>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-balance">Portal del analista</h1>
            <p className="text-sm text-muted-foreground">Inicia sesión con tu correo institucional para continuar.</p>
          </div>
          <LoginForm accounts={DEMO_ACCOUNTS} />
        </div>
      </section>
    </main>
  )
}
