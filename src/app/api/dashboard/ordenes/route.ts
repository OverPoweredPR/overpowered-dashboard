import { NextResponse } from 'next/server'

const N8N = process.env.N8N_WEBHOOK_URL
const TOKEN = process.env.N8N_DASHBOARD_TOKEN

export async function GET() {
  const res = await fetch(`${N8N}/dashboard-ordenes`, {
    headers: {
      ...(TOKEN ? { 'X-Dashboard-Token': TOKEN } : {}),
    },
    next: { revalidate: 0 },
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
