/**
 * API client — calls Next.js route handlers which proxy to n8n.
 * The n8n URL and token never reach the browser.
 */

const BASE = '/api/dashboard'

// ── Shared fetcher ────────────────────────────────────────────────────────────

async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${body}`)
  }
  return res.json() as Promise<T>
}

// ── Response types ────────────────────────────────────────────────────────────

export type Wf11Alert = {
  id: string
  tipo: string
  descripcion: string
  severidad: 'alta' | 'media' | 'baja'
  accion_url?: string
}

export type AprobacionPendiente = {
  orden_id: string
  shopify_order: string
  cliente: string
  monto: number
  tiempo_en_cola_min: number
}

export type HomeData = {
  fecha: string
  generado_en: string
  ventas: {
    ordenes_hoy: number
    revenue_hoy: number
    revenue_ayer: number
    delta_pct: number
    ticket_promedio: number
    ordenes_pendientes_aprobacion: number
  }
  pagos: {
    cobrado_hoy: number
    pendiente_cobro: number
    pagos_confirmados_hoy: number
    pagos_rechazados_hoy: number
  }
  inventario: {
    productos_criticos: number
    productos_agotados: number
    discrepancias_activas: number
  }
  sistema: {
    sync_clover_status: 'ok' | 'error' | 'pending'
    wf11_alertas_activas: Wf11Alert[]
  }
  aprobaciones_pendientes: AprobacionPendiente[]
}

export type Orden = {
  id: string
  shopify_order: string
  cliente: string
  status: 'pendiente_aprobacion' | 'aprobada' | 'en_preparacion' | 'completada' | 'cancelada'
  monto: number
  items: number
  creada_en: string
  factura_url?: string
  razon_cancelacion?: string
}

export type OrdenesData = {
  generado_en: string
  total: number
  resumen: Record<string, number>
  ordenes: Orden[]
}

export type Pago = {
  pago_id: string
  orden_shopify: string
  cliente: { nombre: string; telefono?: string }
  monto: number
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque'
  banco?: string | null
  referencia?: string | null
  evidencia_url?: string | null
  notas?: string | null
  creado_por?: string
  tiempo_en_cola_min?: number
  tiempo_en_revision_min?: number
  confirmado_por?: string
  confirmado_en?: string
  rechazado_por?: string
  rechazado_en?: string
  razon_rechazo?: string
  factura_url?: string
}

export type PagosData = {
  generado_en: string
  resumen: {
    total_pendiente: number
    total_confirmado_hoy: number
    total_rechazado_hoy: number
  }
  columnas: {
    pendiente: Pago[]
    en_revision: Pago[]
    confirmado: Pago[]
    rechazado: Pago[]
  }
}

// ── API functions ─────────────────────────────────────────────────────────────

// ── Audit types ───────────────────────────────────────────────────────────────

export type Severidad = 'error' | 'warning' | 'info'

export type Hallazgo = {
  id: string
  severidad: Severidad
  descripcion: string
  workflow: 'WF11' | 'WF3' | 'WF7' | string
  timestamp: string          // ISO
  resuelto: boolean
  resuelto_en?: string
  resuelto_por?: string
}

export type NocheAuditoria = {
  fecha: string              // 'YYYY-MM-DD'
  hallazgos: Hallazgo[]
  resumen: { error: number; warning: number; info: number; total: number }
}

export type AuditoriaData = {
  ultima_auditoria: string   // ISO timestamp
  proxima_auditoria: string  // ISO timestamp (9:05 PM AST daily)
  wf11_activo: boolean
  sin_resolver: Hallazgo[]   // flat list, all unresolved
  historial: NocheAuditoria[] // last 30 nights
}

export type RunAuditoriaResult = {
  ok: boolean
  mensaje: string
  job_id?: string
}

// ── Inventario types ──────────────────────────────────────────────────────────

export type ProductoInventario = {
  id: string
  nombre: string
  sku?: string
  stock_actual: number
  stock_minimo: number
  unidad: string
  estado: 'ok' | 'critico' | 'agotado'
  ultima_actualizacion: string
}

export type InventarioData = {
  generado_en: string
  resumen: { total: number; criticos: number; agotados: number; discrepancias: number }
  productos: ProductoInventario[]
}

// ── Compras types ─────────────────────────────────────────────────────────────

export type OrdenCompra = {
  id: string
  proveedor: string
  items: number
  total: number
  status: 'borrador' | 'enviada' | 'recibida' | 'cancelada'
  creada_en: string
  esperada_en?: string
}

export type ComprasData = {
  generado_en: string
  resumen: { total: number; pendientes: number; recibidas_hoy: number }
  ordenes: OrdenCompra[]
}

// ── Facturas types ────────────────────────────────────────────────────────────

export type Factura = {
  id: string
  numero: string
  cliente: string
  monto: number
  status: 'borrador' | 'emitida' | 'pagada' | 'vencida' | 'cancelada'
  emitida_en: string
  vence_en?: string
  factura_url?: string
}

export type FacturasData = {
  generado_en: string
  resumen: { total: number; pendientes: number; pagadas_hoy: number; vencidas: number }
  facturas: Factura[]
}

// ── Resoluciones types ────────────────────────────────────────────────────────

export type Resolucion = {
  id: string
  titulo: string
  descripcion: string
  status: 'abierta' | 'en_progreso' | 'resuelta' | 'cerrada'
  prioridad: 'alta' | 'media' | 'baja'
  creada_en: string
  resuelta_en?: string
  asignada_a?: string
}

export type ResolucionesData = {
  generado_en: string
  resumen: { total: number; abiertas: number; en_progreso: number; resueltas_hoy: number }
  resoluciones: Resolucion[]
}

export const api = {
  home:         () => fetcher<HomeData>('/home'),
  ordenes:      () => fetcher<OrdenesData>('/ordenes'),
  pagos:        () => fetcher<PagosData>('/pagos'),
  auditoria:    () => fetcher<AuditoriaData>('/auditoria'),
  inventario:   () => fetcher<InventarioData>('/inventario'),
  compras:      () => fetcher<ComprasData>('/compras'),
  facturas:     () => fetcher<FacturasData>('/facturas'),
  resoluciones: () => fetcher<ResolucionesData>('/resoluciones'),
  runAuditoria: (pin: string) =>
    fetcher<RunAuditoriaResult>('/auditoria/run', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    }),
}
