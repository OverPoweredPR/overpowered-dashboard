# Overpowered Dashboard

Internal operations dashboard for **Baguettes de PR** (tenant: `baguettes`), built and maintained by OverPowered. Multi-tenant architecture — the same codebase serves multiple food-service clients, each with isolated data via Supabase RLS and JWT-scoped API calls.

The dashboard is a server-side proxy: the browser never talks directly to n8n or Supabase service-role endpoints. All sensitive calls go through Next.js API routes.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Charts | recharts |
| Data fetching | @tanstack/react-query v5 |
| Auth / DB | Supabase (@supabase/ssr) |
| Automation backend | n8n (local instance at n8n.overpoweredpr.com) |
| Tunnel | Cloudflare Tunnel (cloudflared) |
| Hosting (dev) | Mac Mini — Tailscale IP 100.125.208.33 |

---

## Running in Development

```bash
cd ~/Documents/overpowered-dashboard
npm run dev
```

App runs at `http://localhost:3000`. Hot-reload is enabled via Turbopack.

Other scripts:

```bash
npm run build   # production build + type check
npm run start   # serve the production build
npm run lint    # ESLint
```

> **n8n must be running** for live data. The LaunchAgent (`local.n8n.plist`) keeps it permanent across reboots. If it is down: `launchctl start local.n8n`

---

## Project Structure

```
src/
  app/
    (dashboard)/          # All protected pages share layout + sidebar
      layout.tsx          # Sidebar, header, QueryClientProvider
      home/page.tsx
      ordenes/page.tsx
      pagos/page.tsx
      inventario/page.tsx
      compras/page.tsx
      facturas/page.tsx
      auditoria/page.tsx
      resoluciones/        # Placeholder
    api/
      dashboard/           # Server-side proxy routes (never call n8n from browser)
        home/route.ts
        ordenes/route.ts
        pagos/route.ts
        auditoria/route.ts
        auditoria/run/route.ts
        pago/confirmar/route.ts
        compra/{ocr,confirmar,recibir}/route.ts
        facturar/route.ts
        inventario/ajustar/route.ts
  hooks/
    useDashboard.ts        # All React Query hooks
  lib/
    api.ts                 # Typed fetcher + all response types + api.* functions
    types.ts               # Shared types: Tenant, User, MetricCard
    supabase.ts            # Supabase browser client
```

---

## Modules

| Route | Module | Status | Description |
|---|---|---|---|
| `/home` | Home | Live | KPI metrics, WF11 alerts, sync status, last 3 audit findings, quick actions |
| `/ordenes` | Ordenes | Live | Order table with status filter, mapped from Shopify/Airtable via n8n |
| `/pagos` | Pagos | Live | Kanban board: pending evidence → under review → confirmed / rejected |
| `/inventario` | Inventario | Static | Inventory table with stock levels (n8n integration pending) |
| `/compras` | Compras | Static | Purchase orders + OCR receipt scanning via WF4 |
| `/facturas` | Facturas | Static | Invoice management via WF12 (email HTML generation) |
| `/auditoria` | Auditoria | Live | WF11 nightly audit feed, 30-night history, severity filter, PIN-gated manual trigger |
| `/resoluciones` | Resoluciones | Placeholder | Planned: resolution tracking for audit findings |

**Live** = connected to React Query hooks and n8n API routes.
**Static** = UI built, not yet wired to live data.

---

## Environment Variables

Create `.env.local` in the project root. Never commit this file.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# n8n local instance
N8N_BASE_URL=
N8N_WEBHOOK_URL=
N8N_DASHBOARD_TOKEN=

# Workflow webhook URLs (one per workflow the dashboard triggers or reads from)
WF10_WEBHOOK_URL=
WF12_WEBHOOK_URL=
WF4_WEBHOOK_URL=
WF11_WEBHOOK_URL=        # When set, activates real WF11 trigger; omit for dev mock

# Auth
DASHBOARD_ADMIN_PIN=     # 4-6 digit PIN for manual audit trigger (plain in dev, replace with Supabase+bcrypt in prod)

# Tenant
NEXT_PUBLIC_TENANT_SLUG= # e.g. "baguettes"
```

Variables prefixed `NEXT_PUBLIC_` are exposed to the browser. All others are server-only.

---

## Adding a New Tenant

1. Create a new row in the `tenants` Supabase table (`id`, `name`, `slug`, `active: true`).
2. Set up Supabase RLS policies so every table filters by `tenant_id = auth.jwt() ->> 'tenant_id'`.
3. Deploy a separate environment (or Vercel project) with `NEXT_PUBLIC_TENANT_SLUG` set to the new slug.
4. The sidebar brand name is currently hardcoded in `layout.tsx` — replace it with a lookup from Supabase or the env variable when multi-tenant rendering is wired up.
5. Each tenant needs its own n8n webhook URLs in the environment. The proxy routes read these from env, so no code changes are required as long as the n8n workflow paths match.

---

## Connecting a New n8n Workflow to the Dashboard

### Pattern A — Dashboard reads data from n8n (query)

1. Add the webhook URL to `.env.local`:
   ```bash
   WF99_WEBHOOK_URL=https://n8n.overpoweredpr.com/webhook/wf99-my-workflow
   ```
2. Create a Next.js API route at `src/app/api/dashboard/my-feature/route.ts`:
   ```ts
   import { NextResponse } from 'next/server'

   export async function GET() {
     const url = process.env.WF99_WEBHOOK_URL
     if (!url) return NextResponse.json({ /* mock data for dev */ })
     const res = await fetch(url)
     if (!res.ok) return NextResponse.json({ error: `WF99 respondio ${res.status}` }, { status: 502 })
     return NextResponse.json(await res.json())
   }
   ```
3. Add the response type(s) to `src/lib/api.ts` and an `api.myFeature()` fetcher.
4. Add `useMyFeature()` to `src/hooks/useDashboard.ts` using `useQuery`.
5. Use the hook in the page — handle `isPending` with a skeleton, `error` with an error card.

### Pattern B — Dashboard triggers an action in n8n (mutation)

Same steps 1–3, but the route does `POST` to the webhook. Add a `useMutation` hook instead of `useQuery`.

Reference implementation: `useRunAuditoria` in `useDashboard.ts` + `/api/dashboard/auditoria/run/route.ts`.

### Dev mode without a live webhook

Every API route checks whether its env var is set. If missing, it returns deterministic mock data. This lets the full UI run without n8n during development.

---

## Security Architecture

```
Browser
  |  HTTPS
  v
Next.js API Routes  (/api/dashboard/*)
  |  - Reads Supabase JWT from HttpOnly cookie (server-side, @supabase/ssr)
  |  - Injects X-Tenant-ID header — never trusted from browser body
  |  - n8n URL and API token never sent to browser
  |  HTTPS
  v
n8n  (local, https://n8n.overpoweredpr.com)
  |  Cloudflare Tunnel — only /webhook/* paths are public (403 for editor)
  |
  v
Airtable / Shopify / Clover / Supabase
```

**JWT (Supabase Auth):** Session cookie is HttpOnly, managed by `@supabase/ssr`. Middleware (planned) will verify the JWT on every protected route and extract `tenant_id` from claims for RLS enforcement.

**PIN (Audit trigger):** The `/api/dashboard/auditoria/run` route validates a 4-6 digit PIN before forwarding to WF11. Currently compared as plain string against `DASHBOARD_ADMIN_PIN`. TODO: store hashed with bcrypt in Supabase and verify server-side when auth is wired.

**Supabase RLS:** Every Supabase table has row-level security policies filtering by `tenant_id`. The service role key (server-only) bypasses RLS only for admin operations. The anon key (browser-safe) is always RLS-constrained.

**Cloudflare Tunnel:** The n8n editor is never exposed publicly. The tunnel config (`~/.cloudflared/config.yml`) only proxies `/webhook/*`, `/webhook-test/*`, and `/webhook-waiting/*` paths. All other paths return HTTP 403.

**n8n API key:** Stored in `.env.local` as `N8N_DASHBOARD_TOKEN`, injected server-side as the `X-N8N-API-KEY` header. Never reaches the browser.

---

## Infrastructure Notes

- **n8n LaunchAgent:** `~/Library/LaunchAgents/local.n8n.plist` — starts n8n on login. Uses explicit node binary path (`/opt/homebrew/bin/node`) because LaunchAgent cannot resolve shebang scripts.
- **Cloudflare Tunnel LaunchAgent:** `~/Library/LaunchAgents/com.cloudflare.tunnel.plist` — keeps the tunnel alive permanently.
- **Tunnel ID:** `67c36712-8f4c-44f4-92d5-22f21aef63a4`
- **n8n local URL (editor):** `http://localhost:5678` — accessible via Tailscale/LAN only.
- **n8n public webhooks:** `https://n8n.overpoweredpr.com/webhook/*`

---

## Estado Dashboard — Sesión 2026-04-12

### Módulos completados (Lovable)
- Home ✅ | Órdenes ✅ | Pagos ✅
- Inventario ✅ | Resoluciones ✅
- Auditoría ✅ | Compras ✅ | Facturas ✅

### Commits clave de esta sesión
- 5b58950 — Auditoría (Lovable)
- 2263942 — Compras (Lovable)
- ff3ddea — Facturas (Lovable)
- 66c2352 — Polish global (Lovable)
- 001fa8b — LovableComponents portados
- 113dc0b — page.tsx activados (8 módulos)
- f135943 — Polish global portado

### Dependencias pendientes de fix
- shadcn/ui components (Claudia 3 en progreso)
- date-fns + sonner (Claudia 3 en progreso)
- Mobile nav — 4 módulos ocultos (Lovable fix en progreso)

### Próxima sesión
- Conectar datos reales (n8n endpoints)
- Supabase Auth — magic link
- Vercel deploy limpio post-fix

### Commits adicionales — tarde 2026-04-12
- 460bc8f — hooks React Query x5
- 3b2abf9 — API routes Compras/Facturas/Inventario
- 82ad29e — Login page
- b5ae0bf — Route protection + logout + email sidebar
- fix pendiente: N8N_DASHBOARD_TOKEN unificado (Claudia 3)

### Estado env vars
- NEXT_PUBLIC_SUPABASE_ANON_KEY — placeholder en local
- NEXT_PUBLIC_TENANT_SLUG — falta en Development/Preview
- N8N_WEBHOOK_TOKEN → renombrar a N8N_DASHBOARD_TOKEN

## Dashboard Workflows — n8n Local (2026-04-14)

| Workflow | ID | Webhook |
|---|---|---|
| Dashboard - Home | z5zdhv2zJbxfhril | /dashboard-home |
| Dashboard - Ordenes | Yrqz5srA0Z6JBQ3t | /dashboard-ordenes |
| Dashboard - Pagos | MM8I9ww7PwmBqJIZ | /dashboard-pagos |
| Dashboard - Inventario | YMNvjcM73Cn3579k | /dashboard-inventario |
| Dashboard - Compras | W224KkWcaTcDuuVK | /dashboard-compras |
| Dashboard - Facturas | WGGYjnOWJVVQFdSa | /dashboard-facturas |
| Dashboard - Auditoria | tQyKf2haDkdjfR4I | /dashboard-auditoria |
| Dashboard - Resoluciones | blAeXwnUW3zErAQm | /dashboard-resoluciones |

Todos activos en localhost:5678. Stack completo operativo.

## Estado Workflows n8n Local — 2026-04-14

### Activos (8) — solo Dashboard
- Dashboard Home, Ordenes, Pagos, Inventario, 
  Compras, Facturas, Auditoria, Resoluciones

### Inactivos en Local (pendiente migración)
- WF3, WF11 — corren en Cloud, NO activar 
  en local hasta desactivar en Cloud primero

### Regla de migración Cloud → Local
1. Desactivar en Cloud primero
2. Verificar en local
3. Activar en local
4. Nunca los dos activos simultáneamente
