"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon, ClipboardList, Flame, CheckCircle2, TrendingUp,
  Package, Trash2, Award, Thermometer, Clock, User,
} from "lucide-react";

type Batch = {
  id: string;
  product: string;
  batchNumber: string;
  quantity: number;
  startTime: string;
  endTime: string;
  baker: string;
  progress: number;
  tempC: number;
  status: "Planificado" | "En Horno" | "Completado";
};

const batches: Batch[] = [
  { id: "L-001", product: "Baguette Clásico", batchNumber: "B-2604-01", quantity: 120, startTime: "5:00 AM", endTime: "5:45 AM", baker: "José Martínez", progress: 0, tempC: 0, status: "Planificado" },
  { id: "L-002", product: "Pan de Agua", batchNumber: "B-2604-02", quantity: 80, startTime: "5:30 AM", endTime: "6:10 AM", baker: "José Martínez", progress: 0, tempC: 0, status: "Planificado" },
  { id: "L-003", product: "Croissant Mantequilla", batchNumber: "B-2604-03", quantity: 60, startTime: "6:00 AM", endTime: "6:35 AM", baker: "Pedro Colón", progress: 0, tempC: 0, status: "Planificado" },
  { id: "L-004", product: "Pan Sobao", batchNumber: "B-2604-04", quantity: 100, startTime: "5:15 AM", endTime: "6:00 AM", baker: "José Martínez", progress: 65, tempC: 210, status: "En Horno" },
  { id: "L-005", product: "Baguette Integral", batchNumber: "B-2604-05", quantity: 90, startTime: "5:45 AM", endTime: "6:30 AM", baker: "Pedro Colón", progress: 40, tempC: 195, status: "En Horno" },
  { id: "L-006", product: "Pan de Queso", batchNumber: "B-2604-06", quantity: 50, startTime: "6:15 AM", endTime: "7:00 AM", baker: "José Martínez", progress: 80, tempC: 220, status: "En Horno" },
  { id: "L-007", product: "Baguette Clásico", batchNumber: "B-2604-07", quantity: 120, startTime: "4:00 AM", endTime: "4:45 AM", baker: "José Martínez", progress: 100, tempC: 0, status: "Completado" },
  { id: "L-008", product: "Croissant Almendra", batchNumber: "B-2604-08", quantity: 45, startTime: "4:15 AM", endTime: "4:55 AM", baker: "Pedro Colón", progress: 100, tempC: 0, status: "Completado" },
  { id: "L-009", product: "Pan Sobao", batchNumber: "B-2604-09", quantity: 100, startTime: "4:30 AM", endTime: "5:15 AM", baker: "José Martínez", progress: 100, tempC: 0, status: "Completado" },
  { id: "L-010", product: "Mallorca", batchNumber: "B-2604-10", quantity: 70, startTime: "4:45 AM", endTime: "5:30 AM", baker: "Pedro Colón", progress: 100, tempC: 0, status: "Completado" },
];

const columns: { key: Batch["status"]; label: string; icon: typeof ClipboardList; color: string }[] = [
  { key: "Planificado", label: "Planificado", icon: ClipboardList, color: "text-muted-foreground" },
  { key: "En Horno", label: "En Horno", icon: Flame, color: "text-orange-500" },
  { key: "Completado", label: "Completado", icon: CheckCircle2, color: "text-primary" },
];

function TempBadge({ temp }: { temp: number }) {
  if (temp === 0) return null;
  const color = temp >= 210 ? "text-red-500" : temp >= 190 ? "text-orange-500" : "text-muted-foreground";
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${color}`}>
      <Thermometer className="h-3 w-3" />{temp}°C
    </span>
  );
}

export default function Produccion() {
  const [date, setDate] = useState<Date>(new Date());

  const planned = batches.filter((b) => b.status === "Planificado").length;
  const inOven = batches.filter((b) => b.status === "En Horno").length;
  const completed = batches.filter((b) => b.status === "Completado").length;
  const totalUnits = batches.filter((b) => b.status === "Completado").reduce((a, b2) => a + b2.quantity, 0);
  const efficiency = Math.round((completed / batches.length) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Producción</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[200px] justify-start gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(date, "PPP", { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>

        {/* Summary Chips */}
        <div className="flex flex-wrap gap-3">
          {[
            { icon: ClipboardList, label: `${planned} Planificados` },
            { icon: Flame, label: `${inOven} En Proceso` },
            { icon: CheckCircle2, label: `${completed} Completados` },
            { icon: TrendingUp, label: `${efficiency}% Eficiencia` },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2">
              <c.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{c.label}</span>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unidades Hoy</p>
                <p className="text-xl font-bold text-foreground">{totalUnits.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Desperdicio</p>
                <p className="text-xl font-bold text-foreground">2.3%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Más Vendido</p>
                <p className="text-xl font-bold text-foreground">Baguette Clásico</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Production Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {columns.map((col) => {
            const items = batches.filter((b) => b.status === col.key);
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <col.icon className={`h-4 w-4 ${col.color}`} />
                  <h2 className="text-sm font-semibold text-foreground">{col.label}</h2>
                  <Badge variant="secondary" className="ml-auto text-xs">{items.length}</Badge>
                </div>
                <div className="space-y-3">
                  {items.map((batch) => (
                    <Card key={batch.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground text-sm leading-tight">{batch.product}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{batch.batchNumber}</p>
                          </div>
                          <TempBadge temp={batch.tempC} />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Package className="h-3 w-3" />{batch.quantity} uds</span>
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{batch.baker.split(" ")[0]}</span>
                          <span className="flex items-center gap-1 col-span-2"><Clock className="h-3 w-3" />{batch.startTime} – {batch.endTime}</span>
                        </div>

                        {batch.status !== "Planificado" && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Progreso</span>
                              <span className={`font-medium ${batch.progress === 100 ? "text-primary" : "text-foreground"}`}>{batch.progress}%</span>
                            </div>
                            <Progress value={batch.progress} className="h-1.5" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
