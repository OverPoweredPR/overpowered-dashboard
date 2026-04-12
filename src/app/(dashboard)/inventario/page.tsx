"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, AlertTriangle, Package, ChevronDown, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  sku: string;
  name: string;
  stock: number;
  min: number;
  updatedAt: string;
}

interface Discrepancy {
  id: string;
  sku: string;
  product: string;
  shopify: number;
  airtable: number;
  diff: number;
  acknowledged: boolean;
}

interface ReconRecord {
  date: string;
  errors: number;
  warnings: number;
  total: number;
  status: "OK" | "Con errores" | "Pendiente";
}

const products: Product[] = [
  { sku: "MAT-001", name: "Harina de trigo", stock: 55, min: 50, updatedAt: "2026-04-12 06:30" },
  { sku: "MAT-002", name: "Mantequilla", stock: 30, min: 25, updatedAt: "2026-04-12 06:30" },
  { sku: "MAT-003", name: "Levadura", stock: 8, min: 10, updatedAt: "2026-04-11 22:00" },
  { sku: "MAT-004", name: "Sal", stock: 45, min: 20, updatedAt: "2026-04-12 06:30" },
  { sku: "MAT-005", name: "Azúcar", stock: 12, min: 15, updatedAt: "2026-04-11 22:00" },
  { sku: "MAT-006", name: "Huevos", stock: 0, min: 10, updatedAt: "2026-04-12 05:00" },
  { sku: "MAT-007", name: "Chocolate", stock: 22, min: 15, updatedAt: "2026-04-12 06:30" },
  { sku: "MAT-008", name: "Crema", stock: 0, min: 20, updatedAt: "2026-04-11 22:00" },
];

const initialDiscrepancies: Discrepancy[] = [
  { id: "D-01", sku: "MAT-003", product: "Levadura", shopify: 12, airtable: 8, diff: 4, acknowledged: false },
  { id: "D-02", sku: "MAT-005", product: "Azúcar", shopify: 15, airtable: 12, diff: 3, acknowledged: false },
  { id: "D-03", sku: "MAT-007", product: "Chocolate", shopify: 20, airtable: 22, diff: -2, acknowledged: false },
];

const reconHistory: ReconRecord[] = [
  { date: "2026-04-12", errors: 0, warnings: 2, total: 8, status: "OK" },
  { date: "2026-04-11", errors: 1, warnings: 3, total: 8, status: "Con errores" },
  { date: "2026-04-10", errors: 0, warnings: 1, total: 8, status: "OK" },
  { date: "2026-04-09", errors: 2, warnings: 4, total: 8, status: "Con errores" },
  { date: "2026-04-08", errors: 0, warnings: 0, total: 8, status: "OK" },
  { date: "2026-04-07", errors: 0, warnings: 1, total: 8, status: "OK" },
  { date: "2026-04-06", errors: 0, warnings: 0, total: 8, status: "Pendiente" },
];

function getStatus(stock: number, min: number) {
  if (stock === 0) return { dot: "bg-destructive", label: "Sin stock" };
  if (stock <= min) return { dot: "bg-warning", label: "Bajo" };
  return { dot: "bg-success", label: "Normal" };
}

export default function Inventario() {
  const [search, setSearch] = useState("");
  const [discrepancies, setDiscrepancies] = useState(initialDiscrepancies);
  const [adjustModal, setAdjustModal] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [reconOpen, setReconOpen] = useState(false);

  const zeroStockProducts = products.filter((p) => p.stock === 0);
  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAcknowledge = (id: string) => {
    setDiscrepancies((prev) => prev.map((d) => (d.id === id ? { ...d, acknowledged: true } : d)));
    toast.success("Discrepancia reconocida");
  };

  const handleAdjust = () => {
    if (adjustQty && adjustReason && adjustModal) {
      toast.success(`Stock de ${adjustModal.name} ajustado a ${adjustQty}`);
      setAdjustModal(null);
      setAdjustQty("");
      setAdjustReason("");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Inventario</h1>
            <p className="text-sm text-muted-foreground">Control de materias primas y reconciliación</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar SKU o producto..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Zero stock alert */}
        {zeroStockProducts.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-semibold text-destructive">¡Alerta de stock cero!</p>
              <p className="text-xs text-muted-foreground">
                {zeroStockProducts.map((p) => p.name).join(", ")} — requieren reabastecimiento inmediato.
              </p>
            </div>
          </div>
        )}

        {/* Product Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold text-muted-foreground">SKU</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Producto</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Stock Actual</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Stock Mínimo</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Estado</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Última Act.</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const st = getStatus(p.stock, p.min);
                    return (
                      <tr key={p.sku} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-mono text-xs text-muted-foreground">{p.sku}</td>
                        <td className="p-4 font-medium">{p.name}</td>
                        <td className="p-4 font-bold">{p.stock}</td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">{p.min}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                            <span className="text-xs font-medium">{st.label}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground hidden sm:table-cell">{p.updatedAt}</td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs gap-1"
                            onClick={() => { setAdjustModal(p); setAdjustQty(String(p.stock)); setAdjustReason(""); }}
                          >
                            <Package className="w-3.5 h-3.5" /> Ajustar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Discrepancies */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" /> Discrepancias Shopify vs Airtable
              <Badge variant="outline" className="ml-auto">{discrepancies.filter((d) => !d.acknowledged).length} pendientes</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold text-muted-foreground">SKU</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Producto</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Shopify</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Airtable</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Diff</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {discrepancies.map((d) => (
                    <tr key={d.id} className={`border-b last:border-0 transition-colors ${d.acknowledged ? "opacity-50" : "hover:bg-muted/30"}`}>
                      <td className="p-4 font-mono text-xs text-muted-foreground">{d.sku}</td>
                      <td className="p-4 font-medium">{d.product}</td>
                      <td className="p-4">{d.shopify}</td>
                      <td className="p-4">{d.airtable}</td>
                      <td className="p-4">
                        <Badge variant={d.diff > 0 ? "destructive" : "secondary"} className="text-xs">
                          {d.diff > 0 ? "+" : ""}{d.diff}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {d.acknowledged ? (
                          <Badge variant="outline" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3" /> Reconocido</Badge>
                        ) : (
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => handleAcknowledge(d.id)}>
                            Acknowledge
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Reconciliation History */}
        <Collapsible open={reconOpen} onOpenChange={setReconOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Historial de Reconciliación (7 noches)
                  <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${reconOpen ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 font-semibold text-muted-foreground">Fecha</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Errores</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Warnings</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Total</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconHistory.map((r) => (
                        <tr key={r.date} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-mono text-xs">{r.date}</td>
                          <td className="p-4">
                            {r.errors > 0 ? (
                              <Badge variant="destructive" className="text-xs">{r.errors}</Badge>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>
                          <td className="p-4">
                            {r.warnings > 0 ? (
                              <Badge className="text-xs bg-warning/15 text-warning border-warning/30" variant="outline">{r.warnings}</Badge>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>
                          <td className="p-4">{r.total}</td>
                          <td className="p-4">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                r.status === "OK" ? "bg-success/15 text-success border-success/30" :
                                r.status === "Con errores" ? "bg-destructive/15 text-destructive border-destructive/30" :
                                "bg-muted text-muted-foreground"
                              }`}
                            >
                              {r.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Adjust Stock Modal */}
      <Dialog open={!!adjustModal} onOpenChange={(open) => { if (!open) setAdjustModal(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajustar Stock</DialogTitle>
            <DialogDescription>
              {adjustModal?.sku} — {adjustModal?.name} (actual: {adjustModal?.stock})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nueva cantidad</label>
              <Input type="number" min={0} value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Razón del ajuste</label>
              <Select value={adjustReason} onValueChange={setAdjustReason}>
                <SelectTrigger><SelectValue placeholder="Seleccionar razón..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="conteo">Conteo físico</SelectItem>
                  <SelectItem value="error">Error sistema</SelectItem>
                  <SelectItem value="merma">Merma</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" disabled={!adjustQty || !adjustReason} onClick={handleAdjust}>
              Guardar Ajuste
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
