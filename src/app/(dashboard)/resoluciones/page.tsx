"use client"
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertTriangle, UserCheck, CheckCircle2, Plus, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

type ColumnKey = "nuevo" | "en_proceso" | "escalado" | "resuelto";
type Priority = "alta" | "media" | "baja";
type IssueType = "Calidad" | "Entrega" | "Facturación" | "Cantidad" | "Otro";

interface Case {
  id: string;
  client: string;
  issue: string;
  issueType: IssueType;
  agent: string;
  priority: Priority;
  createdAt: Date;
  column: ColumnKey;
}

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

const formatOpen = (d: Date) => {
  const h = Math.floor((now.getTime() - d.getTime()) / 3600000);
  if (h < 1) return `${Math.floor((now.getTime() - d.getTime()) / 60000)}min`;
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
};

const initialCases: Case[] = [
  { id: "RES-040", client: "Hotel San Juan", issue: "Baguettes llegaron frías, cliente solicita reposición", issueType: "Calidad", agent: "Sin asignar", priority: "alta", createdAt: hoursAgo(4), column: "nuevo" },
  { id: "RES-039", client: "Café La Plaza", issue: "Cantidad incorrecta en pedido — faltaron 12 croissants", issueType: "Cantidad", agent: "Sin asignar", priority: "media", createdAt: hoursAgo(60), column: "nuevo" },
  { id: "RES-038", client: "Deli Boricua", issue: "Producto con fecha de expiración cercana recibido", issueType: "Calidad", agent: "Sin asignar", priority: "baja", createdAt: hoursAgo(52), column: "nuevo" },
  { id: "RES-037", client: "Bistro 787", issue: "Entrega tardía de 2 horas — afectó servicio de almuerzo", issueType: "Entrega", agent: "María López", priority: "alta", createdAt: hoursAgo(18), column: "en_proceso" },
  { id: "RES-036", client: "Restaurante El Coquí", issue: "Croissants dañados durante el transporte", issueType: "Calidad", agent: "Carlos Rivera", priority: "media", createdAt: hoursAgo(72), column: "escalado" },
  { id: "RES-035", client: "Panadería Express", issue: "Error en facturación — cobro doble", issueType: "Facturación", agent: "María López", priority: "alta", createdAt: hoursAgo(96), column: "resuelto" },
  { id: "RES-034", client: "Hotel Caribe", issue: "Pan de ajo con sabor inusual — lote investigado", issueType: "Calidad", agent: "Carlos Rivera", priority: "baja", createdAt: hoursAgo(120), column: "resuelto" },
];

const columnMeta: { key: ColumnKey; title: string; accent: string }[] = [
  { key: "nuevo", title: "Nuevo", accent: "bg-warning" },
  { key: "en_proceso", title: "En Proceso", accent: "bg-info" },
  { key: "escalado", title: "Escalado", accent: "bg-destructive" },
  { key: "resuelto", title: "Resuelto", accent: "bg-success" },
];

const priorityColors: Record<Priority, string> = {
  alta: "bg-destructive",
  media: "bg-warning",
  baja: "bg-success",
};

const issueTypes: IssueType[] = ["Calidad", "Entrega", "Facturación", "Cantidad", "Otro"];
const agents = ["María López", "Carlos Rivera", "Ana Torres"];
const clients = ["Hotel San Juan", "Café La Plaza", "Deli Boricua", "Bistro 787", "Restaurante El Coquí", "Panadería Express", "Hotel Caribe"];

const isUrgent = (c: Case) => c.column !== "resuelto" && now.getTime() - c.createdAt.getTime() > 48 * 3600000;

export default function Resoluciones() {
  const [cases, setCases] = useState(initialCases);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAgent, setFilterAgent] = useState("all");
  const [resolveModal, setResolveModal] = useState<Case | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [newModal, setNewModal] = useState(false);
  const [newCase, setNewCase] = useState({ client: "", issueType: "" as IssueType, description: "", agent: "", priority: "" as Priority });

  const filtered = cases.filter((c) => {
    const matchSearch = !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.client.toLowerCase().includes(search.toLowerCase()) || c.issue.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "all" || c.priority === filterPriority;
    const matchAgent = filterAgent === "all" || c.agent === filterAgent;
    return matchSearch && matchPriority && matchAgent;
  });

  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      total: cases.length,
      abiertos: cases.filter((c) => c.column === "nuevo" || c.column === "en_proceso").length,
      escalados: cases.filter((c) => c.column === "escalado").length,
      resueltosHoy: cases.filter((c) => c.column === "resuelto" && c.createdAt >= today).length,
    };
  }, [cases]);

  const handleTake = (id: string) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, column: "en_proceso" as ColumnKey, agent: "Tú" } : c)));
    toast.success("Caso tomado");
  };

  const handleEscalate = (id: string) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, column: "escalado" as ColumnKey } : c)));
    toast.warning("Caso escalado");
  };

  const handleResolve = () => {
    if (resolveNote.trim() && resolveModal) {
      setCases((prev) => prev.map((c) => (c.id === resolveModal.id ? { ...c, column: "resuelto" as ColumnKey } : c)));
      toast.success(`Caso ${resolveModal.id} marcado como resuelto`);
      setResolveModal(null);
      setResolveNote("");
    }
  };

  const handleCreateCase = () => {
    if (!newCase.client || !newCase.issueType || !newCase.description || !newCase.agent || !newCase.priority) {
      toast.error("Completa todos los campos");
      return;
    }
    const id = `RES-${String(cases.length + 34).padStart(3, "0")}`;
    setCases((prev) => [
      { id, client: newCase.client, issue: newCase.description, issueType: newCase.issueType, agent: newCase.agent, priority: newCase.priority, createdAt: new Date(), column: "nuevo" },
      ...prev,
    ]);
    toast.success(`Caso ${id} creado`);
    setNewModal(false);
    setNewCase({ client: "", issueType: "" as IssueType, description: "", agent: "", priority: "" as Priority });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between animate-fade-in">
          <div>
            <h1 className="page-title">Resoluciones</h1>
            <p className="text-sm text-muted-foreground">Seguimiento de quejas y resoluciones de clientes</p>
          </div>
          <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setNewModal(true)}>
            <Plus className="w-4 h-4" /> Nueva Resolución
          </Button>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Total", value: summary.total, cls: "bg-muted text-foreground" },
            { label: "Abiertos", value: summary.abiertos, cls: "bg-warning/15 text-warning" },
            { label: "Escalados", value: summary.escalados, cls: "bg-destructive/15 text-destructive" },
            { label: "Resueltos hoy", value: summary.resueltosHoy, cls: "bg-success/15 text-primary" },
          ].map((s) => (
            <div key={s.label} className={`${s.cls} rounded-full px-4 py-1.5 text-sm font-semibold flex items-center gap-2`}>
              {s.label}: <span className="font-bold">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar caso, cliente o descripción..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Prioridad" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAgent} onValueChange={setFilterAgent}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Agente" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los agentes</SelectItem>
              {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Kanban */}
        <div className="overflow-x-auto -mx-4 px-4 pb-4 md:mx-0 md:px-0">
          <div className="flex gap-4 min-w-[900px] xl:grid xl:grid-cols-4 xl:min-w-0">
            {columnMeta.map((col) => {
              const colCards = filtered.filter((c) => c.column === col.key);
              return (
                <div key={col.key} className="flex-1 min-w-[220px] space-y-3">
                  <div className="flex items-center gap-2 sticky top-0 bg-background py-1 z-10">
                    <div className={`w-3 h-3 rounded-full ${col.accent}`} />
                    <h3 className="font-semibold text-sm">{col.title}</h3>
                    <span className="ml-auto shrink-0 text-xs font-bold bg-muted rounded-full w-6 h-6 flex items-center justify-center">{colCards.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colCards.map((c) => {
                      const urgent = isUrgent(c);
                      return (
                        <Card key={c.id} className={`transition-shadow hover:shadow-md ${urgent ? "border-destructive/70 border-2" : ""}`}>
                          <CardContent className="p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-mono text-muted-foreground">{c.id}</span>
                              <div className="flex items-center gap-1.5">
                                {urgent && (
                                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0 gap-1">
                                    <AlertTriangle className="w-3 h-3" /> +48h
                                  </Badge>
                                )}
                                <div className={`w-2.5 h-2.5 rounded-full ${priorityColors[c.priority]} shrink-0`} title={c.priority} />
                              </div>
                            </div>
                            <p className="font-medium text-sm">{c.client}</p>
                            <Badge variant="outline" className="text-[10px] font-normal">{c.issueType}</Badge>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.issue}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{formatOpen(c.createdAt)} abierto</span>
                              <Badge variant="outline" className="text-[10px]">{c.agent}</Badge>
                            </div>

                            {col.key === "nuevo" && (
                              <Button size="sm" className="w-full gap-2 bg-primary hover:bg-primary/90 active:scale-[0.97] transition-all" onClick={() => handleTake(c.id)}>
                                <UserCheck className="w-4 h-4" /> Tomar caso
                              </Button>
                            )}
                            {col.key === "en_proceso" && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs border-destructive/50 text-destructive hover:bg-destructive/10 active:scale-[0.97]" onClick={() => handleEscalate(c.id)}>
                                  <ArrowUpRight className="w-3.5 h-3.5" /> Escalar
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs border-success/50 text-primary hover:bg-success/10 active:scale-[0.97]" onClick={() => { setResolveModal(c); setResolveNote(""); }}>
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolver
                                </Button>
                              </div>
                            )}
                            {col.key === "escalado" && (
                              <Button size="sm" variant="outline" className="w-full gap-2 border-success/50 text-primary hover:bg-success/10 active:scale-[0.97]" onClick={() => { setResolveModal(c); setResolveNote(""); }}>
                                <CheckCircle2 className="w-4 h-4" /> Marcar resuelta
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                    {colCards.length === 0 && (
                      <div className="border border-dashed rounded-lg p-8 text-center">
                        <CheckCircle2 className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Sin casos</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      <Dialog open={!!resolveModal} onOpenChange={(open) => { if (!open) { setResolveModal(null); setResolveNote(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar como Resuelta</DialogTitle>
            <DialogDescription>{resolveModal?.id} — {resolveModal?.client}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nota de resolución <span className="text-destructive">*</span></label>
              <Textarea placeholder="Describe la resolución aplicada..." value={resolveNote} onChange={(e) => setResolveNote(e.target.value)} rows={4} />
            </div>
            <Button className="w-full bg-success hover:bg-success/90 text-success-foreground" disabled={!resolveNote.trim()} onClick={handleResolve}>Confirmar Resolución</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Case Modal */}
      <Dialog open={newModal} onOpenChange={setNewModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Resolución</DialogTitle>
            <DialogDescription>Registra un nuevo caso de resolución</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Cliente <span className="text-destructive">*</span></label>
              <Select value={newCase.client} onValueChange={(v) => setNewCase((p) => ({ ...p, client: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                <SelectContent>{clients.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tipo <span className="text-destructive">*</span></label>
                <Select value={newCase.issueType} onValueChange={(v) => setNewCase((p) => ({ ...p, issueType: v as IssueType }))}>
                  <SelectTrigger><SelectValue placeholder="Tipo de issue" /></SelectTrigger>
                  <SelectContent>{issueTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Prioridad <span className="text-destructive">*</span></label>
                <Select value={newCase.priority} onValueChange={(v) => setNewCase((p) => ({ ...p, priority: v as Priority }))}>
                  <SelectTrigger><SelectValue placeholder="Prioridad" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">🔴 Alta</SelectItem>
                    <SelectItem value="media">🟡 Media</SelectItem>
                    <SelectItem value="baja">🟢 Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Asignar a <span className="text-destructive">*</span></label>
              <Select value={newCase.agent} onValueChange={(v) => setNewCase((p) => ({ ...p, agent: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar agente" /></SelectTrigger>
                <SelectContent>{agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Descripción <span className="text-destructive">*</span></label>
              <Textarea placeholder="Describe el problema..." value={newCase.description} onChange={(e) => setNewCase((p) => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleCreateCase}>Crear Caso</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
