export type FieldKey =
  | 'nombre'
  | 'tipoDoc'
  | 'documento'
  | 'celular'
  | 'celularAcudiente'
  | 'correo'
  | 'acudiente'
  | 'grado'
  | 'calendario'
  | 'carreras'
  | 'autorizacion'

export type EstadoCampo = 'Verificado' | 'Por revisar' | 'Revisado manualmente'

export interface Campo {
  valor: string
  estado: EstadoCampo
  motivo?: string
}

export type EstadoRevision = 'En procesamiento' | 'Verificado' | 'Por revisar' | 'Revisado'
export type Prioridad = 'Alta' | 'Media' | 'Baja' | 'Pendiente de prioridad'
export type EstadoEnvio =
  | 'Pendiente de envío'
  | 'Enviado'
  | 'Error de envío'
  | 'Pendiente de actualización'
export type MotivoPapelera = 'Incontactable' | 'Duplicado'
export type EstadoImagen = 'conservada' | 'no-conservada' | 'eliminada-plazo'

export interface CambioCampo {
  usuario: string
  fecha: number
  campo: string
  anterior: string
  nuevo: string
}

export interface Comentario {
  id: string
  usuario: string
  fecha: number
  texto: string
}

export interface Registro {
  id: string
  embajador: string
  dispositivo: string
  jornada: string
  colegio: string
  ciudad: string
  capturadoEn: number
  campos: Record<FieldKey, Campo>
  procesando: boolean
  procesarEn?: number
  imagen: EstadoImagen
  papelera: null | { motivo: MotivoPapelera; fecha: number; ref?: string }
  restauradoFirma?: string
  revisionPendiente?: string
  dupResueltos: string[]
  envio: { estado: EstadoEnvio; fecha?: number; crmId?: string; motivo?: string }
  enviadoEn?: number
  retencionDias?: number
  forzarErrorCRM?: string
  bloqueo: null | { usuario: string; desde: number }
  comentarios: Comentario[]
  historial: CambioCampo[]
  purgado?: boolean
  purgadoEn?: number
}

export type Perfil = 'Operativo' | 'Analítico' | 'Administrativo'

export interface Usuario {
  id: string
  nombre: string
  perfil: Perfil
  correo?: string
  clave: string
  activo: boolean
  intentos: number
  bloqueadoHasta?: number
  sesionDispositivo?: string | null
}

export interface Auditoria {
  id: string
  fecha: number
  usuario: string
  tipo: string
  registro?: string
  detalle?: string
}

export type MotivoCalidad = 'borrosa' | 'poca luz' | 'incompleta' | 'reflejos'

export interface ColaItem {
  id: string
  jornada: string
  colegio: string
  ciudad: string
  capturadoEn: number
  estado: 'Pendiente' | 'Subiendo' | 'Subida' | 'Error'
  progreso: number
  error?: string
  subidaEn?: number
}

export interface CrmConfig {
  organizacion: string
  ambiente: 'Pruebas' | 'Producción'
  credencialesGuardadas: boolean
  estado: 'Conectado' | 'Con error'
  causa?: string
  ultimaVerificacion?: number
}

export interface MapeoCampo {
  clave: string
  etiqueta: string
  campoCrm: string
  requerido: boolean
  siVacio: 'blanco' | 'defecto'
  valorDefecto: string
}

export interface Alerta {
  id: string
  fecha: number
  texto: string
  tipo: 'error' | 'info'
}

export interface Notificacion {
  id: string
  tipo: 'exito' | 'error' | 'info'
  texto: string
}

export interface DB {
  version: number
  registros: Registro[]
  usuarios: Usuario[]
  auditoria: Auditoria[]
  crm: CrmConfig
  mapeo: MapeoCampo[]
  equivalencias: Record<string, Record<string, string>>
  config: { retencionDias: number; inactividadMin: number }
  dispositivo: {
    id: string
    inicializado: boolean
    lote: { jornada: string; colegio: string; ciudad: string } | null
    historialLote: { jornada: string[]; colegio: string[]; ciudad: string[] }
    cola: ColaItem[]
  }
  sesionApp: { usuarioId: string; desde: number } | null
  sesionWeb: { usuarioId: string; desde: number } | null
  cierre: { app?: string; web?: string }
  demo: {
    online: boolean
    falloCarga: boolean
    crmCaido: boolean
    calidad: 'auto' | 'buena' | MotivoCalidad
  }
  reset: { correo: string; expira: number } | null
  alertas: Alerta[]
  notificacionApp: Notificacion | null
  filtrosRegistros: Record<string, string>
}
