"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Search, Upload, Download, TrendingUp, Percent } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  cost: number;
  price: number;
  lastUpdated: string;
  history: { month: string; price: number }[];
}

const products: Product[] = [
  { id: 1, name: "Pan Sobao", category: "Panes", unit: "ud", cost: 1.20, price: 5.00, lastUpdated: "2026-04-10", history: [{ month: "Nov", price: 4.25 }, { month: "Dic", price: 4.50 }, { month: "Ene", price: 4.50 }, { month: "Feb", price: 4.75 }, { month: "Mar", price: 4.75 }, { month: "Abr", price: 5.00 }] },
  { id: 2, name: "Baguette Clásico", category: "Panes", unit: "ud", cost: 1.80, price: 6.00, lastUpdated: "2026-04-10", history: [{ month: "Nov", price: 5.00 }, { month: "Dic", price: 5.25 }, { month: "Ene", price: 5.50 }, { month: "Feb", price: 5.50 }, { month: "Mar", price: 5.75 }, { month: "Abr", price: 6.00 }] },
  { id: 3, name: "Croissant Mantequilla", category: "Repostería", unit: "ud", cost: 2.10, price: 7.00, lastUpdated: "2026-04-08", history: [{ month: "Nov", price: 6.00 }, { month: "Dic", price: 6.25 }, { month: "Ene", price: 6.50 }, { month: "Feb", price: 6.50 }, { month: "Mar", price: 6.75 }, { month: "Abr", price: 7.00 }] },
  { id: 4, name: "Quesito", category: "Repostería", unit: "ud", cost: 1.50, price: 5.00, lastUpdated: "2026-04-05", history: [{ month: "Nov", price: 4.00 }, { month: "Dic", price: 4.25 }, { month: "Ene", price: 4.50 }, { month: "Feb", price: 4.50 }, { month: "Mar", price: 4.75 }, { month: "Abr", price: 5.00 }] },
  { id: 5, name: "Mallorca", category: "Panes", unit: "ud", cost: 1.40, price: 5.00, lastUpdated: "2026-04-03", history: [{ month: "Nov", price: 4.50 }, { month: "Dic", price: 4.50 }, { month: "Ene", price: 4.75 }, { month: "Feb", price: 4.75 }, { month: "Mar", price: 5.00 }, { month: "Abr", price: 5.00 }] },
  { id: 6, name: "Pan Integral", category: "Panes", unit: "ud", cost: 2.00, price: 6.00, lastUpdated: "2026-04-02", history: [{ month: "Nov", price: 5.25 }, { month: "Dic", price: 5.50 }, { month: "Ene", price: 5.50 }, { month: "Feb", price: 5.75 }, { month: "Mar", price: 5.75 }, { month: "Abr", price: 6.00 }] },
  { id: 7, name: "Bizcocho Chocolate", category: "Repostería", unit: "ud", cost: 4.50, price: 9.00, lastUpdated: "2026-04-01", history: [{ month: "Nov", price: 8.00 }, { month: "Dic", price: 8.00 }, { month: "Ene", price: 8.50 }, { month: "Feb", price: 8.50 }, { month: "Mar", price: 8.75 }, { month: "Abr", price: 9.00 }] },
  { id: 8, name: "Empanada de Carne", category: "Salados", unit: "ud", cost: 2.80, price: 5.00, lastUpdated: "2026-03-28", history: [{ month: "Nov", price: 4.50 }, { month: "Dic", price: 4.50 }, { month: "Ene", price: 4.75 }, { month: "Feb", price: 4.75 }, { month: "Mar", price: 5.00 }, { month: "Abr", price: 5.00 }] },
  { id: 9, name: "Polvorón", category: "Repostería", unit: "ud", cost: 1.80, price: 4.00, lastUpdated: "2026-03-25", history: [{ month: "Nov", price: 3.50 }, { month: "Dic", price: 3.50 }, { month: "Ene", price: 3.75 }, { month: "Feb", price: 3.75 }, { month: "Mar", price: 4.00 }, { month: "Abr", price: 4.00 }] },
  { id: 10, name: "Palito de Queso", category: "Salados", unit: "ud", cost: 1.60, price: 3.50, lastUpdated: "2026-03-20", history: [{ month: "Nov", price: 3.00 }, { month: "Dic", price: 3.00 }, { month: "Ene", price: 3.25 }, { month: "Feb", price: 3.25 }, { month: "Mar", price: 3.50 }, { month: "Abr", price: 3.50 }] },
  { id: 11, name: "Sandwich Jamón y Queso", category: "Salados", unit: "ud", cost: 3.20, price: 4.50, lastUpdated: "2026-04-11", history: [{ month: "Nov", price: 4.00 }, { month: "Dic", price: 4.00 }, { month: "Ene", price: 4.25 }, { month: "Feb", price: 4.25 }, { month: "Mar", price: 4.50 }, { month: "Abr", price: 4.50 }] },
  { id: 12, name: "Café con Leche", category: "Bebidas", unit: "ud", cost: 0.90, price: 3.50, lastUpdated: "2026-04-12", history: [{ month: "Nov", price: 3.00 }, { month: "Dic", price: 3.00 }, { month: "Ene", price: 3.25 }, { month: "Feb", price: 3.25 }, { month: "Mar", price: 3.50 }, { month: "Abr", price: 3.50 }] },
];

const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];
const fmt = (n: number) => `$${n.toFixed(2)}`;
const margin = (p: Product) => ((p.price - p.cost) / p.price) * 100;

const marginBadge = (m: number) => {
  if (m >= 40) return <Badge className="bg-primary/15 text-primary border-0 text-[11px]">{m.toFixed(1)}%</Badge>;
  if (m >= 20) return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0 text-[11px]">{m.toFixed(1)}%</Badge>;
  return <Badge className="bg-destructive/15 text-destructive border-0 text-[11px]">{m.toFixed(1)}%</Badge>;
};

export default function Precios() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkType, setBulkType] = useState<"increase" | "discount">("increase");
  const [bulkPct, setBulkPct] = useState("5");
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);

  const filtered = useMemo(() =>
    products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (catFilter === "Todos" || p.category === catFilter)
    ), [search, catFilter]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const handleBulkApply = () => {
    const pct = parseFloat(bulkPct);
    if (isNaN(pct) || pct <= 0) { toast.error("Ingresa un porcentaje válido"); return; }
    toast.success(`${bulkType === "increase" ? "Aumento" : "Descuento"} de ${pct}% aplicado a ${selected.size} productos`);
    setBulkOpen(false);
    setSelected(new Set());
  };

  const exportCSV = () => {
    const header = "Producto,Categoría,Unidad,Costo,Precio,Margen %,Última Actualización\n";
    const rows = products.map((p) => `${p.name},${p.category},${p.unit},${p.cost},${p.price},${margin(p).toFixed(1)},${p.lastUpdated}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "precios.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Lista de Precios</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCSV}>
              <Download className="h-4 w-4" /> Exportar CSV
            </Button>
            {selected.size > 0 && (
              <Button size="sm" className="gap-1.5" onClick={() => setBulkOpen(true)}>
                <Percent className="h-4 w-4" /> Actualizar ({selected.size})
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="p-3 text-left">
                      <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                    </th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Producto</th>
                    <th className="p-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Categoría</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Ud.</th>
                    <th className="p-3 text-right font-medium text-muted-foreground">Costo</th>
                    <th className="p-3 text-right font-medium text-muted-foreground">Precio</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Margen</th>
                    <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Actualizado</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className={cn("border-b border-border transition-colors", selected.has(p.id) && "bg-primary/5")}>
                      <td className="p-3"><Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} /></td>
                      <td className="p-3 font-medium text-foreground">{p.name}</td>
                      <td className="p-3 hidden sm:table-cell"><Badge variant="outline" className="text-[10px]">{p.category}</Badge></td>
                      <td className="p-3 text-center text-muted-foreground">{p.unit}</td>
                      <td className="p-3 text-right text-muted-foreground">{fmt(p.cost)}</td>
                      <td className="p-3 text-right font-semibold text-foreground">{fmt(p.price)}</td>
                      <td className="p-3 text-center">{marginBadge(margin(p))}</td>
                      <td className="p-3 text-muted-foreground text-xs hidden md:table-cell">{p.lastUpdated}</td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost" className="h-7 gap-1 text-primary" onClick={() => setHistoryProduct(p)}>
                          <TrendingUp className="h-3.5 w-3.5" /> Historial
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Update Dialog */}
        <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Actualización Masiva de Precios</DialogTitle>
              <DialogDescription>{selected.size} productos seleccionados</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex gap-2">
                <Button variant={bulkType === "increase" ? "default" : "outline"} className="flex-1" onClick={() => setBulkType("increase")}>Aumentar</Button>
                <Button variant={bulkType === "discount" ? "default" : "outline"} className="flex-1" onClick={() => setBulkType("discount")}>Descuento</Button>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" value={bulkPct} onChange={(e) => setBulkPct(e.target.value)} className="w-24" min="0" />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkOpen(false)}>Cancelar</Button>
              <Button onClick={handleBulkApply}>Aplicar {bulkType === "increase" ? "Aumento" : "Descuento"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Price History Dialog */}
        <Dialog open={!!historyProduct} onOpenChange={() => setHistoryProduct(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Historial de Precio — {historyProduct?.name}</DialogTitle>
              <DialogDescription>Últimos 6 meses</DialogDescription>
            </DialogHeader>
            {historyProduct && (
              <div className="h-[250px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyProduct.history}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${v.toFixed(2)}`} className="text-muted-foreground" />
                    <Tooltip formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`, "Precio"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                    <Line type="monotone" dataKey="price" stroke="hsl(165 76% 25%)" strokeWidth={2} dot={{ fill: "hsl(165 76% 25%)", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
