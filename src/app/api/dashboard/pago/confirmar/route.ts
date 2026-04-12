import { NextRequest, NextResponse } from 'next/server'

// WF10 is WhatsApp-driven — this route validates the PIN against Airtable
// and then calls WF10 webhook to mark the payment as confirmed.
// PIN validation will move to Supabase Auth once auth is wired up.

const WF10_WEBHOOK = process.env.WF10_WEBHOOK_URL ?? ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pago_id, numero_orden, pin } = body as {
      pago_id:       string
      numero_orden:  string
      pin:           string
    }

    if (!pago_id || !numero_orden || !pin) {
      return NextResponse.json(
        { error: 'pago_id, numero_orden y pin son requeridos' },
        { status: 400 }
      )
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN inválido — debe tener 4 a 6 dígitos numéricos' },
        { status: 400 }
      )
    }

    // TODO: validate PIN against Supabase/Airtable before forwarding

    if (!WF10_WEBHOOK) {
      // Dev mode — return success without hitting WF10
      return NextResponse.json({
        ok:      true,
        message: 'Pago confirmado (dev mode — WF10_WEBHOOK_URL no configurado)',
        pago_id,
        numero_orden,
      })
    }

    const wf10Res = await fetch(WF10_WEBHOOK, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        action:       'CONFIRMAR',
        pago_id,
        numero_orden,
        confirmed_by: 'dashboard',
      }),
    })

    if (!wf10Res.ok) {
      const text = await wf10Res.text()
      return NextResponse.json(
        { error: `WF10 respondió ${wf10Res.status}`, detail: text },
        { status: 502 }
      )
    }

    const data = await wf10Res.json().catch(() => ({}))
    return NextResponse.json({ ok: true, wf10: data })
  } catch (err) {
    console.error('[/api/dashboard/pago/confirmar]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
