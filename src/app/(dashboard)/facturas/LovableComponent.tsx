import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { FileText, Search, Eye, Send, Download, CalendarIcon, DollarSign, AlertTriangle, Mail, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type DocType = "factura" | "recibo" | "estado_cuenta" | "aviso_cobro";
type DocStatus = "enviada" | "vista" | "pendiente" | "vencida";

interface Invoice {
  id: string;
  client: string;
  email: string;
  type: DocType;
  amount: number;
  date: string;
  status: DocStatus;
}

const typeLabel: Record<DocType, string> = { factura: "Factura", recibo: "Recibo", estado_cuenta: "Estado de Cuenta", aviso_cobro: "Aviso de Cobro" };
const typeStyle: Record<DocType, string> = {
  factura: "bg-info/10 text-info border-info/30",
  recibo: "bg-success/10 text-success border-success/30",
  estado_cuenta: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  aviso_cobro: "bg-warning/10 text-warning border-warning/30",
};
const statusStyle: Record<DocStatus, string> = {
  enviada: "bg-info/10 text-info border-info/30",
  vista: "bg-success/10 text-success border-success/30",
  pendiente: "bg-warning/10 text-warning border-warning/30",
  vencida: "bg-destructive/10 text-destructive border-destructive/30",
};
const statusLabel: Record<DocStatus, string> = { enviada: "Enviada", vista: "Vista", pendiente: "Pendiente", vencida: "Vencida" };

const initialInvoices: Invoice[] = [
  { id: "INV-450", client: "Hotel San Juan", email: "cuentas@hotelsanjuan.com", type: "factura", amount: 520, date: "2026-04-10", status: "pendiente" },
  { id: "INV-449", client: "Restaurante El Coquí", email: "pagos@elcoqui.com", type: "factura", amount: 245, date: "2026-04-08", status: "vencida" },
  { id: "REC-112", client: "Café La Plaza", email: "admin@cafelaplaza.com", type: "recibo", amount: 178.50, date: "2026-04-05", status: "vista" },
  { id: "INV-447", client: "Deli Boricua", email: "contabilidad@deliboricua.com", type: "factura", amount: 350, date: "2026-04-03", status: "vencida" },
  { id: "STMT-030", client: "Bistro 787", email: "finance@bistro787.com", type: "estado_cuenta", amount: 1420, date: "2026-04-01", status: "enviada" },
  { id: "COL-015", client: "Restaurante El Coquí", email: "pagos@elcoqui.com", type: "aviso_cobro", amount: 595, date: "2026-04-11", status: "enviada" },
  { id: "REC-111", client: "Panadería Express", email: "info@panaderiaexpress.com", type: "recibo", amount: 198, date: "2026-03-28", status: "vista" },
  { id: "INV-446", client: "Bistro 787", email: "finance@bistro787.com", type: "factura", amount: 420, date: "2026-03-28", status: "enviada" },
  { id: "COL-014", client: "Deli Boricua", email: "contabilidad@deliboricua.com", type: "aviso_cobro", amount: 350, date: "2026-04-12", status: "pendiente" },
  { id: "STMT-029", client: "Hotel San Juan", email: "cuentas@hotelsanjuan.com", type: "estado_cuenta", amount: 2340, date: "2026-03-31", status: "vista" },
];

const tabFilters: { value: string; label: string; type?: DocType }[] = [
  { value: "todas", label: "Todas" },
  { value: "factura", label: "Facturas", type: "factura" },
  { value: "recibo", label: "Recibos", type: "recibo" },
  { value: "estado_cuenta", label: "Estados de Cuenta", type: "estado_cuenta" },
  { value: "aviso_cobro", label: "Avisos de Cobro", type: "aviso_cobro" },
];

export default function Facturas() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("todas");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Modals
  const [previewDoc, setPreviewDoc] = useState<Invoice | null>(null);
  const [resendDoc, setResendDoc] = useState<Invoice | null>(null);
  const [resendEmail, setResendEmail] = useState("");

  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  const filtered = initialInvoices
    .filter((inv) => tab === "todas" || inv.type === tab)
    .filter((inv) => statusFilter === "all" || inv.status === statusFilter)
    .filter((inv) => !search || inv.id.toLowerCase().includes(search.toLowerCase()) || inv.client.toLowerCase().includes(search.toLowerCase()))
    .filter((inv) => {
      if (dateFrom && new Date(inv.date) < dateFrom) return false;
      if (dateTo && new Date(inv.date) > dateTo) return false;
      return true;
    });

  const totalFacturado = initialInvoices.reduce((s, i) => s + i.amount, 0);
  const pendienteCobro = initialInvoices.filter((i) => i.status === "pendiente").reduce((s, i) => s + i.amount, 0);
  const vencidasTotal = initialInvoices.filter((i) => i.status === "vencida").reduce((s, i) => s + i.amount, 0);
  const enviadasHoy = initialInvoices.filter((i) => i.date === "2026-04-12").length;

  const openResend = (inv: Invoice) => {
    setResendDoc(inv);
    setResendEmail(inv.email);
  };

  const confirmResend = () => {
    if (!resendDoc || !resendEmail) return;
    toast.success(`${resendDoc.id} reenviada a ${resendEmail}`);
    setResendDoc(null);
  };

  const stats = [
    { label: "Total Facturado", value: `$${totalFacturado.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-foreground" },
    { label: "Pendiente Cobro", value: `$${pendienteCobro.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: Clock, color: "text-warning" },
    { label: "Vencidas", value: `$${vencidasTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: AlertTriangle, color: "text-destructive" },
    { label: "Enviadas Hoy", value: enviadasHoy.toString(), icon: Mail, color: "text-info" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold">Facturas & Recibos</h1>
          <p className="text-sm text-muted-foreground">Documentos de facturación, recibos y cobranzas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
          {stats.map((s, i) => (
            <Card key={s.label} className="hover:shadow-md transition-all" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="animate-fade-in">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            {tabFilters.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs whitespace-nowrap">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por ID o cliente..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("text-xs gap-1.5 h-9", !dateFrom && "text-muted-foreground")}>
                <CalendarIcon className="w-3.5 h-3.5" />
                {dateFrom ? format(dateFrom, "dd/MM/yy") : "Desde"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("text-xs gap-1.5 h-9", !dateTo && "text-muted-foreground")}>
                <CalendarIcon className="w-3.5 h-3.5" />
                {dateTo ? format(dateTo, "dd/MM/yy") : "Hasta"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={setDateTo} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 h-9">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="enviada">Enviada</SelectItem>
              <SelectItem value="vista">Vista</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="vencida">Vencida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-7 h-7 text-muted-foreground" />}
            title={tab === "todas" ? "Sin documentos" : `Sin ${tabFilters.find((t) => t.value === tab)?.label.toLowerCase()}`}
            description="No se encontraron documentos con los filtros seleccionados."
          />
        ) : (
          <Card className="overflow-hidden animate-fade-in">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold text-muted-foreground">ID</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Cliente</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Tipo</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Monto</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Fecha</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Estado</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv) => (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-semibold font-mono text-xs">{inv.id}</td>
                        <td className="p-4">{inv.client}</td>
                        <td className="p-4 hidden sm:table-cell">
                          <Badge variant="outline" className={`text-[10px] ${typeStyle[inv.type]}`}>
                            {typeLabel[inv.type]}
                          </Badge>
                        </td>
                        <td className="p-4 font-semibold">${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">{inv.date}</td>
                        <td className="p-4">
                          <Badge variant="outline" className={`text-[10px] ${statusStyle[inv.status]}`}>
                            {statusLabel[inv.status]}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1.5">
                            <Button variant="outline" size="sm" className="text-xs h-7 px-2 active:scale-95 transition-all" onClick={() => setPreviewDoc(inv)}>
                              <Eye className="w-3.5 h-3.5 mr-1" /> Ver PDF
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs h-7 px-2 active:scale-95 transition-all" onClick={() => openResend(inv)}>
                              <Send className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* PDF Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => { if (!open) setPreviewDoc(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Vista previa — {previewDoc?.id}</DialogTitle>
            <DialogDescription>{previewDoc?.client} · ${previewDoc?.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</DialogDescription>
          </DialogHeader>
          <div className="bg-muted/30 rounded-lg flex items-center justify-center" style={{ minHeight: 400 }}>
            <div className="text-center space-y-3 p-8">
              <div className="w-16 h-16 mx-auto rounded-xl bg-muted flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Vista previa del documento</p>
              <p className="text-xs text-muted-foreground">
                {typeLabel[previewDoc?.type || "factura"]} #{previewDoc?.id}<br />
                Emitida: {previewDoc?.date}<br />
                Monto: ${previewDoc?.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <Button className="w-full gap-2 bg-primary hover:bg-primary/90 active:scale-95 transition-all">
            <Download className="w-4 h-4" /> Descargar PDF
          </Button>
        </DialogContent>
      </Dialog>

      {/* Resend Modal */}
      <Dialog open={!!resendDoc} onOpenChange={(open) => { if (!open) setResendDoc(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reenviar {resendDoc?.id}</DialogTitle>
            <DialogDescription>Enviar copia del documento al cliente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Correo electrónico</label>
              <Input type="email" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} />
            </div>
            <div className="p-3 rounded-lg bg-muted/30 text-xs space-y-1">
              <p><span className="text-muted-foreground">Documento:</span> {resendDoc?.id}</p>
              <p><span className="text-muted-foreground">Cliente:</span> {resendDoc?.client}</p>
              <p><span className="text-muted-foreground">Monto:</span> ${resendDoc?.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
            <Button className="w-full gap-2 bg-primary hover:bg-primary/90 active:scale-95 transition-all" onClick={confirmResend}>
              <Send className="w-4 h-4" /> Enviar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
