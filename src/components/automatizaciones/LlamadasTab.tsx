"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Phone, Play, PhoneCall, PhoneOff, Voicemail, Clock, BarChart3,
  PhoneForwarded, Radio, Users, FileText, Target,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const callLog = [
  { date: "2026-04-14 9:15", client: "Supermercado Pueblo", duration: "2:34", status: "Contestó" as const },
  { date: "2026-04-14 9:02", client: "Hotel Miramar", duration: "1:12", status: "Contestó" as const },
  { date: "2026-04-14 8:45", client: "Café Central", duration: "0:00", status: "No contestó" as const },
  { date: "2026-04-14 8:30", client: "Panadería Don Juan", duration: "0:22", status: "Buzón" as const },
  { date: "2026-04-13 16:10", client: "Restaurante El Fogón", duration: "3:05", status: "Contestó" as const },
  { date: "2026-04-13 15:45", client: "Bistro 787", duration: "0:00", status: "Colgó" as const },
];

const callStatusIcon = { Contestó: PhoneCall, "No contestó": PhoneOff, Buzón: Voicemail, Colgó: PhoneForwarded };
const callStatusColor = {
  Contestó: "text-primary",
  "No contestó": "text-destructive",
  Buzón: "text-amber-600 dark:text-amber-400",
  Colgó: "text-orange-500",
};

const donutData = [
  { name: "Contestó", value: 42, color: "hsl(var(--primary))" },
  { name: "Buzón", value: 18, color: "#d97706" },
  { name: "No contestó", value: 25, color: "hsl(var(--destructive))" },
  { name: "Colgó", value: 15, color: "#f97316" },
];

const campaigns = [
  {
    id: 1, name: "Reactivación Q2", target: 45, completed: 28, success: 62,
    scheduled: "Lun-Vie 9:00 AM", status: "active" as const,
    script: "Hola [nombre], le llamamos de BaguetteOps para confirmar su pedido semanal...",
  },
  {
    id: 2, name: "Cobranza suave", target: 12, completed: 12, success: 75,
    scheduled: "Mar-Jue 10:00 AM", status: "completed" as const,
    script: "Buenos días [nombre], le recordamos que tiene una factura pendiente por $[monto]...",
  },
  {
    id: 3, name: "Nuevos productos Abril", target: 30, completed: 0, success: 0,
    scheduled: "15 Abr 8:30 AM", status: "scheduled" as const,
    script: "¡Hola [nombre]! Tenemos nuevos productos que le pueden interesar para su negocio...",
  },
];

const liveCalls = [
  { client: "Mini Market El Sol", duration: "1:42", agent: "Aria IA" },
  { client: "Deli Express", duration: "0:33", agent: "Aria IA" },
];

export function LlamadasTab() {
  const [callsEnabled, setCallsEnabled] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<typeof campaigns[0] | null>(null);

  return (
    <div className="space-y-4">
      {/* Live indicator */}
      {callsEnabled && liveCalls.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
              <span className="text-sm font-semibold text-primary">En vivo ahora — {liveCalls.length} llamadas activas</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {liveCalls.map((lc, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border border-primary/20 bg-background p-2.5">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-primary animate-pulse" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{lc.client}</p>
                      <p className="text-[11px] text-muted-foreground">{lc.agent}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary/30 text-[10px]">
                    <Clock className="h-3 w-3 mr-1" />{lc.duration}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Llamadas hoy", value: "24", icon: Phone },
          { label: "Tasa respuesta", value: "62%", icon: BarChart3 },
          { label: "Duración prom.", value: "1:47", icon: Clock },
          { label: "Auto-llamadas", value: callsEnabled ? "Activo" : "Inactivo", icon: PhoneCall },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch checked={callsEnabled} onCheckedChange={setCallsEnabled} />
          <span className="text-sm font-medium text-foreground">Llamadas automáticas (VAPI)</span>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => toast.success("Campaña creada")}>
          <Play className="h-4 w-4" /> Nueva Campaña
        </Button>
      </div>

      {/* Donut + Campaigns side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Donut chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resultados de Llamadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} {d.value}%
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Manager */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" /> Campañas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <Badge variant="outline" className={cn("text-[10px] border-0",
                      c.status === "active" ? "bg-primary/15 text-primary" :
                      c.status === "completed" ? "bg-muted text-muted-foreground" :
                      "bg-blue-500/15 text-blue-500"
                    )}>
                      {c.status === "active" ? "Activa" : c.status === "completed" ? "Completada" : "Programada"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.completed}/{c.target}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.scheduled}</span>
                    {c.success > 0 && <span className="flex items-center gap-1 text-primary"><BarChart3 className="h-3 w-3" />{c.success}% éxito</span>}
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => setSelectedCampaign(c)}>
                      <FileText className="h-3.5 w-3.5 mr-1" /> Script
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Script: {c.name}</DialogTitle></DialogHeader>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground leading-relaxed italic">"{c.script}"</div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-lg bg-muted/30 p-2"><p className="text-lg font-bold text-foreground">{c.target}</p><p className="text-[10px] text-muted-foreground">Objetivo</p></div>
                      <div className="rounded-lg bg-muted/30 p-2"><p className="text-lg font-bold text-foreground">{c.completed}</p><p className="text-[10px] text-muted-foreground">Completadas</p></div>
                      <div className="rounded-lg bg-muted/30 p-2"><p className="text-lg font-bold text-primary">{c.success}%</p><p className="text-[10px] text-muted-foreground">Éxito</p></div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Call log */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Registro de Llamadas</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-right p-2.5 font-medium text-muted-foreground hidden sm:table-cell">Duración</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Estado</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground hidden sm:table-cell"></th>
                </tr>
              </thead>
              <tbody>
                {callLog.map((c, i) => {
                  const Icon = callStatusIcon[c.status];
                  return (
                    <tr key={i} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="p-2.5 text-muted-foreground text-xs">{c.date}</td>
                      <td className="p-2.5 font-medium text-foreground">{c.client}</td>
                      <td className="p-2.5 text-right text-foreground hidden sm:table-cell">{c.duration}</td>
                      <td className="p-2.5 text-center">
                        <Badge variant="outline" className={cn("gap-1 border-0 text-[10px]", callStatusColor[c.status])}>
                          <Icon className="h-3 w-3" />{c.status}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-center hidden sm:table-cell">
                        {c.status === "Contestó" && <Button size="sm" variant="ghost" className="h-7 text-xs text-primary">▶ Audio</Button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
