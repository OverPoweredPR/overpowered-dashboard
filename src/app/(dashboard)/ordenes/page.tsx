"use client"
import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePullRefresh } from "@/hooks/use-pull-refresh";
import { useOrdenes, useRefreshDashboard } from "@/hooks/useDashboard";
import type { Orden } from "@/lib/api";
import { Search, Package, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const statusLabels: Record<Orden["status"], string> = {
  pendiente_aprobacion: "Pendiente",
  aprobada:             "Pendiente",
  en_preparacion:       "En proceso",
  completada:           "Entregada",
  cancelada:            "Cancelada",
};

const statusStyles: Record<string, string> = {
  "Entregada":  "bg-success/10 text-success border-success/20",
  "En proceso": "bg-info/10 text-info border-info/20",
  "Pendiente":  "bg-warning/10 text-warning border-warning/20",
  "Cancelada":  "bg-destructive/10 text-destructive border-destructive/20",
};

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PR", { day: "numeric", month: "short" });
}

export default function Ordenes() {
  const { data, isPending, error, refetch } = useOrdenes();
  const { refreshOrdenes } = useRefreshDashboard();
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  const handleRefresh = useCallback(async () => {
    refreshOrdenes();
    await refetch();
    toast.success("Órdenes actualizadas");
  }, [refreshOrdenes, refetch]);

  const { containerRef, pullDistance, refreshing } = usePullRefresh({ onRefresh: handleRefresh });

  const ordenes = data?.ordenes ?? [];
  const filtered = ordenes.filter((o) =>
    !search ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.cliente.toLowerCase().includes(search.toLowerCase()) ||
    o.shopify_order.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div ref={containerRef} className="space-y-6">
        {/* Pull indicator */}
        {(pullDistance > 0 || refreshing) && (
          <div className="flex justify-center -mt-2 mb-2 md:hidden">
            <RefreshCw className={`w-5 h-5 text-primary transition-transform ${refreshing ? "animate-spin" : ""}`} style={{ transform: `rotate(${pullDistance * 3}deg)` }} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="page-title">Órdenes</h1>
            <p className="text-sm text-muted-foreground">Gestión de pedidos del día</p>
          </div>
          <div className="flex items-center gap-3">
            {data && (
              <button onClick={handleRefresh} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <RefreshCw size={13} /> Actualizar
              </button>
            )}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar orden..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertCircle size={16} className="text-destructive shrink-0" />
            <p className="text-sm text-destructive flex-1">No se pudieron cargar las órdenes: {error.message}</p>
            <button onClick={() => refetch()} className="text-xs font-medium text-destructive hover:underline">Reintentar</button>
          </div>
        )}

        {isPending ? (
          <TableSkeleton rows={6} cols={5} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Package className="w-7 h-7 text-muted-foreground" />} title="Sin órdenes" description="No se encontraron órdenes con ese criterio de búsqueda." />
        ) : isMobile ? (
          /* Mobile card view */
          <div className="space-y-3 animate-fade-in">
            {filtered.map((o) => {
              const label = statusLabels[o.status];
              return (
                <Card key={o.id} className="shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{o.shopify_order}</span>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusStyles[label]}`}>{label}</span>
                    </div>
                    <p className="text-sm font-medium">{o.cliente}</p>
                    <p className="text-xs text-muted-foreground">{o.items} {o.items === 1 ? "artículo" : "artículos"}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold">{fmt(o.monto)}</span>
                      <span className="text-xs text-muted-foreground">{fmtDate(o.creada_en)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="overflow-hidden shadow-sm animate-fade-in">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="table-header">Orden</th>
                      <th className="table-header">Cliente</th>
                      <th className="table-header hidden md:table-cell">Artículos</th>
                      <th className="table-header">Total</th>
                      <th className="table-header">Estado</th>
                      <th className="table-header hidden sm:table-cell">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o) => {
                      const label = statusLabels[o.status];
                      return (
                        <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                          <td className="p-4 font-semibold text-foreground">{o.shopify_order}</td>
                          <td className="p-4">{o.cliente}</td>
                          <td className="p-4 text-muted-foreground hidden md:table-cell">{o.items} {o.items === 1 ? "artículo" : "artículos"}</td>
                          <td className="p-4 font-semibold">{fmt(o.monto)}</td>
                          <td className="p-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusStyles[label]}`}>{label}</span>
                          </td>
                          <td className="p-4 text-muted-foreground hidden sm:table-cell">{fmtDate(o.creada_en)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
