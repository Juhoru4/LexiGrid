'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Eye, ImageOff, Lock, MessageSquare, Pencil, ScanSearch, UserCheck, X, XCircle, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { fmtDate, fmtDateTime, fmtTime } from '@/lib/lexigrid/format'
import { CAREERS, displayPhotoMarks, FIELD_KEYS, FIELD_LABELS, OPTIONS, photoMatches, validate } from '@/lib/lexigrid/rules'
import { useStore } from '@/lib/lexigrid/store'
import { TRASH_INCONTACTABLE, type FieldKey, type FieldStatus, type LexRecord } from '@/lib/lexigrid/types'
import { cn } from '@/lib/utils'
import { useAnalyst } from './analyst-context'
import { EmptyState } from './empty-state'
import { FormPhoto, PAPER_H, PAPER_W } from './form-photo'
import { RecordTags } from './record-tags'
import { StatusBadge } from './status-badge'
import { useUi } from './ui-context'

const IMAGE_MESSAGES = {
  'none-certain': 'Imagen no conservada: todos los campos fueron identificados con certeza del 100 %.',
  expired: 'Imagen eliminada por cumplirse el plazo de retención de 10 días tras el envío.',
} as const

function StatusPill({ status }: { status: FieldStatus }) {
  if (status === 'Por revisar') return <StatusBadge tone="warning" icon={AlertTriangle}>Por revisar</StatusBadge>
  if (status === 'Revisado manualmente') return <StatusBadge tone="success" icon={UserCheck}>Revisado manualmente</StatusBadge>
  return <StatusBadge tone="success" icon={Check}>Verificado</StatusBadge>
}

export function ReviewDialog() {
  const { openId, openRecord } = useUi()
  const store = useStore()
  const storeRef = useRef(store)
  storeRef.current = store
  const rec = openId ? store.byId.get(openId) : undefined

  useEffect(() => {
    if (!openId) return
    const r = storeRef.current.byId.get(openId)
    if (r && r.send.state !== 'Enviado' && (!r.trash || r.trash.reason === TRASH_INCONTACTABLE)) storeRef.current.lock(openId)
    return () => storeRef.current.unlock(openId)
  }, [openId])

  return (
    <Dialog open={!!rec} onOpenChange={(o) => !o && openRecord(null)}>
      <DialogContent className="flex h-[92vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
        {rec && <ReviewBody key={rec.id} rec={rec} onClose={() => openRecord(null)} />}
      </DialogContent>
    </Dialog>
  )
}

function ReviewBody({ rec, onClose }: { rec: LexRecord; onClose: () => void }) {
  const store = useStore()
  const analyst = useAnalyst()
  const d = store.derived.get(rec.id)!
  const [active, setActive] = useState<FieldKey | null>(null)
  const [zoom, setZoom] = useState(0.78)
  const [editing, setEditing] = useState<FieldKey | null>(null)
  const [draft, setDraft] = useState('')
  const [comment, setComment] = useState('')
  const initialPriority = useRef(d.priority)
  const lastReview = useRef(d.review)

  const lockedByOther = !!rec.lock && rec.lock.by !== analyst.name
  const sent = rec.send.state === 'Enviado'
  const trashedDuplicate = rec.trash?.reason === 'Duplicado'
  const editable = rec.lock?.by === analyst.name && !sent && !trashedDuplicate
  const matches = FIELD_KEYS.filter((k) => photoMatches(k, rec.fields[k].value, rec.fields[k].photo)).length

  useEffect(() => {
    if (lastReview.current === 'Por revisar' && d.review !== 'Por revisar') toast.success('Registro revisado', { description: 'No quedan campos pendientes. Se recalculó la prioridad.' })
    lastReview.current = d.review
  }, [d.review])

  const startEdit = (k: FieldKey) => {
    setEditing(k)
    setActive(k)
    setDraft(rec.fields[k].value)
  }
  const save = (k: FieldKey, value: string) => {
    if (validate(k, value)) return
    store.correctField(rec.id, k, value)
    setEditing(null)
    toast.success(`${FIELD_LABELS[k]} guardado`, { description: value.trim() ? 'Quedó como Revisado manualmente.' : 'El campo quedó vacío y Revisado manualmente.' })
  }

  const photoPane =
    d.image === 'available' ? (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 border-b bg-card px-3 py-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold"><ScanSearch className="size-4 text-brand" />Foto del formulario</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" aria-label="Alejar" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))}><ZoomOut /></Button>
            <button type="button" className="w-12 text-center text-xs font-semibold tabular-nums" onClick={() => setZoom(0.78)} aria-label="Restablecer zoom">{Math.round(zoom * 100)} %</button>
            <Button variant="outline" size="icon-sm" aria-label="Acercar" onClick={() => setZoom((z) => Math.min(2, +(z + 0.15).toFixed(2)))}><ZoomIn /></Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-cover bg-center p-6" style={{ backgroundImage: 'url(/desk-surface.png)' }}>
          <div className="mx-auto" style={{ width: PAPER_W * zoom, height: PAPER_H * zoom }}>
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: PAPER_W, height: PAPER_H }}>
              <FormPhoto rec={rec} active={active} onSelect={setActive} />
            </div>
          </div>
        </div>
        <p className="border-t bg-card px-3 py-1.5 text-[11px] text-muted-foreground">Los recuadros amarillos son campos dudosos. Toca un campo en la foto o en la lista para ubicarlo.</p>
      </div>
    ) : (
      <EmptyState icon={ImageOff} title="Sin foto del formulario" description={IMAGE_MESSAGES[d.image as 'none-certain' | 'expired']} className="flex-1 bg-muted/40" />
    )

  return (
    <>
      <DialogHeader className="gap-1 border-b px-5 py-3.5 text-left">
        <p className="text-xs font-semibold text-brand">Revisión de registro</p>
        <DialogTitle className="pr-10 text-lg font-bold">{rec.fields.name.value}</DialogTitle>
        <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="font-mono">{rec.id}</span>
          <span>{rec.journey} · {rec.school.trim()} · {rec.city.trim()}</span>
          <span>Capturado {fmtDateTime(rec.capturedAt)}</span>
        </DialogDescription>
        <div className="pt-1.5"><RecordTags rec={rec} d={d} now={store.now} /></div>
      </DialogHeader>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(220px,38%)_1fr] md:grid-cols-[0.95fr_1.05fr] md:grid-rows-1">
        <div className="flex min-h-0 flex-col border-b md:border-r md:border-b-0">{photoPane}</div>

        <Tabs defaultValue="campos" className="min-h-0 gap-0">
          <TabsList className="m-3 mb-0 w-fit">
            <TabsTrigger value="campos">Campos</TabsTrigger>
            <TabsTrigger value="comparar">Comparar</TabsTrigger>
            <TabsTrigger value="comentarios">Comentarios{rec.comments.length > 0 && ` (${rec.comments.length})`}</TabsTrigger>
            <TabsTrigger value="historial">Cambios</TabsTrigger>
          </TabsList>

          <TabsContent value="campos" className="min-h-0 overflow-auto p-3">
            <div className="flex flex-col gap-3">
              {lockedByOther && (
                <div className="flex items-start gap-2 rounded-lg border border-info-border bg-info-soft p-3 text-xs text-info">
                  <Lock className="mt-0.5 size-4 shrink-0" />
                  <p>Abierto por <strong>{rec.lock!.by}</strong> desde las {fmtTime(rec.lock!.since)}. Puedes verlo en solo lectura; no se puede guardar mientras esté en revisión.</p>
                </div>
              )}
              {sent && (
                <div className="flex items-start gap-2 rounded-lg border bg-muted p-3 text-xs text-muted-foreground">
                  <Eye className="mt-0.5 size-4 shrink-0" />
                  <p>Registro enviado al CRM el {fmtDateTime(rec.send.at!)} (ID {rec.send.crmId}). Es de solo lectura.</p>
                </div>
              )}
              {trashedDuplicate && (
                <div className="flex items-start gap-2 rounded-lg border bg-muted p-3 text-xs text-muted-foreground">
                  <Eye className="mt-0.5 size-4 shrink-0" />
                  <p>Está en la Papelera como duplicado de {rec.trash!.refName}. Restáuralo desde la Papelera para editarlo.</p>
                </div>
              )}
              {rec.send.state === 'Error de envío' && (
                <div className="flex items-start gap-2 rounded-lg border border-danger-border bg-danger-soft p-3 text-xs text-danger">
                  <XCircle className="mt-0.5 size-4 shrink-0" />
                  <p>Error de envío: {rec.send.error}. Corrige el campo y reintenta desde Enviar al CRM.</p>
                </div>
              )}
              {initialPriority.current !== d.priority && (
                <div className="flex items-center gap-2 rounded-lg border border-success-border bg-success-soft p-3 text-xs text-success">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <p className="flex flex-wrap items-center gap-1">Prioridad recalculada: <strong>{initialPriority.current}</strong><ArrowRight className="size-3" /><strong>{d.priority}</strong></p>
                </div>
              )}

              <ul className="flex flex-col gap-2">
                {FIELD_KEYS.map((k) => {
                  const f = rec.fields[k]
                  const isEditing = editing === k
                  const error = isEditing ? validate(k, draft) : null
                  const invalidSaved = !!validate(k, f.value)
                  return (
                    <li
                      key={k}
                      onClick={() => setActive(k)}
                      className={cn('rounded-xl border bg-card p-3 transition-colors', f.status === 'Por revisar' && 'border-warning-border bg-warning-soft/50', active === k && 'ring-2 ring-brand')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-muted-foreground">{FIELD_LABELS[k]}</p>
                          {!isEditing && <p className="mt-0.5 text-sm font-semibold break-words">{f.value ? f.value.replaceAll(';', ',') : <span className="font-normal text-muted-foreground italic">(vacío)</span>}</p>}
                        </div>
                        <StatusPill status={f.status} />
                      </div>
                      {f.reason && !isEditing && <p className="mt-1.5 flex items-center gap-1 text-xs text-warning"><AlertTriangle className="size-3.5 shrink-0" />{f.reason}</p>}

                      {isEditing ? (
                        <div className="mt-2 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                          {k === 'careers' ? (
                            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Carreras de interés">
                              {CAREERS.map((c) => {
                                const list = draft.split(';').map((s) => s.trim()).filter(Boolean)
                                const on = list.includes(c)
                                return (
                                  <button
                                    key={c}
                                    type="button"
                                    aria-pressed={on}
                                    onClick={() => setDraft((on ? list.filter((x) => x !== c) : [...list, c]).join('; '))}
                                    className={cn('rounded-full border px-2.5 py-1 text-xs font-medium transition-colors', on ? 'border-brand bg-brand-soft text-accent-foreground' : 'bg-card text-muted-foreground hover:bg-muted')}
                                  >
                                    {c}
                                  </button>
                                )
                              })}
                            </div>
                          ) : OPTIONS[k] ? (
                            <Select value={draft} onValueChange={(v) => setDraft(v ?? '')}>
                              <SelectTrigger className="w-full" aria-label={FIELD_LABELS[k]}><SelectValue placeholder="Selecciona una opción" /></SelectTrigger>
                              <SelectContent><SelectGroup>{OPTIONS[k]!.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectGroup></SelectContent>
                            </Select>
                          ) : (
                            <Input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} aria-invalid={!!error} aria-label={FIELD_LABELS[k]} inputMode={k === 'document' || k === 'phone' || k === 'guardianPhone' ? 'numeric' : undefined} onKeyDown={(e) => { if (e.key === 'Enter' && !error) save(k, draft) }} />
                          )}
                          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" disabled={!!error} onClick={() => save(k, draft)}><Check data-icon="inline-start" />Guardar</Button>
                            {f.value && <Button size="sm" variant="outline" onClick={() => save(k, '')}>Dejar vacío</Button>}
                            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
                          </div>
                        </div>
                      ) : (
                        editable && (
                          <div className="mt-2 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {f.status === 'Por revisar' && (
                              <Button size="sm" disabled={invalidSaved} onClick={() => { store.confirmField(rec.id, k); toast.success(`${FIELD_LABELS[k]} confirmado`) }}>
                                <Check data-icon="inline-start" />Confirmar
                              </Button>
                            )}
                            <Button size="sm" variant={f.status === 'Por revisar' ? 'outline' : 'ghost'} onClick={() => startEdit(k)}>
                              <Pencil data-icon="inline-start" />Corregir
                            </Button>
                            {f.status === 'Por revisar' && invalidSaved && <span className="text-xs text-danger">El valor es inválido: corrígelo o déjalo vacío para poder guardarlo.</span>}
                          </div>
                        )
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="comparar" className="min-h-0 overflow-auto p-3">
            {d.image !== 'available' ? (
              <EmptyState icon={ImageOff} title="No hay foto para comparar" description={IMAGE_MESSAGES[d.image as 'none-certain' | 'expired']} />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-lg border bg-card p-3 text-xs">
                  <p><strong>{matches}</strong> de {FIELD_KEYS.length} campos coinciden con lo escrito en la foto.</p>
                  {matches < FIELD_KEYS.length ? <StatusBadge tone="warning" icon={AlertTriangle}>{FIELD_KEYS.length - matches} difieren</StatusBadge> : <StatusBadge tone="success" icon={Check}>Todo coincide</StatusBadge>}
                </div>
                <div className="overflow-hidden rounded-xl border bg-card">
                  <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-b bg-muted px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                    <span>Campo</span><span>Escrito en la foto</span><span>Lectura de la IA</span>
                  </div>
                  <ul>
                    {FIELD_KEYS.map((k) => {
                      const f = rec.fields[k]
                      const same = photoMatches(k, f.value, f.photo)
                      return (
                        <li key={k}>
                          <button type="button" onClick={() => setActive(k)} className={cn('grid w-full grid-cols-[1fr_1fr_1fr] items-start gap-2 border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-muted/50', !same && 'bg-warning-soft/60', active === k && 'ring-2 ring-brand ring-inset')}>
                            <span className="text-xs font-semibold">{FIELD_LABELS[k]}</span>
                            <span className="font-hand text-[19px] leading-tight text-[#1f3a8a] break-words">{displayPhotoMarks(k, f.photo).replaceAll(';', ',')}</span>
                            <span className="flex flex-col gap-1">
                              <span className="text-[13px] break-words">{f.value ? f.value.replaceAll(';', ',') : <em className="text-muted-foreground">(vacío)</em>}</span>
                              {same ? <StatusBadge tone="success" icon={Check} className="w-fit">Coincide</StatusBadge> : <StatusBadge tone="warning" icon={X} className="w-fit">Difiere</StatusBadge>}
                              {!same && f.reason && <span className="text-[11px] text-warning">{f.reason}</span>}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comentarios" className="min-h-0 overflow-auto p-3">
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">Los comentarios son internos y nunca se envían al CRM.</p>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escribe un comentario interno..." aria-label="Comentario interno" rows={3} />
              <Button className="w-fit" disabled={!comment.trim()} onClick={() => { store.addComment(rec.id, comment); setComment(''); toast.success('Comentario agregado') }}>
                <MessageSquare data-icon="inline-start" />Agregar comentario
              </Button>
              {rec.comments.length === 0 ? (
                <EmptyState icon={MessageSquare} title="Sin comentarios" description="Deja notas para ti o para otros analistas." className="py-8" />
              ) : (
                <ul className="flex flex-col gap-2">
                  {rec.comments.map((c) => (
                    <li key={c.id} className="rounded-xl border bg-card p-3 text-sm">
                      <p className="text-xs font-semibold">{c.user} <span className="font-normal text-muted-foreground">· {fmtDateTime(c.at)}</span></p>
                      <p className="mt-1">{c.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="historial" className="min-h-0 overflow-auto p-3">
            <ol className="flex flex-col gap-3 border-l pl-4">
              {rec.timeline.map((t) => (
                <li key={t.id} className="relative text-sm">
                  <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full bg-brand" />
                  <p className="text-xs text-muted-foreground">{fmtDateTime(t.at)} · {t.user}</p>
                  <p className="font-semibold">{t.label} <span className="font-normal text-muted-foreground">({t.note ?? 'Cambio'})</span></p>
                  {t.from !== t.to ? <p className="text-xs"><span className="text-muted-foreground line-through">{t.from || '(vacío)'}</span> <ArrowRight className="mx-1 inline size-3" />{t.to || '(vacío)'}</p> : <p className="text-xs">{t.to || '(vacío)'}</p>}
                  {t.note && t.from === t.to && t.label === 'Duplicado' && <p className="text-xs text-muted-foreground">{t.note}</p>}
                </li>
              ))}
              {rec.send.at && (
                <li className="relative text-sm">
                  <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full bg-info" />
                  <p className="text-xs text-muted-foreground">{fmtDateTime(rec.send.at)}</p>
                  <p className="font-semibold">{rec.send.state}{rec.send.crmId && ` · ${rec.send.crmId}`}</p>
                  {rec.send.error && <p className="text-xs text-danger">{rec.send.error}</p>}
                </li>
              )}
              <li className="relative text-sm">
                <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full bg-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">{fmtDateTime(rec.capturedAt)}</p>
                <p className="font-semibold">Formulario capturado</p>
                <p className="text-xs text-muted-foreground">Digitalizado por la IA el {fmtDate(rec.capturedAt)}</p>
              </li>
            </ol>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-card px-5 py-3">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {editable ? <><Lock className="size-3.5" />En revisión por ti desde las {fmtTime(rec.lock!.since)}</> : lockedByOther ? 'Solo lectura' : 'Solo lectura'}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          {editable && <Button onClick={onClose}>Guardar y cerrar</Button>}
        </div>
      </div>
    </>
  )
}
