"use client";
'use client'

import {
  TrendingUp,
  ShoppingCart,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import type { MetricCard } from '@/lib/types'
import { useHome, useAuditoria, useRefreshDashboard } from '@/hooks/useDashboard'
import type { Wf11Alert, Hallazgo } from '@/lib/api'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className ?? ''}`} />
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-200 border-l-4 border-l-slate-200 p-4 shadow-sm bg-white space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
      <AlertCircle size={16} className="text-red-500 shrink-0" />
      <p className="text-sm text-red-700 flex-1">{message}</p>
      <button
        onClick={onRetry}
        className="text-xs font-medium text-red-600 hover:text-red-800 underline whitespace-nowrap"
      >
        Reintentar
      </button>
    </div>
  )
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCardWidget({ card }: { card: MetricCard }) {
  const statusColors = {
    ok:      'border-l-emerald-500 bg-white',
    warning: 'border-l-amber-400  bg-white',
    error:   'border-l-red-500    bg-white',
  }
  const deltaColors = {
    ok:      'text-emerald-600',
    warning: 'text-amber-600',
    error:   'text-red-600',
  }
  const borderClass = statusColors[card.status ?? 'ok']
  const deltaClass  = deltaColors[card.status ?? 'ok']

  return (
    <div className={`rounded-lg border border-slate-200 border-l-4 p-4 shadow-sm ${borderClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{card.value}</p>
      {card.delta && <p className={`mt-0.5 text-xs font-medium ${deltaClass}`}>{card.delta}</p>}
    </div>
  )
}

// ─── Alert Row ────────────────────────────────────────────────────────────────

type AlertLevel = 'error' | 'warning' | 'info'
type Alert = { id: string; level: AlertLevel; message: string; time: string; source: string }

function AlertRow({ alert }: { alert: Alert }) {
  const styles: Record<AlertLevel, { bg: string; icon: React.ReactNode }> = {
    error:   { bg: 'bg-red-50 border-red-200',    icon: <XCircle       size={16} className="text-red-500 shrink-0"    /> },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: <AlertTriangle size={16} className="text-amber-500 shrink-0" /> },
    info:    { bg: 'bg-blue-50 border-blue-200',   icon: <CheckCircle   size={16} className="text-blue-500 shrink-0"  /> },
  }
  const { bg, icon } = styles[alert.level]
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${bg}`}>
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700">{alert.message}</p>
        <p className="text-xs text-slate-400 mt-0.5">{alert.source} · {alert.time}</p>
      </div>
    </div>
  )
}

// ─── Sync Status ──────────────────────────────────────────────────────────────

function SyncStatusCard({
  cloverStatus,
  onRefresh,
}: {
  cloverStatus: 'ok' | 'error' | 'pending'
  onRefresh: () => void
}) {
  const syncs = [
    { label: 'WF11 Auditor',       time: 'Hoy 9:05 PM',  status: 'ok' as const        },
    { label: 'WF7 POS → Shopify',  time: 'Hoy 8:00 PM',  status: cloverStatus          },
    { label: 'WF3 Reconciliación', time: 'Hoy 11:59 PM', status: 'pending' as const    },
  ]
  const icons = {
    ok:      <CheckCircle size={14} className="text-emerald-500" />,
    pending: <Clock       size={14} className="text-amber-400"   />,
    error:   <XCircle     size={14} className="text-red-500"     />,
  }
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Estado de sincronización</h3>
        <button onClick={onRefresh} className="text-slate-400 hover:text-indigo-600 transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>
      <ul className="space-y-2">
        {syncs.map((s) => (
          <li key={s.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">{icons[s.status]}{s.label}</span>
            <span className="text-xs text-slate-400">{s.time}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Audit Widget ─────────────────────────────────────────────────────────────

function AuditWidget({ hallazgos }: { hallazgos: Hallazgo[] }) {
  const SEV = {
    error:   { icon: <XCircle       size={14} className="text-red-500    shrink-0" />, badge: 'bg-red-100   text-red-700'   },
    warning: { icon: <AlertTriangle size={14} className="text-amber-500  shrink-0" />, badge: 'bg-amber-100 text-amber-700' },
    info:    { icon: <CheckCircle   size={14} className="text-blue-500   shrink-0" />, badge: 'bg-blue-100  text-blue-700'  },
  }

  if (hallazgos.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400 bg-white rounded-lg border border-slate-200 px-3 py-4">
        <CheckCircle size={16} className="text-emerald-500" /> Sin hallazgos sin resolver
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm divide-y divide-slate-100">
      {hallazgos.map((h) => {
        const { icon, badge } = SEV[h.severidad] ?? SEV.info
        return (
          <div key={h.id} className="flex items-start gap-3 px-3 py-2.5">
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 truncate">{h.descripcion}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badge}`}>{h.severidad}</span>
                <span className="text-xs text-slate-400">{h.workflow}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `$${n.toLocaleString('es-PR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function alertFromWf11(a: Wf11Alert): Alert {
  const levelMap: Record<string, AlertLevel> = { alta: 'error', media: 'warning', baja: 'info' }
  return { id: a.id, level: levelMap[a.severidad] ?? 'info', message: a.descripcion, time: 'WF11', source: a.tipo }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { data, isPending, error, refetch } = useHome()
  const { data: audData } = useAuditoria()
  const { refreshHome } = useRefreshDashboard()

  const topHallazgos: Hallazgo[] = (audData?.sin_resolver ?? [])
    .sort((a, b) => {
      const rank = { error: 0, warning: 1, info: 2 } as Record<string, number>
      return (rank[a.severidad] ?? 2) - (rank[b.severidad] ?? 2)
    })
    .slice(0, 3)

  const metrics: MetricCard[] = data
    ? [
        { label: 'Ventas hoy',        value: fmt(data.ventas.revenue_hoy),      delta: `${data.ventas.delta_pct > 0 ? '+' : ''}${data.ventas.delta_pct.toFixed(1)}% vs ayer`, status: data.ventas.delta_pct >= 0 ? 'ok' : 'warning' },
        { label: 'Órdenes activas',   value: data.ventas.ordenes_hoy,           delta: `${data.ventas.ordenes_pendientes_aprobacion} pendientes aprobación`,                   status: data.ventas.ordenes_pendientes_aprobacion > 0 ? 'warning' : 'ok' },
        { label: 'Pagos pendientes',  value: fmt(data.pagos.pendiente_cobro),   delta: `${data.pagos.pagos_confirmados_hoy} confirmados hoy`,                                  status: data.pagos.pendiente_cobro > 0 ? 'warning' : 'ok' },
        { label: 'Discrepancias',     value: data.inventario.discrepancias_activas, delta: `${data.inventario.productos_criticos} productos críticos`,                         status: data.inventario.discrepancias_activas > 0 ? 'error' : 'ok' },
      ]
    : []

  const alerts: Alert[] = data?.sistema.wf11_alertas_activas.map(alertFromWf11) ?? []

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Resumen operacional — Baguettes de PR</p>
        </div>
        {data && (
          <button onClick={refreshHome} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
            <RefreshCw size={13} /> Actualizar
          </button>
        )}
      </div>

      {error && <ErrorCard message={`No se pudo cargar el dashboard: ${error.message}`} onRetry={() => refetch()} />}

      {/* Metrics */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Métricas del día</h2>
        {isPending ? <MetricsSkeleton /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {metrics.map((m) => <MetricCardWidget key={m.label} card={m} />)}
          </div>
        )}
      </section>

      {/* Alerts + Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Alertas activas</h2>
          {isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border px-3 py-2.5 bg-slate-50">
                  <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                  <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-full" /><Skeleton className="h-3 w-32" /></div>
                </div>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-white rounded-lg border border-slate-200 px-3 py-4">
              <CheckCircle size={16} className="text-emerald-500" /> Sin alertas activas
            </div>
          ) : (
            <div className="space-y-2">{alerts.map((a) => <AlertRow key={a.id} alert={a} />)}</div>
          )}
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Workflows</h2>
          {isPending ? (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
              <Skeleton className="h-4 w-32" />
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          ) : (
            <SyncStatusCard cloverStatus={data?.sistema.sync_clover_status ?? 'ok'} onRefresh={refreshHome} />
          )}
        </section>
      </div>

      {/* Auditoría — últimos hallazgos sin resolver */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Auditoría — sin resolver</h2>
          <a href="/auditoria" className="text-xs text-indigo-600 hover:underline">Ver todo →</a>
        </div>
        {!audData ? (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm divide-y divide-slate-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2.5">
                <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-full" /><Skeleton className="h-3 w-24" /></div>
              </div>
            ))}
          </div>
        ) : (
          <AuditWidget hallazgos={topHallazgos} />
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Nueva factura',   icon: <CreditCard   size={14} /> },
            { label: 'Ver órdenes',     icon: <ShoppingCart size={14} /> },
            { label: 'Generar reporte', icon: <TrendingUp   size={14} /> },
          ].map((a) => (
            <button key={a.label} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-sm">
              {a.icon}{a.label}
            </button>
          ))}
        </div>
      </section>

      {isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400 py-2">
          <Loader2 size={14} className="animate-spin" /> Cargando datos…
        </div>
      )}
    </div>
  )
}
