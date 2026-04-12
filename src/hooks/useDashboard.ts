'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type AuditoriaData, type ComprasData, type FacturasData, type HomeData, type InventarioData, type OrdenesData, type PagosData, type ResolucionesData, type RunAuditoriaResult } from '@/lib/api'

// ── Query keys ────────────────────────────────────────────────────────────────

export const dashboardKeys = {
  home:         ['dashboard', 'home']         as const,
  ordenes:      ['dashboard', 'ordenes']      as const,
  pagos:        ['dashboard', 'pagos']        as const,
  auditoria:    ['dashboard', 'auditoria']    as const,
  inventario:   ['dashboard', 'inventario']   as const,
  compras:      ['dashboard', 'compras']      as const,
  facturas:     ['dashboard', 'facturas']     as const,
  resoluciones: ['dashboard', 'resoluciones'] as const,
}

// ── useHome — polling cada 30s ────────────────────────────────────────────────

export function useHome() {
  return useQuery<HomeData, Error>({
    queryKey:        dashboardKeys.home,
    queryFn:         api.home,
    refetchInterval: 30_000,
    staleTime:       25_000,
  })
}

// ── useOrdenes — refresh manual ───────────────────────────────────────────────

export function useOrdenes() {
  return useQuery<OrdenesData, Error>({
    queryKey:  dashboardKeys.ordenes,
    queryFn:   api.ordenes,
    staleTime: 60_000,
  })
}

// ── usePagos — refresh manual ─────────────────────────────────────────────────

export function usePagos() {
  return useQuery<PagosData, Error>({
    queryKey:  dashboardKeys.pagos,
    queryFn:   api.pagos,
    staleTime: 60_000,
  })
}

// ── useAuditoria — refresh manual ────────────────────────────────────────────

export function useAuditoria() {
  return useQuery<AuditoriaData, Error>({
    queryKey:  dashboardKeys.auditoria,
    queryFn:   api.auditoria,
    staleTime: 120_000,
  })
}

// ── useRunAuditoria — trigger WF11 con PIN ────────────────────────────────────

export function useRunAuditoria() {
  const client = useQueryClient()
  return useMutation<RunAuditoriaResult, Error, string>({
    mutationFn: (pin: string) => api.runAuditoria(pin),
    onSuccess:  () => {
      // Refresca auditoria y home después de ejecutar
      client.invalidateQueries({ queryKey: dashboardKeys.auditoria })
      client.invalidateQueries({ queryKey: dashboardKeys.home })
    },
  })
}

// ── useInventario ─────────────────────────────────────────────────────────────

export function useInventario() {
  return useQuery<InventarioData, Error>({
    queryKey:  dashboardKeys.inventario,
    queryFn:   api.inventario,
    staleTime: 60_000,
  })
}

// ── useCompras ────────────────────────────────────────────────────────────────

export function useCompras() {
  return useQuery<ComprasData, Error>({
    queryKey:  dashboardKeys.compras,
    queryFn:   api.compras,
    staleTime: 60_000,
  })
}

// ── useFacturas ───────────────────────────────────────────────────────────────

export function useFacturas() {
  return useQuery<FacturasData, Error>({
    queryKey:  dashboardKeys.facturas,
    queryFn:   api.facturas,
    staleTime: 60_000,
  })
}

// ── useResoluciones ───────────────────────────────────────────────────────────

export function useResoluciones() {
  return useQuery<ResolucionesData, Error>({
    queryKey:  dashboardKeys.resoluciones,
    queryFn:   api.resoluciones,
    staleTime: 60_000,
  })
}

// ── useRefreshDashboard ───────────────────────────────────────────────────────

export function useRefreshDashboard() {
  const client = useQueryClient()
  return {
    refreshOrdenes:      () => client.invalidateQueries({ queryKey: dashboardKeys.ordenes }),
    refreshPagos:        () => client.invalidateQueries({ queryKey: dashboardKeys.pagos }),
    refreshHome:         () => client.invalidateQueries({ queryKey: dashboardKeys.home }),
    refreshAuditoria:    () => client.invalidateQueries({ queryKey: dashboardKeys.auditoria }),
    refreshInventario:   () => client.invalidateQueries({ queryKey: dashboardKeys.inventario }),
    refreshCompras:      () => client.invalidateQueries({ queryKey: dashboardKeys.compras }),
    refreshFacturas:     () => client.invalidateQueries({ queryKey: dashboardKeys.facturas }),
    refreshResoluciones: () => client.invalidateQueries({ queryKey: dashboardKeys.resoluciones }),
    refreshAll:          () => client.invalidateQueries({ queryKey: ['dashboard'] }),
  }
}
