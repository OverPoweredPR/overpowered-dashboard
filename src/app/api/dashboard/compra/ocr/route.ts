import { NextRequest, NextResponse } from 'next/server'

const WF4_WEBHOOK = process.env.WF4_WEBHOOK_URL ?? ''

// Mock OCR result returned in dev mode when WF4 is not configured
const MOCK_OCR_RESULT = {
  proveedor:      'Panadería El Bohío',
  numero_factura: 'FAC-2890',
  fecha:          new Date().toISOString().split('T')[0],
  items: [
    { descripcion: 'Harina de trigo (50 lb)',    cantidad: 4,  precio_unitario: 18.50, total: 74.00 },
    { descripcion: 'Azúcar refinada (25 lb)',    cantidad: 6,  precio_unitario: 12.00, total: 72.00 },
    { descripcion: 'Mantequilla (1 lb)',         cantidad: 10, precio_unitario: 4.25,  total: 42.50 },
    { descripcion: 'Levadura seca (1 kg)',       cantidad: 2,  precio_unitario: 8.75,  total: 17.50 },
    { descripcion: 'Sal (5 lb)',                 cantidad: 3,  precio_unitario: 2.50,  total: 7.50  },
  ],
  subtotal: 213.50,
  impuesto: 19.22,
  total:    232.72,
}

export async function POST(req: NextRequest) {
  try {
    const formData  = await req.formData()
    const imageFile = formData.get('image') as File | null

    if (!imageFile) {
      return NextResponse.json({ error: 'Se requiere una imagen (campo "image")' }, { status: 400 })
    }

    // Dev mode — return mock OCR result without hitting WF4
    if (!WF4_WEBHOOK) {
      // Simulate processing delay (in real mode WF4 handles OCR)
      await new Promise((r) => setTimeout(r, 800))
      return NextResponse.json({ ok: true, result: MOCK_OCR_RESULT, source: 'mock' })
    }

    // Convert image to base64 and forward to WF4
    const buffer    = await imageFile.arrayBuffer()
    const base64    = Buffer.from(buffer).toString('base64')
    const mimeType  = imageFile.type || 'image/jpeg'

    const wf4Res = await fetch(WF4_WEBHOOK, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        image_base64: base64,
        mime_type:    mimeType,
        filename:     imageFile.name,
      }),
    })

    if (!wf4Res.ok) {
      const text = await wf4Res.text()
      return NextResponse.json(
        { error: `WF4 respondió ${wf4Res.status}`, detail: text },
        { status: 502 }
      )
    }

    const data = await wf4Res.json()
    return NextResponse.json({ ok: true, result: data.result ?? data })
  } catch (err) {
    console.error('[/api/dashboard/compra/ocr]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
