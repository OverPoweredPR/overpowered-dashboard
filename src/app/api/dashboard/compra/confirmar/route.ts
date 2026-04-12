import { NextRequest, NextResponse } from 'next/server'

const WF4_CONFIRM_WEBHOOK = process.env.WF4_CONFIRM_WEBHOOK_URL ?? ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { proveedor, numero_factura, fecha, items, subtotal, impuesto, total } = body

    if (!proveedor || !items?.length) {
      return NextResponse.json(
        { error: 'proveedor e items son requeridos' },
        { status: 400 }
      )
    }

    const poPayload = {
      proveedor,
      numero_factura: numero_factura ?? '',
      fecha:          fecha          ?? new Date().toISOString().split('T')[0],
      items,
      subtotal:       subtotal ?? 0,
      impuesto:       impuesto ?? 0,
      total:          total    ?? 0,
      created_from:   'dashboard',
      created_at:     new Date().toISOString(),
    }

    if (!WF4_CONFIRM_WEBHOOK) {
      // Dev mode
      const mockPONumber = `PO-${Date.now().toString().slice(-4)}`
      return NextResponse.json({
        ok:        true,
        po_numero: mockPONumber,
        message:   `PO ${mockPONumber} creado (dev mode — WF4_CONFIRM_WEBHOOK_URL no configurado)`,
      })
    }

    const wf4Res = await fetch(WF4_CONFIRM_WEBHOOK, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(poPayload),
    })

    if (!wf4Res.ok) {
      const text = await wf4Res.text()
      return NextResponse.json(
        { error: `WF4 respondió ${wf4Res.status}`, detail: text },
        { status: 502 }
      )
    }

    const data = await wf4Res.json()
    return NextResponse.json({ ok: true, po_numero: data.po_numero, wf4: data })
  } catch (err) {
    console.error('[/api/dashboard/compra/confirmar]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
