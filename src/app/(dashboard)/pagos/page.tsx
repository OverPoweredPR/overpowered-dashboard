'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  X,
  Camera,
  Delete,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { usePagos, useRefreshDashboard } from '@/hooks/useDashboard'
import type { Pago as ApiPago } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

type PagoEstado = 'pendiente_evidencia' | 'evidencia_subida' | 'confirmado' | 'rechazado'
type MetodoPago = 'Efectivo' | 'ATH Móvil' | 'Transferencia' | 'Tarjeta'

type Pago = {
  id: string
  numero_orden: string
  cliente: string
  monto: number
  metodo: MetodoPago
  estado: PagoEstado
  /** ISO datetime — cuándo entró en el estado actual */
  desde: string
  evidence_url?: string
}

// ─── API → local mapper ───────────────────────────────────────────────────────

const METODO_MAP: Record<string, MetodoPago> = {
  efectivo:      'Efectivo',
  transferencia: 'Transferencia',
  tarjeta:       'Tarjeta',
  ath:           'ATH Móvil',
}

function apiPagoToLocal(p: ApiPago, estado: PagoEstado): Pago {
  return {
    id:           p.pago_id,
    numero_orden: p.orden_shopify,
    cliente:      typeof p.cliente === 'string' ? p.cliente : p.cliente.nombre,
    monto:        p.monto,
    metodo:       METODO_MAP[p.metodo_pago] ?? 'Transferencia',
    estado,
    desde:        p.confirmado_en ?? p.rechazado_en ?? new Date().toISOString(),
    evidence_url: p.evidencia_url ?? undefined,
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className ?? ''}`} />
}

function KanbanSkeleton() {
  return (
    <div className="flex gap-3 min-w-max lg:min-w-0 lg:grid lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col min-w-[240px] w-full flex-1">
          <div className="px-3 py-2 rounded-t-lg border border-slate-200 bg-slate-50">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex-1 bg-slate-50 border-x border-b border-slate-200 rounded-b-lg p-2 space-y-2 min-h-[200px]">
            {Array.from({ length: i === 0 ? 2 : 1 }).map((__, j) => (
              <div key={j} className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Column config ────────────────────────────────────────────────────────────

type ColumnDef = {
  id: PagoEstado
  label: string
  color: string
  headerBg: string
  icon: React.ReactNode
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'pendiente_evidencia',
    label: 'Pendiente evidencia',
    color: 'border-amber-400',
    headerBg: 'bg-amber-50',
    icon: <Clock size={14} className="text-amber-500" />,
  },
  {
    id: 'evidencia_subida',
    label: 'Evidencia subida',
    color: 'border-blue-400',
    headerBg: 'bg-blue-50',
    icon: <Upload size={14} className="text-blue-500" />,
  },
  {
    id: 'confirmado',
    label: 'Confirmado',
    color: 'border-emerald-500',
    headerBg: 'bg-emerald-50',
    icon: <CheckCircle size={14} className="text-emerald-500" />,
  },
  {
    id: 'rechazado',
    label: 'Rechazado',
    color: 'border-red-400',
    headerBg: 'bg-red-50',
    icon: <XCircle size={14} className="text-red-500" />,
  },
]

const METODO_COLORS: Record<MetodoPago, string> = {
  'ATH Móvil':     'bg-purple-100 text-purple-700',
  'Transferencia': 'bg-sky-100    text-sky-700',
  'Efectivo':      'bg-green-100  text-green-700',
  'Tarjeta':       'bg-slate-100  text-slate-600',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): { label: string; hours: number } {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  const hours   = diff / 3600
  if (diff < 60)   return { label: 'hace unos segundos', hours }
  if (diff < 3600) return { label: `hace ${Math.floor(diff / 60)}m`,  hours }
  if (diff < 86400)return { label: `hace ${Math.floor(diff / 3600)}h`, hours }
  return { label: `hace ${Math.floor(diff / 86400)}d`, hours }
}

// ─── PIN Modal ────────────────────────────────────────────────────────────────

function PinModal({
  pago,
  onClose,
  onConfirmed,
}: {
  pago: Pago
  onClose: () => void
  onConfirmed: () => void
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const pin = digits.join('')

  const handleDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
    if (e.key === 'Enter' && pin.length >= 4) handleSubmit()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    e.preventDefault()
    const next = Array(6).fill('')
    text.split('').forEach((c, i) => { next[i] = c })
    setDigits(next)
    inputRefs.current[Math.min(text.length, 5)]?.focus()
  }

  const handleSubmit = async () => {
    if (pin.length < 4) { setError('El PIN debe tener 4-6 dígitos'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/pago/confirmar', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pago_id: pago.id, numero_orden: pago.numero_orden, pin }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      onConfirmed()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al confirmar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Confirmar pago</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {pago.numero_orden} · {pago.cliente} · ${pago.monto.toFixed(2)}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Ingresa tu PIN gerencial</p>
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                autoFocus={i === 0}
                className={`w-10 h-12 text-center text-lg font-bold rounded-lg border-2
                  focus:outline-none focus:border-indigo-500 transition-colors
                  ${d ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'}
                  ${error ? 'border-red-400' : ''}`}
              />
            ))}
          </div>
          <p className="text-xs text-center text-slate-400">4 a 6 dígitos · Enter para confirmar</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            <AlertTriangle size={14} />
            {error}
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
            disabled={loading || pin.length < 4}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2
              text-sm font-medium rounded-lg bg-indigo-600 text-white
              hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {loading ? 'Confirmando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Pago Card ────────────────────────────────────────────────────────────────

function PagoCard({
  pago,
  onEvidenciaSubida,
  onConfirmado,
}: {
  pago: Pago
  onEvidenciaSubida: (id: string) => void
  onConfirmado:      (id: string) => void
}) {
  const fileRef            = useRef<HTMLInputElement>(null)
  const [uploading,  setUploading]  = useState(false)
  const [showPin,    setShowPin]    = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { label: agoLabel, hours } = timeAgo(pago.desde)
  const isStale = pago.estado === 'pendiente_evidencia' && hours >= 24

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    setUploading(true)
    // TODO: upload to Supabase Storage → get URL → call WF10
    await new Promise((r) => setTimeout(r, 1200)) // simulated upload
    setUploading(false)
    onEvidenciaSubida(pago.id)
  }

  return (
    <>
      <div
        className={`bg-white rounded-lg border shadow-sm p-3 space-y-2.5
          ${isStale ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200'}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-mono text-xs font-bold text-slate-700">
              {pago.numero_orden}
            </span>
            <p className="text-sm text-slate-600 leading-tight">{pago.cliente}</p>
          </div>
          <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
            ${pago.monto.toFixed(2)}
          </span>
        </div>

        {/* Method badge */}
        <span
          className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full
            ${METODO_COLORS[pago.metodo]}`}
        >
          {pago.metodo}
        </span>

        {/* Time badge */}
        <div className={`flex items-center gap-1 text-xs font-medium
          ${isStale ? 'text-red-600' : 'text-slate-400'}`}
        >
          {isStale
            ? <AlertTriangle size={11} className="shrink-0" />
            : <Clock         size={11} className="shrink-0" />}
          {agoLabel}
          {isStale && (
            <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs font-semibold">
              +24h
            </span>
          )}
        </div>

        {/* Evidence preview */}
        {previewUrl && (
          <div className="relative rounded overflow-hidden h-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Evidencia" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Actions */}
        <div className="space-y-1.5">
          {pago.estado === 'pendiente_evidencia' && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFile}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full inline-flex items-center justify-center gap-1.5
                  px-3 py-1.5 text-xs font-medium rounded-md
                  bg-amber-50 border border-amber-300 text-amber-700
                  hover:bg-amber-100 disabled:opacity-50 transition-colors"
              >
                {uploading
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Camera  size={12} />}
                {uploading ? 'Subiendo…' : 'Subir evidencia'}
              </button>
            </>
          )}

          {pago.estado === 'evidencia_subida' && (
            <button
              onClick={() => setShowPin(true)}
              className="w-full inline-flex items-center justify-center gap-1.5
                px-3 py-1.5 text-xs font-medium rounded-md
                bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <CheckCircle size={12} />
              Confirmar pago
            </button>
          )}

          {pago.estado === 'confirmado' && (
            <span className="flex items-center justify-center gap-1 text-xs text-emerald-600 font-medium py-1">
              <CheckCircle size={12} /> Pago confirmado
            </span>
          )}

          {pago.estado === 'rechazado' && (
            <span className="flex items-center justify-center gap-1 text-xs text-red-500 font-medium py-1">
              <XCircle size={12} /> Rechazado
            </span>
          )}
        </div>
      </div>

      {showPin && (
        <PinModal
          pago={pago}
          onClose={() => setShowPin(false)}
          onConfirmed={() => {
            setShowPin(false)
            onConfirmado(pago.id)
          }}
        />
      )}
    </>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  col,
  pagos,
  onEvidenciaSubida,
  onConfirmado,
}: {
  col: ColumnDef
  pagos: Pago[]
  onEvidenciaSubida: (id: string) => void
  onConfirmado:      (id: string) => void
}) {
  return (
    <div className="flex flex-col min-w-[240px] w-full flex-1">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg border-t-2
        ${col.color} ${col.headerBg} border-x border-slate-200`}
      >
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          {col.icon}
          {col.label}
        </span>
        <span className="text-xs font-bold bg-white rounded-full w-5 h-5 flex items-center
          justify-center border border-slate-200 text-slate-600">
          {pagos.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 bg-slate-50 border-x border-b border-slate-200
        rounded-b-lg p-2 space-y-2 min-h-[200px]"
      >
        {pagos.length === 0 ? (
          <p className="text-xs text-slate-400 text-center pt-6">Sin pagos</p>
        ) : (
          pagos.map((p) => (
            <PagoCard
              key={p.id}
              pago={p}
              onEvidenciaSubida={onEvidenciaSubida}
              onConfirmado={onConfirmado}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PagosPage() {
  const { data, isPending, error, refetch } = usePagos()
  const { refreshPagos } = useRefreshDashboard()

  // Map API columnas to local Pago state
  const initialPagos: Pago[] = data
    ? [
        ...(data.columnas.pendiente   ?? []).map((p) => apiPagoToLocal(p, 'pendiente_evidencia')),
        ...(data.columnas.en_revision ?? []).map((p) => apiPagoToLocal(p, 'evidencia_subida')),
        ...(data.columnas.confirmado  ?? []).map((p) => apiPagoToLocal(p, 'confirmado')),
        ...(data.columnas.rechazado   ?? []).map((p) => apiPagoToLocal(p, 'rechazado')),
      ]
    : []

  const [pagos, setPagos] = useState<Pago[]>(initialPagos)

  // Sync when fresh data arrives from React Query
  useEffect(() => { if (data) setPagos(initialPagos) }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  const moveCard = (id: string, newEstado: PagoEstado) =>
    setPagos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, estado: newEstado, desde: new Date().toISOString() } : p
      )
    )

  const stale = pagos.filter(
    (p) => p.estado === 'pendiente_evidencia' && timeAgo(p.desde).hours >= 24
  ).length

  if (isPending) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-slate-800">Pagos</h1>
        <div className="overflow-x-auto pb-4"><KanbanSkeleton /></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-slate-800">Pagos</h1>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">No se pudieron cargar los pagos: {error.message}</p>
          <button onClick={() => refetch()} className="text-xs font-medium text-red-600 hover:text-red-800 underline">Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pagos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagos.length} pago{pagos.length !== 1 ? 's' : ''} activos
          </p>
        </div>
        <div className="flex items-center gap-3">
        <button onClick={refreshPagos} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
          <RefreshCw size={13} /> Actualizar
        </button>
        {stale > 0 && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
            <AlertTriangle size={14} />
            {stale} pago{stale !== 1 ? 's' : ''} con +24h sin evidencia
          </div>
        )}
        </div>
      </div>

      {/* Kanban board — horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max lg:min-w-0 lg:grid lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              col={col}
              pagos={pagos.filter((p) => p.estado === col.id)}
              onEvidenciaSubida={(id) => moveCard(id, 'evidencia_subida')}
              onConfirmado={(id)      => moveCard(id, 'confirmado')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
