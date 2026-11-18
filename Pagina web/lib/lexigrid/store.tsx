'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { buildSeed } from './data'
import { DAY, sleep, uid } from './format'
import {
  crmIdFor,
  crmValidate,
  contactPending,
  deriveAll,
  duplicateGroups,
  FIELD_KEYS,
  FIELD_LABELS,
  hasNoChannel,
  isSent,
  TRASH_DAYS,
  validate,
} from './rules'
import {
  TRASH_DUPLICATE,
  TRASH_INCONTACTABLE,
  type AppState,
  type Derived,
  type DupGroup,
  type FieldKey,
  type HistoryEntry,
  type HistoryType,
  type Integration,
  type LexRecord,
} from './types'

const STORAGE_KEY = 'lexigrid-state-v2'

const initialState: AppState = {
  ready: false,
  records: [],
  history: [],
  integration: { online: true, error: null, dropNext: false },
}

type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'reset'; now: number }
  | { type: 'lock'; id: string; at: number }
  | { type: 'unlock'; id: string }
  | { type: 'releaseMine' }
  | { type: 'confirm'; id: string; key: FieldKey; at: number }
  | { type: 'correct'; id: string; key: FieldKey; value: string; at: number }
  | { type: 'comment'; id: string; text: string; at: number }
  | { type: 'resolveDuplicate'; baseId: string; memberIds: string[]; choice: Record<FieldKey, string>; at: number }
  | { type: 'restore'; ids: string[]; at: number }
  | { type: 'sent'; id: string; at: number }
  | { type: 'sendError'; id: string; error: string; at: number }
  | { type: 'batchLog'; detail: string; at: number }
  | { type: 'unify'; field: 'school' | 'journey' | 'city'; variants: string[]; final: string; at: number }
  | { type: 'integration'; patch: Partial<Integration> }

const show = (v: string) => (v.trim() ? v : '(vacío)')

/** Crea el reductor para el analista con sesión iniciada: bloqueos, historial y comentarios se atribuyen a `ME`. */
function createReducer(ME: string) {
const entry = (type: HistoryType, detail: string, at: number, recordId?: string): HistoryEntry => ({ id: uid(), user: ME, at, type, detail, recordId })
const canEdit = (rec: LexRecord) => rec.lock?.by === ME && rec.send.state !== 'Enviado'

/** Reevalúa papelera por incontactable, celulares repetidos y purga de 30 días tras cualquier cambio. */
function settle(prev: LexRecord[], next: LexRecord[], at: number): { records: LexRecord[]; logs: HistoryEntry[] } {
  const logs: HistoryEntry[] = []
  const prevById = new Map(prev.map((r) => [r.id, r]))
  const records: LexRecord[] = []

  for (const original of next) {
    let rec = original
    const f = rec.fields
    if (f.phone.value.trim() && f.phone.value.trim() === f.guardianPhone.value.trim()) {
      rec = { ...rec, fields: { ...f, guardianPhone: { ...f.guardianPhone, value: '', photo: f.guardianPhone.photo } } }
    }
    if (rec.trash && at - rec.trash.at > TRASH_DAYS * DAY) {
      logs.push(entry('Papelera', `Eliminó definitivamente a ${rec.fields.name.value} (venció el plazo de ${TRASH_DAYS} días)`, at, rec.id))
      continue
    }
    if (!rec.trash && !isSent(rec) && hasNoChannel(rec) && !contactPending(rec)) {
      rec = { ...rec, trash: { reason: TRASH_INCONTACTABLE, at }, lock: null }
      logs.push(entry('Papelera', `Movió a la Papelera a ${rec.fields.name.value} (Incontactable)`, at, rec.id))
    } else if (rec.trash?.reason === TRASH_INCONTACTABLE && !hasNoChannel(rec) && prevById.get(rec.id)?.trash) {
      rec = { ...rec, trash: null }
      logs.push(entry('Restauración', `Recuperación automática de ${rec.fields.name.value}: ya tiene un canal de contacto`, at, rec.id))
    }
    records.push(rec)
  }
  return { records, logs }
}

function apply(state: AppState, mutate: (records: LexRecord[]) => LexRecord[], logs: HistoryEntry[], at: number): AppState {
  const next = mutate(state.records)
  const settled = settle(state.records, next, at)
  return { ...state, records: settled.records, history: [...settled.logs, ...logs, ...state.history] }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state
    case 'reset':
      return buildSeed(action.now)
    case 'integration':
      return { ...state, integration: { ...state.integration, ...action.patch } }
    case 'lock':
      return {
        ...state,
        records: state.records.map((r) => {
          if (r.id !== action.id || (r.lock && r.lock.by !== ME)) return r
          return { ...r, lock: { by: ME, since: r.lock?.since ?? action.at } }
        }),
      }
    case 'unlock':
      return { ...state, records: state.records.map((r) => (r.id === action.id && r.lock?.by === ME ? { ...r, lock: null } : r)) }
    case 'releaseMine':
      return { ...state, records: state.records.map((r) => (r.lock?.by === ME ? { ...r, lock: null } : r)) }
    case 'confirm': {
      const rec = state.records.find((r) => r.id === action.id)
      if (!rec || !canEdit(rec) || validate(action.key, rec.fields[action.key].value)) return state
      const field = rec.fields[action.key]
      return apply(
        state,
        (rs) =>
          rs.map((r) =>
            r.id === action.id
              ? {
                  ...r,
                  fields: { ...r.fields, [action.key]: { ...field, status: 'Revisado manualmente', reason: undefined } },
                  timeline: [{ id: uid(), user: ME, at: action.at, label: FIELD_LABELS[action.key], from: field.value, to: field.value, note: 'Confirmado' }, ...r.timeline],
                }
              : r,
          ),
        [entry('Confirmación', `Confirmó ${FIELD_LABELS[action.key]} de ${rec.fields.name.value}: ${show(field.value)}`, action.at, rec.id)],
        action.at,
      )
    }
    case 'correct': {
      const rec = state.records.find((r) => r.id === action.id)
      const value = action.value.trim()
      if (!rec || !canEdit(rec) || validate(action.key, value)) return state
      const field = rec.fields[action.key]
      return apply(
        state,
        (rs) =>
          rs.map((r) =>
            r.id === action.id
              ? {
                  ...r,
                  fields: { ...r.fields, [action.key]: { ...field, value, status: 'Revisado manualmente', reason: undefined } },
                  timeline: [{ id: uid(), user: ME, at: action.at, label: FIELD_LABELS[action.key], from: field.value, to: value, note: 'Corregido' }, ...r.timeline],
                }
              : r,
          ),
        [entry('Corrección', `Corrigió ${FIELD_LABELS[action.key]} de ${rec.fields.name.value}: ${show(field.value)} → ${show(value)}`, action.at, rec.id)],
        action.at,
      )
    }
    case 'comment': {
      const rec = state.records.find((r) => r.id === action.id)
      if (!rec || !action.text.trim()) return state
      return apply(
        state,
        (rs) => rs.map((r) => (r.id === action.id ? { ...r, comments: [{ id: uid(), user: ME, at: action.at, text: action.text.trim() }, ...r.comments] } : r)),
        [entry('Comentario', `Comentó en el registro de ${rec.fields.name.value}: "${action.text.trim()}"`, action.at, rec.id)],
        action.at,
      )
    }
    case 'resolveDuplicate': {
      const byId = new Map(state.records.map((r) => [r.id, r]))
      const base = byId.get(action.baseId)
      if (!base) return state
      const others = action.memberIds.filter((id) => id !== action.baseId)
      const wasSent = base.send.state === 'Enviado'
      return apply(
        state,
        (rs) =>
          rs.map((r) => {
            if (r.id === action.baseId) {
              const fields = { ...r.fields }
              const changed: string[] = []
              FIELD_KEYS.forEach((k) => {
                const source = byId.get(action.choice[k]) ?? r
                if (source.fields[k].value !== r.fields[k].value) changed.push(FIELD_LABELS[k])
                fields[k] = { ...source.fields[k], photo: r.fields[k].photo }
              })
              return {
                ...r,
                fields,
                hadDoubts: action.memberIds.some((id) => byId.get(id)?.hadDoubts),
                send: wasSent ? { ...r.send, state: 'Pendiente de actualización' } : r.send,
                timeline: [
                  { id: uid(), user: ME, at: action.at, label: 'Duplicado', from: `${action.memberIds.length} registros`, to: 'Unificado', note: changed.length ? `Campos actualizados: ${changed.join(', ')}` : 'Sin cambios de valores' },
                  ...r.timeline,
                ],
              }
            }
            if (others.includes(r.id)) {
              return { ...r, lock: null, trash: { reason: TRASH_DUPLICATE, at: action.at, ref: base.id, refName: base.fields.name.value } }
            }
            return r
          }),
        [entry('Duplicado resuelto', `Resolvió el duplicado de ${base.fields.name.value} (${action.memberIds.length} registros); ${others.length} pasaron a la Papelera${wasSent ? ' y el conservado quedó Pendiente de actualización' : ''}`, action.at, base.id)],
        action.at,
      )
    }
    case 'restore': {
      const names: string[] = []
      const next = (rs: LexRecord[]) =>
        rs.map((r) => {
          if (!r.trash || !action.ids.includes(r.id)) return r
          names.push(r.fields.name.value)
          const f = { ...r.fields }
          if (r.trash.reason === TRASH_INCONTACTABLE) {
            const reason = 'Restaurado de la Papelera: confirma el canal de contacto'
            ;(['phone', 'guardianPhone', 'email'] as FieldKey[]).forEach((k) => (f[k] = { ...f[k], status: 'Por revisar', reason }))
          } else {
            f.document = { ...f.document, status: 'Por revisar', reason: 'Restaurado de la Papelera: verifica que no sea un duplicado' }
          }
          return { ...r, fields: f, trash: null }
        })
      const next1 = next(state.records)
      return apply(state, () => next1, [entry('Restauración', `Restauró ${names.length} registro(s) desde la Papelera: ${names.join(', ')}`, action.at)], action.at)
    }
    case 'sent': {
      const rec = state.records.find((r) => r.id === action.id)
      if (!rec || rec.send.state === 'Enviado') return state
      const update = rec.send.state === 'Pendiente de actualización'
      const crmId = rec.send.crmId ?? crmIdFor(rec.id)
      return apply(
        state,
        (rs) => rs.map((r) => (r.id === action.id ? { ...r, send: { state: 'Enviado', at: action.at, crmId } } : r)),
        [entry(update ? 'Actualización en CRM' : 'Envío al CRM', `${update ? 'Actualizó' : 'Envió'} a ${rec.fields.name.value} en el CRM (ID ${crmId})`, action.at, rec.id)],
        action.at,
      )
    }
    case 'sendError': {
      const rec = state.records.find((r) => r.id === action.id)
      if (!rec) return state
      const stayUpdate = rec.send.state === 'Pendiente de actualización'
      return apply(
        state,
        (rs) => rs.map((r) => (r.id === action.id ? { ...r, send: { ...r.send, state: stayUpdate ? 'Pendiente de actualización' : 'Error de envío', error: action.error, at: action.at } } : r)),
        [entry('Envío al CRM', `Error de envío de ${rec.fields.name.value}: ${action.error}`, action.at, rec.id)],
        action.at,
      )
    }
    case 'batchLog':
      return { ...state, history: [entry('Envío al CRM', action.detail, action.at), ...state.history] }
    case 'unify': {
      let count = 0
      return apply(
        state,
        (rs) =>
          rs.map((r) => {
            if (isSent(r) || !action.variants.includes(r[action.field])) return r
            count++
            return { ...r, [action.field]: action.final }
          }),
        [entry('Unificación de nombres', `Unificó ${action.variants.map((v) => `"${v.trim()}"`).join(', ')} como "${action.final}"`, action.at)],
        action.at,
      )
    }
    default:
      return state
  }
}
return reducer
}

export type SendSummary = { sent: number; failed: { id: string; error: string }[]; interrupted: boolean }

type Store = {
  state: AppState
  groups: DupGroup[]
  derived: Map<string, Derived>
  byId: Map<string, LexRecord>
  now: number
  lock: (id: string) => void
  unlock: (id: string) => void
  releaseMine: () => void
  confirmField: (id: string, key: FieldKey) => void
  correctField: (id: string, key: FieldKey, value: string) => void
  addComment: (id: string, text: string) => void
  resolveDuplicate: (baseId: string, memberIds: string[], choice: Record<FieldKey, string>) => void
  restore: (ids: string[]) => void
  unify: (field: 'school' | 'journey' | 'city', variants: string[], final: string) => void
  setIntegration: (patch: Partial<Integration>) => void
  retryConnection: () => Promise<void>
  resetData: () => void
  logBatch: (detail: string) => void
  sendMany: (ids: string[], onProgress?: (done: number, total: number) => void) => Promise<SendSummary>
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ me, children }: { me: string; children: ReactNode }) {
  const reducer = useMemo(() => createReducer(me), [me])
  const [state, dispatch] = useReducer(reducer, initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    let loaded: AppState | null = null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) loaded = { ...(JSON.parse(raw) as AppState), ready: true }
    } catch {
      loaded = null
    }
    dispatch({ type: 'hydrate', state: loaded ?? buildSeed(Date.now()) })
  }, [])

  useEffect(() => {
    if (!state.ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* almacenamiento lleno o no disponible */
    }
  }, [state])

  const now = useMemo(() => Date.now(), [state.records])
  const groups = useMemo(() => duplicateGroups(state.records), [state.records])
  const derived = useMemo(() => deriveAll(state.records, groups, now), [state.records, groups, now])
  const byId = useMemo(() => new Map(state.records.map((r) => [r.id, r])), [state.records])

  const sendMany = useCallback(async (ids: string[], onProgress?: (done: number, total: number) => void): Promise<SendSummary> => {
    const failed: { id: string; error: string }[] = []
    let sent = 0
    let processed = 0
    for (const id of ids) {
      await sleep(420)
      const st = stateRef.current
      if (!st.integration.online || (st.integration.dropNext && processed >= 2)) {
        if (st.integration.dropNext) {
          dispatch({ type: 'integration', patch: { online: false, dropNext: false, error: 'Se perdió la conexión con el CRM durante el envío. Los registros restantes quedaron pendientes.' } })
        }
        return { sent, failed, interrupted: true }
      }
      const rec = st.records.find((r) => r.id === id)
      if (!rec) continue
      const error = crmValidate(rec)
      if (error) {
        dispatch({ type: 'sendError', id, error, at: Date.now() })
        failed.push({ id, error })
      } else {
        dispatch({ type: 'sent', id, at: Date.now() })
        sent++
      }
      processed++
      onProgress?.(processed, ids.length)
    }
    return { sent, failed, interrupted: false }
  }, [])

  const store = useMemo<Store>(
    () => ({
      state,
      groups,
      derived,
      byId,
      now,
      lock: (id) => dispatch({ type: 'lock', id, at: Date.now() }),
      unlock: (id) => dispatch({ type: 'unlock', id }),
      releaseMine: () => dispatch({ type: 'releaseMine' }),
      confirmField: (id, key) => dispatch({ type: 'confirm', id, key, at: Date.now() }),
      correctField: (id, key, value) => dispatch({ type: 'correct', id, key, value, at: Date.now() }),
      addComment: (id, text) => dispatch({ type: 'comment', id, text, at: Date.now() }),
      resolveDuplicate: (baseId, memberIds, choice) => dispatch({ type: 'resolveDuplicate', baseId, memberIds, choice, at: Date.now() }),
      restore: (ids) => dispatch({ type: 'restore', ids, at: Date.now() }),
      unify: (field, variants, final) => dispatch({ type: 'unify', field, variants, final, at: Date.now() }),
      setIntegration: (patch) => dispatch({ type: 'integration', patch }),
      retryConnection: async () => {
        await sleep(700)
        dispatch({ type: 'integration', patch: { online: true, error: null } })
      },
      resetData: () => dispatch({ type: 'reset', now: Date.now() }),
      logBatch: (detail) => dispatch({ type: 'batchLog', detail, at: Date.now() }),
      sendMany,
    }),
    [state, groups, derived, byId, now, sendMany],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider')
  return ctx
}
