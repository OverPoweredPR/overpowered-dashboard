import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sku, cantidad, motivo } = body

    if (!sku || cantidad === undefined || !motivo) {
      return NextResponse.json(
        { error: 'sku, cantidad y motivo son requeridos' },
        { status: 400 }
      )
    }

    // TODO: integrar con Airtable / WF3 cuando esté disponible
    console.log('[inventario/ajustar]', { sku, cantidad, motivo })

    return NextResponse.json({ ok: true, sku, cantidad, motivo })
  } catch (err) {
    console.error('[/api/dashboard/inventario/ajustar]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
