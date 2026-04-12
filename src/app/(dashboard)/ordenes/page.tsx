'use client'

import { useState } from 'react'
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronUp,
  ChevronDown,
  Search,
  RefreshCw,
} from 'lucide-react'
import { useOrdenes, useRefreshDashboard } from '@/hooks/useDashboard'
import type { Orden } from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderStatus = 'pagada' | 'pendiente' | 'cancelada' | 'en_proceso'

type Order = {
  id: string
  numero: string
  cliente: string
  total: number
  estado: OrderStatus
  fecha: string
  shopify_order_id: string
  facturado: boolean
}

type SortField = 'numero' | 'cliente' | 'total' | 'estado' | 'fecha'
type SortDir   = 'asc' | 'desc'

// ─── API → local mapper ───────────────────────────────────────────────────────

const STATUS_MAP: Record<Orden['status'], OrderStatus> = {
  pendiente_aprobacion: 'pendiente',
  aprobada:             'en_proceso',
  en_preparacion:       'en_proceso',
  completada:           'pagada',
  cancelada:            'cancelada',
}

function toOrder(o: Orden): Order {
  return {
    id:               o.id,
    numero:           o.shopify_order,
    cliente:          o.cliente,
    total:            o.monto,
    estado:           STATUS_MAP[o.status] ?? 'pendiente',
    fecha:            o.creada_en.split('T')[0],
    shopify_order_id: o.shopify_order,
    facturado:        !!o.factura_url,
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className ?? ''}`} />
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Orden', 'Cliente', 'Total', 'Estado', 'Fecha', 'Acción'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pagada: {
    label: 'Pagada',
    className: 'bg-emerald-100 text-emerald-700',
    icon: <CheckCircle size={12} />,
  },
  pendiente: {
    label: 'Pendiente',
    className: 'bg-amber-100 text-amber-700',
    icon: <Clock size={12} />,
  },
  en_proceso: {
    label: 'En proceso',
    className: 'bg-blue-100 text-blue-700',
    icon: <AlertCircle size={12} />,
  },
  cancelada: {
    label: 'Cancelada',
    className: 'bg-slate-100 text-slate-500',
    icon: <XCircle size={12} />,
  },
}

function StatusBadge({ estado }: { estado: OrderStatus }) {
  const cfg = STATUS_CONFIG[estado]
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

// ─── Facturar button ──────────────────────────────────────────────────────────

function FacturarButton({ order }: { order: Order }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(order.facturado)
  const [error, setError]     = useState<string | null>(null)

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
        <CheckCircle size={13} />
        Facturado
      </span>
    )
  }

  const handleFacturar = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/facturar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_type:     'order',
          invoice_id:       `INV-${order.numero.replace('#', '')}`,
          customer_name:    order.cliente,
          shopify_order_id: order.shopify_order_id,
          total:            order.total.toFixed(2),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        onClick={handleFacturar}
        disabled={loading || order.estado === 'cancelada'}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
          bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40
          disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <FileText size={12} />
        )}
        {loading ? 'Generando…' : 'Facturar'}
      </button>
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  )
}

// ─── Sort header ──────────────────────────────────────────────────────────────

function SortHeader({
  field,
  label,
  current,
  dir,
  onClick,
}: {
  field: SortField
  label: string
  current: SortField
  dir: SortDir
  onClick: (f: SortField) => void
}) {
  const active = current === field
  return (
    <th
      onClick={() => onClick(field)}
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
        text-slate-500 cursor-pointer select-none hover:text-slate-700 whitespace-nowrap"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        ) : (
          <ChevronDown size={12} className="opacity-30" />
        )}
      </span>
    </th>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdenesPage() {
  const [search,  setSearch]  = useState('')
  const [sortBy,  setSortBy]  = useState<SortField>('fecha')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filter,  setFilter]  = useState<OrderStatus | 'todas'>('todas')

  const { data, isPending, error, refetch } = useOrdenes()
  const { refreshOrdenes } = useRefreshDashboard()

  const ordenes: Order[] = (data?.ordenes ?? []).map(toOrder)

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  if (isPending) {
    return (
      <div className="space-y-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold text-slate-800">Órdenes</h1></div>
        </div>
        <TableSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 max-w-6xl">
        <h1 className="text-xl font-bold text-slate-800">Órdenes</h1>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">No se pudieron cargar las órdenes: {error.message}</p>
          <button onClick={() => refetch()} className="text-xs font-medium text-red-600 hover:text-red-800 underline">Reintentar</button>
        </div>
      </div>
    )
  }

  const filtered = ordenes
    .filter((o) => {
      const matchFilter = filter === 'todas' || o.estado === filter
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        o.numero.toLowerCase().includes(q) ||
        o.cliente.toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortBy === 'numero')  cmp = a.numero.localeCompare(b.numero)
      if (sortBy === 'cliente') cmp = a.cliente.localeCompare(b.cliente)
      if (sortBy === 'total')   cmp = a.total - b.total
      if (sortBy === 'estado')  cmp = a.estado.localeCompare(b.estado)
      if (sortBy === 'fecha')   cmp = a.fecha.localeCompare(b.fecha)
      return sortDir === 'asc' ? cmp : -cmp
    })

  const counts = {
    todas:      ordenes.length,
    pagada:     ordenes.filter((o) => o.estado === 'pagada').length,
    pendiente:  ordenes.filter((o) => o.estado === 'pendiente').length,
    en_proceso: ordenes.filter((o) => o.estado === 'en_proceso').length,
    cancelada:  ordenes.filter((o) => o.estado === 'cancelada').length,
  }

  const FILTER_TABS: { key: OrderStatus | 'todas'; label: string }[] = [
    { key: 'todas',      label: `Todas (${counts.todas})`          },
    { key: 'pendiente',  label: `Pendientes (${counts.pendiente})`  },
    { key: 'en_proceso', label: `En proceso (${counts.en_proceso})` },
    { key: 'pagada',     label: `Pagadas (${counts.pagada})`        },
    { key: 'cancelada',  label: `Canceladas (${counts.cancelada})`  },
  ]

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Órdenes</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtered.length} orden{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={refreshOrdenes} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${
                  filter === t.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar orden o cliente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md
              bg-white text-slate-700 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
              w-full sm:w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <SortHeader field="numero"  label="Orden"   current={sortBy} dir={sortDir} onClick={handleSort} />
                <SortHeader field="cliente" label="Cliente" current={sortBy} dir={sortDir} onClick={handleSort} />
                <SortHeader field="total"   label="Total"   current={sortBy} dir={sortDir} onClick={handleSort} />
                <SortHeader field="estado"  label="Estado"  current={sortBy} dir={sortDir} onClick={handleSort} />
                <SortHeader field="fecha"   label="Fecha"   current={sortBy} dir={sortDir} onClick={handleSort} />
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    No se encontraron órdenes
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">
                      {order.numero}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{order.cliente}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge estado={order.estado} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {order.fecha}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <FacturarButton order={order} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Mostrando {filtered.length} de {ordenes.length} órdenes
          </p>
          <p className="text-xs text-slate-400">
            Total filtrado:{' '}
            <span className="font-semibold text-slate-700">
              ${filtered.reduce((s, o) => s + o.total, 0).toFixed(2)}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
