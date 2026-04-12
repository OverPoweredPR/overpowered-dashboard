import { NextResponse } from 'next/server'

const N8N_URL = process.env.N8N_WEBHOOK_URL
const N8N_TOKEN = process.env.N8N_WEBHOOK_TOKEN

export async function GET() {
  try {
    const res = await fetch(`${N8N_URL}/dashboard-compras`, {
      headers: { 'Authorization': `Bearer ${N8N_TOKEN}` }
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Error conectando con n8n' }, { status: 500 })
  }
}
