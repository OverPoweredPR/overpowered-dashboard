export type Tenant = {
  id: string
  name: string
  slug: string
  active: boolean
}

export type User = {
  id: string
  email: string
  name: string
  role: 'owner' | 'manager' | 'viewer'
  tenant_id: string
}

export type MetricCard = {
  label: string
  value: string | number
  delta?: string
  status?: 'ok' | 'warning' | 'error'
}
