import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { FileText, Search, Eye, Send, Download, CalendarIcon, DollarSign, AlertTriangle, Mail, Clock, TrendingUp, TrendingDown, CheckCheck } from "lucide-react";
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
  dueDate: string;
  status: DocStatus;
  items?: { desc: string; qty: number; price: number }[];
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

const now = new Date("2026-04-14");

const initialInvoices: Invoice[] = [
  { id: "INV-450", client: "Hotel San Juan", email: "cuentas@hotelsanjuan.com", type: "factura", amount: 520, date: "2026-04-10", dueDate: "2026-04-20", status: "pendiente", items: [{ desc: "Baguettes artesanales x50", qty: 50, price: 5.20 }, { desc: "Croissants mantequilla x30", qty: 30, price: 4.00 }, { desc: "Pan de ajo x20", qty: 20, price: 6.00 }] },
  { id: "INV-449", client: "Restaurante El Coquí", email: "pagos@elcoqui.com", type: "factura", amount: 245, date: "2026-04-08", dueDate: "2026-03-10", status: "vencida", items: [{ desc: "Baguettes clásicas x30", qty: 30, price: 4.50 }, { desc: "Pan integral x20", qty: 20, price: 5.50 }] },
  { id: "REC-112", client: "Café La Plaza", email: "admin@cafelaplaza.com", type: "recibo", amount: 178.50, date: "2026-04-05", dueDate: "2026-04-15", status: "vista", items: [{ desc: "Croissants surtidos x25", qty: 25, price: 3.50 }, { desc: "Pan de queso x15", qty: 15, price: 6.10 }] },
  { id: "INV-447", client: "Deli Boricua", email: "contabilidad@deliboricua.com", type: "factura", amount: 350, date: "2026-04-03", dueDate: "2026-03-01", status: "vencida", items: [{ desc: "Baguettes premium x40", qty: 40, price: 6.25 }, { desc: "Pan rústico x10", qty: 10, price: 10.00 }] },
  { id: "STMT-030", client: "Bistro 787", email: "finance@bistro787.com", type: "estado_cuenta", amount: 1420, date: "2026-04-01", dueDate: "2026-04-30", status: "enviada", items: [{ desc: "Pedido semanal — Semana 13", qty: 1, price: 710 }, { desc: "Pedido semanal — Semana 14", qty: 1, price: 710 }] },
  { id: "COL-015", client: "Restaurante El Coquí", email: "pagos@elcoqui.com", type: "aviso_cobro", amount: 595, date: "2026-04-11", dueDate: "2026-04-18", status: "enviada", items: [{ desc: "Balance pendiente — INV-449", qty: 1, price: 245 }, { desc: "Balance pendiente — INV-443", qty: 1, price: 350 }] },
  { id: "REC-111", client: "Panadería Express", email: "info@panaderiaexpress.com", type: "recibo", amount: 198, date: "2026-03-28", dueDate: "2026-04-10", status: "vista", items: [{ desc: "Pan francés x60", qty: 60, price: 3.30 }] },
  { id: "INV-446", client: "Bistro 787", email: "finance@bistro787.com", type: "factura", amount: 420, date: "2026-03-28", dueDate: "2026-04-12", status: "enviada", items: [{ desc: "Baguettes artesanales x40", qty: 40, price: 5.20 }, { desc: "Focaccia x20", qty: 20, price: 10.60 }] },
  { id: "COL-014", client: "Deli Boricua", email: "contabilidad@deliboricua.com", type: "aviso_cobro", amount: 350, date: "2026-04-12", dueDate: "2026-04-19", status: "pendiente", items: [{ desc: "Balance pendiente — INV-447", qty: 1, price: 350 }] },
  { id: "STMT-029", client: "Hotel San Juan", email: "cuentas@hotelsanjuan.com", type: "estado_cuenta", amount: 2340, date: "2026-03-31", dueDate: "2026-04-30", status: "vista", items: [{ desc: "Resumen mensual — Marzo 2026", qty: 1, price: 2340 }] },
];

const tabFilters: { value: string; label: string; type?: DocType }[] = [
  { value: "todas", label: "Todas" },
  { value: "factura", label: "Facturas", type: "factura" },
  { value: "recibo", label: "Recibos", type: "recibo" },
  { value: "estado_cuenta", label: "Estados de Cuenta", type: "estado_cuenta" },
  { value: "aviso_cobro", label: "Avisos de Cobro", type: "aviso_cobro" },
];

function getDaysOverdue(inv: Invoice): number | null {
  if (inv.status !== "vencida") return null;
  const due = new Date(inv.dueDate);
  const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

export default function Facturas() {
  const [loading, setLoading] = useState(true);
  const [invoices] = useState(initialInvoices);
  const [tab, setTab] = useState("todas");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Modals
  const [previewDoc, setPreviewDoc] = useState<Invoice | null>(null);
  const [resendDoc, setResendDoc] = useState<Invoice | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendCC, setResendCC] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  const filtered = useMemo(() => invoices
    .filter((inv) => tab === "todas" || inv.type === tab)
    .filter((inv) => statusFilter === "all" || inv.status === statusFilter)
    .filter((inv) => !search || inv.id.toLowerCase().includes(search.toLowerCase()) || inv.client.toLowerCase().includes(search.toLowerCase()))
    .filter((inv) => {
      if (dateFrom && new Date(inv.date) < dateFrom) return false;
      if (dateTo && new Date(inv.date) > dateTo) return false;
      return true;
    }), [invoices, tab, statusFilter, search, dateFrom, dateTo]);

  const kpi = useMemo(() => {
    const total = invoices.reduce((s, i) => s + i.amount, 0);
    const cobrado = invoices.filter((i) => i.status === "vista").reduce((s, i) => s + i.amount, 0);
    const pendiente = invoices.filter((i) => i.status === "pendiente" || i.status === "enviada").reduce((s, i) => s + i.amount, 0);
    const vencido = invoices.filter((i) => i.status === "vencida").reduce((s, i) => s + i.amount, 0);
    return { total, cobrado, pendiente, vencido };
  }, [invoices]);

  const stats = [
    { label: "Total Facturado", value: kpi.total, icon: DollarSign, color: "text-foreground", trend: 12 },
    { label: "Cobrado", value: kpi.cobrado, icon: CheckCheck, color: "text-primary", trend: 8 },
    { label: "Pendiente", value: kpi.pendiente, icon: Clock, color: "text-warning", trend: -5 },
    { label: "Vencido", value: kpi.vencido, icon: AlertTriangle, color: "text-destructive", trend: 3 },
  ];

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  };

  const handleBulkResend = () => {
    toast.success(`${selected.size} documentos reenviados`);
    setSelected(new Set());
  };

  const handleBulkMarkSeen = () => {
    toast.success(`${selected.size} documentos marcados como vistos`);
    setSelected(new Set());
  };

  const openResend = (inv: Invoice) => {
    setResendDoc(inv);
    setResendEmail(inv.email);
    setResendCC("");
    setResendMessage("");
  };

  const confirmResend = () => {
    if (!resendDoc || !resendEmail) return;
    toast.success(`${resendDoc.id} reenviada a ${resendEmail}${resendCC ? ` (CC: ${resendCC})` : ""}`);
    setResendDoc(null);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Cliente", "Tipo", "Monto", "Fecha", "Vencimiento", "Estado", "Días Vencida"];
    const rows = filtered.map((inv) => [
      inv.id, inv.client, typeLabel[inv.type],
      inv.amount.toFixed(2), inv.date, inv.dueDate,
      statusLabel[inv.status], getDaysOverdue(inv) ?? ""
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facturas_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV descargado");
  };

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between animate-fade-in">
          <div>
            <h1 className="page-title">Facturas & Recibos</h1>
            <p className="text-sm text-muted-foreground">Documentos de facturación, recibos y cobranzas</p>
          </div>
          <Button variant="outline" className="gap-2 text-sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
          {stats.map((s, i) => (
            <Card key={s.label} className="hover:shadow-md transition-all" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <div className={`flex items-center gap-0.5 text-[11px] font-medium ${s.trend > 0 ? "text-primary" : "text-destructive"}`}>
                    {s.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(s.trend)}%
                  </div>
                </div>
                <p className={`text-xl font-bold ${s.color}`}>{fmt(s.value)}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="animate-fade-in">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            {tabFilters.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs whitespace-nowrap">{t.label}</TabsTrigger>
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
            <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="enviada">Enviada</SelectItem>
              <SelectItem value="vista">Vista</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="vencida">Vencida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg animate-fade-in">
            <span className="text-sm font-medium">{selected.size} seleccionado(s)</span>
            <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-xs" onClick={handleBulkResend}>
              <Send className="w-3.5 h-3.5" /> Reenviar seleccionadas
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleBulkMarkSeen}>
              <Eye className="w-3.5 h-3.5" /> Marcar como vistas
            </Button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-7 h-7 text-muted-foreground" />}
            title={tab === "todas" ? "Sin documentos" : `Sin ${tabFilters.find((t) => t.value === tab)?.label.toLowerCase()}`}
            description="No se encontraron documentos con los filtros seleccionados."
          />
        ) : (
          <Card className="overflow-hidden shadow-sm animate-fade-in">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="table-header w-10">
                        <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                      </th>
                      <th className="table-header">ID</th>
                      <th className="table-header">Cliente</th>
                      <th className="table-header hidden sm:table-cell">Tipo</th>
                      <th className="table-header">Monto</th>
                      <th className="table-header hidden md:table-cell">Fecha</th>
                      <th className="table-header">Estado</th>
                      <th className="table-header hidden lg:table-cell">Días Vencida</th>
                      <th className="table-header">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv) => {
                      const daysOver = getDaysOverdue(inv);
                      return (
                        <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <Checkbox checked={selected.has(inv.id)} onCheckedChange={() => toggleSelect(inv.id)} />
                          </td>
                          <td className="p-4 font-semibold font-mono text-xs">{inv.id}</td>
                          <td className="p-4">{inv.client}</td>
                          <td className="p-4 hidden sm:table-cell">
                            <Badge variant="outline" className={`text-[10px] ${typeStyle[inv.type]}`}>{typeLabel[inv.type]}</Badge>
                          </td>
                          <td className="p-4 font-semibold">{fmt(inv.amount)}</td>
                          <td className="p-4 text-muted-foreground hidden md:table-cell">{inv.date}</td>
                          <td className="p-4">
                            <Badge variant="outline" className={`text-[10px] ${statusStyle[inv.status]}`}>{statusLabel[inv.status]}</Badge>
                          </td>
                          <td className="p-4 hidden lg:table-cell">
                            {daysOver !== null ? (
                              <span className={`text-xs font-semibold ${daysOver > 30 ? "text-destructive" : "text-warning"}`}>
                                {daysOver}d {daysOver > 30 && "⚠️"}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* PDF Preview Modal — Real invoice layout */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => { if (!open) setPreviewDoc(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista previa — {previewDoc?.id}</DialogTitle>
            <DialogDescription>{previewDoc?.client}</DialogDescription>
          </DialogHeader>
          {previewDoc && (
            <div className="bg-white text-gray-900 rounded-lg p-8 space-y-6 border">
              {/* Invoice header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "#0F6E56" }}>BAGUETTES DE PR</h2>
                  <p className="text-xs text-gray-500 mt-1">San Juan, Puerto Rico<br />Tel: (787) 555-0100<br />info@baguettesdepr.com</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-700">{typeLabel[previewDoc.type].toUpperCase()}</p>
                  <p className="text-sm font-mono text-gray-500">{previewDoc.id}</p>
                  <p className="text-xs text-gray-400 mt-1">Fecha: {previewDoc.date}</p>
                  <p className="text-xs text-gray-400">Vence: {previewDoc.dueDate}</p>
                </div>
              </div>
              <Separator className="bg-gray-200" />
              {/* Client */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Facturar a</p>
                <p className="font-semibold text-sm">{previewDoc.client}</p>
                <p className="text-xs text-gray-500">{previewDoc.email}</p>
              </div>
              {/* Line items table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">Descripción</th>
                    <th className="text-center py-2 text-xs text-gray-500 font-medium">Cant.</th>
                    <th className="text-right py-2 text-xs text-gray-500 font-medium">Precio</th>
                    <th className="text-right py-2 text-xs text-gray-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(previewDoc.items || []).map((item, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2.5 text-sm">{item.desc}</td>
                      <td className="py-2.5 text-center text-sm text-gray-600">{item.qty}</td>
                      <td className="py-2.5 text-right text-sm text-gray-600">${item.price.toFixed(2)}</td>
                      <td className="py-2.5 text-right text-sm font-medium">${(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-56 space-y-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{fmt(previewDoc.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>IVU (11.5%)</span>
                    <span>{fmt(previewDoc.amount * 0.115)}</span>
                  </div>
                  <Separator className="bg-gray-200" />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span style={{ color: "#0F6E56" }}>{fmt(previewDoc.amount * 1.115)}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center pt-4 border-t border-gray-100">
                Gracias por su negocio · Baguettes de PR · RUC: 66-1234567
              </p>
            </div>
          )}
          <Button className="w-full gap-2 bg-primary hover:bg-primary/90 active:scale-95 transition-all">
            <Download className="w-4 h-4" /> Descargar PDF
          </Button>
        </DialogContent>
      </Dialog>

      {/* Resend Modal — with CC + message */}
      <Dialog open={!!resendDoc} onOpenChange={(open) => { if (!open) setResendDoc(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reenviar {resendDoc?.id}</DialogTitle>
            <DialogDescription>Enviar copia del documento al cliente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Para</label>
              <Input type="email" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">CC <span className="text-muted-foreground/60">(opcional)</span></label>
              <Input type="email" placeholder="cc@ejemplo.com" value={resendCC} onChange={(e) => setResendCC(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Mensaje personalizado <span className="text-muted-foreground/60">(opcional)</span></label>
              <Textarea placeholder="Agregar un mensaje al correo..." value={resendMessage} onChange={(e) => setResendMessage(e.target.value)} rows={3} />
            </div>
            <div className="p-3 rounded-lg bg-muted/30 text-xs space-y-1">
              <p><span className="text-muted-foreground">Documento:</span> {resendDoc?.id}</p>
              <p><span className="text-muted-foreground">Cliente:</span> {resendDoc?.client}</p>
              <p><span className="text-muted-foreground">Monto:</span> {fmt(resendDoc?.amount ?? 0)}</p>
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
