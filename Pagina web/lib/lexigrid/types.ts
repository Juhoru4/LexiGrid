export type FieldKey =
  | 'name'
  | 'docType'
  | 'document'
  | 'phone'
  | 'guardianPhone'
  | 'email'
  | 'guardianName'
  | 'degree'
  | 'calendar'
  | 'careers'
  | 'consent'

export type FieldStatus = 'Verificado' | 'Por revisar' | 'Revisado manualmente'

export type Field = {
  value: string
  status: FieldStatus
  reason?: string
  /** Lo que realmente aparece escrito en la foto del formulario. */
  photo: string
  confidence: number
}

export type SendState = 'Pendiente de envío' | 'Enviado' | 'Error de envío' | 'Pendiente de actualización'

export const TRASH_INCONTACTABLE = 'Incontactable (sin canal de contacto)' as const
export const TRASH_DUPLICATE = 'Duplicado' as const
export type TrashReason = typeof TRASH_INCONTACTABLE | typeof TRASH_DUPLICATE

export type Comment = { id: string; user: string; at: number; text: string }
export type TimelineEntry = { id: string; user: string; at: number; label: string; from: string; to: string; note?: string }

export type LexRecord = {
  id: string
  journey: string
  school: string
  city: string
  capturedAt: number
  fields: Record<FieldKey, Field>
  hadDoubts: boolean
  trash: null | { reason: TrashReason; at: number; ref?: string; refName?: string }
  send: { state: SendState; at?: number; crmId?: string; error?: string }
  lock: null | { by: string; since: number }
  comments: Comment[]
  timeline: TimelineEntry[]
}

export type HistoryType =
  | 'Corrección'
  | 'Confirmación'
  | 'Comentario'
  | 'Duplicado resuelto'
  | 'Papelera'
  | 'Restauración'
  | 'Envío al CRM'
  | 'Actualización en CRM'
  | 'Unificación de nombres'

export type HistoryEntry = { id: string; user: string; at: number; type: HistoryType; detail: string; recordId?: string }

export type Integration = { online: boolean; error: string | null; dropNext: boolean }

export type AppState = {
  ready: boolean
  records: LexRecord[]
  history: HistoryEntry[]
  integration: Integration
}

export type Priority = 'Alta' | 'Media' | 'Baja' | 'Pendiente de prioridad'
export type ReviewState = 'Por revisar' | 'Verificado' | 'Revisado'
export type ImageState = 'available' | 'none-certain' | 'expired'

export type DupGroup = {
  id: string
  memberIds: string[]
  flaggedId: string
  matchOn: ('documento' | 'correo')[]
  matchValue: string
}

export type Derived = {
  review: ReviewState
  pending: FieldKey[]
  priority: Priority
  duplicate: boolean
  groupId?: string
  filled: number
  image: ImageState
  noConsent: boolean
}
