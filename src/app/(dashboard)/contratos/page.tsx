"use client"
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Plus, FileText, Calendar, DollarSign, Clock, Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ContractType = "Mensual" | "Trimestral" | "Anual" | "Spot";
type ContractStatus = "Activo" | "Por vencer" | "Vencido" | "Borrador";

interface Contract {
  id: number;
  client: string;
  type: ContractType;
  start: string;
  end: string;
  value: number;
  status: ContractStatus;
  notes: string;
}

const today = new Date();
const diffDays = (d: string) => Math.ceil((new Date(d).getTime() - today.getTime()) / 86400000);
const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

const contracts: Contract[] = [
  { id: 1, client: "Supermercado Pueblo", type: "Anual", start: "2025-07-01", end: "2026-06-30", value: 156000, status: "Activo", notes: "Entrega diaria 6AM. Incluye pan sobao, baguette, mallorca." },
  { id: 2, client: "Hotel Miramar", type: "Trimestral", start: "2026-03-01", end: "2026-05-31", value: 45800, status: "Activo", notes: "Desayuno buffet L-D. Croissants y panes variados." },
  { id: 3, client: "Café Central", type: "Mensual", start: "2026-04-01", end: "2026-04-30", value: 4200, status: "Por vencer", notes: "Reposición semanal martes y viernes." },
  { id: 4, client: "Restaurante El Fogón", type: "Anual", start: "2025-05-01", end: "2026-04-30", value: 62400, status: "Por vencer", notes: "Pan de agua y baguette para servicio de cena." },
  { id: 5, client: "Panadería Don Juan", type: "Spot", start: "2026-04-10", end: "2026-04-20", value: 2400, status: "Activo", notes: "Pedido especial para evento corporativo." },
  { id: 6, client: "Club Náutico", type: "Trimestral", start: "2026-01-01", end: "2026-03-31", value: 18600, status: "Vencido", notes: "Brunch dominical. Pendiente renovación." },
  { id: 7, client: "Bistro 787", type: "Mensual", start: "2026-02-01", end: "2026-02-28", value: 3200, status: "Vencido", notes: "No renovó. Evaluar oferta especial." },
  { id: 8, client: "Hotel Condado", type: "Anual", start: "2026-05-01", end: "2027-04-30", value: 180000, status: "Borrador", notes: "Propuesta enviada 04/12. Esperando aprobación." },
];

const statusStyle: Record<ContractStatus, string> = {
  Activo: "bg-primary/15 text-primary",
  "Por vencer": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Vencido: "bg-destructive/15 text-destructive",
  Borrador: "bg-muted text-muted-foreground",
};

const typeStyle: Record<ContractType, string> = {
  Mensual: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Trimestral: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  Anual: "bg-primary/15 text-primary",
  Spot: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

const totalContracts = contracts.length;
const activeCount = contracts.filter((c) => c.status === "Activo").length;
const expiringCount = contracts.filter((c) => c.status === "Por vencer").length;
const expiredCount = contracts.filter((c) => c.status === "Vencido").length;

const kpis = [
  { label: "Total Contratos", value: totalContracts, icon: FileText },
  { label: "Activos", value: activeCount, icon: Clock },
  { label: "Por vencer (30d)", value: expiringCount, icon: Calendar },
  { label: "Vencidos", value: expiredCount, icon: DollarSign },
];

const types: ContractType[] = ["Mensual", "Trimestral", "Anual", "Spot"];

export default function Contratos() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [detail, setDetail] = useState<Contract | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newClient, setNewClient] = useState("");
  const [newType, setNewType] = useState<ContractType>("Mensual");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newValue, setNewValue] = useState("");

  const filtered = contracts.filter((c) =>
    c.client.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === "Todos" || c.status === statusFilter)
  );

  const expiringSoon = contracts.filter((c) => c.status === "Por vencer");

  const handleCreate = () => {
    if (!newClient.trim() || !newStart || !newEnd) { toast.error("Completa los campos requeridos"); return; }
    toast.success(`Contrato para ${newClient} creado`);
    setModalOpen(false);
    setNewClient(""); setNewStart(""); setNewEnd(""); setNewValue("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Contratos & Acuerdos</h1>
          <Button className="gap-1.5" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Nuevo Contrato
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <k.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Expiring Soon */}
        {expiringSoon.length > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <h2 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Por Vencer — Próximos 30 días
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {expiringSoon.map((c) => (
                <div key={c.id} className="rounded-lg border border-amber-500/20 bg-background p-3">
                  <p className="text-sm font-semibold text-foreground">{c.client}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Vence: {c.end} ({diffDays(c.end)}d)</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setDetail(c)}>Ver detalle</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-primary border-primary/30" onClick={() => toast.success(`Renovación de ${c.client} iniciada`)}>
                      <RefreshCw className="h-3 w-3" /> Renovar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Todos", "Activo", "Por vencer", "Vencido", "Borrador"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.client}</p>
                    <div className="flex gap-1.5 mt-1">
                      <Badge className={cn("border-0 text-[10px]", typeStyle[c.type])}>{c.type}</Badge>
                      <Badge className={cn("border-0 text-[10px]", statusStyle[c.status])}>{c.status}</Badge>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-foreground">{fmt(c.value)}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {c.start} → {c.end}
                  {c.status !== "Vencido" && c.status !== "Borrador" && (
                    <span className="ml-auto font-medium">{diffDays(c.end)}d restantes</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => setDetail(c)}>Ver detalle</Button>
                  {(c.status === "Por vencer" || c.status === "Vencido") && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-primary border-primary/30" onClick={() => toast.success(`Renovación de ${c.client} iniciada`)}>
                      <RefreshCw className="h-3 w-3" /> Renovar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Drawer */}
        <Sheet open={!!detail} onOpenChange={() => setDetail(null)}>
          <SheetContent className="overflow-y-auto">
            {detail && (
              <>
                <SheetHeader>
                  <SheetTitle>{detail.client}</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div className="flex gap-2">
                    <Badge className={cn("border-0", typeStyle[detail.type])}>{detail.type}</Badge>
                    <Badge className={cn("border-0", statusStyle[detail.status])}>{detail.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Inicio</p><p className="text-sm font-medium text-foreground">{detail.start}</p></div>
                    <div><p className="text-xs text-muted-foreground">Fin</p><p className="text-sm font-medium text-foreground">{detail.end}</p></div>
                    <div><p className="text-xs text-muted-foreground">Valor</p><p className="text-sm font-bold text-foreground">{fmt(detail.value)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Días restantes</p><p className="text-sm font-medium text-foreground">{diffDays(detail.end)}</p></div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notas</p>
                    <p className="text-sm text-foreground">{detail.notes}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 gap-1.5" onClick={() => toast.success("Renovación iniciada")}>
                      <RefreshCw className="h-4 w-4" /> Renovar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* New Contract Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Contrato</DialogTitle>
              <DialogDescription>Registra un nuevo contrato o acuerdo</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5"><Label>Cliente</Label><Input value={newClient} onChange={(e) => setNewClient(e.target.value)} placeholder="Nombre del cliente" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={newType} onValueChange={(v) => setNewType(v as ContractType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Valor ($)</Label><Input type="number" value={newValue} onChange={(e) => setNewValue(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Desde</Label><Input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Hasta</Label><Input type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Crear Contrato</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
