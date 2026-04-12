'use client'

import { useState } from 'react'
import {
  FileText,
  ExternalLink,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Send,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type InvoiceType = 'order' | 'payment' | 'statement' | 'collections' | 'moratoria'

type Factura = {
  id: string
  invoice_id: string
  tipo: InvoiceType
  cliente: string
  fecha: string
  monto: number
  drive_url: string
  reenviada: boolean
}

type AgingBucket = '0-30' | '31-60' | '61-90' | '90+'
type ClienteSemaforo = 'verde' | 'amarillo' | 'rojo'

type ClienteCobranza = {
  id: string
  nombre: string
  email: string
  balance: number
  aging: Record<AgingBucket, number>
  semaforo: ClienteSemaforo
  ultima_factura: string
}

// ─── Static mock data ─────────────────────────────────────────────────────────

const FACTURAS_MOCK: Factura[] = [
  { id: 'f1',  invoice_id: 'INV-1041', tipo: 'order',       cliente: 'Restaurante El Mofongo',   fecha: '2026-04-12', monto: 845.00,  drive_url: '#', reenviada: false },
  { id: 'f2',  invoice_id: 'INV-1040', tipo: 'payment',     cliente: 'Café Borinquen',            fecha: '2026-04-11', monto: 320.50,  drive_url: '#', reenviada: true  },
  { id: 'f3',  invoice_id: 'INV-1039', tipo: 'order',       cliente: 'Panadería La Reina',        fecha: '2026-04-10', monto: 1230.00, drive_url: '#', reenviada: false },
  { id: 'f4',  invoice_id: 'STMT-043', tipo: 'statement',   cliente: 'Hotel Condado Beach',       fecha: '2026-04-01', monto: 4500.00, drive_url: '#', reenviada: false },
  { id: 'f5',  invoice_id: 'COB-021',  tipo: 'collections', cliente: 'Colmado Don Pepe',          fecha: '2026-03-28', monto: 680.75,  drive_url: '#', reenviada: true  },
  { id: 'f6',  invoice_id: 'MOR-008',  tipo: 'moratoria',   cliente: 'Restaurante El Mofongo',   fecha: '2026-03-20', monto: 1200.00, drive_url: '#', reenviada: false },
  { id: 'f7',  invoice_id: 'INV-1038', tipo: 'order',       cliente: 'Supermercado La Familia',  fecha: '2026-04-09', monto: 2100.00, drive_url: '#', reenviada: false },
  { id: 'f8',  invoice_id: 'PAY-055',  tipo: 'payment',     cliente: 'Café Borinquen',            fecha: '2026-04-08', monto: 320.50,  drive_url: '#', reenviada: false },
]

const CLIENTES_MOCK: ClienteCobranza[] = [
  {
    id: 'c1', nombre: 'Restaurante El Mofongo', email: 'pagos@elmofongo.pr',
    balance: 2045.00, aging: { '0-30': 845.00, '31-60': 1200.00, '61-90': 0, '90+': 0 },
    semaforo: 'amarillo', ultima_factura: '2026-04-12',
  },
  {
    id: 'c2', nombre: 'Hotel Condado Beach', email: 'cuentas@condadobeach.pr',
    balance: 8750.00, aging: { '0-30': 4500.00, '31-60': 2500.00, '61-90': 1750.00, '90+': 0 },
    semaforo: 'rojo', ultima_factura: '2026-04-01',
  },
  {
    id: 'c3', nombre: 'Colmado Don Pepe', email: 'donpepe@gmail.com',
    balance: 680.75, aging: { '0-30': 0, '31-60': 680.75, '61-90': 0, '90+': 0 },
    semaforo: 'amarillo', ultima_factura: '2026-03-28',
  },
  {
    id: 'c4', nombre: 'Panadería La Reina', email: 'lareina@example.pr',
    balance: 1230.00, aging: { '0-30': 1230.00, '31-60': 0, '61-90': 0, '90+': 0 },
    semaforo: 'verde', ultima_factura: '2026-04-10',
  },
  {
    id: 'c5', nombre: 'Supermercado La Familia', email: 'pagos@lafamilia.pr',
    balance: 3400.00, aging: { '0-30': 2100.00, '31-60': 800.00, '61-90': 500.00, '90+': 0 },
    semaforo: 'amarillo', ultima_factura: '2026-04-09',
  },
  {
    id: 'c6', nombre: 'Café Borinquen', email: 'contabilidad@cafeborinquen.pr',
    balance: 0, aging: { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 },
    semaforo: 'verde', ultima_factura: '2026-04-11',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `$${n.toLocaleString('es-PR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Invoice type badge ───────────────────────────────────────────────────────

const TIPO_CONFIG: Record<InvoiceType, { label: string; className: string }> = {
  order:       { label: 'Orden',       className: 'bg-blue-100   text-blue-700'   },
  payment:     { label: 'Pago',        className: 'bg-emerald-100 text-emerald-700' },
  statement:   { label: 'Estado Cta.', className: 'bg-purple-100 text-purple-700' },
  collections: { label: 'Cobro',       className: 'bg-amber-100  text-amber-700'  },
  moratoria:   { label: 'Moratoria',   className: 'bg-red-100    text-red-700'    },
}

function TipoBadge({ tipo }: { tipo: InvoiceType }) {
  const cfg = TIPO_CONFIG[tipo]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

// ─── Semáforo cobranza ────────────────────────────────────────────────────────

function SemaforoCobranza({ status }: { status: ClienteSemaforo }) {
  const cfg = {
    verde:    { icon: <CheckCircle   size={14} className="text-emerald-500" />, label: 'Al día'  },
    amarillo: { icon: <AlertTriangle size={14} className="text-amber-500"   />, label: 'Pendiente' },
    rojo:     { icon: <XCircle       size={14} className="text-red-500"     />, label: 'Vencido' },
  }[status]
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
      {cfg.icon}{cfg.label}
    </span>
  )
}

// ─── Reenviar button ──────────────────────────────────────────────────────────

function ReenviarButton({ factura }: { factura: Factura }) {
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(factura.reenviada)
  const [error,     setError]     = useState<string | null>(null)

  const handleReenviar = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/facturar', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_type:  factura.tipo,
          invoice_id:    factura.invoice_id,
          customer_name: factura.cliente,
          total:         factura.monto.toFixed(2),
          notes:         'Reenvío desde dashboard',
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? `HTTP ${res.status}`)
      }
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
        <CheckCircle size={12} /> Enviado
      </span>
    )
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        onClick={handleReenviar}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
          bg-indigo-50 text-indigo-700 border border-indigo-200
          hover:bg-indigo-100 disabled:opacity-40 transition-colors"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        {loading ? 'Enviando…' : 'Reenviar'}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

// ─── Generar cobro button ─────────────────────────────────────────────────────

function GenerarCobroButton({
  cliente,
  tipo,
  onDone,
}: {
  cliente: ClienteCobranza
  tipo: 'collections' | 'moratoria'
  onDone: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleGenerar = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/facturar', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_type:   tipo,
          invoice_id:     `${tipo.toUpperCase().slice(0, 3)}-${Date.now()}`,
          customer_name:  cliente.nombre,
          customer_email: cliente.email,
          total:          cliente.balance.toFixed(2),
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? `HTTP ${res.status}`)
      setDone(true)
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
        <CheckCircle size={12} /> Generado
      </span>
    )
  }

  const label = tipo === 'moratoria' ? 'Moratoria' : 'Cobro'
  const colorClass = tipo === 'moratoria'
    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        onClick={handleGenerar}
        disabled={loading || cliente.balance === 0}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
          border disabled:opacity-40 transition-colors ${colorClass}`}
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
        {loading ? 'Generando…' : `Generar ${label}`}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

// ─── Aging bar ────────────────────────────────────────────────────────────────

function AgingBar({ aging, total }: { aging: Record<AgingBucket, number>; total: number }) {
  if (total === 0) return <span className="text-xs text-slate-400">—</span>

  const buckets: { key: AgingBucket; color: string }[] = [
    { key: '0-30',  color: 'bg-emerald-400' },
    { key: '31-60', color: 'bg-amber-400'   },
    { key: '61-90', color: 'bg-orange-500'  },
    { key: '90+',   color: 'bg-red-600'     },
  ]

  return (
    <div className="space-y-1 min-w-[120px]">
      <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100">
        {buckets.map(({ key, color }) => {
          const pct = total > 0 ? (aging[key] / total) * 100 : 0
          return pct > 0 ? (
            <div key={key} className={`${color} h-full`} style={{ width: `${pct}%` }} />
          ) : null
        })}
      </div>
      <div className="flex gap-2 flex-wrap">
        {buckets.map(({ key, color }) =>
          aging[key] > 0 ? (
            <span key={key} className="text-xs text-slate-500">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${color} mr-0.5 align-middle`} />
              {key}d: {fmt(aging[key])}
            </span>
          ) : null
        )}
      </div>
    </div>
  )
}

// ─── Tab: Facturas ────────────────────────────────────────────────────────────

function FacturasTab() {
  const [tipoFilter, setTipoFilter] = useState<InvoiceType | 'todas'>('todas')
  const [facturas,   setFacturas]   = useState<Factura[]>(FACTURAS_MOCK)

  const tipos: { key: InvoiceType | 'todas'; label: string }[] = [
    { key: 'todas',       label: 'Todas'       },
    { key: 'order',       label: 'Órdenes'     },
    { key: 'payment',     label: 'Pagos'       },
    { key: 'statement',   label: 'Est. Cuenta' },
    { key: 'collections', label: 'Cobros'      },
    { key: 'moratoria',   label: 'Moratoria'   },
  ]

  const filtered = tipoFilter === 'todas'
    ? facturas
    : facturas.filter((f) => f.tipo === tipoFilter)

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex gap-1 flex-wrap">
        {tipos.map((t) => (
          <button
            key={t.key}
            onClick={() => setTipoFilter(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors
              ${tipoFilter === t.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
          >
            {t.label}
            {t.key !== 'todas' && (
              <span className="ml-1 opacity-70">
                ({facturas.filter((f) => f.tipo === t.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Monto</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">PDF</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                    No hay facturas con ese filtro
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{f.invoice_id}</td>
                    <td className="px-4 py-3"><TipoBadge tipo={f.tipo} /></td>
                    <td className="px-4 py-3 text-slate-700">{f.cliente}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{f.fecha}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{fmt(f.monto)}</td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href={f.drive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <ExternalLink size={12} />
                        Drive
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ReenviarButton factura={f} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-between">
          <p className="text-xs text-slate-400">
            {filtered.length} de {facturas.length} facturas
          </p>
          <p className="text-xs text-slate-400">
            Total: <span className="font-semibold text-slate-700">
              {fmt(filtered.reduce((s, f) => s + f.monto, 0))}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Cobranza ────────────────────────────────────────────────────────────

function CobranzaTab() {
  const [clientes,       setClientes]       = useState<ClienteCobranza[]>(CLIENTES_MOCK)
  const [loteLoading,    setLoteLoading]    = useState(false)
  const [loteDone,       setLoteDone]       = useState(false)
  const [loteError,      setLoteError]      = useState<string | null>(null)
  const [expandedAgings, setExpandedAgings] = useState<Set<string>>(new Set())

  const conBalance = clientes.filter((c) => c.balance > 0)
  const totalPendiente = conBalance.reduce((s, c) => s + c.balance, 0)

  const toggleAging = (id: string) =>
    setExpandedAgings((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleLote = async () => {
    setLoteLoading(true)
    setLoteError(null)
    try {
      // Genera estados de cuenta (STMT) para todos los clientes activos en paralelo
      const activos = clientes.filter((c) => c.balance > 0)
      await Promise.all(
        activos.map((c) =>
          fetch('/api/dashboard/facturar', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              invoice_type:   'statement',
              invoice_id:     `STMT-${c.id}-${Date.now()}`,
              customer_name:  c.nombre,
              customer_email: c.email,
              total:          c.balance.toFixed(2),
            }),
          })
        )
      )
      setLoteDone(true)
    } catch (e) {
      setLoteError(e instanceof Error ? e.message : 'Error en lote')
    } finally {
      setLoteLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary + lote button */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-4 flex-wrap">
          <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Balance total pendiente</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{fmt(totalPendiente)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{conBalance.length} cliente{conBalance.length !== 1 ? 's' : ''} con balance</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Clientes en mora</p>
            <p className="text-xl font-bold text-red-600 mt-1">
              {clientes.filter((c) => c.semaforo === 'rojo').length}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">balance +60 días</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {loteDone ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-emerald-600 font-medium bg-emerald-50 rounded-lg border border-emerald-200">
              <CheckCircle size={14} /> Estados de cuenta enviados
            </span>
          ) : (
            <button
              onClick={handleLote}
              disabled={loteLoading || conBalance.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                bg-indigo-600 text-white hover:bg-indigo-700
                disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loteLoading ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
              {loteLoading ? 'Generando…' : 'Generar en lote (STMT)'}
            </button>
          )}
          {loteError && <p className="text-xs text-red-500">{loteError}</p>}
          {!loteDone && <p className="text-xs text-slate-400">Genera estados de cuenta para {conBalance.length} clientes activos</p>}
        </div>
      </div>

      {/* Clients table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Cliente</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aging</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Últ. Factura</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.map((c) => {
                const expanded = expandedAgings.has(c.id)
                const rowBg = c.semaforo === 'rojo' ? 'bg-red-50/30' : c.semaforo === 'amarillo' ? 'bg-amber-50/20' : ''
                return (
                  <>
                    <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${rowBg}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{c.nombre}</p>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${c.balance === 0 ? 'text-slate-400' : c.semaforo === 'rojo' ? 'text-red-600' : 'text-slate-800'}`}>
                          {fmt(c.balance)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleAging(c.id)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600"
                        >
                          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          Ver desglose
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <SemaforoCobranza status={c.semaforo} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{c.ultima_factura}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <GenerarCobroButton
                            cliente={c}
                            tipo="collections"
                            onDone={() => {}}
                          />
                          {c.semaforo === 'rojo' && (
                            <GenerarCobroButton
                              cliente={c}
                              tipo="moratoria"
                              onDone={() => {}}
                            />
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Aging detail row */}
                    {expanded && (
                      <tr key={`${c.id}-aging`} className="bg-indigo-50/40">
                        <td colSpan={6} className="px-6 py-3">
                          <AgingBar aging={c.aging} total={c.balance} />
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400">
            {clientes.length} clientes · datos estáticos (WF12 pendiente integración)
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'facturas' | 'cobranza'

export default function FacturasPage() {
  const [tab, setTab] = useState<Tab>('facturas')

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'facturas', label: 'Facturas',  icon: <FileText size={14} /> },
    { id: 'cobranza', label: 'Cobranza',  icon: <Clock    size={14} /> },
  ]

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Facturas & Cobranza</h1>
          <p className="text-sm text-slate-500 mt-0.5">Historial de PDFs + gestión de cuentas por cobrar (WF12)</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium
              border-b-2 -mb-px transition-colors
              ${tab === t.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'facturas' && <FacturasTab />}
      {tab === 'cobranza' && <CobranzaTab />}
    </div>
  )
}
