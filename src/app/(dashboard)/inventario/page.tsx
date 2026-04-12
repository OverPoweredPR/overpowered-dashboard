'use client'

import { useState } from 'react'
import {
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Semaforo = 'verde' | 'amarillo' | 'rojo'

type Producto = {
  id: string
  sku: string
  nombre: string
  stock_actual: number
  stock_minimo: number
  ultima_actualizacion: string
}

type Discrepancia = {
  id: string
  sku: string
  nombre: string
  stock_shopify: number
  stock_airtable: number
  diferencia: number
  fecha: string
  acknowledged: boolean
}

type Reconciliacion = {
  fecha: string
  productos_revisados: number
  discrepancias: number
  ajustes: number
}

// ─── Static mock data ─────────────────────────────────────────────────────────

const PRODUCTOS_MOCK: Producto[] = [
  { id: '1', sku: 'BAG-001', nombre: 'Baguette Clásica',        stock_actual: 48,  stock_minimo: 20, ultima_actualizacion: '2026-04-12 08:30' },
  { id: '2', sku: 'BAG-002', nombre: 'Baguette Integral',       stock_actual: 15,  stock_minimo: 15, ultima_actualizacion: '2026-04-12 08:30' },
  { id: '3', sku: 'BAG-003', nombre: 'Baguette de Ajo',         stock_actual: 0,   stock_minimo: 10, ultima_actualizacion: '2026-04-12 07:15' },
  { id: '4', sku: 'PAN-001', nombre: 'Pan de Agua',             stock_actual: 120, stock_minimo: 50, ultima_actualizacion: '2026-04-12 08:30' },
  { id: '5', sku: 'PAN-002', nombre: 'Pan de Mallorca',         stock_actual: 8,   stock_minimo: 20, ultima_actualizacion: '2026-04-11 18:00' },
  { id: '6', sku: 'CRO-001', nombre: 'Croissant Mantequilla',   stock_actual: 30,  stock_minimo: 25, ultima_actualizacion: '2026-04-12 08:30' },
  { id: '7', sku: 'CRO-002', nombre: 'Croissant de Chocolate',  stock_actual: 0,   stock_minimo: 15, ultima_actualizacion: '2026-04-11 18:00' },
  { id: '8', sku: 'MUF-001', nombre: 'Muffin de Arándanos',     stock_actual: 22,  stock_minimo: 20, ultima_actualizacion: '2026-04-12 08:30' },
]

const DISCREPANCIAS_MOCK: Discrepancia[] = [
  { id: 'd1', sku: 'BAG-002', nombre: 'Baguette Integral',      stock_shopify: 15, stock_airtable: 12, diferencia: 3,  fecha: '2026-04-12', acknowledged: false },
  { id: 'd2', sku: 'CRO-001', nombre: 'Croissant Mantequilla',  stock_shopify: 30, stock_airtable: 35, diferencia: -5, fecha: '2026-04-12', acknowledged: false },
  { id: 'd3', sku: 'MUF-001', nombre: 'Muffin de Arándanos',    stock_shopify: 22, stock_airtable: 20, diferencia: 2,  fecha: '2026-04-11', acknowledged: true  },
]

const RECONCILIACIONES_MOCK: Reconciliacion[] = [
  { fecha: '2026-04-12', productos_revisados: 8, discrepancias: 2, ajustes: 1 },
  { fecha: '2026-04-11', productos_revisados: 8, discrepancias: 1, ajustes: 0 },
  { fecha: '2026-04-10', productos_revisados: 8, discrepancias: 3, ajustes: 2 },
  { fecha: '2026-04-09', productos_revisados: 8, discrepancias: 0, ajustes: 0 },
  { fecha: '2026-04-08', productos_revisados: 8, discrepancias: 4, ajustes: 3 },
  { fecha: '2026-04-07', productos_revisados: 8, discrepancias: 1, ajustes: 1 },
  { fecha: '2026-04-06', productos_revisados: 8, discrepancias: 2, ajustes: 1 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSemaforo(p: Producto): Semaforo {
  if (p.stock_actual === 0)                    return 'rojo'
  if (p.stock_actual <= p.stock_minimo)        return 'amarillo'
  return 'verde'
}

// ─── Semáforo dot ─────────────────────────────────────────────────────────────

function SemaforoDot({ status }: { status: Semaforo }) {
  const cfg = {
    verde:    { bg: 'bg-emerald-500', ring: 'ring-emerald-200', label: 'OK'     },
    amarillo: { bg: 'bg-amber-400',   ring: 'ring-amber-200',   label: 'Bajo'   },
    rojo:     { bg: 'bg-red-500',     ring: 'ring-red-200',     label: 'Agotado'},
  }[status]

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium`}>
      <span className={`w-2.5 h-2.5 rounded-full ring-2 ${cfg.bg} ${cfg.ring}`} />
      {cfg.label}
    </span>
  )
}

// ─── Ajustar stock modal ──────────────────────────────────────────────────────

function AjustarModal({
  producto,
  onClose,
  onAjustado,
}: {
  producto: Producto
  onClose: () => void
  onAjustado: (id: string, nuevaCantidad: number) => void
}) {
  const [cantidad, setCantidad] = useState<string>('')
  const [motivo,   setMotivo]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const handleSubmit = async () => {
    const num = parseInt(cantidad, 10)
    if (isNaN(num) || num < 0) { setError('Ingresa una cantidad válida (≥ 0)'); return }
    if (!motivo.trim())         { setError('El motivo es requerido'); return }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/inventario/ajustar', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sku: producto.sku, cantidad: num, motivo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      onAjustado(producto.id, num)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al ajustar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Ajustar stock</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {producto.nombre} <span className="font-mono text-xs">({producto.sku})</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="bg-slate-50 rounded-lg px-4 py-3 flex justify-between text-sm">
          <span className="text-slate-500">Stock actual</span>
          <span className="font-bold text-slate-800">{producto.stock_actual}</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nueva cantidad
            </label>
            <input
              type="number"
              min="0"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="ej. 40"
              autoFocus
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Motivo
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="ej. Conteo físico — discrepancia con sistema"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            <AlertTriangle size={14} />{error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200
              text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2
              text-sm font-medium rounded-lg bg-indigo-600 text-white
              hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {loading ? 'Guardando…' : 'Ajustar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Productos table ──────────────────────────────────────────────────────────

function ProductosTable({
  productos,
  onAjustar,
}: {
  productos: Producto[]
  onAjustar: (p: Producto) => void
}) {
  const criticos = productos.filter((p) => getSemaforo(p) !== 'verde').length

  return (
    <div className="space-y-3">
      {criticos > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle size={14} />
          {criticos} producto{criticos !== 1 ? 's' : ''} bajo stock o agotado{criticos !== 1 ? 's' : ''}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Producto</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Stock Actual</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Stock Mínimo</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Últ. Actualización</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productos.map((p) => {
                const sem = getSemaforo(p)
                const rowBg = sem === 'rojo' ? 'bg-red-50/40' : sem === 'amarillo' ? 'bg-amber-50/30' : ''
                return (
                  <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${rowBg}`}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-600">{p.sku}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{p.nombre}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${p.stock_actual === 0 ? 'text-red-600' : p.stock_actual <= p.stock_minimo ? 'text-amber-600' : 'text-slate-800'}`}>
                        {p.stock_actual}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">{p.stock_minimo}</td>
                    <td className="px-4 py-3 text-center">
                      <SemaforoDot status={sem} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{p.ultima_actualizacion}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onAjustar(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
                          bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                      >
                        <Package size={12} />
                        Ajustar stock
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400">{productos.length} productos · datos estáticos (WF3 pendiente)</p>
        </div>
      </div>
    </div>
  )
}

// ─── Discrepancias WF3 ────────────────────────────────────────────────────────

function DiscrepanciasSection({
  discrepancias,
  onAcknowledge,
}: {
  discrepancias: Discrepancia[]
  onAcknowledge: (id: string) => void
}) {
  const pendientes = discrepancias.filter((d) => !d.acknowledged)

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <XCircle size={16} className="text-red-500" />
          Discrepancias WF3 — Shopify vs Airtable
          {pendientes.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full">
              {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
            </span>
          )}
        </h2>
      </div>

      {discrepancias.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-3">
          <CheckCircle size={14} /> Sin discrepancias activas
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Producto</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Shopify</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Airtable</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Diferencia</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discrepancias.map((d) => (
                  <tr key={d.id} className={`transition-colors ${d.acknowledged ? 'opacity-50 bg-slate-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-600">{d.sku}</td>
                    <td className="px-4 py-3 text-slate-700">{d.nombre}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{d.stock_shopify}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{d.stock_airtable}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${d.diferencia > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {d.diferencia > 0 ? '+' : ''}{d.diferencia}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{d.fecha}</td>
                    <td className="px-4 py-3 text-right">
                      {d.acknowledged ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle size={12} /> Revisado
                        </span>
                      ) : (
                        <button
                          onClick={() => onAcknowledge(d.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
                            bg-emerald-50 text-emerald-700 border border-emerald-200
                            hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle size={12} />
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

// ─── Historial reconciliaciones ───────────────────────────────────────────────

function HistorialReconciliaciones({ data }: { data: Reconciliacion[] }) {
  const [open, setOpen] = useState(false)

  return (
    <section className="space-y-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
      >
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        Historial de reconciliaciones (últimas 30 noches)
      </button>

      {open && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Productos revisados</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Discrepancias</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Ajustes realizados</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((r) => (
                  <tr key={r.fecha} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-700 font-medium text-xs">{r.fecha}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{r.productos_revisados}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={r.discrepancias > 0 ? 'text-amber-600 font-semibold' : 'text-slate-400'}>
                        {r.discrepancias}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{r.ajustes}</td>
                    <td className="px-4 py-3 text-center">
                      {r.discrepancias === 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle size={12} /> Limpio
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <AlertTriangle size={12} /> Con diferencias
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-400">{data.length} noches · datos estáticos (WF3 pendiente)</p>
          </div>
        </div>
      )}
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InventarioPage() {
  const [productos,     setProductos]     = useState<Producto[]>(PRODUCTOS_MOCK)
  const [discrepancias, setDiscrepancias] = useState<Discrepancia[]>(DISCREPANCIAS_MOCK)
  const [ajustando,     setAjustando]     = useState<Producto | null>(null)

  const handleAjustado = (id: string, nuevaCantidad: number) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, stock_actual: nuevaCantidad, ultima_actualizacion: new Date().toLocaleString('es-PR', { hour12: false }).slice(0, 16) }
          : p
      )
    )
  }

  const handleAcknowledge = (id: string) => {
    setDiscrepancias((prev) =>
      prev.map((d) => (d.id === id ? { ...d, acknowledged: true } : d))
    )
  }

  const pendientesDiscrep = discrepancias.filter((d) => !d.acknowledged).length

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Inventario</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {productos.length} productos · {pendientesDiscrep > 0 ? `${pendientesDiscrep} discrepancia${pendientesDiscrep !== 1 ? 's' : ''} pendiente${pendientesDiscrep !== 1 ? 's' : ''}` : 'Sin discrepancias activas'}
          </p>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* Tabla de productos */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Productos</h2>
        <ProductosTable productos={productos} onAjustar={setAjustando} />
      </section>

      {/* Discrepancias WF3 */}
      <DiscrepanciasSection discrepancias={discrepancias} onAcknowledge={handleAcknowledge} />

      {/* Historial */}
      <HistorialReconciliaciones data={RECONCILIACIONES_MOCK} />

      {/* Modal ajuste */}
      {ajustando && (
        <AjustarModal
          producto={ajustando}
          onClose={() => setAjustando(null)}
          onAjustado={handleAjustado}
        />
      )}
    </div>
  )
}
