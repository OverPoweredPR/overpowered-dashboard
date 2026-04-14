"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Percent, Gift, Truck, Package, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PromoType = "descuento" | "2x1" | "envio_gratis" | "combo";
type PromoStatus = "active" | "upcoming" | "expired";

interface Promo {
  id: number;
  name: string;
  type: PromoType;
  discount?: number;
  from: string;
  to: string;
  products: string;
  used: number;
  limit: number;
  active: boolean;
  status: PromoStatus;
}

const typeConfig: Record<PromoType, { label: string; icon: typeof Percent; color: string }> = {
  descuento: { label: "% Descuento", icon: Percent, color: "bg-primary/15 text-primary" },
  "2x1": { label: "2x1", icon: Gift, color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  envio_gratis: { label: "Envío Gratis", icon: Truck, color: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  combo: { label: "Combo", icon: Package, color: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
};

const initialPromos: Promo[] = [
  { id: 1, name: "Semana del Pan Sobao", type: "descuento", discount: 15, from: "2026-04-10", to: "2026-04-20", products: "Pan Sobao, Mallorca", used: 87, limit: 200, active: true, status: "active" },
  { id: 2, name: "2x1 Croissants Martes", type: "2x1", from: "2026-04-01", to: "2026-04-30", products: "Croissant Mantequilla", used: 124, limit: 500, active: true, status: "active" },
  { id: 3, name: "Envío Gratis +$50", type: "envio_gratis", from: "2026-04-01", to: "2026-04-30", products: "Todas las categorías", used: 43, limit: 100, active: true, status: "active" },
  { id: 4, name: "Combo Desayuno", type: "combo", discount: 20, from: "2026-04-14", to: "2026-04-28", products: "Pan + Café + Quesito", used: 31, limit: 150, active: true, status: "active" },
  { id: 5, name: "Día de las Madres", type: "descuento", discount: 25, from: "2026-05-08", to: "2026-05-11", products: "Bizcochos, Repostería", used: 0, limit: 300, active: true, status: "upcoming" },
  { id: 6, name: "Promo Verano Baguette", type: "2x1", from: "2026-06-01", to: "2026-06-15", products: "Baguette Clásico", used: 0, limit: 200, active: true, status: "upcoming" },
  { id: 7, name: "Black Friday Panadería", type: "descuento", discount: 30, from: "2025-11-28", to: "2025-11-30", products: "Todas las categorías", used: 412, limit: 500, active: false, status: "expired" },
  { id: 8, name: "Navidad Dulce", type: "combo", discount: 15, from: "2025-12-20", to: "2025-12-25", products: "Polvorón + Bizcocho", used: 189, limit: 200, active: false, status: "expired" },
  { id: 9, name: "San Valentín 2x1", type: "2x1", from: "2026-02-12", to: "2026-02-15", products: "Repostería", used: 95, limit: 150, active: false, status: "expired" },
];

const promoTypes: PromoType[] = ["descuento", "2x1", "envio_gratis", "combo"];

export default function Descuentos() {
  const [promos, setPromos] = useState(initialPromos);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<PromoType>("descuento");
  const [newDiscount, setNewDiscount] = useState("10");
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [newProducts, setNewProducts] = useState("");

  const active = promos.filter((p) => p.status === "active");
  const upcoming = promos.filter((p) => p.status === "upcoming");
  const expired = promos.filter((p) => p.status === "expired");

  const toggleActive = (id: number) => {
    setPromos((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  };

  const handleCreate = () => {
    if (!newName.trim() || !newFrom || !newTo) { toast.error("Completa los campos requeridos"); return; }
    const promo: Promo = {
      id: Date.now(), name: newName, type: newType,
      discount: newType === "descuento" || newType === "combo" ? parseFloat(newDiscount) : undefined,
      from: newFrom, to: newTo, products: newProducts || "Todas las categorías",
      used: 0, limit: 100, active: true,
      status: new Date(newFrom) > new Date() ? "upcoming" : "active",
    };
    setPromos((prev) => [promo, ...prev]);
    setModalOpen(false);
    setNewName(""); setNewFrom(""); setNewTo(""); setNewProducts("");
    toast.success("Promoción creada");
  };

  const PromoCard = ({ p }: { p: Promo }) => {
    const cfg = typeConfig[p.type];
    return (
      <Card key={p.id}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
              <Badge className={cn("mt-1 border-0 text-[10px]", cfg.color)}>
                <cfg.icon className="h-3 w-3 mr-1" />{cfg.label}{p.discount ? ` ${p.discount}%` : ""}
              </Badge>
            </div>
            {p.status === "active" && <Switch checked={p.active} onCheckedChange={() => toggleActive(p.id)} />}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />{p.from} → {p.to}
          </div>
          <p className="text-xs text-muted-foreground">{p.products}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />{p.used}/{p.limit} usos
            </div>
            <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (p.used / p.limit) * 100)}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Descuentos & Promociones</h1>
          <Button className="gap-1.5" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Nueva Promoción
          </Button>
        </div>

        {/* Active */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Activas ({active.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {active.map((p) => <PromoCard key={p.id} p={p} />)}
          </div>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Próximas ({upcoming.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcoming.map((p) => <PromoCard key={p.id} p={p} />)}
            </div>
          </div>
        )}

        {/* Expired */}
        {expired.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Expiradas ({expired.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2.5 font-medium text-muted-foreground">Nombre</th>
                      <th className="text-left p-2.5 font-medium text-muted-foreground hidden sm:table-cell">Tipo</th>
                      <th className="text-left p-2.5 font-medium text-muted-foreground hidden md:table-cell">Fechas</th>
                      <th className="text-right p-2.5 font-medium text-muted-foreground">Usos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expired.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-2.5 font-medium text-foreground">{p.name}</td>
                        <td className="p-2.5 hidden sm:table-cell">
                          <Badge variant="outline" className="text-[10px]">{typeConfig[p.type].label}</Badge>
                        </td>
                        <td className="p-2.5 text-xs text-muted-foreground hidden md:table-cell">{p.from} → {p.to}</td>
                        <td className="p-2.5 text-right text-muted-foreground">{p.used}/{p.limit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Promotion Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Promoción</DialogTitle>
              <DialogDescription>Crea una nueva promoción o descuento</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej: Semana del Croissant" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={newType} onValueChange={(v) => setNewType(v as PromoType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {promoTypes.map((t) => <SelectItem key={t} value={t}>{typeConfig[t].label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {(newType === "descuento" || newType === "combo") && (
                  <div className="space-y-1.5">
                    <Label>Descuento %</Label>
                    <Input type="number" value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)} min="1" max="100" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Desde</Label>
                  <Input type="date" value={newFrom} onChange={(e) => setNewFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Hasta</Label>
                  <Input type="date" value={newTo} onChange={(e) => setNewTo(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Productos aplicables</Label>
                <Input value={newProducts} onChange={(e) => setNewProducts(e.target.value)} placeholder="Ej: Pan Sobao, Croissant (vacío = todos)" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Crear Promoción</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
