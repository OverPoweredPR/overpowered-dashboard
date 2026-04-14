"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DollarSign, ShoppingCart, Users, TrendingUp, PackageX, Percent, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";

const periods = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "year", label: "Este año" },
];

const kpis = [
  { label: "Ventas", value: "$162,400", trend: 12.3, up: true, icon: DollarSign },
  { label: "Órdenes", value: "1,248", trend: 8.1, up: true, icon: ShoppingCart },
  { label: "Ticket Promedio", value: "$130", trend: 3.8, up: true, icon: TrendingUp },
  { label: "Clientes Activos", value: "87", trend: 5.2, up: true, icon: Users },
  { label: "Tasa de Cobro", value: "94.2%", trend: 1.4, up: true, icon: Percent },
  { label: "Productos Agotados", value: "3", trend: 2, up: false, icon: PackageX },
];

const revenueTrend = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 3, i + 1);
  return {
    date: d.toLocaleDateString("es-PR", { day: "numeric", month: "short" }),
    revenue: 3800 + Math.round(Math.random() * 3200 + Math.sin(i / 4) * 1200),
  };
});

const ordersByStatus = [
  { name: "Completadas", value: 842, color: "hsl(165 76% 25%)" },
  { name: "En proceso", value: 215, color: "hsl(210 90% 55%)" },
  { name: "Pendientes", value: 134, color: "hsl(38 92% 50%)" },
  { name: "Canceladas", value: 57, color: "hsl(0 72% 51%)" },
];

const topProducts = [
  { name: "Pan Sobao", units: 4820, revenue: 24100 },
  { name: "Baguette Clásico", units: 3650, revenue: 21900 },
  { name: "Croissant Mantequilla", units: 2980, revenue: 20860 },
  { name: "Pan de Agua", units: 2740, revenue: 10960 },
  { name: "Quesito", units: 2510, revenue: 12550 },
  { name: "Mallorca", units: 2200, revenue: 11000 },
  { name: "Pan Integral", units: 1890, revenue: 11340 },
  { name: "Bizcocho de Chocolate", units: 1650, revenue: 14850 },
  { name: "Empanada de Carne", units: 1420, revenue: 7100 },
  { name: "Polvorón", units: 1280, revenue: 5120 },
];
const maxUnits = topProducts[0].units;

const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

// Heatmap data: day (0=Mon) × hour (6-22)
const heatmapHours = Array.from({ length: 17 }, (_, i) => i + 6);
const heatmapDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const heatmapData: number[][] = heatmapDays.map((_, di) =>
  heatmapHours.map((h) => {
    const base = di < 5 ? 8 : 12;
    const peak = h >= 7 && h <= 9 ? 14 : h >= 11 && h <= 13 ? 12 : h >= 17 && h <= 19 ? 10 : 4;
    return Math.max(0, Math.round(base + peak + (Math.random() * 6 - 3) + (di >= 5 ? 4 : 0)));
  })
);
const heatMax = Math.max(...heatmapData.flat());

const retention = { returning: 62, new: 25 };
const retentionTotal = retention.returning + retention.new;

export default function Metricas() {
  const [period, setPeriod] = useState("month");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Métricas & KPIs</h1>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">{k.label}</span>
                  <k.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground">{k.value}</p>
                <div className={cn("flex items-center gap-1 mt-1 text-[11px] font-medium", k.up ? "text-primary" : "text-destructive")}>
                  {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {k.trend}%
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Trend */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tendencia de Ingresos (30 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(165 76% 25%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(165 76% 25%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} className="text-muted-foreground" />
                    <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(165 76% 25%)" strokeWidth={2} fill="url(#revGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Orders by Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Órdenes por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {ordersByStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => Number(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
                {ordersByStatus.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs text-muted-foreground">{s.name} ({s.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top 10 Productos Más Vendidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0", i < 3 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="font-medium text-foreground truncate">{p.name}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">{p.units.toLocaleString()} uds · {fmt(p.revenue)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(p.units / maxUnits) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Heatmap */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Órdenes por Día y Hora</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[400px]">
                  {/* Hour labels */}
                  <div className="flex ml-10 mb-1">
                    {heatmapHours.map((h) => (
                      <div key={h} className="flex-1 text-center text-[9px] text-muted-foreground">{h}h</div>
                    ))}
                  </div>
                  {heatmapDays.map((day, di) => (
                    <div key={day} className="flex items-center gap-1 mb-1">
                      <span className="w-9 text-xs text-muted-foreground text-right shrink-0">{day}</span>
                      <div className="flex flex-1 gap-0.5">
                        {heatmapData[di].map((val, hi) => (
                          <div
                            key={hi}
                            className="flex-1 aspect-square rounded-sm transition-colors"
                            style={{ background: `hsl(165 76% 25% / ${Math.max(0.06, val / heatMax)})` }}
                            title={`${day} ${heatmapHours[hi]}:00 — ${val} órdenes`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* Legend */}
                  <div className="flex items-center gap-2 mt-3 ml-10">
                    <span className="text-[10px] text-muted-foreground">Menos</span>
                    {[0.1, 0.3, 0.5, 0.7, 1].map((o) => (
                      <div key={o} className="h-3 w-5 rounded-sm" style={{ background: `hsl(165 76% 25% / ${o})` }} />
                    ))}
                    <span className="text-[10px] text-muted-foreground">Más</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Retention */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Retención de Clientes — Este Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{retention.returning}</p>
                  <p className="text-xs text-muted-foreground mt-1">Recurrentes</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-500">{retention.new}</p>
                  <p className="text-xs text-muted-foreground mt-1">Nuevos</p>
                </div>
              </div>
              <div className="flex-1 w-full max-w-md">
                <div className="h-4 rounded-full bg-muted overflow-hidden flex">
                  <div className="h-full bg-primary transition-all" style={{ width: `${(retention.returning / retentionTotal) * 100}%` }} />
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${(retention.new / retentionTotal) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                  <span>{((retention.returning / retentionTotal) * 100).toFixed(0)}% recurrentes</span>
                  <span>{((retention.new / retentionTotal) * 100).toFixed(0)}% nuevos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
