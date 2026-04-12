import { NextRequest, NextResponse } from 'next/server'

// WF2 — Receipt → Shopify Inventory - Airtable Baguette
const WF2_WEBHOOK = process.env.WF2_WEBHOOK_URL ?? ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { po_id, po_numero, proveedor } = body as {
      po_id:     string
      po_numero: string
      proveedor: string
    }

    if (!po_id || !po_numero) {
      return NextResponse.json(
        { error: 'po_id y po_numero son requeridos' },
        { status: 400 }
      )
    }

    if (!WF2_WEBHOOK) {
      return NextResponse.json({
        ok:        true,
        message:   `PO ${po_numero} marcado como recibido (dev mode — WF2_WEBHOOK_URL no configurado)`,
        po_id,
        po_numero,
      })
    }

    const wf2Res = await fetch(WF2_WEBHOOK, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        po_id,
        po_numero,
        proveedor:   proveedor ?? '',
        received_at: new Date().toISOString(),
        source:      'dashboard',
      }),
    })

    if (!wf2Res.ok) {
      const text = await wf2Res.text()
      return NextResponse.json(
        { error: `WF2 respondió ${wf2Res.status}`, detail: text },
        { status: 502 }
      )
    }

    const data = await wf2Res.json().catch(() => ({}))
    return NextResponse.json({ ok: true, wf2: data })
  } catch (err) {
    console.error('[/api/dashboard/compra/recibir]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
