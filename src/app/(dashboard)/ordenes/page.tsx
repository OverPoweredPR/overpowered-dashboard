"use client"
import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePullRefresh } from "@/hooks/use-pull-refresh";
import { Search, Package, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  "Entregada": "bg-success/10 text-success border-success/20",
  "En proceso": "bg-info/10 text-info border-info/20",
  "Pendiente": "bg-warning/10 text-warning border-warning/20",
  "Cancelada": "bg-destructive/10 text-destructive border-destructive/20",
};

const orders = [
  { id: "#2087", client: "Restaurante El Coquí", items: "50 baguettes, 20 croissants", total: "$245.00", status: "Entregada", date: "12 Abr" },
  { id: "#2086", client: "Café La Plaza", items: "30 baguettes, 10 pain au chocolat", total: "$178.50", status: "En proceso", date: "12 Abr" },
  { id: "#2085", client: "Hotel San Juan", items: "100 baguettes, 50 rolls", total: "$520.00", status: "En proceso", date: "12 Abr" },
  { id: "#2084", client: "Deli Boricua", items: "25 baguettes", total: "$87.50", status: "Pendiente", date: "11 Abr" },
  { id: "#2083", client: "Panadería Express", items: "40 baguettes, 15 croissants", total: "$198.00", status: "Entregada", date: "11 Abr" },
  { id: "#2082", client: "Bistro 787", items: "60 baguettes", total: "$210.00", status: "Cancelada", date: "11 Abr" },
  { id: "#2081", client: "Café La Plaza", items: "20 baguettes", total: "$70.00", status: "Entregada", date: "10 Abr" },
];

export default function Ordenes() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Órdenes actualizadas");
  }, []);

  const { containerRef, pullDistance, refreshing } = usePullRefresh({ onRefresh: handleRefresh });

  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  const filtered = orders.filter((o) =>
    !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase())
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
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar orden..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Package className="w-7 h-7 text-muted-foreground" />} title="Sin órdenes" description="No se encontraron órdenes con ese criterio de búsqueda." />
        ) : isMobile ? (
          /* Mobile card view */
          <div className="space-y-3 animate-fade-in">
            {filtered.map((o) => (
              <Card key={o.id} className="shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{o.id}</span>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusStyles[o.status]}`}>{o.status}</span>
                  </div>
                  <p className="text-sm font-medium">{o.client}</p>
                  <p className="text-xs text-muted-foreground">{o.items}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-semibold">{o.total}</span>
                    <span className="text-xs text-muted-foreground">{o.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                    {filtered.map((o) => (
                      <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                        <td className="p-4 font-semibold text-foreground">{o.id}</td>
                        <td className="p-4">{o.client}</td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">{o.items}</td>
                        <td className="p-4 font-semibold">{o.total}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusStyles[o.status]}`}>{o.status}</span>
                        </td>
                        <td className="p-4 text-muted-foreground hidden sm:table-cell">{o.date}</td>
                      </tr>
                    ))}
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
