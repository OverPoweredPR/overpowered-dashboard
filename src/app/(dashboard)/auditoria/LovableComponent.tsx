import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { AlertTriangle, Info, XCircle, ShieldCheck, Play, ChevronDown, Search, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

type Severity = "error" | "warning" | "info";
type AlertStatus = "sin_resolver" | "resuelto" | "ignorado";

interface Alert {
  id: number;
  severity: Severity;
  description: string;
  workflow: string;
  detected: string;
  status: AlertStatus;
  resolvedAt?: string;
}

interface NightRecord {
  date: string;
  errors: number;
  warnings: number;
  totalProducts: number;
  status: "ok" | "warning" | "error";
}

const initialAlerts: Alert[] = [
  { id: 1, severity: "error", description: "Stock cero: Huevos — reabastecimiento requerido", workflow: "WF11", detected: "12 Abr, 11:45 AM", status: "sin_resolver" },
  { id: 2, severity: "error", description: "Stock cero: Crema — reabastecimiento requerido", workflow: "WF11", detected: "12 Abr, 11:30 AM", status: "sin_resolver" },
  { id: 3, severity: "error", description: "Fallo sincronización Clover POS (timeout)", workflow: "WF7", detected: "12 Abr, 10:00 AM", status: "sin_resolver" },
  { id: 4, severity: "warning", description: "Pago ORD-398 vencido +24h — Café La Plaza ($178.50)", workflow: "WF3", detected: "12 Abr, 9:30 AM", status: "sin_resolver" },
  { id: 5, severity: "warning", description: "Discrepancia inventario: Levadura (Shopify 12 vs Airtable 8)", workflow: "WF11", detected: "12 Abr, 6:30 AM", status: "sin_resolver" },
  { id: 6, severity: "warning", description: "Precio de mantequilla aumentó 8% vs último pedido", workflow: "WF3", detected: "11 Abr, 4:15 PM", status: "sin_resolver" },
  { id: 7, severity: "info", description: "Reconciliación nocturna completada — 2 warnings", workflow: "WF11", detected: "12 Abr, 12:00 AM", status: "sin_resolver" },
  { id: 8, severity: "info", description: "Orden ORD-401 creada — Hotel San Juan ($520)", workflow: "WF3", detected: "12 Abr, 8:00 AM", status: "sin_resolver" },
  { id: 9, severity: "info", description: "Backup de datos completado exitosamente", workflow: "WF7", detected: "12 Abr, 3:00 AM", status: "sin_resolver" },
];

const nightHistory: NightRecord[] = [
  { date: "2026-04-12", errors: 0, warnings: 2, totalProducts: 48, status: "warning" },
  { date: "2026-04-11", errors: 1, warnings: 3, totalProducts: 48, status: "error" },
  { date: "2026-04-10", errors: 0, warnings: 1, totalProducts: 47, status: "warning" },
  { date: "2026-04-09", errors: 2, warnings: 4, totalProducts: 48, status: "error" },
  { date: "2026-04-08", errors: 0, warnings: 0, totalProducts: 48, status: "ok" },
  { date: "2026-04-07", errors: 0, warnings: 1, totalProducts: 46, status: "warning" },
  { date: "2026-04-06", errors: 1, warnings: 2, totalProducts: 48, status: "error" },
];

const severityDot: Record<Severity, string> = {
  error: "bg-destructive",
  warning: "bg-warning",
  info: "bg-info",
};

const statusBadgeStyle: Record<AlertStatus, string> = {
  sin_resolver: "bg-destructive/10 text-destructive border-destructive/30",
  resuelto: "bg-success/10 text-success border-success/30",
  ignorado: "bg-muted text-muted-foreground border-border",
};

const statusLabel: Record<AlertStatus, string> = {
  sin_resolver: "Sin resolver",
  resuelto: "Resuelto",
  ignorado: "Ignorado",
};

const wfColors: Record<string, string> = {
  WF11: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  WF3: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  WF7: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const nightStatusIcon: Record<string, string> = { ok: "✅", warning: "⚠️", error: "❌" };

const severityOrder: Record<Severity, number> = { error: 0, warning: 1, info: 2 };

export default function Auditoria() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterWorkflow, setFilterWorkflow] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  const filtered = alerts
    .filter((a) => filterSeverity === "all" || a.severity === filterSeverity)
    .filter((a) => filterWorkflow === "all" || a.workflow === filterWorkflow)
    .filter((a) => !search || a.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const totalCount = alerts.length;
  const errorCount = alerts.filter((a) => a.severity === "error").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const resolvedCount = alerts.filter((a) => a.status === "resuelto").length;

  const handleResolve = (id: number) => {
    const now = new Date().toLocaleString("es-PR", { hour: "2-digit", minute: "2-digit", hour12: true, day: "2-digit", month: "short" });
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "resuelto" as AlertStatus, resolvedAt: now } : a));
    toast.success("Hallazgo marcado como resuelto");
  };

  const handleIgnore = (id: number) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "ignorado" as AlertStatus } : a));
    toast("Hallazgo ignorado", { icon: "🔇" });
  };

  const handleRunAudit = () => {
    if (pin.length === 6) {
      setPinOpen(false);
      setPin("");
      toast.success("Auditoría ejecutada exitosamente");
    }
  };

  const workflows = [...new Set(alerts.map((a) => a.workflow))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold">Auditoría</h1>
            <p className="text-sm text-muted-foreground">Monitoreo del sistema y hallazgos</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-xs gap-1.5 py-1">
              <Clock className="w-3 h-3" /> Última auditoría: hoy 1:05 AM
            </Badge>
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 active:scale-95 transition-all" onClick={() => { setPinOpen(true); setPin(""); }}>
              <Play className="w-3.5 h-3.5" /> Ejecutar Ahora
            </Button>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2 animate-fade-in">
          <Badge variant="outline" className="bg-muted/60 text-foreground gap-1.5 py-1.5 px-3 text-xs">
            Total Hallazgos: <span className="font-bold">{totalCount}</span>
          </Badge>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1.5 py-1.5 px-3 text-xs">
            <XCircle className="w-3.5 h-3.5" /> Errores: <span className="font-bold">{errorCount}</span>
          </Badge>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1.5 py-1.5 px-3 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" /> Warnings: <span className="font-bold">{warningCount}</span>
          </Badge>
          <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1.5 py-1.5 px-3 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resueltos: <span className="font-bold">{resolvedCount}</span>
          </Badge>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Severidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterWorkflow} onValueChange={setFilterWorkflow}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Workflow" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {workflows.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar hallazgo..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Main table */}
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<ShieldCheck className="w-7 h-7 text-success" />} title="Sistema OK" description="No hay hallazgos que coincidan con los filtros." />
        ) : (
          <Card className="overflow-hidden animate-fade-in">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold text-muted-foreground">Severidad</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Workflow</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Descripción</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Detectado</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Estado</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.id} className={`border-b last:border-0 transition-colors ${a.status === "ignorado" ? "opacity-50" : "hover:bg-muted/30"}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${severityDot[a.severity]}`} />
                            <span className="capitalize text-xs font-medium">{a.severity === "error" ? "Error" : a.severity === "warning" ? "Warning" : "Info"}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${wfColors[a.workflow] || ""}`}>
                            {a.workflow}
                          </Badge>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="text-sm truncate">{a.description}</p>
                          {a.resolvedAt && <p className="text-[10px] text-muted-foreground mt-0.5">Resuelto: {a.resolvedAt}</p>}
                        </td>
                        <td className="p-4 text-muted-foreground text-xs hidden md:table-cell">{a.detected}</td>
                        <td className="p-4">
                          <Badge variant="outline" className={`text-[10px] ${statusBadgeStyle[a.status]}`}>
                            {statusLabel[a.status]}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {a.status === "sin_resolver" && (
                            <div className="flex gap-1.5">
                              <Button variant="outline" size="sm" className="text-xs h-7 px-2 hover:bg-success/10 hover:text-success active:scale-95 transition-all" onClick={() => handleResolve(a.id)}>
                                Resolver
                              </Button>
                              <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground active:scale-95 transition-all" onClick={() => handleIgnore(a.id)}>
                                Ignorar
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reconciliation history */}
        <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Historial de Reconciliación (últimas 7 noches)
                  <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${historyOpen ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 font-semibold text-muted-foreground">Fecha</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Errores</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Warnings</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Total Productos</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nightHistory.map((r) => (
                        <tr key={r.date} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-mono text-xs">{r.date}</td>
                          <td className="p-4">
                            {r.errors > 0 ? <Badge variant="destructive" className="text-xs">{r.errors}</Badge> : <span className="text-muted-foreground">0</span>}
                          </td>
                          <td className="p-4">
                            {r.warnings > 0 ? <Badge variant="outline" className="text-xs bg-warning/15 text-warning border-warning/30">{r.warnings}</Badge> : <span className="text-muted-foreground">0</span>}
                          </td>
                          <td className="p-4 text-muted-foreground">{r.totalProducts}</td>
                          <td className="p-4 text-base">{nightStatusIcon[r.status]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* PIN Modal */}
      <Dialog open={pinOpen} onOpenChange={(open) => { if (!open) setPinOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ejecutar Auditoría</DialogTitle>
            <DialogDescription>Ingresa el PIN de 6 dígitos para iniciar la auditoría manual</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <InputOTP maxLength={6} value={pin} onChange={setPin} onComplete={handleRunAudit}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button className="w-full bg-primary hover:bg-primary/90 active:scale-95 transition-all" disabled={pin.length < 6} onClick={handleRunAudit}>
              Ejecutar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
