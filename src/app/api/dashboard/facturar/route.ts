import { NextRequest, NextResponse } from 'next/server'

const WF12_WEBHOOK = 'https://mrestevez.app.n8n.cloud/webhook/wf12-invoice'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { invoice_type, invoice_id, customer_name, customer_email, shopify_order_id, total, line_items, notes } = body

    if (!invoice_type || !invoice_id || !customer_name) {
      return NextResponse.json(
        { error: 'invoice_type, invoice_id y customer_name son requeridos' },
        { status: 400 }
      )
    }

    const payload = {
      invoice_type,
      invoice_id,
      customer_name,
      customer_email:   customer_email  ?? '',
      shopify_order_id: shopify_order_id ?? '',
      total:            total            ?? '0.00',
      line_items:       line_items       ?? [],
      notes:            notes            ?? '',
    }

    const wf12Res = await fetch(WF12_WEBHOOK, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    if (!wf12Res.ok) {
      const text = await wf12Res.text()
      return NextResponse.json(
        { error: `WF12 respondió ${wf12Res.status}`, detail: text },
        { status: 502 }
      )
    }

    const data = await wf12Res.json().catch(() => ({}))

    return NextResponse.json({ ok: true, wf12: data })
  } catch (err) {
    console.error('[/api/dashboard/facturar]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
