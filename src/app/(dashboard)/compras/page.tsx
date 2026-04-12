'use client'

import { useRef, useState } from 'react'
import {
  Camera,
  Loader2,
  CheckCircle,
  XCircle,
  Package,
  RotateCcw,
  AlertTriangle,
  FileText,
  Truck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type OCRItem = {
  descripcion:     string
  cantidad:        number
  precio_unitario: number
  total:           number
}

type OCRResult = {
  proveedor:       string
  numero_factura:  string
  fecha:           string
  items:           OCRItem[]
  subtotal:        number
  impuesto:        number
  total:           number
}

type POEstado = 'pendiente' | 'recibido' | 'pagado'

type PO = {
  id:        string
  numero:    string
  proveedor: string
  fecha:     string
  total:     number
  estado:    POEstado
  items:     number
}

// ─── Static PO mock data ──────────────────────────────────────────────────────

const POS_MOCK: PO[] = [
  { id: '1', numero: 'PO-2042', proveedor: 'Panadería El Bohío',    fecha: '2026-04-10', total: 845.00, estado: 'pendiente', items: 8 },
  { id: '2', numero: 'PO-2041', proveedor: 'Distribuidora Central', fecha: '2026-04-08', total: 1230.50, estado: 'recibido', items: 12 },
  { id: '3', numero: 'PO-2040', proveedor: 'Proveedor Lácteos PR',  fecha: '2026-04-05', total: 390.75, estado: 'pagado',   items: 5 },
  { id: '4', numero: 'PO-2039', proveedor: 'Panadería El Bohío',    fecha: '2026-04-01', total: 720.00, estado: 'pagado',   items: 7 },
  { id: '5', numero: 'PO-2038', proveedor: 'Distribuidora Central', fecha: '2026-03-28', total: 980.25, estado: 'pagado',   items: 9 },
]

// ─── PO status badge ──────────────────────────────────────────────────────────

const PO_STATUS: Record<POEstado, { label: string; className: string; icon: React.ReactNode }> = {
  pendiente: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700',   icon: <AlertTriangle size={11} /> },
  recibido:  { label: 'Recibido',  className: 'bg-blue-100  text-blue-700',    icon: <Truck         size={11} /> },
  pagado:    { label: 'Pagado',    className: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle  size={11} /> },
}

function StatusBadge({ estado }: { estado: POEstado }) {
  const cfg = PO_STATUS[estado]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

// ─── Marcar recibido button ───────────────────────────────────────────────────

function RecibirButton({ po, onRecibido }: { po: PO; onRecibido: (id: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  if (po.estado !== 'pendiente') return null

  const handleRecibir = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/compra/recibir', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ po_id: po.id, po_numero: po.numero, proveedor: po.proveedor }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? `HTTP ${res.status}`)
      }
      onRecibido(po.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        onClick={handleRecibir}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
          bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Truck size={12} />}
        {loading ? 'Procesando…' : 'Marcar recibido'}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

// ─── OCR Result table ─────────────────────────────────────────────────────────

function OCRResultTable({
  result,
  onEdit,
  onConfirm,
  onReset,
}: {
  result:    OCRResult
  onEdit:    (updated: OCRResult) => void
  onConfirm: () => void
  onReset:   () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [data,    setData]    = useState<OCRResult>(result)

  const updateItem = (i: number, field: keyof OCRItem, val: string) => {
    const items = [...data.items]
    const num   = parseFloat(val) || 0
    items[i] = {
      ...items[i],
      [field]: field === 'descripcion' ? val : num,
      total:   field === 'cantidad'        ? num * items[i].precio_unitario
              : field === 'precio_unitario' ? items[i].cantidad * num
              : items[i].total,
    }
    const subtotal = items.reduce((s, it) => s + it.total, 0)
    setData({ ...data, items, subtotal, total: subtotal + data.impuesto })
    onEdit({ ...data, items, subtotal, total: subtotal + data.impuesto })
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/compra/confirmar', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      onConfirm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar PO')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Invoice header */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Proveedor',       value: data.proveedor      },
          { label: 'Nº Factura',      value: data.numero_factura },
          { label: 'Fecha Factura',   value: data.fecha          },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Items table — editable */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-y border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Cant.</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Precio Unit.</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.items.map((item, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.descripcion}
                    onChange={(e) => updateItem(i, 'descripcion', e.target.value)}
                    className="w-full text-sm text-slate-700 bg-transparent border-b border-transparent
                      hover:border-slate-300 focus:border-indigo-400 focus:outline-none py-0.5"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => updateItem(i, 'cantidad', e.target.value)}
                    className="w-full text-sm text-right text-slate-700 bg-transparent border-b border-transparent
                      hover:border-slate-300 focus:border-indigo-400 focus:outline-none py-0.5"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    value={item.precio_unitario}
                    onChange={(e) => updateItem(i, 'precio_unitario', e.target.value)}
                    className="w-full text-sm text-right text-slate-700 bg-transparent border-b border-transparent
                      hover:border-slate-300 focus:border-indigo-400 focus:outline-none py-0.5"
                  />
                </td>
                <td className="px-3 py-2 text-right text-sm font-medium text-slate-700">
                  ${item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 border-t-2 border-slate-200">
            <tr>
              <td colSpan={3} className="px-3 py-2 text-right text-xs text-slate-500">Subtotal</td>
              <td className="px-3 py-2 text-right text-sm text-slate-700">${data.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="px-3 py-2 text-right text-xs text-slate-500">IVU / Impuesto</td>
              <td className="px-3 py-2 text-right text-sm text-slate-700">${data.impuesto.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="px-3 py-2 text-right text-sm font-bold text-slate-700">TOTAL</td>
              <td className="px-3 py-2 text-right text-sm font-bold text-slate-800">${data.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-slate-400 flex items-center gap-1">
        <AlertTriangle size={11} /> Revisa y corrige antes de confirmar — los valores son editables.
      </p>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <XCircle size={14} />{error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg
            border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={14} /> Nueva foto
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium
            rounded-lg bg-indigo-600 text-white hover:bg-indigo-700
            disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          {loading ? 'Guardando PO…' : 'Confirmar PO'}
        </button>
      </div>
    </div>
  )
}

// ─── Tab: Nueva Compra ────────────────────────────────────────────────────────

function NuevaCompraTab() {
  const fileRef = useRef<HTMLInputElement>(null)

  type UIState = 'idle' | 'preview' | 'processing' | 'result' | 'success'

  const [uiState,    setUiState]    = useState<UIState>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [ocrResult,  setOcrResult]  = useState<OCRResult | null>(null)
  const [error,      setError]      = useState<string | null>(null)
  const [imageFile,  setImageFile]  = useState<File | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setUiState('preview')
    setError(null)
    setOcrResult(null)
  }

  const handleOCR = async () => {
    if (!imageFile) return
    setUiState('processing')
    setError(null)
    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const res = await fetch('/api/dashboard/compra/ocr', {
        method: 'POST',
        body:   formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)

      setOcrResult(data.result)
      setUiState('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al procesar OCR')
      setUiState('preview')
    }
  }

  const handleReset = () => {
    setUiState('idle')
    setPreviewUrl(null)
    setOcrResult(null)
    setImageFile(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  if (uiState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">PO creado exitosamente</p>
          <p className="text-sm text-slate-500 mt-1">La orden de compra fue guardada en Airtable via WF4.</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg
            bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          <Camera size={14} /> Procesar otra factura
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {/* Idle state — big camera button */}
      {uiState === 'idle' && (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-3 py-14 px-6
            border-2 border-dashed border-slate-300 rounded-xl
            hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-indigo-100
            flex items-center justify-center transition-colors"
          >
            <Camera size={28} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-slate-700">Tomar foto de factura</p>
            <p className="text-sm text-slate-400 mt-1">
              Abre la cámara en móvil · Selecciona archivo en desktop
            </p>
          </div>
        </button>
      )}

      {/* Preview state */}
      {(uiState === 'preview' || uiState === 'processing') && previewUrl && (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Factura capturada"
              className="w-full max-h-72 object-contain"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50
              border border-red-200 rounded-lg px-3 py-2"
            >
              <XCircle size={14} />{error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={uiState === 'processing'}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg
                border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <RotateCcw size={14} /> Retomar
            </button>
            <button
              onClick={handleOCR}
              disabled={uiState === 'processing'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
                rounded-lg bg-indigo-600 text-white hover:bg-indigo-700
                disabled:opacity-50 transition-colors"
            >
              {uiState === 'processing' ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Procesando factura…
                </>
              ) : (
                <>
                  <FileText size={14} />
                  Procesar con OCR
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result state */}
      {uiState === 'result' && ocrResult && (
        <OCRResultTable
          result={ocrResult}
          onEdit={setOcrResult}
          onConfirm={() => setUiState('success')}
          onReset={handleReset}
        />
      )}
    </div>
  )
}

// ─── Tab: Historial POs ───────────────────────────────────────────────────────

function HistorialPOsTab() {
  const [pos,   setPOs]    = useState<PO[]>(POS_MOCK)
  const [open,  setOpen]   = useState<string | null>(null)

  const markRecibido = (id: string) =>
    setPOs((prev) => prev.map((p) => p.id === id ? { ...p, estado: 'recibido' } : p))

  const pendientes = pos.filter((p) => p.estado === 'pendiente').length

  return (
    <div className="space-y-4 max-w-4xl">
      {pendientes > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50
          border border-amber-200 rounded-lg px-3 py-2"
        >
          <AlertTriangle size={14} />
          {pendientes} PO{pendientes !== 1 ? 's' : ''} pendiente{pendientes !== 1 ? 's' : ''} de recepción
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">PO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Proveedor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pos.map((po) => (
                <>
                  <tr
                    key={po.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setOpen(open === po.id ? null : po.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1">
                        {open === po.id
                          ? <ChevronUp   size={12} className="text-slate-400" />
                          : <ChevronDown size={12} className="text-slate-400" />}
                        {po.numero}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{po.proveedor}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{po.fecha}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      ${po.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full
                        bg-slate-100 text-slate-600 text-xs font-semibold"
                      >
                        {po.items}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge estado={po.estado} /></td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <RecibirButton po={po} onRecibido={markRecibido} />
                    </td>
                  </tr>

                  {/* Expandable detail row */}
                  {open === po.id && (
                    <tr key={`${po.id}-detail`} className="bg-indigo-50">
                      <td colSpan={7} className="px-6 py-3">
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">{po.numero}</span> ·{' '}
                          {po.proveedor} · {po.items} items · Total ${po.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Detalle de líneas disponible cuando se conecte Airtable vía React Query.
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-between">
          <p className="text-xs text-slate-400">{pos.length} órdenes de compra</p>
          <p className="text-xs text-slate-400">
            Total histórico:{' '}
            <span className="font-semibold text-slate-700">
              ${pos.reduce((s, p) => s + p.total, 0).toFixed(2)}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'nueva' | 'historial'

export default function ComprasPage() {
  const [tab, setTab] = useState<Tab>('nueva')

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'nueva',    label: 'Nueva Compra', icon: <Camera  size={14} /> },
    { id: 'historial', label: 'Historial POs', icon: <Package size={14} /> },
  ]

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Compras</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Facturas de proveedor + órdenes de compra (WF4 + WF2)
        </p>
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
      {tab === 'nueva'    && <NuevaCompraTab />}
      {tab === 'historial' && <HistorialPOsTab />}
    </div>
  )
}
