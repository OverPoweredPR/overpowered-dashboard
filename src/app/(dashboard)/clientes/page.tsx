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
  Search, Plus, Users, UserCheck, DollarSign, Package, FileText, Calendar, TrendingUp,
} from "lucide-react";

type Client = {
  id: string;
  name: string;
  initials: string;
  businessType: string;
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate: string;
  status: "Activo" | "Inactivo";
  email: string;
  phone: string;
  address: string;
  orders: { id: string; date: string; total: number; status: string }[];
  payments: { paid: number; pending: number };
};

const sampleClients: Client[] = [
  {
    id: "C-001", name: "Panadería Don Juan", initials: "DJ", businessType: "Panadería",
    totalOrders: 48, totalRevenue: 24500, lastOrderDate: "2026-04-13", status: "Activo",
    email: "donjuan@mail.com", phone: "787-555-0101", address: "Calle Sol 123, San Juan",
    orders: [
      { id: "ORD-301", date: "2026-04-13", total: 540, status: "Entregado" },
      { id: "ORD-295", date: "2026-04-10", total: 320, status: "Entregado" },
      { id: "ORD-288", date: "2026-04-07", total: 680, status: "Entregado" },
      { id: "ORD-270", date: "2026-04-01", total: 450, status: "Entregado" },
      { id: "ORD-255", date: "2026-03-28", total: 390, status: "Entregado" },
    ],
    payments: { paid: 22100, pending: 2400 },
  },
  {
    id: "C-002", name: "Café Central", initials: "CC", businessType: "Cafetería",
    totalOrders: 35, totalRevenue: 18200, lastOrderDate: "2026-04-12", status: "Activo",
    email: "central@cafe.com", phone: "787-555-0202", address: "Ave Ponce de León 456, Santurce",
    orders: [
      { id: "ORD-300", date: "2026-04-12", total: 620, status: "Entregado" },
      { id: "ORD-290", date: "2026-04-08", total: 410, status: "Entregado" },
      { id: "ORD-280", date: "2026-04-04", total: 530, status: "En tránsito" },
      { id: "ORD-265", date: "2026-03-30", total: 370, status: "Entregado" },
      { id: "ORD-250", date: "2026-03-25", total: 480, status: "Entregado" },
    ],
    payments: { paid: 16800, pending: 1400 },
  },
  {
    id: "C-003", name: "Hotel Miramar", initials: "HM", businessType: "Hotel",
    totalOrders: 62, totalRevenue: 45800, lastOrderDate: "2026-04-14", status: "Activo",
    email: "compras@miramar.com", phone: "787-555-0303", address: "Cond. Ashford, Condado",
    orders: [
      { id: "ORD-305", date: "2026-04-14", total: 1200, status: "Preparando" },
      { id: "ORD-298", date: "2026-04-11", total: 890, status: "Entregado" },
      { id: "ORD-285", date: "2026-04-06", total: 1100, status: "Entregado" },
      { id: "ORD-272", date: "2026-04-02", total: 950, status: "Entregado" },
      { id: "ORD-260", date: "2026-03-29", total: 780, status: "Entregado" },
    ],
    payments: { paid: 42000, pending: 3800 },
  },
  {
    id: "C-004", name: "Restaurante El Fogón", initials: "EF", businessType: "Restaurante",
    totalOrders: 28, totalRevenue: 15600, lastOrderDate: "2026-04-11", status: "Activo",
    email: "elfogon@rest.com", phone: "787-555-0404", address: "Calle Loíza 789, Santurce",
    orders: [
      { id: "ORD-296", date: "2026-04-11", total: 420, status: "Entregado" },
      { id: "ORD-282", date: "2026-04-05", total: 560, status: "Entregado" },
      { id: "ORD-268", date: "2026-03-31", total: 340, status: "Entregado" },
      { id: "ORD-252", date: "2026-03-26", total: 480, status: "Entregado" },
      { id: "ORD-240", date: "2026-03-22", total: 390, status: "Entregado" },
    ],
    payments: { paid: 14200, pending: 1400 },
  },
  {
    id: "C-005", name: "Deli Express", initials: "DE", businessType: "Deli",
    totalOrders: 15, totalRevenue: 6200, lastOrderDate: "2026-03-15", status: "Inactivo",
    email: "deli@express.com", phone: "787-555-0505", address: "Calle Cruz 321, Viejo SJ",
    orders: [
      { id: "ORD-210", date: "2026-03-15", total: 280, status: "Entregado" },
      { id: "ORD-195", date: "2026-03-08", total: 350, status: "Entregado" },
      { id: "ORD-180", date: "2026-02-28", total: 420, status: "Entregado" },
      { id: "ORD-165", date: "2026-02-20", total: 310, status: "Entregado" },
      { id: "ORD-150", date: "2026-02-12", total: 260, status: "Entregado" },
    ],
    payments: { paid: 6200, pending: 0 },
  },
  {
    id: "C-006", name: "Supermercado Pueblo", initials: "SP", businessType: "Supermercado",
    totalOrders: 72, totalRevenue: 52300, lastOrderDate: "2026-04-14", status: "Activo",
    email: "compras@pueblo.com", phone: "787-555-0606", address: "Ave Roosevelt, Hato Rey",
    orders: [
      { id: "ORD-306", date: "2026-04-14", total: 1800, status: "Preparando" },
      { id: "ORD-299", date: "2026-04-11", total: 1500, status: "Entregado" },
      { id: "ORD-291", date: "2026-04-08", total: 1350, status: "Entregado" },
      { id: "ORD-278", date: "2026-04-03", total: 1600, status: "Entregado" },
      { id: "ORD-262", date: "2026-03-29", total: 1200, status: "Entregado" },
    ],
    payments: { paid: 48500, pending: 3800 },
  },
];

export default function Clientes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filtered = sampleClients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.businessType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = sampleClients.filter((c) => c.status === "Activo").length;
  const revenueMTD = sampleClients.reduce((s, c) => s + c.totalRevenue, 0);

  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Summary Chips */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{sampleClients.length} Clientes</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2">
            <UserCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{activeCount} Activos</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Revenue MTD: {fmt(revenueMTD)}</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> Nuevo Cliente
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                        {client.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground leading-tight">{client.name}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{client.businessType}</Badge>
                    </div>
                  </div>
                  <Badge
                    variant={client.status === "Activo" ? "default" : "outline"}
                    className={client.status === "Activo" ? "bg-primary/15 text-primary border-0" : "text-muted-foreground"}
                  >
                    {client.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    <span>{client.totalOrders} órdenes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{fmt(client.totalRevenue)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Última orden: {client.lastOrderDate}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedClient(client)}
                >
                  Ver detalle
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No se encontraron clientes.
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedClient && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {selectedClient.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-lg">{selectedClient.name}</SheetTitle>
                    <SheetDescription>{selectedClient.businessType} · {selectedClient.id}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                {/* Client Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-foreground">{selectedClient.email}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Teléfono</span><span className="text-foreground">{selectedClient.phone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Dirección</span><span className="text-foreground text-right max-w-[60%]">{selectedClient.address}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Estado</span>
                    <Badge variant={selectedClient.status === "Activo" ? "default" : "outline"}
                      className={selectedClient.status === "Activo" ? "bg-primary/15 text-primary border-0" : ""}>
                      {selectedClient.status}
                    </Badge>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Pagado</p>
                      <p className="text-lg font-bold text-primary">{fmt(selectedClient.payments.paid)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Pendiente</p>
                      <p className="text-lg font-bold text-destructive">{fmt(selectedClient.payments.pending)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Order History */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Últimas Órdenes</h3>
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
                        {selectedClient.orders.map((o) => (
                          <tr key={o.id} className="border-t border-border">
                            <td className="p-2.5 text-foreground font-medium">{o.id}</td>
                            <td className="p-2.5 text-muted-foreground">{o.date}</td>
                            <td className="p-2.5 text-right text-foreground">{fmt(o.total)}</td>
                            <td className="p-2.5 text-right">
                              <Badge variant="secondary" className="text-xs">{o.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    <Package className="h-4 w-4" /> Nueva Orden
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <FileText className="h-4 w-4" /> Nueva Factura
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
