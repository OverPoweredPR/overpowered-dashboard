"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  MessageCircle, CheckCheck, Workflow, Send, Eye, Reply, Clock, Copy,
  FileText, ShoppingCart, CreditCard, Truck, UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const waFlows = [
  { id: 1, name: "Confirmación de orden", desc: "Se envía al crear una orden nueva", active: true, icon: ShoppingCart },
  { id: 2, name: "Recordatorio de pago", desc: "3 días antes del vencimiento", active: true, icon: CreditCard },
  { id: 3, name: "Notificación de entrega", desc: "Cuando el repartidor sale en ruta", active: true, icon: Truck },
  { id: 4, name: "Seguimiento de cliente", desc: "7 días después de última compra", active: false, icon: UserCheck },
];

const templates: Record<string, { name: string; body: string }[]> = {
  "Confirmación de orden": [
    { name: "Confirmación estándar", body: "Hola {{nombre}}, su orden #{{orden}} ha sido confirmada ✅. Total: ${{total}}. Le avisaremos cuando esté lista." },
    { name: "Con detalles", body: "¡Gracias {{nombre}}! Recibimos su pedido #{{orden}}:\n\n{{productos}}\n\nTotal: ${{total}}\nEntrega estimada: {{fecha}}" },
  ],
  "Recordatorio de pago": [
    { name: "Recordatorio amable", body: "Hola {{nombre}}, le recordamos que su factura #{{factura}} por ${{monto}} vence el {{fecha}}. ¿Necesita ayuda?" },
    { name: "Urgente", body: "{{nombre}}, su factura #{{factura}} vence mañana. Monto: ${{monto}}. Evite cargos adicionales pagando hoy." },
  ],
  "Notificación de entrega": [
    { name: "En camino", body: "🚚 Su pedido #{{orden}} está en camino. Conductor: {{conductor}}. ETA: {{hora}}. Rastree en: {{link}}" },
    { name: "Entregado", body: "✅ Pedido #{{orden}} entregado exitosamente. ¿Todo bien con su orden? Responda si necesita algo." },
  ],
  "Seguimiento de cliente": [
    { name: "Check-in", body: "¡Hola {{nombre}}! Hace unos días no le vemos. ¿Le gustaría repetir su último pedido? Responda SÍ y lo preparamos." },
  ],
};

const waMessages = [
  { date: "2026-04-14 9:20", client: "Supermercado Pueblo", preview: "Su orden #ORD-1248 ha sido confirmada ✅", status: "Leído" as const, thread: [
    { from: "bot", text: "Su orden #ORD-1248 ha sido confirmada ✅. Total: $1,245.00. Le avisaremos cuando esté lista.", time: "9:20 AM" },
    { from: "client", text: "Perfecto, gracias. ¿A qué hora llega?", time: "9:22 AM" },
    { from: "bot", text: "Estimamos entrega entre 10:00 y 10:30 AM. Le notificaremos cuando el repartidor salga.", time: "9:22 AM" },
  ]},
  { date: "2026-04-14 9:05", client: "Hotel Miramar", preview: "Recordatorio: Factura #F-0091 vence en 3 días", status: "Enviado" as const, thread: [
    { from: "bot", text: "Hola Hotel Miramar, le recordamos que su factura #F-0091 por $3,450.00 vence el 17 de abril.", time: "9:05 AM" },
  ]},
  { date: "2026-04-14 8:50", client: "Café Central", preview: "Su pedido está en camino 🚚 ETA: 10:15 AM", status: "Respondido" as const, thread: [
    { from: "bot", text: "🚚 Su pedido #ORD-1247 está en camino. Conductor: Carlos M. ETA: 10:15 AM.", time: "8:50 AM" },
    { from: "client", text: "¿Pueden llegar antes de las 10? Tenemos evento", time: "8:52 AM" },
    { from: "bot", text: "Déjeme verificar con el conductor. Un momento por favor.", time: "8:53 AM" },
    { from: "client", text: "Gracias!", time: "8:53 AM" },
  ]},
  { date: "2026-04-13 16:00", client: "Panadería Don Juan", preview: "¡Hola! ¿Cómo estuvo su último pedido?", status: "Leído" as const, thread: [
    { from: "bot", text: "¡Hola Don Juan! Hace unos días no le vemos. ¿Le gustaría repetir su último pedido?", time: "4:00 PM" },
  ]},
];

const waStatusIcon = { Enviado: Send, Leído: Eye, Respondido: Reply };
const waStatusColor = { Enviado: "text-muted-foreground", Leído: "text-blue-500", Respondido: "text-primary" };

export function WhatsAppTab() {
  const [flowState, setFlowState] = useState(waFlows.map((f) => f.active));
  const [templateFlow, setTemplateFlow] = useState<string | null>(null);
  const [threadMsg, setThreadMsg] = useState<typeof waMessages[0] | null>(null);

  const toggleFlow = (i: number) => setFlowState((p) => p.map((v, j) => (j === i ? !v : v)));

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Mensajes hoy", value: "38", icon: MessageCircle },
          { label: "Tasa de lectura", value: "83%", icon: CheckCheck },
          { label: "Tiempo resp. prom.", value: "4.2 min", icon: Clock },
          { label: "Flujos activos", value: String(flowState.filter(Boolean).length), icon: Workflow },
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

      {/* Flows + Templates */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Flujos de WhatsApp</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {waFlows.map((f, i) => (
            <div key={f.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setTemplateFlow(f.name)}>
                  <FileText className="h-3.5 w-3.5 mr-1" /> Plantillas
                </Button>
                <Switch checked={flowState[i]} onCheckedChange={() => toggleFlow(i)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Templates dialog */}
      <Dialog open={!!templateFlow} onOpenChange={() => setTemplateFlow(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Plantillas: {templateFlow}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {templateFlow && templates[templateFlow]?.map((t, i) => (
              <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <div className="bg-muted/40 rounded-md p-3 text-xs text-muted-foreground whitespace-pre-line">{t.body}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { toast.success("Plantilla aplicada"); setTemplateFlow(null); }}>
                    Usar plantilla
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => { navigator.clipboard.writeText(t.body); toast.success("Copiado"); }}>
                    <Copy className="h-3 w-3 mr-1" /> Copiar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Message log */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Mensajes Recientes</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground hidden sm:table-cell">Mensaje</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {waMessages.map((m, i) => {
                  const Icon = waStatusIcon[m.status];
                  return (
                    <tr key={i} className="border-t border-border hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => setThreadMsg(m)}>
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

      {/* Conversation thread */}
      <Sheet open={!!threadMsg} onOpenChange={() => setThreadMsg(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" /> {threadMsg?.client}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {threadMsg?.thread.map((msg, i) => (
              <div key={i} className={cn("flex", msg.from === "bot" ? "justify-start" : "justify-end")}>
                <div className={cn(
                  "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                  msg.from === "bot"
                    ? "bg-muted/60 text-foreground rounded-tl-none"
                    : "bg-primary text-primary-foreground rounded-tr-none"
                )}>
                  <p>{msg.text}</p>
                  <p className={cn("text-[10px] mt-1", msg.from === "bot" ? "text-muted-foreground" : "text-primary-foreground/70")}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
