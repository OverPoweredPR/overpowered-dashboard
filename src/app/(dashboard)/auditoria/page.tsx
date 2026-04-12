'use client'

import { useState } from 'react'
import {
  ShieldCheck, AlertTriangle, Info, XCircle, CheckCircle,
  Clock, ChevronDown, ChevronUp, Play, RefreshCw, Loader2, X, AlertCircle,
} from 'lucide-react'
import { useAuditoria, useRunAuditoria, useRefreshDashboard } from '@/hooks/useDashboard'
import type { Hallazgo, NocheAuditoria, Severidad } from '@/lib/api'

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return 'hace unos segundos'
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-PR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-PR', { weekday: 'short', month: 'short', day: 'numeric' })
}

const SEV: Record<Severidad, { label: string; dot: string; badge: string; rowBg: string; icon: React.ReactNode }> = {
  error:   { label: 'Error',   dot: 'bg-red-500',   badge: 'bg-red-100 text-red-700',     rowBg: 'border-l-red-500',   icon: <XCircle       size={15} className="text-red-500   shrink-0" /> },
  warning: { label: 'Warning', dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700', rowBg: 'border-l-amber-400', icon: <AlertTriangle size={15} className="text-amber-500 shrink-0" /> },
  info:    { label: 'Info',    dot: 'bg-blue-400',  badge: 'bg-blue-100 text-blue-700',   rowBg: 'border-l-blue-400',  icon: <Info          size={15} className="text-blue-500  shrink-0" /> },
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className ?? ''}`} />
}

function PinModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (pin: string) => void }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const pin = digits.join('')
  const handleDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]; next[i] = val; setDigits(next)
    if (val && i < 5) (document.getElementById(`apin-${i + 1}`) as HTMLInputElement)?.focus()
  }
  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) (document.getElementById(`apin-${i - 1}`) as HTMLInputElement)?.focus()
    if (e.key === 'Enter' && pin.length >= 4) onConfirm(pin)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div><h2 className="text-base font-bold text-slate-800">PIN de administrador</h2>
            <p className="text-sm text-slate-500 mt-0.5">Requerido para auditoría manual</p></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="flex gap-2 justify-center">
          {digits.map((d, i) => (
            <input key={i} id={`apin-${i}`} type="password" inputMode="numeric" maxLength={1} value={d}
              autoFocus={i === 0} onChange={(e) => handleDigit(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-10 h-12 text-center text-lg font-bold rounded-lg border-2 focus:outline-none focus:border-indigo-500 transition-colors ${d ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'}`} />
          ))}
        </div>
        <p className="text-xs text-center text-slate-400">4 a 6 dígitos</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={() => pin.length >= 4 && onConfirm(pin)} disabled={pin.length < 4}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors">
            <Play size={13} /> Ejecutar
          </button>
        </div>
      </div>
    </div>
  )
}

function HallazgoCard({ hallazgo, onResolve }: { hallazgo: Hallazgo; onResolve: (id: string) => void }) {
  const cfg = SEV[hallazgo.severidad]
  return (
    <div className={`bg-white rounded-lg border border-l-4 border-slate-200 p-3 flex gap-3 ${cfg.rowBg} ${hallazgo.resuelto ? 'opacity-60' : ''}`}>
      <div className="mt-0.5">{cfg.icon}</div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className={`text-sm text-slate-700 ${hallazgo.resuelto ? 'line-through' : ''}`}>{hallazgo.descripcion}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${cfg.badge}`}>{cfg.label}</span>
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{hallazgo.workflow}</span>
          <span className="text-xs text-slate-400">{fmtDateTime(hallazgo.timestamp)}</span>
          {hallazgo.resuelto && hallazgo.resuelto_por && (
            <span className="text-xs text-emerald-600 flex items-center gap-0.5"><CheckCircle size={10} /> Resuelto por {hallazgo.resuelto_por}</span>
          )}
        </div>
      </div>
      {!hallazgo.resuelto && (
        <button onClick={() => onResolve(hallazgo.id)}
          className="shrink-0 self-start px-2.5 py-1 text-xs font-medium rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors">
          Resolver
        </button>
      )}
    </div>
  )
}

function NocheRow({ noche }: { noche: NocheAuditoria }) {
  const [open, setOpen] = useState(false)
  const pendientes = noche.hallazgos.filter((h) => !h.resuelto).length
  return (
    <>
      <tr onClick={() => setOpen((v) => !v)} className="hover:bg-slate-50 cursor-pointer transition-colors">
        <td className="px-4 py-3 text-sm text-slate-700">
          <span className="flex items-center gap-1.5">
            {open ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
            {fmtDate(noche.fecha)}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          {noche.resumen.error > 0
            ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{noche.resumen.error}</span>
            : <span className="text-xs text-slate-300">—</span>}
        </td>
        <td className="px-4 py-3 text-center">
          {noche.resumen.warning > 0
            ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{noche.resumen.warning}</span>
            : <span className="text-xs text-slate-300">—</span>}
        </td>
        <td className="px-4 py-3 text-center">
          {noche.resumen.info > 0
            ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />{noche.resumen.info}</span>
            : <span className="text-xs text-slate-300">—</span>}
        </td>
        <td className="px-4 py-3 text-center text-sm font-semibold text-slate-600">{noche.resumen.total}</td>
        <td className="px-4 py-3 text-center">
          {pendientes === 0
            ? <CheckCircle size={14} className="text-emerald-500 mx-auto" />
            : <span className="text-xs text-amber-600 font-medium">{pendientes} pendiente{pendientes !== 1 ? 's' : ''}</span>}
        </td>
      </tr>
      {open && (
        <tr><td colSpan={6} className="px-4 pb-3 bg-slate-50/60">
          <div className="space-y-1.5 pt-1">
            {noche.hallazgos.map((h) => (
              <div key={h.id} className={`flex items-start gap-2 text-xs p-2 rounded-lg border-l-2
                ${h.severidad === 'error' ? 'border-l-red-400 bg-red-50' : h.severidad === 'warning' ? 'border-l-amber-400 bg-amber-50' : 'border-l-blue-300 bg-blue-50'}`}>
                {SEV[h.severidad].icon}
                <span className={`flex-1 text-slate-700 ${h.resuelto ? 'line-through opacity-60' : ''}`}>{h.descripcion}</span>
                <span className="text-slate-400 whitespace-nowrap font-mono">{h.workflow}</span>
              </div>
            ))}
          </div>
        </td></tr>
      )}
    </>
  )
}

export default function AuditoriaPage() {
  const { data, isPending, error, refetch } = useAuditoria()
  const { refreshAuditoria }                = useRefreshDashboard()
  const runMutation                         = useRunAuditoria()

  const [showPin,   setShowPin]   = useState(false)
  const [hallazgos, setHallazgos] = useState<Hallazgo[] | null>(null)
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [runMsg,    setRunMsg]    = useState<string | null>(null)

  const activeHallazgos = hallazgos ?? data?.sin_resolver ?? []

  const handleResolve = (id: string) => {
    const base = hallazgos ?? data?.sin_resolver ?? []
    setHallazgos(base.map((h) =>
      h.id === id ? { ...h, resuelto: true, resuelto_en: new Date().toISOString(), resuelto_por: 'Usuario' } : h
    ))
  }

  const handleRunPin = async (pin: string) => {
    setShowPin(false); setRunStatus('running'); setRunMsg(null)
    try {
      const result = await runMutation.mutateAsync(pin)
      setRunStatus('done'); setRunMsg(result.mensaje)
    } catch (e) {
      setRunStatus('error'); setRunMsg(e instanceof Error ? e.message : 'Error al ejecutar')
    }
  }

  if (isPending) return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-slate-800">Auditoría</h1><Skeleton className="h-8 w-40" /></div>
      <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-lg border border-l-4 border-slate-200 border-l-slate-300 p-3 space-y-2"><Skeleton className="h-4 flex-1" /><Skeleton className="h-3 w-32" /></div>)}</div>
    </div>
  )

  if (error) return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-xl font-bold text-slate-800">Auditoría</h1>
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <AlertCircle size={16} className="text-red-500 shrink-0" />
        <p className="text-sm text-red-700 flex-1">No se pudo cargar: {error.message}</p>
        <button onClick={() => refetch()} className="text-xs font-medium text-red-600 underline">Reintentar</button>
      </div>
    </div>
  )

  const sinResolver  = activeHallazgos.filter((h) => !h.resuelto)
  const erroreCount  = sinResolver.filter((h) => h.severidad === 'error').length
  const warningCount = sinResolver.filter((h) => h.severidad === 'warning').length

  return (
    <>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={20} className="text-indigo-600" /> Auditoría del Sistema
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {data && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={12} /> Última: <span className="font-medium text-slate-700">{timeAgo(data.ultima_auditoria)}</span> · {fmtDateTime(data.ultima_auditoria)}
                </span>
              )}
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${data?.wf11_activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                WF11 {data?.wf11_activo ? 'activo' : 'inactivo en local'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refreshAuditoria} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
              <RefreshCw size={13} /> Actualizar
            </button>
            <button onClick={() => setShowPin(true)} disabled={runStatus === 'running'}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {runStatus === 'running' ? <><Loader2 size={14} className="animate-spin" /> Ejecutando…</> : <><Play size={14} /> Ejecutar ahora</>}
            </button>
          </div>
        </div>

        {runMsg && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm ${runStatus === 'done' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {runStatus === 'done' ? <CheckCircle size={14} /> : <XCircle size={14} />}{runMsg}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {[
            { label: `${erroreCount} error${erroreCount !== 1 ? 'es' : ''}`,     color: erroreCount  > 0 ? 'bg-red-100   text-red-700'   : 'bg-slate-100 text-slate-400' },
            { label: `${warningCount} warning${warningCount !== 1 ? 's' : ''}`, color: warningCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400' },
            { label: `${sinResolver.length} sin resolver`,                        color: sinResolver.length > 0 ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-400' },
          ].map((p) => (
            <span key={p.label} className={`text-xs font-semibold px-3 py-1 rounded-full ${p.color}`}>{p.label}</span>
          ))}
        </div>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Hallazgos sin resolver</h2>
          {sinResolver.length === 0 ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              <CheckCircle size={16} className="text-emerald-500" />
              <p className="text-sm text-emerald-700">No hay hallazgos pendientes — sistema OK</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(['error', 'warning', 'info'] as Severidad[]).flatMap((sev) =>
                sinResolver.filter((h) => h.severidad === sev).map((h) => (
                  <HallazgoCard key={h.id} hallazgo={h} onResolve={handleResolve} />
                ))
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Historial — últimas 30 noches</h2>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left   text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-red-400">Errores</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-amber-400">Warnings</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-blue-400">Info</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.historial ?? []).map((noche) => <NocheRow key={noche.fecha} noche={noche} />)}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400">{data?.historial.length ?? 0} noches · WF11 cron: <span className="font-mono">5 1 * * *</span> (9:05 PM AST)</p>
            </div>
          </div>
        </section>
      </div>

      {showPin && <PinModal onClose={() => setShowPin(false)} onConfirm={handleRunPin} />}
    </>
  )
}
