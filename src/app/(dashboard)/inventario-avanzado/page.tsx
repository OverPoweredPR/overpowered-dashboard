import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, PackagePlus, ShoppingCart, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

/* ── ABC Analysis ── */
interface ABCProduct { name: string; revenue: number; frequency: number; stock: number }
const abcData: Record<"A" | "B" | "C", { color: string; bg: string; products: ABCProduct[] }> = {
  A: { color: "text-primary", bg: "bg-primary/10", products: [
    { name: "Pan Sobao", revenue: 24100, frequency: 320, stock: 480 },
    { name: "Baguette Clásico", revenue: 21900, frequency: 280, stock: 350 },
    { name: "Croissant Mantequilla", revenue: 20860, frequency: 260, stock: 290 },
  ]},
  B: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", products: [
    { name: "Quesito", revenue: 12550, frequency: 180, stock: 210 },
    { name: "Mallorca", revenue: 11000, frequency: 160, stock: 190 },
    { name: "Pan Integral", revenue: 11340, frequency: 140, stock: 175 },
  ]},
  C: { color: "text-muted-foreground", bg: "bg-muted", products: [
    { name: "Polvorón", revenue: 5120, frequency: 85, stock: 320 },
    { name: "Palito de Queso", revenue: 3800, frequency: 60, stock: 250 },
    { name: "Galleta de Manteca", revenue: 2400, frequency: 40, stock: 400 },
  ]},
};

/* ── Reorder Alerts ── */
const reorderAlerts = [
  { name: "Harina Todo Uso", stock: 12, min: 50, unit: "kg", supplier: "Molinos PR" },
  { name: "Mantequilla", stock: 5, min: 20, unit: "kg", supplier: "Tres Monjitas" },
  { name: "Levadura Seca", stock: 2, min: 10, unit: "kg", supplier: "Fleischmann" },
  { name: "Azúcar Blanca", stock: 8, min: 30, unit: "kg", supplier: "Central Aguirre" },
];

/* ── Cost Analysis ── */
const costAnalysis = [
  { product: "Harina Todo Uso", unitCost: 1.85, lastPurchase: "2026-04-08", change: 4.2, up: true, supplier: "Molinos PR" },
  { product: "Mantequilla", unitCost: 6.50, lastPurchase: "2026-04-05", change: -1.8, up: false, supplier: "Tres Monjitas" },
  { product: "Huevos (caja 30)", unitCost: 8.20, lastPurchase: "2026-04-10", change: 2.5, up: true, supplier: "Granja del Sol" },
  { product: "Azúcar Blanca", unitCost: 0.95, lastPurchase: "2026-04-03", change: 0.0, up: true, supplier: "Central Aguirre" },
  { product: "Chocolate 70%", unitCost: 12.40, lastPurchase: "2026-04-07", change: 6.1, up: true, supplier: "Cortés" },
  { product: "Crema de Leche", unitCost: 4.20, lastPurchase: "2026-04-09", change: -0.5, up: false, supplier: "Tres Monjitas" },
];

/* ── Expiration Tracker ── */
const expirations = [
  { product: "Crema de Leche", batch: "L-0412", qty: 15, unit: "L", daysLeft: 3 },
  { product: "Mantequilla", batch: "L-0398", qty: 8, unit: "kg", daysLeft: 5 },
  { product: "Huevos", batch: "L-0415", qty: 60, unit: "uds", daysLeft: 6 },
  { product: "Levadura Fresca", batch: "L-0420", qty: 4, unit: "kg", daysLeft: 12 },
  { product: "Queso Crema", batch: "L-0405", qty: 10, unit: "kg", daysLeft: 18 },
  { product: "Jamón", batch: "L-0410", qty: 6, unit: "kg", daysLeft: 25 },
];

/* ── Stock Valuation ── */
const stockValuation = [
  { category: "Harinas & Granos", value: 18500, pct: 32 },
  { category: "Lácteos", value: 12200, pct: 21 },
  { category: "Azúcares & Endulzantes", value: 8400, pct: 14 },
  { category: "Carnes & Embutidos", value: 7800, pct: 13 },
  { category: "Chocolate & Cacao", value: 6200, pct: 11 },
  { category: "Otros", value: 5100, pct: 9 },
];
const totalValuation = stockValuation.reduce((s, c) => s + c.value, 0);

const urgencyBadge = (days: number) => {
  if (days <= 7) return <Badge className="bg-destructive/15 text-destructive border-0 text-[10px]"><Timer className="h-3 w-3 mr-1" />{days}d</Badge>;
  return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0 text-[10px]"><Timer className="h-3 w-3 mr-1" />{days}d</Badge>;
};

export default function InventarioAvanzado() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Inventario Avanzado</h1>

        {/* ABC Analysis */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Análisis ABC</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(abcData) as [keyof typeof abcData, typeof abcData.A][]).map(([tier, { color, bg, products }]) => (
              <Card key={tier}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className={cn("h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold", bg, color)}>{tier}</span>
                    Categoría {tier}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {products.map((p) => (
                    <div key={p.name} className="rounded-lg border border-border p-3">
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Rev: {fmt(p.revenue)}</span>
                        <span>Freq: {p.frequency}</span>
                        <span>Stock: {p.stock}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reorder Alerts */}
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Alertas de Reorden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {reorderAlerts.map((a) => (
                <div key={a.name} className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <p className="text-sm font-semibold text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.supplier}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-destructive font-medium">{a.stock}/{a.min} {a.unit}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10">
                      <ShoppingCart className="h-3 w-3" /> Crear PO
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cost Analysis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Análisis de Costos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2.5 font-medium text-muted-foreground">Producto</th>
                      <th className="text-right p-2.5 font-medium text-muted-foreground">Costo Ud.</th>
                      <th className="text-right p-2.5 font-medium text-muted-foreground">Cambio</th>
                      <th className="text-left p-2.5 font-medium text-muted-foreground hidden sm:table-cell">Proveedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costAnalysis.map((c) => (
                      <tr key={c.product} className="border-t border-border">
                        <td className="p-2.5 font-medium text-foreground">{c.product}</td>
                        <td className="p-2.5 text-right text-foreground">{fmt(c.unitCost)}</td>
                        <td className="p-2.5 text-right">
                          <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", c.change > 0 ? "text-destructive" : c.change < 0 ? "text-primary" : "text-muted-foreground")}>
                            {c.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : c.change < 0 ? <ArrowDownRight className="h-3 w-3" /> : null}
                            {Math.abs(c.change)}%
                          </span>
                        </td>
                        <td className="p-2.5 text-muted-foreground hidden sm:table-cell">{c.supplier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Expiration Tracker */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Próximos a Vencer</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="7">
                <TabsList className="mb-3">
                  <TabsTrigger value="7">≤ 7 días</TabsTrigger>
                  <TabsTrigger value="30">≤ 30 días</TabsTrigger>
                </TabsList>
                {["7", "30"].map((range) => (
                  <TabsContent key={range} value={range} className="space-y-2 mt-0">
                    {expirations.filter((e) => e.daysLeft <= Number(range)).map((e) => (
                      <div key={e.batch} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{e.product}</p>
                          <p className="text-xs text-muted-foreground">{e.batch} · {e.qty} {e.unit}</p>
                        </div>
                        {urgencyBadge(e.daysLeft)}
                      </div>
                    ))}
                    {expirations.filter((e) => e.daysLeft <= Number(range)).length === 0 && (
                      <p className="text-sm text-muted-foreground py-4 text-center">Sin productos próximos a vencer.</p>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Stock Valuation */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Valoración de Inventario</CardTitle>
              <span className="text-lg font-bold text-primary">{fmt(totalValuation)}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {stockValuation.map((c) => (
              <div key={c.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{c.category}</span>
                  <span className="text-muted-foreground">{fmt(c.value)} ({c.pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
