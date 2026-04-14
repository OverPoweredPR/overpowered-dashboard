"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, Play, MessageCircle, Bug, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ── Quick Links ── */
const quickLinks = [
  { title: "Documentación", desc: "Guías paso a paso del sistema", icon: BookOpen, color: "bg-primary/10 text-primary" },
  { title: "Video Tutoriales", desc: "Aprende con videos cortos", icon: Play, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { title: "WhatsApp Soporte", desc: "Chat directo con el equipo", icon: MessageCircle, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { title: "Reportar Bug", desc: "Reporta un error o sugerencia", icon: Bug, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
];

/* ── FAQ ── */
const faqs = [
  { q: "¿Cómo creo una nueva orden?", a: "Ve a Órdenes → clic en 'Nueva Orden'. Selecciona el cliente, agrega productos, y confirma. La orden aparecerá en el listado con estado 'Pendiente'." },
  { q: "¿Cómo genero una factura?", a: "En Facturas → 'Nueva Factura'. Puedes vincularla a una orden existente o crear una independiente. El sistema aplica ITBMS automáticamente según la resolución activa." },
  { q: "¿Cómo registro un pago?", a: "En Pagos → 'Nuevo Pago'. Selecciona la factura, método de pago, y monto. Se acepta pago parcial y el balance se actualiza automáticamente." },
  { q: "¿Qué significan los estados de las órdenes?", a: "Pendiente: sin iniciar. En proceso: en producción. Completada: lista para entrega. Entregada: recibida por el cliente. Cancelada: orden anulada." },
  { q: "¿Cómo configuro las resoluciones de facturación?", a: "En Resoluciones → 'Nueva Resolución'. Ingresa el rango autorizado por la DIAN/Hacienda, fecha de vigencia, y prefijo. Solo una resolución puede estar activa a la vez." },
  { q: "¿Cómo funciona el inventario?", a: "El inventario se actualiza automáticamente con cada orden y recepción de compra. Puedes ver stock actual, mínimos, y recibir alertas de reorden en Inventario Avanzado." },
  { q: "¿Puedo exportar reportes?", a: "Sí. En Reportes y Métricas encontrarás opciones de exportación a PDF y CSV. También puedes programar reportes automáticos por email." },
  { q: "¿Cómo agrego un nuevo empleado?", a: "En Empleados → 'Nuevo Empleado'. Completa nombre, rol, contacto, y horario. El empleado podrá registrar check-ins desde su cuenta." },
  { q: "¿Cómo funciona la auditoría?", a: "Auditoría registra automáticamente cada acción del sistema: creación, edición, eliminación de registros. Puedes filtrar por usuario, módulo, y fecha." },
  { q: "¿Cómo contacto soporte técnico?", a: "Usa el formulario de contacto en esta página, escribe por WhatsApp al equipo de soporte, o envía un email a soporte@overpowered.app." },
];

/* ── System Status ── */
const systems = [
  { name: "Dashboard", status: "operational" as const },
  { name: "n8n Automations", status: "operational" as const },
  { name: "Shopify", status: "operational" as const },
  { name: "Airtable", status: "operational" as const },
  { name: "Clover POS", status: "operational" as const },
  { name: "WhatsApp API", status: "operational" as const },
];

const statusStyle = { operational: { dot: "bg-primary", label: "Operativo" } };

const subjects = [
  "Error en el sistema",
  "Pregunta sobre funcionalidad",
  "Solicitud de nueva función",
  "Problema con integración",
  "Otro",
];

export default function Soporte() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!subject || !message.trim()) {
      toast.error("Completa todos los campos");
      return;
    }
    toast.success("Mensaje enviado. Te responderemos pronto.");
    setSubject("");
    setMessage("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Soporte & Ayuda</h1>

        {/* Quick Links */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((l) => (
            <Card key={l.title} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", l.color)}>
                  <l.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{l.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* FAQ */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Preguntas Frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-sm text-left">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Right Column */}
          <div className="space-y-4">
            {/* System Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {systems.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{s.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", statusStyle[s.status].dot)} />
                      <span className="text-xs text-muted-foreground">{statusStyle[s.status].label}</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 pt-2 border-t border-border">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Todos los sistemas operativos</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Contactar Soporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un asunto" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Describe tu problema o pregunta..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
                <Button className="w-full gap-2" onClick={handleSend}>
                  <Send className="h-4 w-4" /> Enviar Mensaje
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
