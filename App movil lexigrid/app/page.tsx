'use client'

import { ArrowRight, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { DemoControls } from '@/components/lg/demo-controls'
import { Logo } from '@/components/lg/logo'

export default function Inicio() {
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 md:py-20">
        <header className="flex flex-col gap-4">
          <Logo />
          <div>
            <p className="text-sm font-medium text-primary">Prototipo de demostración · Universidad de San Buenaventura Cali</p>
            <h1 className="mt-2 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Digitalización de formularios de aspirantes, de la jornada al CRM
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
              Ingresa como embajador para capturar fotos de formularios, gestionar la cola de carga y consultar el historial.
            </p>
          </div>
        </header>

        <ul className="grid max-w-md gap-4">
          <li>
            <Link
              href="/app/login"
              className="group flex h-full flex-col gap-4 rounded-2xl border bg-card p-6 shadow-xs transition hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <Smartphone className="size-5" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">Entrar como Embajador</h2>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Operativo · solo app móvil</p>
                <p className="mt-3 text-pretty text-sm text-muted-foreground">
                  Captura fotos de formularios en jornadas, gestiona la cola de carga y consulta el historial.
                </p>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-primary">
                Continuar <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        </ul>

        <section className="rounded-2xl border bg-card p-6 text-sm">
          <h2 className="font-semibold text-foreground">Credenciales de demostración</h2>
          <dl className="mt-3 grid gap-3 text-muted-foreground">
            <div className="max-w-md">
              <dt className="font-medium text-foreground">Embajadores</dt>
              <dd>Embajador 1, 2 o 3 · clave <code className="rounded bg-muted px-1">Feria2026</code></dd>
              <dd className="mt-1 text-xs">Embajador 3 está en uso en otro dispositivo.</dd>
            </div>
          </dl>
        </section>
      </div>
      <DemoControls ambito="inicio" />
    </main>
  )
}
