"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Truck, Clock, Route, CheckCircle2, Loader2, Timer } from "lucide-react";

const today = new Date().toLocaleDateString("es-PR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

type StopStatus = "completed" | "in_progress" | "pending";

interface Stop {
  client: string;
  address: string;
  status: StopStatus;
  time: string;
}

interface DeliveryRoute {
  id: number;
  driver: string;
  initials: string;
  vehicle: "Carro" | "Van" | "Moto";
  status: "En ruta" | "Completada" | "Pendiente";
  eta: string;
  stops: Stop[];
}

const routes: DeliveryRoute[] = [
  {
    id: 1, driver: "Miguel Torres", initials: "MT", vehicle: "Van", status: "En ruta", eta: "11:30 AM",
    stops: [
      { client: "Supermercado Pueblo", address: "Av. Muñoz Rivera #45, San Juan", status: "completed", time: "7:15 AM" },
      { client: "Hotel Miramar", address: "Calle Loíza #112, Santurce", status: "completed", time: "8:00 AM" },
      { client: "Café Central", address: "Calle Fortaleza #22, Viejo SJ", status: "in_progress", time: "9:10 AM" },
      { client: "Restaurante El Fogón", address: "Ave. Ashford #88, Condado", status: "pending", time: "10:00 AM" },
      { client: "Panadería Don Juan", address: "Calle del Cristo #5, Viejo SJ", status: "pending", time: "10:45 AM" },
    ],
  },
  {
    id: 2, driver: "Ana Ríos", initials: "AR", vehicle: "Moto", status: "En ruta", eta: "10:15 AM",
    stops: [
      { client: "Bistro 787", address: "Calle San Sebastián #30, Viejo SJ", status: "completed", time: "7:30 AM" },
      { client: "La Placita Café", address: "Plaza del Mercado, Santurce", status: "in_progress", time: "8:45 AM" },
      { client: "Deli El Punto", address: "Ave. Ponce de León #200", status: "pending", time: "9:30 AM" },
    ],
  },
  {
    id: 3, driver: "Carlos Méndez", initials: "CM", vehicle: "Carro", status: "Pendiente", eta: "1:00 PM",
    stops: [
      { client: "Club Náutico", address: "Ave. Fernández Juncos #100", status: "pending", time: "11:00 AM" },
      { client: "Mini Market Express", address: "Calle Loíza #250", status: "pending", time: "11:45 AM" },
      { client: "Hotel Condado", address: "Ave. Ashford #200, Condado", status: "pending", time: "12:30 PM" },
      { client: "Cafetería Doña Lola", address: "Calle Sol #15, Viejo SJ", status: "pending", time: "1:00 PM" },
    ],
  },
  {
    id: 4, driver: "Laura Vega", initials: "LV", vehicle: "Van", status: "Completada", eta: "—",
    stops: [
      { client: "Panadería Kasalta", address: "Calle McLeary #1966, Ocean Park", status: "completed", time: "6:30 AM" },
      { client: "Colmado El Jibarito", address: "Calle de la Cruz #55", status: "completed", time: "7:15 AM" },
      { client: "Restaurante Marmalade", address: "Calle Fortaleza #317", status: "completed", time: "8:00 AM" },
    ],
  },
];

const allStops = routes.flatMap((r) => r.stops.map((s) => ({ ...s, driver: r.driver })));
const completedStops = allStops.filter((s) => s.status === "completed").length;
const pendingStops = allStops.filter((s) => s.status !== "completed").length;
const activeRoutes = routes.filter((r) => r.status === "En ruta").length;

const statusIcon = (s: StopStatus) => {
  if (s === "completed") return <CheckCircle2 className="h-4 w-4 text-primary" />;
  if (s === "in_progress") return <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />;
  return <Timer className="h-4 w-4 text-muted-foreground" />;
};

const vehicleColor: Record<string, string> = {
  Van: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Moto: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Carro: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
};

const routeStatusStyle: Record<string, string> = {
  "En ruta": "bg-primary/15 text-primary",
  Completada: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Pendiente: "bg-muted text-muted-foreground",
};

const kpis = [
  { label: "Rutas activas", value: activeRoutes, icon: Route },
  { label: "Entregas completadas", value: completedStops, icon: CheckCircle2 },
  { label: "Pendientes", value: pendingStops, icon: Clock },
  { label: "Km recorridos hoy", value: 87, icon: MapPin },
];

export default function Rutas() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl font-bold text-foreground">Rutas de Entrega</h1>
          <span className="text-sm text-muted-foreground capitalize">{today}</span>
        </div>

        {/* KPI chips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <k.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Route Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {routes.map((r) => (
            <Card key={r.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{r.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{r.driver}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-0 ${vehicleColor[r.vehicle]}`}>{r.vehicle}</Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-0 ${routeStatusStyle[r.status]}`}>{r.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">ETA</p>
                    <p className="text-sm font-semibold text-foreground">{r.eta}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">{r.stops.length} paradas</p>
                {r.stops.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 py-1.5 border-t border-border first:border-0">
                    <div className="mt-0.5">{statusIcon(s.status)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.client}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.address}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{s.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumen de Entregas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2.5 font-medium text-muted-foreground">Hora</th>
                    <th className="text-left p-2.5 font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left p-2.5 font-medium text-muted-foreground hidden sm:table-cell">Dirección</th>
                    <th className="text-left p-2.5 font-medium text-muted-foreground">Repartidor</th>
                    <th className="text-center p-2.5 font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {allStops
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((s, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="p-2.5 text-foreground">{s.time}</td>
                        <td className="p-2.5 font-medium text-foreground">{s.client}</td>
                        <td className="p-2.5 text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">{s.address}</td>
                        <td className="p-2.5 text-foreground">{s.driver}</td>
                        <td className="p-2.5 text-center">{statusIcon(s.status)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
