import { AlertTriangle, Ban, Clock, Copy, Lock, RefreshCw, Send, ShieldCheck, Trash2, UserCheck, XCircle } from 'lucide-react'
import { trashDaysLeft } from '@/lib/lexigrid/rules'
import type { Derived, LexRecord } from '@/lib/lexigrid/types'
import { StatusBadge, type Tone } from './status-badge'
import type { ComponentType } from 'react'

export type Tag = { id: string; group: string; label: string; tone: Tone; icon: ComponentType<{ className?: string }> }

export function getTags(rec: LexRecord, d: Derived, now: number): Tag[] {
  const tags: Tag[] = []
  tags.push(
    d.review === 'Por revisar'
      ? { id: 'review:Por revisar', group: 'Revisión', label: `Por revisar · ${d.pending.length}`, tone: 'warning', icon: AlertTriangle }
      : d.review === 'Revisado'
        ? { id: 'review:Revisado', group: 'Revisión', label: 'Revisado manualmente', tone: 'success', icon: UserCheck }
        : { id: 'review:Verificado', group: 'Revisión', label: 'Verificado', tone: 'success', icon: ShieldCheck },
  )
  if (d.duplicate) tags.push({ id: 'dup', group: 'Duplicado', label: 'Por revisar duplicado', tone: 'warning', icon: Copy })
  if (rec.trash) {
    tags.push({ id: 'trash', group: 'Papelera', label: `Papelera · ${trashDaysLeft(rec.trash.at, now)} d`, tone: 'neutral', icon: Trash2 })
    tags.push({ id: `trash:${rec.trash.reason}`, group: 'Papelera', label: rec.trash.reason === 'Duplicado' ? 'Duplicado' : 'Incontactable', tone: 'neutral', icon: Ban })
  }
  const send = rec.send.state
  tags.push({
    id: `send:${send}`,
    group: 'Envío',
    label: send,
    tone: send === 'Enviado' ? 'info' : send === 'Error de envío' ? 'danger' : send === 'Pendiente de actualización' ? 'info' : 'neutral',
    icon: send === 'Enviado' ? Send : send === 'Error de envío' ? XCircle : send === 'Pendiente de actualización' ? RefreshCw : Clock,
  })
  if (!rec.trash) {
    tags.push({
      id: `priority:${d.priority}`,
      group: 'Prioridad',
      label: d.priority === 'Pendiente de prioridad' ? 'Prioridad pendiente' : `Prioridad ${d.priority.toLowerCase()}`,
      tone: d.priority === 'Alta' ? 'brand' : d.priority === 'Media' ? 'info' : 'neutral',
      icon: Clock,
    })
  }
  if (d.noConsent) tags.push({ id: 'noConsent', group: 'Datos', label: 'Sin autorización de datos', tone: 'danger', icon: Ban })
  if (rec.lock) tags.push({ id: 'lock', group: 'Bloqueo', label: `En revisión · ${rec.lock.by.split(' ')[0]}`, tone: 'info', icon: Lock })
  return tags
}

export function RecordTags({ rec, d, now, only }: { rec: LexRecord; d: Derived; now: number; only?: string[] }) {
  const tags = getTags(rec, d, now).filter((t) => !only || only.includes(t.group))
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((t) => (
        <StatusBadge key={t.id} tone={t.tone} icon={t.icon}>
          {t.label}
        </StatusBadge>
      ))}
    </div>
  )
}
