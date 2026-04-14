"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, Plus, Truck, TruckIcon, DollarSign, FileText, Calendar, Star, Phone, Mail, MapPin, Clock, Package,
} from "lucide-react";

type Supplier = {
  id: string;
  company: string;
  initials: string;
  category: "Lácteos" | "Harinas" | "Carnes" | "Otros";
  contactName: string;
  phone: string;
  email: string;
  address: string;
  totalPOs: number;
  totalSpent: number;
  openPOs: number;
  lastDelivery: string;
  deliveryStatus: "on-time" | "late" | "pending";
  avgDeliveryDays: number;
  qualityRating: number;
  pos: { id: string; date: string; total: number; status: string; items: number }[];
};

const categoryColors: Record<string, string> = {
  "Lácteos": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "Harinas": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "Carnes": "bg-red-500/15 text-red-600 dark:text-red-400",
  "Otros": "bg-muted text-muted-foreground",
};

const statusDot: Record<string, string> = {
  "on-time": "bg-primary",
  "late": "bg-destructive",
  "pending": "bg-warning",
};

const suppliers: Supplier[] = [
  {
    id: "PRV-001", company: "Lácteos del Valle", initials: "LV", category: "Lácteos",
    contactName: "María Torres", phone: "787-555-1001", email: "ventas@lacteovalle.com",
    address: "Carr. 2 Km 45, Arecibo", totalPOs: 84, totalSpent: 67200, openPOs: 2,
    lastDelivery: "2026-04-13", deliveryStatus: "on-time", avgDeliveryDays: 2, qualityRating: 5,
    pos: [
      { id: "PO-410", date: "2026-04-13", total: 1850, status: "Entregado", items: 6 },
      { id: "PO-402", date: "2026-04-09", total: 2100, status: "Entregado", items: 8 },
      { id: "PO-395", date: "2026-04-05", total: 1600, status: "Entregado", items: 5 },
      { id: "PO-388", date: "2026-04-01", total: 1950, status: "Entregado", items: 7 },
      { id: "PO-380", date: "2026-03-28", total: 1700, status: "Entregado", items: 6 },
    ],
  },
  {
    id: "PRV-002", company: "Harinas Premium PR", initials: "HP", category: "Harinas",
    contactName: "Carlos Méndez", phone: "787-555-2002", email: "pedidos@harinaspr.com",
    address: "Zona Industrial, Caguas", totalPOs: 56, totalSpent: 42800, openPOs: 1,
    lastDelivery: "2026-04-12", deliveryStatus: "on-time", avgDeliveryDays: 3, qualityRating: 4,
    pos: [
      { id: "PO-408", date: "2026-04-12", total: 3200, status: "Entregado", items: 4 },
      { id: "PO-398", date: "2026-04-07", total: 2800, status: "Entregado", items: 3 },
      { id: "PO-390", date: "2026-04-02", total: 3500, status: "Entregado", items: 5 },
      { id: "PO-382", date: "2026-03-28", total: 2600, status: "Entregado", items: 3 },
      { id: "PO-375", date: "2026-03-24", total: 2900, status: "Entregado", items: 4 },
    ],
  },
  {
    id: "PRV-003", company: "Carnes Selectas", initials: "CS", category: "Carnes",
    contactName: "Roberto Díaz", phone: "787-555-3003", email: "ventas@carnesselectas.com",
    address: "Mercado Central, Bayamón", totalPOs: 38, totalSpent: 55600, openPOs: 3,
    lastDelivery: "2026-04-14", deliveryStatus: "pending", avgDeliveryDays: 1, qualityRating: 5,
    pos: [
      { id: "PO-412", date: "2026-04-14", total: 4200, status: "En tránsito", items: 10 },
      { id: "PO-405", date: "2026-04-10", total: 3800, status: "Entregado", items: 8 },
      { id: "PO-396", date: "2026-04-06", total: 4500, status: "Entregado", items: 12 },
      { id: "PO-387", date: "2026-04-01", total: 3600, status: "Entregado", items: 9 },
      { id: "PO-378", date: "2026-03-27", total: 4100, status: "Entregado", items: 11 },
    ],
  },
  {
    id: "PRV-004", company: "Distribuidora Isla", initials: "DI", category: "Otros",
    contactName: "Ana Colón", phone: "787-555-4004", email: "isla@dist.com",
    address: "Parque Industrial, Carolina", totalPOs: 25, totalSpent: 18400, openPOs: 0,
    lastDelivery: "2026-04-10", deliveryStatus: "late", avgDeliveryDays: 5, qualityRating: 3,
    pos: [
      { id: "PO-400", date: "2026-04-10", total: 1200, status: "Entregado", items: 15 },
      { id: "PO-392", date: "2026-04-04", total: 980, status: "Entregado", items: 12 },
      { id: "PO-384", date: "2026-03-30", total: 1100, status: "Entregado", items: 14 },
      { id: "PO-376", date: "2026-03-25", total: 850, status: "Entregado", items: 10 },
      { id: "PO-368", date: "2026-03-20", total: 1050, status: "Entregado", items: 13 },
    ],
  },
  {
    id: "PRV-005", company: "Empaques Boricua", initials: "EB", category: "Otros",
    contactName: "Luis Rivera", phone: "787-555-5005", email: "ventas@empaquesb.com",
    address: "Ave. Las Américas, Ponce", totalPOs: 20, totalSpent: 12600, openPOs: 1,
    lastDelivery: "2026-04-11", deliveryStatus: "on-time", avgDeliveryDays: 4, qualityRating: 4,
    pos: [
      { id: "PO-403", date: "2026-04-11", total: 750, status: "Entregado", items: 8 },
      { id: "PO-394", date: "2026-04-06", total: 620, status: "Entregado", items: 6 },
      { id: "PO-386", date: "2026-04-01", total: 890, status: "Entregado", items: 10 },
      { id: "PO-377", date: "2026-03-26", total: 540, status: "Entregado", items: 5 },
      { id: "PO-369", date: "2026-03-21", total: 700, status: "Entregado", items: 7 },
    ],
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export default function Proveedores() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [selected, setSelected] = useState<Supplier | null>(null);

  const filtered = suppliers.filter((s) => {
    const matchSearch = s.company.toLowerCase().includes(search.toLowerCase()) ||
      s.contactName.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || s.category === catFilter;
    return matchSearch && matchCat;
  });

  const activeCount = suppliers.filter((s) => s.openPOs > 0 || s.deliveryStatus !== "late").length;
  const gastoMTD = suppliers.reduce((a, s) => a + s.totalSpent, 0);
  const openPOsTotal = suppliers.reduce((a, s) => a + s.openPOs, 0);
  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Summary Chips */}
        <div className="flex flex-wrap gap-3">
          {[
            { icon: Truck, label: `${suppliers.length} Proveedores` },
            { icon: TruckIcon, label: `${activeCount} Activos` },
            { icon: DollarSign, label: `Gasto MTD: ${fmt(gastoMTD)}` },
            { icon: Package, label: `${openPOsTotal} POs Abiertas` },
          ].map((chip, i) => (
            <div key={i} className="flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2">
              <chip.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{chip.label}</span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Proveedores</h1>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> Nuevo Proveedor
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar proveedor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Lácteos">Lácteos</SelectItem>
              <SelectItem value="Harinas">Harinas</SelectItem>
              <SelectItem value="Carnes">Carnes</SelectItem>
              <SelectItem value="Otros">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                        {s.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground leading-tight">{s.company}</p>
                      <Badge className={`mt-1 text-xs border-0 ${categoryColors[s.category]}`}>{s.category}</Badge>
                    </div>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full mt-1.5 ${statusDot[s.deliveryStatus]}`} />
                </div>

                <div className="text-sm space-y-1.5 text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{s.contactName} · {s.phone}</div>
                  <div className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" />{s.totalPOs} POs · {fmt(s.totalSpent)}</div>
                  <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Última entrega: {s.lastDelivery}</div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelected(s)}>Ver detalle</Button>
                  <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Nueva PO
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No se encontraron proveedores.</div>
        )}
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">{selected.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-lg">{selected.company}</SheetTitle>
                    <SheetDescription>
                      <Badge className={`text-xs border-0 ${categoryColors[selected.category]}`}>{selected.category}</Badge>
                      <span className="ml-2">{selected.id}</span>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />Email</span><span className="text-foreground">{selected.email}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Teléfono</span><span className="text-foreground">{selected.phone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Dirección</span><span className="text-foreground text-right max-w-[55%]">{selected.address}</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Tiempo promedio</span><span className="text-foreground">{selected.avgDeliveryDays} días</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center gap-1.5"><Star className="h-3.5 w-3.5" />Calidad</span><Stars rating={selected.qualityRating} /></div>
                </div>

                {/* Spend Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground mb-1">Total Gastado</p><p className="text-lg font-bold text-primary">{fmt(selected.totalSpent)}</p></CardContent></Card>
                  <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground mb-1">POs Abiertas</p><p className="text-lg font-bold text-foreground">{selected.openPOs}</p></CardContent></Card>
                </div>

                {/* PO History */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Últimas Órdenes de Compra</h3>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2.5 font-medium text-muted-foreground">ID</th>
                          <th className="text-left p-2.5 font-medium text-muted-foreground">Fecha</th>
                          <th className="text-right p-2.5 font-medium text-muted-foreground">Total</th>
                          <th className="text-right p-2.5 font-medium text-muted-foreground">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.pos.map((po) => (
                          <tr key={po.id} className="border-t border-border">
                            <td className="p-2.5 text-foreground font-medium">{po.id}</td>
                            <td className="p-2.5 text-muted-foreground">{po.date}</td>
                            <td className="p-2.5 text-right text-foreground">{fmt(po.total)}</td>
                            <td className="p-2.5 text-right"><Badge variant="secondary" className="text-xs">{po.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <Plus className="h-4 w-4" /> Nueva Orden de Compra
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
