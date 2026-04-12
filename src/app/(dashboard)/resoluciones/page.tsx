import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertTriangle, UserCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type ColumnKey = "abierta" | "en_proceso" | "resuelta";

interface Case {
  id: string;
  client: string;
  issue: string;
  agent: string;
  createdAt: Date;
  column: ColumnKey;
}

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

const formatOpen = (d: Date) => {
  const h = Math.floor((now.getTime() - d.getTime()) / 3600000);
  if (h < 24) return `${h}h abierto`;
  return `${Math.floor(h / 24)}d ${h % 24}h abierto`;
};

const initialCases: Case[] = [
  { id: "RES-040", client: "Hotel San Juan", issue: "Baguettes llegaron frías, cliente solicita reposición", agent: "Sin asignar", createdAt: hoursAgo(4), column: "abierta" },
  { id: "RES-039", client: "Café La Plaza", issue: "Cantidad incorrecta en pedido — faltaron 12 croissants", agent: "Sin asignar", createdAt: hoursAgo(60), column: "abierta" },
  { id: "RES-038", client: "Deli Boricua", issue: "Producto con fecha de expiración cercana recibido", agent: "Sin asignar", createdAt: hoursAgo(52), column: "abierta" },
  { id: "RES-037", client: "Bistro 787", issue: "Entrega tardía de 2 horas — afectó servicio de almuerzo", agent: "María López", createdAt: hoursAgo(18), column: "en_proceso" },
  { id: "RES-036", client: "Restaurante El Coquí", issue: "Croissants dañados durante el transporte", agent: "Carlos Rivera", createdAt: hoursAgo(72), column: "en_proceso" },
  { id: "RES-035", client: "Panadería Express", issue: "Error en facturación — cobro doble", agent: "María López", createdAt: hoursAgo(96), column: "resuelta" },
  { id: "RES-034", client: "Hotel Caribe", issue: "Pan de ajo con sabor inusual — lote investigado", agent: "Carlos Rivera", createdAt: hoursAgo(120), column: "resuelta" },
];

const columnMeta: { key: ColumnKey; title: string; accent: string }[] = [
  { key: "abierta", title: "Abierta", accent: "bg-warning" },
  { key: "en_proceso", title: "En Proceso", accent: "bg-info" },
  { key: "resuelta", title: "Resuelta", accent: "bg-success" },
];

const isUrgent = (c: Case) => c.column !== "resuelta" && now.getTime() - c.createdAt.getTime() > 48 * 3600000;

export default function Resoluciones() {
  const [cases, setCases] = useState(initialCases);
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [resolveModal, setResolveModal] = useState<Case | null>(null);
  const [resolveNote, setResolveNote] = useState("");

  const clients = [...new Set(initialCases.map((c) => c.client))];

  const filtered = cases.filter((c) => {
    const matchSearch = !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.client.toLowerCase().includes(search.toLowerCase()) || c.issue.toLowerCase().includes(search.toLowerCase());
    const matchClient = filterClient === "all" || c.client === filterClient;
    const matchStatus = filterStatus === "all" || c.column === filterStatus;
    return matchSearch && matchClient && matchStatus;
  });

  const handleTake = (id: string) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, column: "en_proceso" as ColumnKey, agent: "Tú" } : c)));
    toast.success("Caso tomado");
  };

  const handleResolve = () => {
    if (resolveNote.trim() && resolveModal) {
      setCases((prev) => prev.map((c) => (c.id === resolveModal.id ? { ...c, column: "resuelta" as ColumnKey } : c)));
      toast.success(`Caso ${resolveModal.id} marcado como resuelto`);
      setResolveModal(null);
      setResolveNote("");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Resoluciones</h1>
          <p className="text-sm text-muted-foreground">Seguimiento de quejas y resoluciones de clientes</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar caso, cliente o descripción..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Cliente" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clients.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {columnMeta.map((col) => <SelectItem key={col.key} value={col.key}>{col.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Kanban */}
        <div className="overflow-x-auto -mx-4 px-4 pb-4 md:mx-0 md:px-0">
          <div className="flex gap-4 min-w-[750px] xl:grid xl:grid-cols-3 xl:min-w-0">
            {columnMeta.map((col) => {
              const colCards = filtered.filter((c) => c.column === col.key);
              return (
                <div key={col.key} className="flex-1 min-w-[240px] space-y-3">
                  <div className="flex items-center gap-2 sticky top-0 bg-background py-1 z-10">
                    <div className={`w-3 h-3 rounded-full ${col.accent}`} />
                    <h3 className="font-semibold text-sm">{col.title}</h3>
                    <span className="ml-auto shrink-0 text-xs font-bold bg-muted rounded-full w-6 h-6 flex items-center justify-center">
                      {colCards.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {colCards.map((c) => {
                      const urgent = isUrgent(c);
                      return (
                        <Card key={c.id} className={`transition-shadow hover:shadow-md ${urgent ? "border-destructive/70 border-2" : ""}`}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-mono text-muted-foreground">{c.id}</span>
                              {urgent && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0 gap-1">
                                  <AlertTriangle className="w-3 h-3" /> +48h
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium text-sm">{c.client}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{c.issue}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{formatOpen(c.createdAt)}</span>
                              <Badge variant="outline" className="text-[10px]">{c.agent}</Badge>
                            </div>

                            {col.key === "abierta" && (
                              <Button size="sm" className="w-full gap-2 bg-primary hover:bg-primary/90" onClick={() => handleTake(c.id)}>
                                <UserCheck className="w-4 h-4" /> Tomar caso
                              </Button>
                            )}
                            {col.key === "en_proceso" && (
                              <Button size="sm" variant="outline" className="w-full gap-2 border-success/50 text-success hover:bg-success/10" onClick={() => { setResolveModal(c); setResolveNote(""); }}>
                                <CheckCircle2 className="w-4 h-4" /> Marcar resuelta
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                    {colCards.length === 0 && (
                      <div className="border border-dashed rounded-lg p-6 text-center text-xs text-muted-foreground">Sin casos</div>
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
            <DialogDescription>
              {resolveModal?.id} — {resolveModal?.client}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nota de resolución <span className="text-destructive">*</span></label>
              <Textarea
                placeholder="Describe la resolución aplicada..."
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                rows={4}
              />
            </div>
            <Button className="w-full bg-success hover:bg-success/90 text-success-foreground" disabled={!resolveNote.trim()} onClick={handleResolve}>
              Confirmar Resolución
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
