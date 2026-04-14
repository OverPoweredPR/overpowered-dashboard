import { NextResponse } from 'next/server'

const N8N_URL = process.env.N8N_WEBHOOK_URL
const TOKEN   = process.env.N8N_DASHBOARD_TOKEN

export async function GET() {
  if (!N8N_URL || !TOKEN) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }
  try {
    const res = await fetch(`${N8N_URL}/dashboard-pagos`, {
      headers: { 'X-Dashboard-Token': TOKEN },
      next: { revalidate: 0 },
    })
    if (!res.ok) {
      return NextResponse.json({ error: `n8n error: ${res.status}` }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch (err) {
    return NextResponse.json({ error: 'Connection failed', detail: String(err) }, { status: 503 })
  }
}
