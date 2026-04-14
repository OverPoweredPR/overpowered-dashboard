"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, Plus, Users, UserCheck, Clock, CalendarDays, Phone, Mail, MapPin,
} from "lucide-react";

type Employee = {
  id: string;
  name: string;
  initials: string;
  role: "Panadero" | "Repartidor" | "Cajero" | "Supervisor";
  active: boolean;
  checkInToday: string | null;
  hoursThisWeek: number;
  hoursMTD: number;
  email: string;
  phone: string;
  address: string;
  schedule: { day: string; hours: string }[];
  checkins: { date: string; checkIn: string; checkOut: string; hours: number }[];
};

const roleColors: Record<string, string> = {
  Panadero: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Repartidor: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Cajero: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  Supervisor: "bg-primary/15 text-primary",
};

const employees: Employee[] = [
  {
    id: "EMP-001", name: "José Martínez", initials: "JM", role: "Panadero", active: true,
    checkInToday: "5:30 AM", hoursThisWeek: 38, hoursMTD: 152,
    email: "jose@baguettes.com", phone: "787-555-1010", address: "Calle Luna 45, San Juan",
    schedule: [
      { day: "Lun", hours: "5:00–13:00" }, { day: "Mar", hours: "5:00–13:00" },
      { day: "Mié", hours: "5:00–13:00" }, { day: "Jue", hours: "5:00–13:00" },
      { day: "Vie", hours: "5:00–13:00" }, { day: "Sáb", hours: "5:00–11:00" },
      { day: "Dom", hours: "Libre" },
    ],
    checkins: [
      { date: "2026-04-14", checkIn: "5:30 AM", checkOut: "1:15 PM", hours: 7.75 },
      { date: "2026-04-13", checkIn: "5:15 AM", checkOut: "1:00 PM", hours: 7.75 },
      { date: "2026-04-12", checkIn: "5:00 AM", checkOut: "11:00 AM", hours: 6 },
      { date: "2026-04-11", checkIn: "5:20 AM", checkOut: "1:10 PM", hours: 7.83 },
      { date: "2026-04-10", checkIn: "5:05 AM", checkOut: "1:00 PM", hours: 7.92 },
    ],
  },
  {
    id: "EMP-002", name: "Ana Ríos", initials: "AR", role: "Cajero", active: true,
    checkInToday: "7:00 AM", hoursThisWeek: 32, hoursMTD: 128,
    email: "ana@baguettes.com", phone: "787-555-2020", address: "Ave Central 120, Santurce",
    schedule: [
      { day: "Lun", hours: "7:00–15:00" }, { day: "Mar", hours: "7:00–15:00" },
      { day: "Mié", hours: "Libre" }, { day: "Jue", hours: "7:00–15:00" },
      { day: "Vie", hours: "7:00–15:00" }, { day: "Sáb", hours: "7:00–13:00" },
      { day: "Dom", hours: "Libre" },
    ],
    checkins: [
      { date: "2026-04-14", checkIn: "7:00 AM", checkOut: "—", hours: 0 },
      { date: "2026-04-13", checkIn: "6:55 AM", checkOut: "3:00 PM", hours: 8.08 },
      { date: "2026-04-11", checkIn: "7:10 AM", checkOut: "3:05 PM", hours: 7.92 },
      { date: "2026-04-10", checkIn: "7:00 AM", checkOut: "3:00 PM", hours: 8 },
      { date: "2026-04-09", checkIn: "7:05 AM", checkOut: "3:10 PM", hours: 8.08 },
    ],
  },
  {
    id: "EMP-003", name: "Miguel Torres", initials: "MT", role: "Repartidor", active: true,
    checkInToday: "6:00 AM", hoursThisWeek: 40, hoursMTD: 160,
    email: "miguel@baguettes.com", phone: "787-555-3030", address: "Calle Sol 78, Río Piedras",
    schedule: [
      { day: "Lun", hours: "6:00–14:00" }, { day: "Mar", hours: "6:00–14:00" },
      { day: "Mié", hours: "6:00–14:00" }, { day: "Jue", hours: "6:00–14:00" },
      { day: "Vie", hours: "6:00–14:00" }, { day: "Sáb", hours: "Libre" },
      { day: "Dom", hours: "Libre" },
    ],
    checkins: [
      { date: "2026-04-14", checkIn: "6:00 AM", checkOut: "—", hours: 0 },
      { date: "2026-04-13", checkIn: "6:10 AM", checkOut: "2:15 PM", hours: 8.08 },
      { date: "2026-04-12", checkIn: "6:00 AM", checkOut: "2:00 PM", hours: 8 },
      { date: "2026-04-11", checkIn: "5:55 AM", checkOut: "2:00 PM", hours: 8.08 },
      { date: "2026-04-10", checkIn: "6:05 AM", checkOut: "2:10 PM", hours: 8.08 },
    ],
  },
  {
    id: "EMP-004", name: "Carmen Vega", initials: "CV", role: "Supervisor", active: true,
    checkInToday: "6:30 AM", hoursThisWeek: 42, hoursMTD: 168,
    email: "carmen@baguettes.com", phone: "787-555-4040", address: "Cond. Playa, Condado",
    schedule: [
      { day: "Lun", hours: "6:30–15:30" }, { day: "Mar", hours: "6:30–15:30" },
      { day: "Mié", hours: "6:30–15:30" }, { day: "Jue", hours: "6:30–15:30" },
      { day: "Vie", hours: "6:30–15:30" }, { day: "Sáb", hours: "7:00–12:00" },
      { day: "Dom", hours: "Libre" },
    ],
    checkins: [
      { date: "2026-04-14", checkIn: "6:30 AM", checkOut: "—", hours: 0 },
      { date: "2026-04-13", checkIn: "6:25 AM", checkOut: "3:30 PM", hours: 9.08 },
      { date: "2026-04-12", checkIn: "7:00 AM", checkOut: "12:00 PM", hours: 5 },
      { date: "2026-04-11", checkIn: "6:30 AM", checkOut: "3:35 PM", hours: 9.08 },
      { date: "2026-04-10", checkIn: "6:35 AM", checkOut: "3:30 PM", hours: 8.92 },
    ],
  },
  {
    id: "EMP-005", name: "Pedro Colón", initials: "PC", role: "Panadero", active: false,
    checkInToday: null, hoursThisWeek: 0, hoursMTD: 64,
    email: "pedro@baguettes.com", phone: "787-555-5050", address: "Calle Cruz 55, Bayamón",
    schedule: [
      { day: "Lun", hours: "—" }, { day: "Mar", hours: "—" }, { day: "Mié", hours: "—" },
      { day: "Jue", hours: "—" }, { day: "Vie", hours: "—" }, { day: "Sáb", hours: "—" },
      { day: "Dom", hours: "—" },
    ],
    checkins: [
      { date: "2026-04-02", checkIn: "5:00 AM", checkOut: "1:00 PM", hours: 8 },
      { date: "2026-04-01", checkIn: "5:10 AM", checkOut: "1:05 PM", hours: 7.92 },
      { date: "2026-03-31", checkIn: "5:00 AM", checkOut: "1:00 PM", hours: 8 },
      { date: "2026-03-30", checkIn: "5:15 AM", checkOut: "1:10 PM", hours: 7.92 },
      { date: "2026-03-29", checkIn: "5:00 AM", checkOut: "11:00 AM", hours: 6 },
    ],
  },
  {
    id: "EMP-006", name: "Laura Díaz", initials: "LD", role: "Repartidor", active: true,
    checkInToday: "6:15 AM", hoursThisWeek: 36, hoursMTD: 144,
    email: "laura@baguettes.com", phone: "787-555-6060", address: "Ave Muñoz, Hato Rey",
    schedule: [
      { day: "Lun", hours: "6:00–14:00" }, { day: "Mar", hours: "6:00–14:00" },
      { day: "Mié", hours: "6:00–14:00" }, { day: "Jue", hours: "Libre" },
      { day: "Vie", hours: "6:00–14:00" }, { day: "Sáb", hours: "6:00–12:00" },
      { day: "Dom", hours: "Libre" },
    ],
    checkins: [
      { date: "2026-04-14", checkIn: "6:15 AM", checkOut: "—", hours: 0 },
      { date: "2026-04-13", checkIn: "6:00 AM", checkOut: "2:00 PM", hours: 8 },
      { date: "2026-04-12", checkIn: "6:10 AM", checkOut: "12:05 PM", hours: 5.92 },
      { date: "2026-04-11", checkIn: "6:00 AM", checkOut: "2:00 PM", hours: 8 },
      { date: "2026-04-09", checkIn: "6:05 AM", checkOut: "2:10 PM", hours: 8.08 },
    ],
  },
];

export default function Empleados() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selected, setSelected] = useState<Employee | null>(null);

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || e.role === roleFilter;
    return matchSearch && matchRole;
  });

  const activeToday = employees.filter((e) => e.active).length;
  const checkinsToday = employees.filter((e) => e.checkInToday).length;
  const hoursMTD = employees.reduce((a, e) => a + e.hoursMTD, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Summary Chips */}
        <div className="flex flex-wrap gap-3">
          {[
            { icon: Users, label: `${employees.length} Empleados` },
            { icon: UserCheck, label: `${activeToday} Activos hoy` },
            { icon: Clock, label: `${checkinsToday} Check-ins hoy` },
            { icon: CalendarDays, label: `${hoursMTD}h trabajadas MTD` },
          ].map((chip, i) => (
            <div key={i} className="flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2">
              <chip.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{chip.label}</span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Empleados</h1>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> Nuevo Empleado
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar empleado..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Panadero">Panadero</SelectItem>
              <SelectItem value="Repartidor">Repartidor</SelectItem>
              <SelectItem value="Cajero">Cajero</SelectItem>
              <SelectItem value="Supervisor">Supervisor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <Card key={e.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">{e.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground leading-tight">{e.name}</p>
                      <Badge className={`mt-1 text-xs border-0 ${roleColors[e.role]}`}>{e.role}</Badge>
                    </div>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full mt-1.5 ${e.active ? "bg-primary" : "bg-muted-foreground/40"}`} />
                </div>

                <div className="text-sm space-y-1.5 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Check-in: {e.checkInToday ?? "—"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {e.hoursThisWeek}h esta semana
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full" onClick={() => setSelected(e)}>
                  Ver detalle
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No se encontraron empleados.</div>
        )}
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">{selected.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-lg">{selected.name}</SheetTitle>
                    <SheetDescription>
                      <Badge className={`text-xs border-0 ${roleColors[selected.role]}`}>{selected.role}</Badge>
                      <span className="ml-2">{selected.id}</span>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                {/* Contact */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />Email</span><span className="text-foreground">{selected.email}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Teléfono</span><span className="text-foreground">{selected.phone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Dirección</span><span className="text-foreground text-right max-w-[55%]">{selected.address}</span></div>
                </div>

                {/* Hours MTD */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Horas Trabajadas MTD</p>
                    <p className="text-2xl font-bold text-primary">{selected.hoursMTD}h</p>
                  </CardContent>
                </Card>

                {/* Schedule */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Horario Semanal</h3>
                  <div className="grid grid-cols-7 gap-1.5">
                    {selected.schedule.map((s) => (
                      <div key={s.day} className="rounded-lg border border-border p-2 text-center">
                        <p className="text-xs font-medium text-muted-foreground">{s.day}</p>
                        <p className={`text-xs mt-1 font-medium ${s.hours === "Libre" || s.hours === "—" ? "text-muted-foreground/50" : "text-foreground"}`}>
                          {s.hours === "Libre" || s.hours === "—" ? "—" : s.hours}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Check-ins */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Últimos Check-ins</h3>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2.5 font-medium text-muted-foreground">Fecha</th>
                          <th className="text-left p-2.5 font-medium text-muted-foreground">Entrada</th>
                          <th className="text-left p-2.5 font-medium text-muted-foreground">Salida</th>
                          <th className="text-right p-2.5 font-medium text-muted-foreground">Horas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.checkins.map((c) => (
                          <tr key={c.date} className="border-t border-border">
                            <td className="p-2.5 text-foreground font-medium">{c.date}</td>
                            <td className="p-2.5 text-muted-foreground">{c.checkIn}</td>
                            <td className="p-2.5 text-muted-foreground">{c.checkOut}</td>
                            <td className="p-2.5 text-right text-foreground">{c.hours > 0 ? `${c.hours}h` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
