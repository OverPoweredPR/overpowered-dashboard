'use client'

import { useState } from 'react'
import {
  MessageSquareWarning,
  Clock,
  CheckCircle,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Search,
  User,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type CasoEstado = 'abierta' | 'en_proceso' | 'resuelta'

type Caso = {
  id: string
  numero: string
  cliente: string
  descripcion: string
  abierto_en: string       // ISO datetime
  agente: string | null
  estado: CasoEstado
  nota_resolucion: string | null
}

// ─── Static mock data ─────────────────────────────────────────────────────────

const now = new Date('2026-04-12T10:00:00')

function hoursAgo(h: number) {
  return new Date(now.getTime() - h * 3600_000).toISOString()
}

const CASOS_MOCK: Caso[] = [
  {
    id: 'r1', numero: 'RES-0041', cliente: 'Restaurante El Mofongo',
    descripcion: 'Pedido incompleto — faltaron 2 baguettes clásicas en la entrega del martes.',
    abierto_en: hoursAgo(52), agente: null, estado: 'abierta', nota_resolucion: null,
  },
  {
    id: 'r2', numero: 'RES-0040', cliente: 'Hotel Condado Beach',
    descripcion: 'Factura duplicada — cobro doble en orden #1038. Solicitan crédito.',
    abierto_en: hoursAgo(30), agente: null, estado: 'abierta', nota_resolucion: null,
  },
  {
    id: 'r3', numero: 'RES-0039', cliente: 'Café Borinquen',
    descripcion: 'Producto vencido recibido — croissants con fecha de hoy pero en mal estado.',
    abierto_en: hoursAgo(8), agente: null, estado: 'abierta', nota_resolucion: null,
  },
  {
    id: 'r4', numero: 'RES-0038', cliente: 'Panadería La Reina',
    descripcion: 'Error en precio — cotización decía $1.20/u pero facturaron $1.45/u.',
    abierto_en: hoursAgo(20), agente: 'Jose E.', estado: 'en_proceso', nota_resolucion: null,
  },
  {
    id: 'r5', numero: 'RES-0037', cliente: 'Supermercado La Familia',
    descripcion: 'Retraso en entrega — pedido de las 7am llegó a las 11am. Impacto en ventas.',
    abierto_en: hoursAgo(14), agente: 'Maria R.', estado: 'en_proceso', nota_resolucion: null,
  },
  {
    id: 'r6', numero: 'RES-0036', cliente: 'Colmado Don Pepe',
    descripcion: 'Pan de agua llegó aplastado — embalaje inadecuado.',
    abierto_en: hoursAgo(72), agente: 'Jose E.', estado: 'resuelta',
    nota_resolucion: 'Se emitió nota de crédito por $45.00. Se reforzó embalaje para futuras entregas.',
  },
  {
    id: 'r7', numero: 'RES-0035', cliente: 'Hotel Condado Beach',
    descripcion: 'Cantidad incorrecta — recibieron 50 muffins en vez de 80.',
    abierto_en: hoursAgo(96), agente: 'Maria R.', estado: 'resuelta',
    nota_resolucion: 'Entrega de reposición completada al día siguiente. Sin cargo adicional.',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hoursOpen(isoStr: string): number {
  return (now.getTime() - new Date(isoStr).getTime()) / 3_600_000
}

function formatTimeOpen(isoStr: string): string {
  const h = hoursOpen(isoStr)
  if (h < 1)   return 'hace unos minutos'
  if (h < 24)  return `hace ${Math.floor(h)}h`
  return `hace ${Math.floor(h / 24)}d ${Math.floor(h % 24)}h`
}

function isUrgente(caso: Caso): boolean {
  return caso.estado !== 'resuelta' && hoursOpen(caso.abierto_en) >= 48
}

// ─── Resolver modal ───────────────────────────────────────────────────────────

function ResolverModal({
  caso,
  onClose,
  onResuelto,
}: {
  caso: Caso
  onClose: () => void
  onResuelto: (id: string, nota: string) => void
}) {
  const [nota,    setNota]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!nota.trim()) { setError('La nota de resolución es obligatoria'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/resoluciones', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'resolver', caso_id: caso.id, nota }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      onResuelto(caso.id, nota)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al resolver')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Marcar como resuelta</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {caso.numero} · {caso.cliente}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="bg-slate-50 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Problema</p>
          <p className="text-sm text-slate-700">{caso.descripcion}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nota de resolución <span className="text-red-500">*</span>
          </label>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Describe cómo se resolvió el caso…"
            rows={3}
            autoFocus
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none
              focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
          <p className="text-xs text-slate-400 mt-1">Campo obligatorio — quedará registrado en WF5D.</p>
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
              text-sm font-medium rounded-lg bg-emerald-600 text-white
              hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {loading ? 'Guardando…' : 'Resolver caso'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Caso card ────────────────────────────────────────────────────────────────

function CasoCard({
  caso,
  onTomar,
  onResolver,
}: {
  caso: Caso
  onTomar:   (id: string) => void
  onResolver: (caso: Caso) => void
}) {
  const [tomarLoading, setTomarLoading] = useState(false)
  const [tomarError,   setTomarError]   = useState<string | null>(null)

  const urgente = isUrgente(caso)
  const timeOpen = formatTimeOpen(caso.abierto_en)

  const handleTomar = async () => {
    setTomarLoading(true)
    setTomarError(null)
    try {
      const res = await fetch('/api/dashboard/resoluciones', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'tomar', caso_id: caso.id, agente: 'Jose E.' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      onTomar(caso.id)
    } catch (e) {
      setTomarError(e instanceof Error ? e.message : 'Error')
    } finally {
      setTomarLoading(false)
    }
  }

  return (
    <div
      className={`bg-white rounded-lg border shadow-sm p-3.5 space-y-3 transition-all
        ${urgente ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-200'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-700">{caso.numero}</span>
            {urgente && (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                <AlertTriangle size={10} />+48h
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-700 mt-0.5 truncate">{caso.cliente}</p>
        </div>
        <span className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap shrink-0">
          <Clock size={11} />{timeOpen}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{caso.descripcion}</p>

      {/* Agent */}
      {caso.agente && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <User size={11} />
          <span>{caso.agente}</span>
        </div>
      )}

      {/* Resolution note */}
      {caso.nota_resolucion && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          <p className="text-xs font-semibold text-emerald-700 mb-0.5">Resolución</p>
          <p className="text-xs text-emerald-800 leading-relaxed">{caso.nota_resolucion}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-1.5">
        {caso.estado === 'abierta' && (
          <div className="flex flex-col gap-1">
            <button
              onClick={handleTomar}
              disabled={tomarLoading}
              className="w-full inline-flex items-center justify-center gap-1.5
                px-3 py-1.5 text-xs font-medium rounded-md
                bg-indigo-600 text-white hover:bg-indigo-700
                disabled:opacity-40 transition-colors"
            >
              {tomarLoading ? <Loader2 size={12} className="animate-spin" /> : <User size={12} />}
              {tomarLoading ? 'Asignando…' : 'Tomar caso'}
            </button>
            {tomarError && <p className="text-xs text-red-500 text-center">{tomarError}</p>}
          </div>
        )}

        {caso.estado === 'en_proceso' && (
          <button
            onClick={() => onResolver(caso)}
            className="w-full inline-flex items-center justify-center gap-1.5
              px-3 py-1.5 text-xs font-medium rounded-md
              bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle size={12} />
            Marcar resuelta
          </button>
        )}

        {caso.estado === 'resuelta' && (
          <span className="flex items-center justify-center gap-1 text-xs text-emerald-600 font-medium py-1">
            <CheckCircle size={12} /> Caso cerrado
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Kanban column ────────────────────────────────────────────────────────────

type ColumnDef = {
  id: CasoEstado
  label: string
  colorTop: string
  headerBg: string
  icon: React.ReactNode
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'abierta',
    label: 'Abierta',
    colorTop: 'border-amber-400',
    headerBg: 'bg-amber-50',
    icon: <MessageSquareWarning size={14} className="text-amber-500" />,
  },
  {
    id: 'en_proceso',
    label: 'En Proceso',
    colorTop: 'border-blue-400',
    headerBg: 'bg-blue-50',
    icon: <Clock size={14} className="text-blue-500" />,
  },
  {
    id: 'resuelta',
    label: 'Resuelta',
    colorTop: 'border-emerald-500',
    headerBg: 'bg-emerald-50',
    icon: <CheckCircle size={14} className="text-emerald-500" />,
  },
]

function KanbanColumn({
  col,
  casos,
  onTomar,
  onResolver,
}: {
  col: ColumnDef
  casos: Caso[]
  onTomar: (id: string) => void
  onResolver: (caso: Caso) => void
}) {
  const urgentes = casos.filter(isUrgente).length

  return (
    <div className="flex flex-col min-w-[260px] w-full flex-1">
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg
        border-t-2 ${col.colorTop} ${col.headerBg} border-x border-slate-200`}
      >
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          {col.icon}{col.label}
        </span>
        <div className="flex items-center gap-1.5">
          {urgentes > 0 && (
            <span className="text-xs font-bold bg-red-100 text-red-600 rounded-full w-5 h-5
              flex items-center justify-center">
              {urgentes}
            </span>
          )}
          <span className="text-xs font-bold bg-white rounded-full w-5 h-5
            flex items-center justify-center border border-slate-200 text-slate-600">
            {casos.length}
          </span>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 border-x border-b border-slate-200
        rounded-b-lg p-2 space-y-2 min-h-[240px]"
      >
        {casos.length === 0 ? (
          <p className="text-xs text-slate-400 text-center pt-8">Sin casos</p>
        ) : (
          casos.map((c) => (
            <CasoCard
              key={c.id}
              caso={c}
              onTomar={onTomar}
              onResolver={onResolver}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResolucionesPage() {
  const [casos,         setCasos]         = useState<Caso[]>(CASOS_MOCK)
  const [resolviendo,   setResolviendo]   = useState<Caso | null>(null)
  const [searchCliente, setSearchCliente] = useState('')
  const [filterEstado,  setFilterEstado]  = useState<CasoEstado | 'todos'>('todos')

  const handleTomar = (id: string) =>
    setCasos((prev) =>
      prev.map((c) => c.id === id ? { ...c, estado: 'en_proceso', agente: 'Jose E.' } : c)
    )

  const handleResuelto = (id: string, nota: string) =>
    setCasos((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, estado: 'resuelta', nota_resolucion: nota } : c
      )
    )

  const filtered = casos.filter((c) => {
    const matchEstado  = filterEstado === 'todos' || c.estado === filterEstado
    const q = searchCliente.toLowerCase()
    const matchSearch  = !q || c.cliente.toLowerCase().includes(q) || c.numero.toLowerCase().includes(q)
    return matchEstado && matchSearch
  })

  const totalUrgentes = casos.filter(isUrgente).length
  const counts = {
    abierta:    filtered.filter((c) => c.estado === 'abierta').length,
    en_proceso: filtered.filter((c) => c.estado === 'en_proceso').length,
    resuelta:   filtered.filter((c) => c.estado === 'resuelta').length,
  }

  const FILTER_TABS: { key: CasoEstado | 'todos'; label: string }[] = [
    { key: 'todos',      label: `Todos (${filtered.length})`         },
    { key: 'abierta',    label: `Abiertos (${counts.abierta})`       },
    { key: 'en_proceso', label: `En proceso (${counts.en_proceso})`  },
    { key: 'resuelta',   label: `Resueltos (${counts.resuelta})`     },
  ]

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Resoluciones</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pipeline de casos — WF5D Customer Resolution Engine
          </p>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* Urgentes banner */}
      {totalUrgentes > 0 && (
        <div className="flex items-center gap-2 text-sm font-medium text-red-700
          bg-red-50 border border-red-200 rounded-lg px-4 py-2.5"
        >
          <AlertTriangle size={15} className="shrink-0" />
          {totalUrgentes} caso{totalUrgentes !== 1 ? 's' : ''} sin resolver con más de 48 horas
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 flex-wrap">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterEstado(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${filterEstado === t.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative sm:ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar cliente o caso…"
            value={searchCliente}
            onChange={(e) => setSearchCliente(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md
              bg-white text-slate-700 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
              w-full sm:w-56"
          />
        </div>
      </div>

      {/* Kanban — horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max lg:min-w-0 lg:grid lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              col={col}
              casos={filtered.filter((c) => c.estado === col.id)}
              onTomar={handleTomar}
              onResolver={setResolviendo}
            />
          ))}
        </div>
      </div>

      {/* Resolver modal */}
      {resolviendo && (
        <ResolverModal
          caso={resolviendo}
          onClose={() => setResolviendo(null)}
          onResuelto={handleResuelto}
        />
      )}
    </div>
  )
}
