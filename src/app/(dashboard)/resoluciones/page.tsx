'use client'

import { useState } from 'react'
import {
  MessageSquareWarning,
  Clock,
  CheckCircle,
  CheckCircle2,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Search,
  UserCheck,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type CasoEstado = 'abierta' | 'en_proceso' | 'resuelta'

type Caso = {
  id: string
  cliente: string
  problema: string
  abierto_en: Date
  agente: string
  estado: CasoEstado
  nota_resolucion: string | null
}

// ─── Static mock data ─────────────────────────────────────────────────────────
// Ported from Lovable baguette-insights/src/pages/Resoluciones.tsx

const now = new Date('2026-04-12T10:00:00')
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000)

const CASOS_MOCK: Caso[] = [
  { id: 'RES-040', cliente: 'Hotel San Juan',          problema: 'Baguettes llegaron frías, cliente solicita reposición.',             abierto_en: hoursAgo(4),   agente: 'Sin asignar', estado: 'abierta',    nota_resolucion: null },
  { id: 'RES-039', cliente: 'Café La Plaza',           problema: 'Cantidad incorrecta en pedido — faltaron 12 croissants.',            abierto_en: hoursAgo(60),  agente: 'Sin asignar', estado: 'abierta',    nota_resolucion: null },
  { id: 'RES-038', cliente: 'Deli Boricua',            problema: 'Producto con fecha de expiración cercana recibido.',                 abierto_en: hoursAgo(52),  agente: 'Sin asignar', estado: 'abierta',    nota_resolucion: null },
  { id: 'RES-037', cliente: 'Bistro 787',              problema: 'Entrega tardía de 2 horas — afectó servicio de almuerzo.',           abierto_en: hoursAgo(18),  agente: 'María López', estado: 'en_proceso', nota_resolucion: null },
  { id: 'RES-036', cliente: 'Restaurante El Coquí',    problema: 'Croissants dañados durante el transporte.',                         abierto_en: hoursAgo(72),  agente: 'Carlos Rivera', estado: 'en_proceso', nota_resolucion: null },
  { id: 'RES-035', cliente: 'Panadería Express',       problema: 'Error en facturación — cobro doble en orden #1038.',                 abierto_en: hoursAgo(96),  agente: 'María López', estado: 'resuelta',   nota_resolucion: 'Se emitió nota de crédito por $45.00. Cobro duplicado revertido.' },
  { id: 'RES-034', cliente: 'Hotel Caribe',            problema: 'Pan de ajo con sabor inusual — lote investigado.',                   abierto_en: hoursAgo(120), agente: 'Carlos Rivera', estado: 'resuelta', nota_resolucion: 'Lote retirado. Reposición entregada sin cargo.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Ported from Lovable: formatOpen + isUrgent
function formatOpen(d: Date): string {
  const h = Math.floor((now.getTime() - d.getTime()) / 3_600_000)
  if (h < 24) return `${h}h abierto`
  return `${Math.floor(h / 24)}d ${h % 24}h abierto`
}

function isUrgente(c: Caso): boolean {
  return c.estado !== 'resuelta' && now.getTime() - c.abierto_en.getTime() > 48 * 3_600_000
}

// ─── Column config ────────────────────────────────────────────────────────────

type ColumnDef = { id: CasoEstado; label: string; dot: string; headerBg: string; icon: React.ReactNode }

const COLUMNS: ColumnDef[] = [
  { id: 'abierta',    label: 'Abierta',     dot: 'bg-amber-400',   headerBg: 'bg-amber-50',   icon: <MessageSquareWarning size={14} className="text-amber-500" /> },
  { id: 'en_proceso', label: 'En Proceso',  dot: 'bg-blue-400',    headerBg: 'bg-blue-50',    icon: <Clock                size={14} className="text-blue-500"   /> },
  { id: 'resuelta',   label: 'Resuelta',    dot: 'bg-emerald-500', headerBg: 'bg-emerald-50', icon: <CheckCircle          size={14} className="text-emerald-500" /> },
]

// ─── Toast-style inline feedback ─────────────────────────────────────────────

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2
        bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg
        animate-in fade-in slide-in-from-bottom-2"
      onAnimationEnd={() => setTimeout(onDone, 2500)}
    >
      <CheckCircle size={14} className="text-emerald-400 shrink-0" />
      {msg}
    </div>
  )
}

// ─── Resolver modal ───────────────────────────────────────────────────────────
// Visual improvements from Lovable: DialogDescription pattern, disabled state on button

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
        {/* Header — pattern from Lovable DialogHeader */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Marcar como Resuelta</h2>
            {/* DialogDescription pattern from Lovable */}
            <p className="text-sm text-slate-500 mt-0.5">{caso.id} — {caso.cliente}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-4">
            <X size={18} />
          </button>
        </div>

        {/* Problem summary */}
        <div className="bg-slate-50 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Problema</p>
          <p className="text-sm text-slate-700">{caso.problema}</p>
        </div>

        {/* Note field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Nota de resolución <span className="text-red-500">*</span>
          </label>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Describe la resolución aplicada…"
            rows={4}
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
          {/* Lovable: disabled while note is empty */}
          <button
            onClick={handleSubmit}
            disabled={loading || !nota.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2
              text-sm font-medium rounded-lg bg-emerald-600 text-white
              hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {loading ? 'Guardando…' : 'Confirmar Resolución'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Caso card ────────────────────────────────────────────────────────────────
// Key Lovable ports: agent badge footer, hover:shadow-md, border-destructive for urgent

function CasoCard({
  caso,
  onTomar,
  onResolver,
}: {
  caso: Caso
  onTomar:    (id: string) => void
  onResolver: (caso: Caso) => void
}) {
  const [tomarLoading, setTomarLoading] = useState(false)
  const urgent = isUrgente(caso)

  const handleTomar = async () => {
    setTomarLoading(true)
    try {
      const res = await fetch('/api/dashboard/resoluciones', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'tomar', caso_id: caso.id, agente: 'Jose E.' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      onTomar(caso.id)
    } catch {
      // silently revert — toast shown by parent
    } finally {
      setTomarLoading(false)
    }
  }

  return (
    <div
      className={`bg-white rounded-lg border shadow-sm p-4 space-y-3
        transition-shadow hover:shadow-md
        ${urgent ? 'border-red-400 border-2' : 'border-slate-200'}`}
    >
      {/* Top row: case ID + urgent badge (Lovable pattern) */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-slate-500">{caso.id}</span>
        {urgent && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold
            bg-red-100 text-red-600 px-1.5 py-0.5 rounded shrink-0">
            <AlertTriangle size={10} /> +48h
          </span>
        )}
      </div>

      {/* Client name */}
      <p className="font-medium text-sm text-slate-800">{caso.cliente}</p>

      {/* Problem description */}
      <p className="text-xs text-slate-500 leading-relaxed">{caso.problema}</p>

      {/* Footer: time open + agent badge (ported from Lovable) */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {formatOpen(caso.abierto_en)}
        </span>
        {/* Agent badge — ported from Lovable Badge variant="outline" */}
        <span className="border border-slate-200 rounded-full px-2 py-0.5 text-[10px] font-medium text-slate-600">
          {caso.agente}
        </span>
      </div>

      {/* Resolution note */}
      {caso.nota_resolucion && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          <p className="text-xs font-semibold text-emerald-700 mb-0.5">Resolución</p>
          <p className="text-xs text-emerald-800 leading-relaxed">{caso.nota_resolucion}</p>
        </div>
      )}

      {/* Actions */}
      {caso.estado === 'abierta' && (
        <button
          onClick={handleTomar}
          disabled={tomarLoading}
          className="w-full inline-flex items-center justify-center gap-2
            px-3 py-1.5 text-xs font-medium rounded-md
            bg-indigo-600 text-white hover:bg-indigo-700
            disabled:opacity-40 transition-colors"
        >
          {tomarLoading ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
          {tomarLoading ? 'Asignando…' : 'Tomar caso'}
        </button>
      )}

      {caso.estado === 'en_proceso' && (
        <button
          onClick={() => onResolver(caso)}
          className="w-full inline-flex items-center justify-center gap-2
            px-3 py-1.5 text-xs font-medium rounded-md
            border border-emerald-300 text-emerald-700 bg-emerald-50
            hover:bg-emerald-100 transition-colors"
        >
          <CheckCircle2 size={12} /> Marcar resuelta
        </button>
      )}

      {caso.estado === 'resuelta' && (
        <span className="flex items-center justify-center gap-1 text-xs text-emerald-600 font-medium py-0.5">
          <CheckCircle size={12} /> Caso cerrado
        </span>
      )}
    </div>
  )
}

// ─── Kanban column ────────────────────────────────────────────────────────────
// Ported from Lovable: sticky header, dot accent, dashed empty state

function KanbanColumn({
  col, casos, onTomar, onResolver,
}: {
  col: ColumnDef
  casos: Caso[]
  onTomar: (id: string) => void
  onResolver: (caso: Caso) => void
}) {
  const urgentes = casos.filter(isUrgente).length

  return (
    <div className="flex-1 min-w-[260px] space-y-3">
      {/* Sticky header — ported from Lovable */}
      <div className={`sticky top-0 z-10 flex items-center gap-2 py-2 px-3 rounded-lg ${col.headerBg}`}>
        <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
        <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          {col.icon}{col.label}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {urgentes > 0 && (
            <span className="text-[10px] font-bold bg-red-100 text-red-600 rounded-full w-5 h-5 flex items-center justify-center">
              {urgentes}
            </span>
          )}
          <span className="text-xs font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center border border-slate-200 text-slate-600">
            {casos.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {casos.length === 0 ? (
          // Dashed empty state — ported from Lovable
          <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-xs text-slate-400">
            Sin casos
          </div>
        ) : (
          casos.map((c) => (
            <CasoCard key={c.id} caso={c} onTomar={onTomar} onResolver={onResolver} />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResolucionesPage() {
  const [casos,       setCasos]       = useState<Caso[]>(CASOS_MOCK)
  const [resolviendo, setResolviendo] = useState<Caso | null>(null)
  const [search,      setSearch]      = useState('')
  const [filterCliente, setFilterCliente] = useState('all')   // dynamic from Lovable
  const [filterEstado,  setFilterEstado]  = useState<CasoEstado | 'all'>('all')
  const [toast,         setToast]         = useState<string | null>(null)

  // Dynamic client list — ported from Lovable
  const clientes = [...new Set(CASOS_MOCK.map((c) => c.cliente))].sort()

  const filtered = casos.filter((c) => {
    // Lovable: search also matches problema text
    const q = search.toLowerCase()
    const matchSearch   = !q || c.id.toLowerCase().includes(q) || c.cliente.toLowerCase().includes(q) || c.problema.toLowerCase().includes(q)
    const matchCliente  = filterCliente === 'all' || c.cliente === filterCliente
    const matchEstado   = filterEstado  === 'all' || c.estado  === filterEstado
    return matchSearch && matchCliente && matchEstado
  })

  const handleTomar = (id: string) => {
    setCasos((prev) => prev.map((c) => c.id === id ? { ...c, estado: 'en_proceso', agente: 'Jose E.' } : c))
    setToast('Caso tomado')
  }

  const handleResuelto = (id: string, nota: string) => {
    setCasos((prev) => prev.map((c) => c.id === id ? { ...c, estado: 'resuelta', nota_resolucion: nota } : c))
    setToast(`Caso ${id} marcado como resuelto`)
  }

  const totalUrgentes = casos.filter(isUrgente).length

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Resoluciones</h1>
          <p className="text-sm text-slate-500 mt-0.5">Seguimiento de quejas y resoluciones de clientes — WF5D</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* Urgentes banner */}
      {totalUrgentes > 0 && (
        <div className="flex items-center gap-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <AlertTriangle size={15} className="shrink-0" />
          {totalUrgentes} caso{totalUrgentes !== 1 ? 's' : ''} sin resolver con más de 48 horas
        </div>
      )}

      {/* Search + filters — Lovable pattern: text search + two Select dropdowns */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search — Lovable: also matches problema text */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar caso, cliente o descripción…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md
              bg-white text-slate-700 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        {/* Client filter — dynamic list ported from Lovable */}
        <select
          value={filterCliente}
          onChange={(e) => setFilterCliente(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white text-slate-700
            focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:w-48"
        >
          <option value="all">Todos los clientes</option>
          {clientes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Status filter — ported from Lovable */}
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value as CasoEstado | 'all')}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white text-slate-700
            focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:w-36"
        >
          <option value="all">Todos</option>
          {COLUMNS.map((col) => <option key={col.id} value={col.id}>{col.label}</option>)}
        </select>
      </div>

      {/* Kanban — horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 pb-4 md:mx-0 md:px-0">
        <div className="flex gap-4 min-w-[750px] xl:grid xl:grid-cols-3 xl:min-w-0">
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

      {/* Toast — lightweight port of sonner pattern from Lovable */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
