import { NextRequest, NextResponse } from 'next/server'

const WF11_WEBHOOK   = process.env.WF11_WEBHOOK_URL   ?? ''
const ADMIN_PIN_HASH = process.env.DASHBOARD_ADMIN_PIN ?? '1234'  // TODO: store hashed in Supabase

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json() as { pin?: string }

    if (!pin || !/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN inválido — 4 a 6 dígitos requeridos' }, { status: 400 })
    }

    // Simple comparison for now — replace with Supabase lookup + bcrypt when auth is wired
    if (pin !== ADMIN_PIN_HASH) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
    }

    if (!WF11_WEBHOOK) {
      return NextResponse.json({
        ok:      true,
        mensaje: 'Auditoría iniciada (dev mode — WF11_WEBHOOK_URL no configurado)',
        job_id:  `mock-${Date.now()}`,
      })
    }

    const wf11Res = await fetch(WF11_WEBHOOK, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ trigger: 'manual', source: 'dashboard', triggered_at: new Date().toISOString() }),
    })

    if (!wf11Res.ok) {
      const text = await wf11Res.text()
      return NextResponse.json({ error: `WF11 respondió ${wf11Res.status}`, detail: text }, { status: 502 })
    }

    const data = await wf11Res.json().catch(() => ({}))
    return NextResponse.json({ ok: true, mensaje: 'Auditoría iniciada', job_id: data.job_id ?? null })
  } catch (err) {
    console.error('[/api/dashboard/auditoria/run]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
