import { NextResponse } from 'next/server'
import type { AuditoriaData, Hallazgo, NocheAuditoria, Severidad } from '@/lib/api'

// ── Mock data generator ───────────────────────────────────────────────────────

const PLANTILLAS: { descripcion: string; workflow: string; severidad: Severidad }[] = [
  { descripcion: 'Discrepancia de inventario en SKU BPR-1042: Shopify=24, Airtable=19',          workflow: 'WF3',  severidad: 'error'   },
  { descripcion: 'Orden #1038 lleva 48h en estado pendiente_aprobacion sin acción',               workflow: 'WF5A', severidad: 'warning' },
  { descripcion: 'Sync Clover→Shopify completado: 47 transacciones procesadas',                   workflow: 'WF7',  severidad: 'info'    },
  { descripcion: 'Pago duplicado detectado: $128.50 registrado dos veces para orden #1031',       workflow: 'WF11', severidad: 'error'   },
  { descripcion: '3 productos con stock < 5 unidades: Croissant, Pan de Agua, Bizcocho',          workflow: 'WF3',  severidad: 'warning' },
  { descripcion: 'WF10 ejecutó 12 confirmaciones de pago — 0 errores',                           workflow: 'WF10', severidad: 'info'    },
  { descripcion: 'Factura OCR fallida: imagen ilegible — PO-2037 requiere revisión manual',      workflow: 'WF4',  severidad: 'warning' },
  { descripcion: 'Reconciliación nocturna: 2 órdenes Shopify sin equivalente en Airtable',       workflow: 'WF3',  severidad: 'error'   },
  { descripcion: 'Sync POS completado en 3 intentos (timeout en 1er intento)',                   workflow: 'WF7',  severidad: 'warning' },
  { descripcion: 'WF11 completado sin hallazgos críticos — sistema OK',                          workflow: 'WF11', severidad: 'info'    },
  { descripcion: 'Cliente sin email en Airtable: teléfono +1787-555-0142',                       workflow: 'WF5D', severidad: 'warning' },
  { descripcion: 'Inventario actualizado: +240 unidades de Panadería El Bohío',                  workflow: 'WF2',  severidad: 'info'    },
]

function makeISO(daysAgo: number, hour = 21, min = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}

function generateNight(daysAgo: number): NocheAuditoria {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - daysAgo)
  const fechaStr = fecha.toISOString().split('T')[0]
  const seed    = daysAgo * 7
  const count   = 2 + (seed % 4)
  const isOld   = daysAgo > 3

  const hallazgos: Hallazgo[] = Array.from({ length: count }, (_, i) => {
    const tmpl = PLANTILLAS[(seed + i) % PLANTILLAS.length]
    const resuelto = isOld || (i < count - 1 && tmpl.severidad !== 'error')
    return {
      id:           `hall-${fechaStr}-${i}`,
      severidad:    tmpl.severidad,
      descripcion:  tmpl.descripcion,
      workflow:     tmpl.workflow,
      timestamp:    makeISO(daysAgo, 21, i * 3),
      resuelto,
      resuelto_en:  resuelto && isOld ? makeISO(daysAgo - 1, 9) : undefined,
      resuelto_por: resuelto && isOld ? 'Jose E.'                : undefined,
    }
  })

  return {
    fecha: fechaStr,
    hallazgos,
    resumen: {
      error:   hallazgos.filter((h) => h.severidad === 'error').length,
      warning: hallazgos.filter((h) => h.severidad === 'warning').length,
      info:    hallazgos.filter((h) => h.severidad === 'info').length,
      total:   hallazgos.length,
    },
  }
}

// ── GET /api/dashboard/auditoria ──────────────────────────────────────────────

export async function GET() {
  const WF11_WEBHOOK = process.env.WF11_WEBHOOK_URL

  if (!WF11_WEBHOOK) {
    const historial: NocheAuditoria[] = Array.from({ length: 30 }, (_, i) => generateNight(i + 1))
    const sinResolver: Hallazgo[]     = historial
      .slice(0, 7).flatMap((n) => n.hallazgos).filter((h) => !h.resuelto).slice(0, 12)

    const now      = new Date()
    const proxima  = new Date(now)
    proxima.setDate(proxima.getDate() + (now.getHours() >= 21 ? 1 : 0))
    proxima.setHours(21, 5, 0, 0)

    const data: AuditoriaData = {
      ultima_auditoria:  makeISO(1, 21, 5),
      proxima_auditoria: proxima.toISOString(),
      wf11_activo:       false,
      sin_resolver:      sinResolver,
      historial,
    }
    return NextResponse.json(data)
  }

  try {
    const res = await fetch(WF11_WEBHOOK)
    if (!res.ok) return NextResponse.json({ error: `WF11 respondió ${res.status}` }, { status: 502 })
    return NextResponse.json(await res.json())
  } catch (err) {
    console.error('[/api/dashboard/auditoria GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
