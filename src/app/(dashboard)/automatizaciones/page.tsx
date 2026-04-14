"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone, MessageCircle, Workflow, Play, PhoneCall, PhoneOff, Voicemail,
  Clock, BarChart3, CheckCheck, Eye, Reply, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ── VAPI Calls ── */
const callLog = [
  { date: "2026-04-14 9:15", client: "Supermercado Pueblo", duration: "2:34", status: "Contestó" as const },
  { date: "2026-04-14 9:02", client: "Hotel Miramar", duration: "1:12", status: "Contestó" as const },
  { date: "2026-04-14 8:45", client: "Café Central", duration: "0:00", status: "No contestó" as const },
  { date: "2026-04-14 8:30", client: "Panadería Don Juan", duration: "0:22", status: "Buzón" as const },
  { date: "2026-04-13 16:10", client: "Restaurante El Fogón", duration: "3:05", status: "Contestó" as const },
  { date: "2026-04-13 15:45", client: "Bistro 787", duration: "0:00", status: "No contestó" as const },
];
const callStatusIcon = { "Contestó": PhoneCall, "No contestó": PhoneOff, "Buzón": Voicemail };
const callStatusColor = { "Contestó": "text-primary", "No contestó": "text-destructive", "Buzón": "text-amber-600 dark:text-amber-400" };

/* ── WhatsApp ── */
const waFlows = [
  { id: 1, name: "Confirmación de orden", desc: "Se envía al crear una orden nueva", active: true },
  { id: 2, name: "Recordatorio de pago", desc: "3 días antes del vencimiento", active: true },
  { id: 3, name: "Notificación de entrega", desc: "Cuando el repartidor sale en ruta", active: true },
  { id: 4, name: "Seguimiento de cliente", desc: "7 días después de última compra", active: false },
];
const waMessages = [
  { date: "2026-04-14 9:20", client: "Supermercado Pueblo", preview: "Su orden #ORD-1248 ha sido confirmada ✅", status: "Leído" as const },
  { date: "2026-04-14 9:05", client: "Hotel Miramar", preview: "Recordatorio: Factura #F-0091 vence en 3 días", status: "Enviado" as const },
  { date: "2026-04-14 8:50", client: "Café Central", preview: "Su pedido está en camino 🚚 ETA: 10:15 AM", status: "Respondido" as const },
  { date: "2026-04-13 16:00", client: "Panadería Don Juan", preview: "¡Hola! ¿Cómo estuvo su último pedido?", status: "Leído" as const },
  { date: "2026-04-13 14:30", client: "Club Náutico", preview: "Su orden #ORD-1245 ha sido confirmada ✅", status: "Enviado" as const },
];
const waStatusIcon = { Enviado: Send, Leído: Eye, Respondido: Reply };
const waStatusColor = { Enviado: "text-muted-foreground", Leído: "text-blue-500", Respondido: "text-primary" };

/* ── n8n Workflows ── */
const workflows = [
  { id: 1, name: "Sync Órdenes → Airtable", lastRun: "Hace 5 min", status: "success" as const, active: true },
  { id: 2, name: "Actualizar inventario Shopify", lastRun: "Hace 12 min", status: "success" as const, active: true },
  { id: 3, name: "Alertas de stock bajo → Slack", lastRun: "Hace 1 hora", status: "success" as const, active: true },
  { id: 4, name: "Reporte diario por email", lastRun: "Hoy 6:00 AM", status: "success" as const, active: true },
  { id: 5, name: "Sync Clover POS → Dashboard", lastRun: "Hace 30 min", status: "error" as const, active: true },
  { id: 6, name: "Backup DB semanal", lastRun: "Dom 2:00 AM", status: "success" as const, active: false },
];

export default function Automatizaciones() {
  const [callsEnabled, setCallsEnabled] = useState(true);
  const [waFlowState, setWaFlowState] = useState(waFlows.map((f) => f.active));
  const [wfState, setWfState] = useState(workflows.map((w) => w.active));

  const toggleWaFlow = (i: number) => setWaFlowState((p) => p.map((v, j) => j === i ? !v : v));
  const toggleWf = (i: number) => setWfState((p) => p.map((v, j) => j === i ? !v : v));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Automatizaciones & IA</h1>

        <Tabs defaultValue="calls">
          <TabsList>
            <TabsTrigger value="calls" className="gap-1.5"><Phone className="h-4 w-4" /> Llamadas</TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-1.5"><MessageCircle className="h-4 w-4" /> WhatsApp</TabsTrigger>
            <TabsTrigger value="flows" className="gap-1.5"><Workflow className="h-4 w-4" /> Flujos</TabsTrigger>
          </TabsList>

          {/* ── CALLS TAB ── */}
          <TabsContent value="calls" className="space-y-4 mt-4">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Llamadas hoy", value: "4", icon: Phone },
                { label: "Tasa respuesta", value: "50%", icon: BarChart3 },
                { label: "Duración prom.", value: "1:47", icon: Clock },
                { label: "Auto-llamadas", value: callsEnabled ? "Activo" : "Inactivo", icon: PhoneCall },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><s.icon className="h-4 w-4 text-primary" /></div>
                    <div><p className="text-lg font-bold text-foreground">{s.value}</p><p className="text-[11px] text-muted-foreground">{s.label}</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch checked={callsEnabled} onCheckedChange={setCallsEnabled} />
                <span className="text-sm font-medium text-foreground">Llamadas automáticas (VAPI)</span>
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => toast.success("Campaña creada")}><Play className="h-4 w-4" /> Nueva Campaña</Button>
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Registro de Llamadas</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted/50">
                      <th className="text-left p-2.5 font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left p-2.5 font-medium text-muted-foreground">Cliente</th>
                      <th className="text-right p-2.5 font-medium text-muted-foreground hidden sm:table-cell">Duración</th>
                      <th className="text-center p-2.5 font-medium text-muted-foreground">Estado</th>
                      <th className="text-center p-2.5 font-medium text-muted-foreground hidden sm:table-cell"></th>
                    </tr></thead>
                    <tbody>
                      {callLog.map((c, i) => {
                        const Icon = callStatusIcon[c.status];
                        return (
                          <tr key={i} className="border-t border-border">
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
          </TabsContent>

          {/* ── WHATSAPP TAB ── */}
          <TabsContent value="whatsapp" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Mensajes hoy", value: "12", icon: MessageCircle },
                { label: "Tasa de lectura", value: "83%", icon: CheckCheck },
                { label: "Flujos activos", value: String(waFlowState.filter(Boolean).length), icon: Workflow },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><s.icon className="h-4 w-4 text-primary" /></div>
                    <div><p className="text-lg font-bold text-foreground">{s.value}</p><p className="text-[11px] text-muted-foreground">{s.label}</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Flujos de WhatsApp</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {waFlows.map((f, i) => (
                  <div key={f.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div><p className="text-sm font-medium text-foreground">{f.name}</p><p className="text-xs text-muted-foreground">{f.desc}</p></div>
                    <Switch checked={waFlowState[i]} onCheckedChange={() => toggleWaFlow(i)} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Mensajes Recientes</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted/50">
                      <th className="text-left p-2.5 font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left p-2.5 font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left p-2.5 font-medium text-muted-foreground hidden sm:table-cell">Mensaje</th>
                      <th className="text-center p-2.5 font-medium text-muted-foreground">Estado</th>
                    </tr></thead>
                    <tbody>
                      {waMessages.map((m, i) => {
                        const Icon = waStatusIcon[m.status];
                        return (
                          <tr key={i} className="border-t border-border">
                            <td className="p-2.5 text-muted-foreground text-xs">{m.date}</td>
                            <td className="p-2.5 font-medium text-foreground">{m.client}</td>
                            <td className="p-2.5 text-muted-foreground text-xs hidden sm:table-cell truncate max-w-[200px]">{m.preview}</td>
                            <td className="p-2.5 text-center">
                              <Badge variant="outline" className={cn("gap-1 border-0 text-[10px]", waStatusColor[m.status])}>
                                <Icon className="h-3 w-3" />{m.status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── FLOWS TAB ── */}
          <TabsContent value="flows" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((w, i) => (
                <Card key={w.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{w.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={cn("h-2 w-2 rounded-full", w.status === "success" ? "bg-primary" : "bg-destructive")} />
                          <span className="text-[11px] text-muted-foreground">{w.lastRun}</span>
                        </div>
                      </div>
                      <Switch checked={wfState[i]} onCheckedChange={() => toggleWf(i)} />
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] border-0", w.status === "success" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive")}>
                      {w.status === "success" ? "Exitoso" : "Error"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
