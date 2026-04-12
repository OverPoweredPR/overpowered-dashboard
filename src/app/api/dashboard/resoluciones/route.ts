import { NextRequest, NextResponse } from 'next/server'

// TODO: conectar a Airtable / WF5D cuando esté disponible
export async function GET() {
  return NextResponse.json({ ok: true, source: 'static' })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, caso_id, nota, agente } = body

    if (!action || !caso_id) {
      return NextResponse.json(
        { error: 'action y caso_id son requeridos' },
        { status: 400 }
      )
    }

    if (action === 'tomar' && !agente) {
      return NextResponse.json({ error: 'agente es requerido para tomar caso' }, { status: 400 })
    }

    if (action === 'resolver' && !nota?.trim()) {
      return NextResponse.json({ error: 'nota de resolución es requerida' }, { status: 400 })
    }

    // TODO: llamar WF5D webhook cuando esté configurado
    console.log('[resoluciones]', { action, caso_id, nota, agente })

    return NextResponse.json({ ok: true, action, caso_id })
  } catch (err) {
    console.error('[/api/dashboard/resoluciones]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
