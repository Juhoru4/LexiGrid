'use client'

import type { ComponentType } from 'react'
import { Copy, FileStack, History, LayoutDashboard, ListChecks, LogOut, Send, Spline, Trash2, Wifi, CloudOff, CheckCheck, Settings } from 'lucide-react'
import { useEffect } from 'react'
import { logout } from '@/app/login/actions'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { isSent } from '@/lib/lexigrid/rules'
import { useStore } from '@/lib/lexigrid/store'
import { cn } from '@/lib/utils'
import { useAnalyst } from './analyst-context'
import { ReviewDialog } from './review-dialog'
import { StatusBadge } from './status-badge'
import { SECTIONS, useUi, type Section } from './ui-context'
import { DuplicatesView } from './views/duplicates-view'
import { HistoryView } from './views/history-view'
import { OverviewView } from './views/overview-view'
import { RecordsView } from './views/records-view'
import { SendView, SentView } from './views/send-view'
import { TrashView } from './views/trash-view'
import { UnifyView } from './views/unify-view'
import { AdminView } from './views/admin-view'

const ICONS: Record<Section, ComponentType<{ className?: string }>> = {
  Resumen: LayoutDashboard,
  Registros: ListChecks,
  Formularios: FileStack,
  Duplicados: Copy,
  Papelera: Trash2,
  'Enviar al CRM': Send,
  Enviados: CheckCheck,
  'Unificar nombres': Spline,
  'Mi historial': History,
  Administración: Settings,
}

const DESCRIPTIONS: Record<Section, string> = {
  Resumen: 'Lo que necesita tu atención hoy.',
  Registros: 'Cola de trabajo ordenada por prioridad.',
  Formularios: 'Todos los formularios con sus etiquetas. Abre uno para compararlo con la foto original.',
  Duplicados: 'Registros que comparten documento o correo.',
  Papelera: 'Incontactables y duplicados descartados.',
  'Enviar al CRM': 'Envía los registros verificados al CRM.',
  Enviados: 'Registros que ya viven en el CRM.',
  'Unificar nombres': 'Une variantes de colegios, jornadas y ciudades.',
  'Mi historial': 'Tu actividad reciente.',
  Administración: 'Usuarios, parámetros e integración con el CRM.',
}

export function AppShell() {
  const { section, go } = useUi()
  const store = useStore()
  const analyst = useAnalyst()
  const initials = analyst.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const online = store.state.integration.online
  const isAdmin = analyst.role.toLowerCase().includes('administr')
  const visibleSections = isAdmin ? SECTIONS : SECTIONS.filter((section) => section !== 'Administración')

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const limit = 15 * 60 * 1000
    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => window.location.assign('/login'), limit)
    }
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'touchstart']
    reset()
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }))
    return () => {
      clearTimeout(timer)
      events.forEach((event) => window.removeEventListener(event, reset))
    }
  }, [])

  const counts: Partial<Record<Section, number>> = {
    Registros: store.state.records.filter((r) => !r.trash && !isSent(r) && store.derived.get(r.id)?.review === 'Por revisar').length,
    Duplicados: store.groups.length,
    Papelera: store.state.records.filter((r) => r.trash).length,
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r bg-sidebar p-4 lg:flex">
        <div className="flex items-center gap-2.5 px-2 pt-1">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground">LG</div>
          <div>
            <p className="text-base leading-none font-extrabold tracking-tight">LexiGrid</p>
            <p className="text-[11px] text-muted-foreground">Portal del analista</p>
          </div>
        </div>
        <nav aria-label="Secciones" className="flex flex-1 flex-col gap-0.5">
          {visibleSections.map((s) => {
            const Icon = ICONS[s]
            const active = s === section
            return (
              <button key={s} type="button" onClick={() => go(s)} aria-current={active ? 'page' : undefined} className={cn('flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                <Icon className="size-4" />
                <span className="flex-1 text-left">{s}</span>
                {!!counts[s] && <span className="rounded-full bg-warning-soft px-1.5 py-0.5 text-[10px] font-bold text-warning tabular-nums">{counts[s]}</span>}
              </button>
            )
          })}
        </nav>
        <div className="flex items-center gap-2.5 rounded-xl border bg-card p-2.5">
          <Avatar className="size-8"><AvatarFallback className="bg-brand-soft text-xs font-bold text-accent-foreground">{initials}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{analyst.name}</p>
            <p className="truncate text-[11px] text-muted-foreground" title={analyst.email}>{analyst.role}</p>
          </div>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="icon-sm" aria-label="Cerrar sesión" title="Cerrar sesión">
              <LogOut />
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-balance">{section}</h1>
              <p className="truncate text-xs text-muted-foreground">{DESCRIPTIONS[section]}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge tone={online ? 'success' : 'danger'} icon={online ? Wifi : CloudOff}>{online ? 'CRM conectado' : 'CRM sin conexión'}</StatusBadge>
              <form action={logout} className="lg:hidden">
                <Button type="submit" variant="outline" size="icon-sm" aria-label="Cerrar sesión" title="Cerrar sesión">
                  <LogOut />
                </Button>
              </form>
            </div>
          </div>
          <nav aria-label="Secciones" className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
            {visibleSections.map((s) => (
              <button key={s} type="button" onClick={() => go(s)} aria-current={s === section ? 'page' : undefined} className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold', s === section ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{s}</button>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-4 py-5 sm:px-6">
          {section === 'Resumen' && <OverviewView />}
          {section === 'Registros' && <RecordsView variant="queue" />}
          {section === 'Formularios' && <RecordsView variant="forms" />}
          {section === 'Duplicados' && <DuplicatesView />}
          {section === 'Papelera' && <TrashView />}
          {section === 'Enviar al CRM' && <SendView />}
          {section === 'Enviados' && <SentView />}
          {section === 'Unificar nombres' && <UnifyView />}
          {section === 'Mi historial' && <HistoryView />}
          {section === 'Administración' && isAdmin && <AdminView />}
        </main>
      </div>
      <ReviewDialog />
    </div>
  )
}
