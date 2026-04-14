"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertTriangle, ScrollText } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { cn } from "@/lib/utils";

const workflows = [
  {
    id: 1, name: "Sync Órdenes → Airtable", lastRun: "Hace 5 min", status: "success" as const, active: true, errorsToday: 0,
    history: [{ d: "Lun", ok: 42, err: 0 }, { d: "Mar", ok: 38, err: 1 }, { d: "Mié", ok: 45, err: 0 }, { d: "Jue", ok: 40, err: 0 }, { d: "Vie", ok: 44, err: 0 }, { d: "Sáb", ok: 12, err: 0 }, { d: "Dom", ok: 8, err: 0 }],
    logs: [
      { time: "9:10 AM", msg: "Sync completado: 3 órdenes nuevas", level: "info" },
      { time: "9:05 AM", msg: "Sync completado: 1 orden actualizada", level: "info" },
      { time: "8:55 AM", msg: "Conexión establecida con Airtable", level: "info" },
    ],
  },
  {
    id: 2, name: "Actualizar inventario Shopify", lastRun: "Hace 12 min", status: "success" as const, active: true, errorsToday: 0,
    history: [{ d: "Lun", ok: 18, err: 0 }, { d: "Mar", ok: 20, err: 0 }, { d: "Mié", ok: 22, err: 0 }, { d: "Jue", ok: 19, err: 2 }, { d: "Vie", ok: 21, err: 0 }, { d: "Sáb", ok: 5, err: 0 }, { d: "Dom", ok: 3, err: 0 }],
    logs: [
      { time: "9:03 AM", msg: "12 productos actualizados en Shopify", level: "info" },
      { time: "8:50 AM", msg: "Inventario sincronizado correctamente", level: "info" },
    ],
  },
  {
    id: 3, name: "Alertas de stock bajo → Slack", lastRun: "Hace 1 hora", status: "success" as const, active: true, errorsToday: 0,
    history: [{ d: "Lun", ok: 6, err: 0 }, { d: "Mar", ok: 8, err: 0 }, { d: "Mié", ok: 5, err: 0 }, { d: "Jue", ok: 7, err: 0 }, { d: "Vie", ok: 9, err: 0 }, { d: "Sáb", ok: 2, err: 0 }, { d: "Dom", ok: 1, err: 0 }],
    logs: [
      { time: "8:15 AM", msg: "Alerta enviada: Harina de trigo < 10 unidades", level: "warn" },
      { time: "8:15 AM", msg: "Alerta enviada: Mantequilla < 5 unidades", level: "warn" },
    ],
  },
  {
    id: 4, name: "Reporte diario por email", lastRun: "Hoy 6:00 AM", status: "success" as const, active: true, errorsToday: 0,
    history: [{ d: "Lun", ok: 1, err: 0 }, { d: "Mar", ok: 1, err: 0 }, { d: "Mié", ok: 1, err: 0 }, { d: "Jue", ok: 1, err: 0 }, { d: "Vie", ok: 1, err: 0 }, { d: "Sáb", ok: 1, err: 0 }, { d: "Dom", ok: 1, err: 0 }],
    logs: [
      { time: "6:00 AM", msg: "Reporte generado y enviado a 3 destinatarios", level: "info" },
    ],
  },
  {
    id: 5, name: "Sync Clover POS → Dashboard", lastRun: "Hace 30 min", status: "error" as const, active: true, errorsToday: 3,
    history: [{ d: "Lun", ok: 30, err: 0 }, { d: "Mar", ok: 28, err: 2 }, { d: "Mié", ok: 32, err: 0 }, { d: "Jue", ok: 25, err: 5 }, { d: "Vie", ok: 29, err: 1 }, { d: "Sáb", ok: 10, err: 0 }, { d: "Dom", ok: 8, err: 3 }],
    logs: [
      { time: "8:45 AM", msg: "Error: Clover API timeout después de 30s", level: "error" },
      { time: "8:30 AM", msg: "Error: Rate limit excedido en Clover API", level: "error" },
      { time: "8:15 AM", msg: "Error: Respuesta inválida de Clover endpoint /items", level: "error" },
      { time: "8:00 AM", msg: "Sync parcial: 15 de 22 transacciones", level: "warn" },
    ],
  },
  {
    id: 6, name: "Backup DB semanal", lastRun: "Dom 2:00 AM", status: "success" as const, active: false, errorsToday: 0,
    history: [{ d: "Lun", ok: 0, err: 0 }, { d: "Mar", ok: 0, err: 0 }, { d: "Mié", ok: 0, err: 0 }, { d: "Jue", ok: 0, err: 0 }, { d: "Vie", ok: 0, err: 0 }, { d: "Sáb", ok: 0, err: 0 }, { d: "Dom", ok: 1, err: 0 }],
    logs: [
      { time: "Dom 2:05 AM", msg: "Backup completado: 245 MB, 12 tablas", level: "info" },
    ],
  },
];

export function FlujosTab() {
  const [wfState, setWfState] = useState(workflows.map((w) => w.active));
  const [logsWf, setLogsWf] = useState<typeof workflows[0] | null>(null);
  const toggleWf = (i: number) => setWfState((p) => p.map((v, j) => (j === i ? !v : v)));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((w, i) => (
          <Card key={w.id} className={cn(w.errorsToday > 0 && "border-destructive/40")}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{w.name}</p>
                    {w.errorsToday > 0 && (
                      <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                        <AlertTriangle className="h-3 w-3 mr-0.5" />{w.errorsToday}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={cn("h-2 w-2 rounded-full", w.status === "success" ? "bg-primary" : "bg-destructive")} />
                    <span className="text-[11px] text-muted-foreground">{w.lastRun}</span>
                  </div>
                </div>
                <Switch checked={wfState[i]} onCheckedChange={() => toggleWf(i)} />
              </div>

              {/* Mini chart */}
              <div className="h-[50px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={w.history} barGap={1}>
                    <XAxis dataKey="d" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8 }}
                      formatter={(value, name) => [Number(value), name === "ok" ? "Exitosos" : "Errores"]}
                    />
                    <Bar dataKey="ok" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} barSize={8} />
                    <Bar dataKey="err" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className={cn("text-[10px] border-0", w.status === "success" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive")}>
                  {w.status === "success" ? "Exitoso" : "Error"}
                </Badge>
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setLogsWf(w)}>
                  <ScrollText className="h-3.5 w-3.5 mr-1" /> Ver logs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Logs sheet */}
      <Sheet open={!!logsWf} onOpenChange={() => setLogsWf(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>Logs: {logsWf?.name}</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-2">
            {logsWf?.logs.map((l, i) => (
              <div key={i} className={cn(
                "rounded-md border p-2.5 text-xs",
                l.level === "error" ? "border-destructive/30 bg-destructive/5" :
                l.level === "warn" ? "border-amber-500/30 bg-amber-500/5" :
                "border-border"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground">{l.time}</span>
                  <Badge variant="outline" className={cn("text-[9px] h-4 border-0",
                    l.level === "error" ? "text-destructive bg-destructive/10" :
                    l.level === "warn" ? "text-amber-600 bg-amber-500/10" :
                    "text-muted-foreground"
                  )}>{l.level.toUpperCase()}</Badge>
                </div>
                <p className="text-foreground">{l.msg}</p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
