"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Receipt, Percent, Send,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const months = [
  { value: "2026-04", label: "Abril 2026" },
  { value: "2026-03", label: "Marzo 2026" },
  { value: "2026-02", label: "Febrero 2026" },
];

const kpis = [
  { label: "Ingresos MTD", value: "$162,400", trend: 12.3, up: true, icon: DollarSign },
  { label: "Gastos MTD", value: "$98,200", trend: 4.1, up: true, icon: Receipt },
  { label: "Ganancia Neta", value: "$64,200", trend: 18.7, up: true, icon: TrendingUp },
  { label: "Margen %", value: "39.5%", trend: 2.1, up: true, icon: Percent },
];

const revenueVsExpenses = [
  { week: "Sem 1", Ingresos: 35200, Gastos: 22800 },
  { week: "Sem 2", Ingresos: 41500, Gastos: 25100 },
  { week: "Sem 3", Ingresos: 44800, Gastos: 26300 },
  { week: "Sem 4", Ingresos: 40900, Gastos: 24000 },
];

const topClients = [
  { name: "Supermercado Pueblo", revenue: 52300 },
  { name: "Hotel Miramar", revenue: 45800 },
  { name: "Panadería Don Juan", revenue: 24500 },
  { name: "Café Central", revenue: 18200 },
  { name: "Restaurante El Fogón", revenue: 15600 },
];
const maxClientRevenue = topClients[0].revenue;

const expenseBreakdown = [
  { name: "Proveedores", value: 52400, color: "hsl(165 76% 25%)" },
  { name: "Empleados", value: 28600, color: "hsl(210 90% 55%)" },
  { name: "Operaciones", value: 12200, color: "hsl(38 92% 50%)" },
  { name: "Otros", value: 5000, color: "hsl(215 10% 46%)" },
];

const pendingCollections = [
  { client: "Supermercado Pueblo", amount: 3800, daysOverdue: 5 },
  { client: "Hotel Miramar", amount: 3800, daysOverdue: 3 },
  { client: "Panadería Don Juan", amount: 2400, daysOverdue: 8 },
  { client: "Café Central", amount: 1400, daysOverdue: 2 },
  { client: "Restaurante El Fogón", amount: 1400, daysOverdue: 6 },
];

const cashFlow = 64200;
const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function Finanzas() {
  const [month, setMonth] = useState("2026-04");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Finanzas</h1>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{kpi.label}</span>
                  <kpi.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${kpi.up ? "text-primary" : "text-destructive"}`}>
                  {kpi.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {kpi.trend}% vs mes anterior
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cash Flow Indicator */}
        <div className={`flex items-center gap-3 rounded-lg border px-5 py-3 ${cashFlow >= 0 ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}>
          {cashFlow >= 0 ? <TrendingUp className="h-5 w-5 text-primary" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
          <span className="text-sm font-medium text-foreground">
            Cash Flow: <span className={cashFlow >= 0 ? "text-primary" : "text-destructive"}>{fmt(cashFlow)}</span>
          </span>
          <Badge className={`ml-auto border-0 ${cashFlow >= 0 ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
            {cashFlow >= 0 ? "Positivo" : "Negativo"}
          </Badge>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue vs Expenses */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ingresos vs Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueVsExpenses} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} className="text-muted-foreground" />
                    <Tooltip
                      formatter={(value) => fmt(Number(value))}
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                    />
                    <Bar dataKey="Ingresos" fill="hsl(165 76% 25%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Gastos" fill="hsl(215 10% 46%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Desglose de Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {expenseBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => fmt(Number(value))} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top 5 Clients */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top 5 Clientes por Revenue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topClients.map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{c.name}</span>
                    <span className="text-muted-foreground">{fmt(c.revenue)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(c.revenue / maxClientRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Collections */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Cobros Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2.5 font-medium text-muted-foreground">Cliente</th>
                      <th className="text-right p-2.5 font-medium text-muted-foreground">Monto</th>
                      <th className="text-right p-2.5 font-medium text-muted-foreground">Días</th>
                      <th className="text-right p-2.5 font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCollections.map((p) => (
                      <tr key={p.client} className="border-t border-border">
                        <td className="p-2.5 text-foreground font-medium">{p.client}</td>
                        <td className="p-2.5 text-right text-foreground">{fmt(p.amount)}</td>
                        <td className="p-2.5 text-right">
                          <Badge variant="outline" className={p.daysOverdue > 5 ? "text-destructive border-destructive/30" : "text-muted-foreground"}>
                            {p.daysOverdue}d
                          </Badge>
                        </td>
                        <td className="p-2.5 text-right">
                          <Button size="sm" variant="ghost" className="h-7 gap-1 text-primary hover:text-primary">
                            <Send className="h-3.5 w-3.5" /> Cobrar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
