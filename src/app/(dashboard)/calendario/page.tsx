"use client";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Truck, Users, ShoppingCart, FileWarning, CalendarDays, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

type EventType = "entrega" | "reunion" | "compra" | "vencimiento";

interface CalEvent {
  id: number;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time: string;
  detail: string;
}

const typeConfig: Record<EventType, { label: string; dot: string; bg: string; text: string; icon: typeof Truck }> = {
  entrega:     { label: "Entrega", dot: "bg-primary", bg: "bg-primary/10", text: "text-primary", icon: Truck },
  reunion:     { label: "Reunión", dot: "bg-blue-500", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", icon: Users },
  compra:      { label: "Compra", dot: "bg-amber-500", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", icon: ShoppingCart },
  vencimiento: { label: "Vencimiento", dot: "bg-destructive", bg: "bg-destructive/10", text: "text-destructive", icon: FileWarning },
};

const sampleEvents: CalEvent[] = [
  { id: 1, title: "Entrega Supermercado Pueblo", type: "entrega", date: "2026-04-14", time: "7:00 AM", detail: "Van — Miguel Torres — 120 unidades" },
  { id: 2, title: "Entrega Hotel Miramar", type: "entrega", date: "2026-04-14", time: "9:00 AM", detail: "Van — Miguel Torres — 80 unidades" },
  { id: 3, title: "Reunión Café Central", type: "reunion", date: "2026-04-15", time: "10:00 AM", detail: "Revisión de contrato trimestral" },
  { id: 4, title: "Recepción harina — Molinos PR", type: "compra", date: "2026-04-16", time: "8:00 AM", detail: "PO-0042 — 500 kg harina todo uso" },
  { id: 5, title: "Factura #F-0088 vence", type: "vencimiento", date: "2026-04-18", time: "—", detail: "Panadería Don Juan — $2,400" },
  { id: 6, title: "Entrega Restaurante El Fogón", type: "entrega", date: "2026-04-20", time: "7:30 AM", detail: "Moto — Ana Ríos — 60 unidades" },
  { id: 7, title: "Reunión Hotel Condado", type: "reunion", date: "2026-04-22", time: "2:00 PM", detail: "Propuesta catering mensual" },
  { id: 8, title: "Recepción lácteos — Vaquería Tres Monjitas", type: "compra", date: "2026-04-23", time: "6:30 AM", detail: "PO-0045 — mantequilla y crema" },
  { id: 9, title: "Factura #F-0091 vence", type: "vencimiento", date: "2026-04-25", time: "—", detail: "Bistro 787 — $1,800" },
  { id: 10, title: "Entrega La Placita Café", type: "entrega", date: "2026-04-28", time: "8:00 AM", detail: "Carro — Carlos Méndez — 45 unidades" },
  { id: 11, title: "Reunión Supermercado Pueblo", type: "reunion", date: "2026-04-10", time: "11:00 AM", detail: "Negociación volumen Q3" },
  { id: 12, title: "Recepción carnes — Cárnica del Oeste", type: "compra", date: "2026-04-08", time: "7:00 AM", detail: "PO-0039 — jamón y salami" },
  { id: 13, title: "Entrega Panadería Kasalta", type: "entrega", date: "2026-04-03", time: "6:30 AM", detail: "Van — Laura Vega — 90 unidades" },
  { id: 14, title: "Factura #F-0085 vence", type: "vencimiento", date: "2026-04-05", time: "—", detail: "Club Náutico — $3,200" },
];

const DAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Mon=0
}

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function Calendario() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<"month" | "week">("month");
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date(today);
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    return new Date(d.getFullYear(), d.getMonth(), diff);
  });

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    sampleEvents.forEach((e) => {
      (map[e.date] ??= []).push(e);
    });
    return map;
  }, []);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const prevWeek = () => setCurrentWeekStart(new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate() - 7));
  const nextWeek = () => setCurrentWeekStart(new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate() + 7));

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const makeDateStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={view === "month" ? "default" : "outline"} onClick={() => setView("month")} className="gap-1.5">
              <LayoutGrid className="h-4 w-4" /> Mes
            </Button>
            <Button size="sm" variant={view === "week" ? "default" : "outline"} onClick={() => setView("week")} className="gap-1.5">
              <CalendarDays className="h-4 w-4" /> Semana
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {(Object.entries(typeConfig) as [EventType, typeof typeConfig.entrega][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-full", cfg.dot)} />
              <span className="text-xs text-muted-foreground">{cfg.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={view === "month" ? prevMonth : prevWeek}><ChevronLeft className="h-5 w-5" /></Button>
                <CardTitle className="text-base">
                  {view === "month"
                    ? `${monthNames[month]} ${year}`
                    : `${weekDays[0].toLocaleDateString("es-PR", { day: "numeric", month: "short" })} — ${weekDays[6].toLocaleDateString("es-PR", { day: "numeric", month: "short", year: "numeric" })}`}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={view === "month" ? nextMonth : nextWeek}><ChevronRight className="h-5 w-5" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              {view === "month" ? (
                <>
                  <div className="grid grid-cols-7 mb-1">
                    {DAYS_ES.map((d) => (
                      <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, i) => {
                      if (day === null) return <div key={i} className="aspect-square" />;
                      const ds = makeDateStr(year, month, day);
                      const evts = eventsByDate[ds] ?? [];
                      const isToday = ds === todayStr;
                      const isSelected = ds === selectedDate;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDate(ds)}
                          className={cn(
                            "aspect-square p-1 flex flex-col items-center justify-start rounded-lg transition-colors relative",
                            "hover:bg-accent/50",
                            isToday && "ring-2 ring-primary ring-inset",
                            isSelected && "bg-primary/10"
                          )}
                        >
                          <span className={cn("text-sm font-medium", isToday ? "text-primary" : "text-foreground")}>{day}</span>
                          {evts.length > 0 && (
                            <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                              {evts.slice(0, 3).map((e) => (
                                <span key={e.id} className={cn("h-1.5 w-1.5 rounded-full", typeConfig[e.type].dot)} />
                              ))}
                              {evts.length > 3 && <span className="text-[8px] text-muted-foreground">+{evts.length - 3}</span>}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-7 mb-1">
                    {DAYS_ES.map((d) => (
                      <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((wd) => {
                      const ds = makeDateStr(wd.getFullYear(), wd.getMonth(), wd.getDate());
                      const evts = eventsByDate[ds] ?? [];
                      const isToday = ds === todayStr;
                      const isSelected = ds === selectedDate;
                      return (
                        <button
                          key={ds}
                          onClick={() => setSelectedDate(ds)}
                          className={cn(
                            "min-h-[120px] p-2 flex flex-col rounded-lg border transition-colors",
                            "hover:bg-accent/50",
                            isToday && "ring-2 ring-primary ring-inset border-primary/30",
                            isSelected && "bg-primary/10",
                            !isToday && "border-border"
                          )}
                        >
                          <span className={cn("text-sm font-semibold mb-1", isToday ? "text-primary" : "text-foreground")}>{wd.getDate()}</span>
                          <div className="space-y-1 w-full">
                            {evts.slice(0, 3).map((e) => (
                              <div key={e.id} className={cn("text-[10px] rounded px-1 py-0.5 truncate", typeConfig[e.type].bg, typeConfig[e.type].text)}>
                                {e.title.length > 18 ? e.title.slice(0, 18) + "…" : e.title}
                              </div>
                            ))}
                            {evts.length > 3 && <span className="text-[9px] text-muted-foreground">+{evts.length - 3} más</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Side Panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {selectedDate
                  ? new Date(selectedDate + "T12:00:00").toLocaleDateString("es-PR", { weekday: "long", day: "numeric", month: "long" })
                  : "Selecciona un día"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate && <p className="text-sm text-muted-foreground">Haz clic en un día para ver los eventos.</p>}
              {selectedDate && selectedEvents.length === 0 && <p className="text-sm text-muted-foreground">Sin eventos programados.</p>}
              <div className="space-y-3">
                {selectedEvents.map((e) => {
                  const cfg = typeConfig[e.type];
                  return (
                    <div key={e.id} className={cn("rounded-lg p-3 border", cfg.bg, "border-transparent")}>
                      <div className="flex items-start gap-2">
                        <cfg.icon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.text)} />
                        <div className="min-w-0">
                          <p className={cn("text-sm font-semibold", cfg.text)}>{e.title}</p>
                          {e.time !== "—" && <p className="text-xs text-muted-foreground mt-0.5">{e.time}</p>}
                          <p className="text-xs text-muted-foreground mt-1">{e.detail}</p>
                          <Badge variant="outline" className={cn("mt-2 text-[10px] border-0", cfg.bg, cfg.text)}>{cfg.label}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
