import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCardsSkeleton } from "@/components/Skeletons";
import { Package, DollarSign, Clock, AlertTriangle, Plus, RefreshCw, FileText, ShoppingCart } from "lucide-react";

const stats = [
  { label: "Órdenes hoy", value: "47", change: "+12%", icon: Package, color: "text-primary" },
  { label: "Ingresos hoy", value: "$3,842", change: "+8%", icon: DollarSign, color: "text-primary" },
  { label: "Pagos pendientes", value: "12", change: "-3", icon: Clock, color: "text-warning" },
  { label: "Alertas activas", value: "5", change: "+2", icon: AlertTriangle, color: "text-destructive" },
];

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
];

export default function Index() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="page-title">Buenos días ☀️</h1>
          <p className="text-muted-foreground text-sm mt-1">Panel de operaciones — 12 de abril, 2026</p>
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="section-label">Alertas Recientes</CardTitle>
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
