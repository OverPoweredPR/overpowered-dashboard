import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCardsSkeleton } from "@/components/Skeletons";
import { usePullRefresh } from "@/hooks/use-pull-refresh";
import { Package, DollarSign, Clock, AlertTriangle, Plus, RefreshCw, FileText, ShoppingCart, Upload, CheckCheck, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

const sparklineData: Record<string, number[]> = {
  "Órdenes hoy": [32, 38, 29, 41, 35, 44, 47],
  "Ingresos hoy": [2800, 3100, 2950, 3400, 3200, 3600, 3842],
  "Pagos pendientes": [18, 15, 20, 14, 16, 13, 12],
  "Alertas activas": [3, 4, 2, 6, 3, 4, 5],
};

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="mt-1.5" viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

const stats = [
  { label: "Órdenes hoy", value: "47", change: "+12%", icon: Package, color: "text-primary" },
  { label: "Ingresos hoy", value: "$3,842", change: "+8%", icon: DollarSign, color: "text-primary" },
  { label: "Pagos pendientes", value: "12", change: "-3", icon: Clock, color: "text-warning" },
  { label: "Alertas activas", value: "5", change: "+2", icon: AlertTriangle, color: "text-destructive" },
];

const sparkColors: Record<string, string> = {
  "text-primary": "#0F6E56",
  "text-warning": "#F59E0B",
  "text-destructive": "#EF4444",
};

const alerts = [
  { id: 1, message: "Inventario bajo: Harina de trigo (15 lbs restantes)", severity: "error", time: "Hace 5 min" },
  { id: 2, message: "Pago #1042 vencido hace 3 días — Restaurante El Coquí", severity: "warning", time: "Hace 12 min" },
  { id: 3, message: "Orden #2087 entregada exitosamente", severity: "info", time: "Hace 30 min" },
  { id: 4, message: "Precio de mantequilla aumentó 8% — proveedor Dairy Fresh", severity: "warning", time: "Hace 1 hr" },
  { id: 5, message: "Clover POS sincronizado — 23 transacciones importadas", severity: "info", time: "Hace 2 hr" },
];

const severityStyles: Record<string, string> = {
  error: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
};

const quickActions = [
  { label: "Nueva Orden", icon: Plus },
  { label: "Sincronizar POS", icon: RefreshCw },
  { label: "Crear Factura", icon: FileText },
  { label: "Orden de Compra", icon: ShoppingCart },
  { label: "Subir Evidencia", icon: Upload },
  { label: "Reconciliar Stock", icon: ClipboardCheck },
];

function formatTime(d: Date) {
  return d.toLocaleTimeString("es-PR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { const cleanup = loadData(); return cleanup; }, [loadData]);

  const handlePullRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 800));
    setLastUpdated(new Date());
    toast.success("Dashboard actualizado");
  }, []);

  const { containerRef, pullDistance, refreshing: pullRefreshing } = usePullRefresh({ onRefresh: handlePullRefresh });

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAcknowledgeAll = () => {
    toast.success("Todas las alertas han sido reconocidas");
  };

  return (
    <DashboardLayout>
      <div ref={containerRef} className="space-y-6">
        {/* Pull indicator */}
        {(pullDistance > 0 || pullRefreshing) && (
          <div className="flex justify-center -mt-2 mb-2 md:hidden">
            <RefreshCw className={`w-5 h-5 text-primary transition-transform ${pullRefreshing ? "animate-spin" : ""}`} style={{ transform: `rotate(${pullDistance * 3}deg)` }} />
          </div>
        )}
        <div className="animate-fade-in flex items-start justify-between gap-4">
          <div>
            <h1 className="page-title">Buenos días ☀️</h1>
            <p className="text-muted-foreground text-sm mt-1">Panel de operaciones — 12 de abril, 2026</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Última actualización: {formatTime(lastUpdated)}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="shrink-0 gap-1.5 hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {loading ? (
          <StatCardsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <Card key={s.label} className="shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                    <span className="text-xs font-medium text-muted-foreground">{s.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  <MiniSparkline data={sparklineData[s.label]} color={sparkColors[s.color] || "#0F6E56"} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <Card className="shadow-sm">
              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                <CardTitle className="section-label">Alertas Recientes</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAcknowledgeAll}
                  className="text-xs gap-1 text-muted-foreground hover:text-primary"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Acknowledge all
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((a) => (
                  <div key={a.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:opacity-80 ${severityStyles[a.severity]}`}>
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{a.message}</p>
                      <p className="text-xs opacity-70 mt-1">{a.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="section-label">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {quickActions.map((a) => (
                  <Button key={a.label} variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs font-medium hover:bg-primary/10 hover:border-primary/30 hover:text-primary active:scale-95 transition-all">
                    <a.icon className="h-4 w-4" />
                    {a.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="section-label">Clover POS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-foreground">Conectado</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between"><span>Última sincronización</span><span className="font-medium text-foreground">11:42 AM</span></div>
                  <div className="flex justify-between"><span>Transacciones hoy</span><span className="font-medium text-foreground">23</span></div>
                  <div className="flex justify-between"><span>Errores</span><span className="font-medium text-foreground">0</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
