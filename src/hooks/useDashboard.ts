'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type AuditoriaData, type HomeData, type OrdenesData, type PagosData, type RunAuditoriaResult } from '@/lib/api'

// ── Query keys ────────────────────────────────────────────────────────────────

export const dashboardKeys = {
  home:      ['dashboard', 'home']      as const,
  ordenes:   ['dashboard', 'ordenes']   as const,
  pagos:     ['dashboard', 'pagos']     as const,
  auditoria: ['dashboard', 'auditoria'] as const,
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

// ── useRefreshDashboard ───────────────────────────────────────────────────────

export function useRefreshDashboard() {
  const client = useQueryClient()
  return {
    refreshOrdenes:   () => client.invalidateQueries({ queryKey: dashboardKeys.ordenes }),
    refreshPagos:     () => client.invalidateQueries({ queryKey: dashboardKeys.pagos }),
    refreshHome:      () => client.invalidateQueries({ queryKey: dashboardKeys.home }),
    refreshAuditoria: () => client.invalidateQueries({ queryKey: dashboardKeys.auditoria }),
    refreshAll:       () => client.invalidateQueries({ queryKey: ['dashboard'] }),
  }
}
