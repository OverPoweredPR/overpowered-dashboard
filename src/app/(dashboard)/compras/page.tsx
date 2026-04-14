"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload, ShoppingCart, Plus, Eye, PackageCheck,
  Trash2, ChevronDown, Sparkles, DollarSign, History,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LineItem {
  sku: string;
  name: string;
  qtyOrdered: number;
  qtyReceived: number;
  price: number;
}

interface PO {
  id: string;
  vendor: string;
  items: LineItem[];
  total: number;
  date: string;
  status: "borrador" | "enviada" | "recibida" | "cancelada";
}

interface OcrItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  borrador:  "bg-muted text-muted-foreground border-border",
  enviada:   "bg-blue-50 text-blue-600 border-blue-200",
  recibida:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelada: "bg-red-50 text-destructive border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  borrador:  "Borrador",
  enviada:   "Enviada",
  recibida:  "Recibida",
  cancelada: "Cancelada",
};

const DEFAULT_VENDORS = ["Dairy Fresh", "Flour Mill PR", "Huevos del Campo", "Caribbean Sugar Co", "Levadura PR"];

// ── Mini trend chart (inline SVG, no dep) ─────────────────────────────────────

function HistorialChart({ pos }: { pos: PO[] }) {
  const recibidas = pos.filter((p) => p.status === "recibida");
  // Group by date, count totals
  const byDate: Record<string, { total: number; count: number }> = {};
  recibidas.forEach((p) => {
    const key = p.date;
    if (!byDate[key]) byDate[key] = { total: 0, count: 0 };
    byDate[key].total += p.total;
    byDate[key].count += 1;
  });
  const days = Object.keys(byDate).slice(-7);
  if (days.length < 2) return null;
  const values = days.map((d) => byDate[d].total);
  const max = Math.max(...values, 1);
  const W = 220, H = 48, pad = 6;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2);
    const y = H - pad - (v / max) * (H - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg width={W} height={H} className="mt-2">
      <polyline points={pts.join(" ")} fill="none" stroke="#0F6E56" strokeWidth={2} strokeLinejoin="round" />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r={3} fill="#0F6E56" />;
      })}
    </svg>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ReceiptProgress({ items }: { items: LineItem[] }) {
  const ordered = items.reduce((s, i) => s + i.qtyOrdered, 0);
  const received = items.reduce((s, i) => s + i.qtyReceived, 0);
  if (ordered === 0) return <Badge variant="outline" className="text-xs">{items.length} prod.</Badge>;
  const pct = Math.round((received / ordered) * 100);
  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{items.length} prod.</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden w-full">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#0F6E56" : "#f59e0b" }}
        />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Compras() {
  const [pos, setPOs] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"activas" | "historial">("activas");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [receiveModal, setReceiveModal] = useState<PO | null>(null);
  const [receiveQtys, setReceiveQtys] = useState<number[]>([]);
  const [newModal, setNewModal] = useState(false);
  const [newVendor, setNewVendor] = useState("");
  const [newItems, setNewItems] = useState<{ sku: string; name: string; qty: number; price: number }[]>([
    { sku: "", name: "", qty: 1, price: 0 },
  ]);

  // OCR state — now editable
  const [ocrDragging, setOcrDragging] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrItems, setOcrItems] = useState<OcrItem[] | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/compras")
      .then((r) => r.json())
      .then((data) => {
        const raw = data.purchase_orders ?? data.ordenes ?? [];
        setPOs(
          raw.map((p: Record<string, unknown>) => ({
            id:     (p.id ?? "") as string,
            vendor: (p.vendor ?? p.proveedor ?? "") as string,
            total:  (p.total ?? p.monto ?? 0) as number,
            date:   (p.date ?? p.fecha ?? "") as string,
            status: (p.status ?? p.estado ?? "borrador") as PO["status"],
            items:  (p.items ?? []) as LineItem[],
          }))
        );
      })
      .catch(() => toast.error("Error cargando compras"))
      .finally(() => setLoading(false));
  }, []);

  // Derived vendors — real vendors from existing POs + defaults
  const vendorList = useMemo(() => {
    const fromPOs = pos.map((p) => p.vendor).filter(Boolean);
    return Array.from(new Set([...fromPOs, ...DEFAULT_VENDORS])).sort();
  }, [pos]);

  // Summary stats
  const totalPOs   = pos.length;
  const monthSpend = pos.filter((p) => p.status === "recibida").reduce((s, p) => s + p.total, 0);
  const pendingRecv = pos.filter((p) => p.status === "enviada").length;

  // Historial — completed POs
  const historial = pos.filter((p) => p.status === "recibida");
  const historialTotal = historial.reduce((s, p) => s + p.total, 0);

  // Receive modal
  const openReceive = (po: PO) => {
    setReceiveModal(po);
    setReceiveQtys(po.items.map((i) => i.qtyReceived));
  };

  const confirmReceive = () => {
    if (!receiveModal) return;
    setPOs((prev) =>
      prev.map((p) =>
        p.id !== receiveModal.id
          ? p
          : {
              ...p,
              status: "recibida" as const,
              items: p.items.map((item, i) => ({ ...item, qtyReceived: receiveQtys[i] })),
            }
      )
    );
    setReceiveModal(null);
    toast.success(`${receiveModal.id} marcada como recibida`);
  };

  // New PO
  const addNewItem    = () => setNewItems((prev) => [...prev, { sku: "", name: "", qty: 1, price: 0 }]);
  const removeNewItem = (idx: number) => setNewItems((prev) => prev.filter((_, i) => i !== idx));
  const updateNewItem = (idx: number, field: string, value: string | number) =>
    setNewItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  const newTotal = newItems.reduce((s, i) => s + i.qty * i.price, 0);

  const createPO = () => {
    if (!newVendor || newItems.some((i) => !i.sku || !i.name)) {
      toast.error("Completa todos los campos requeridos");
      return;
    }
    const po: PO = {
      id:     `PO-${121 + pos.length}`,
      vendor: newVendor,
      items:  newItems.map((i) => ({ sku: i.sku, name: i.name, qtyOrdered: i.qty, qtyReceived: 0, price: i.price })),
      total:  newTotal,
      date:   new Date().toLocaleDateString("es-PR", { day: "numeric", month: "short" }),
      status: "borrador",
    };
    setPOs((prev) => [po, ...prev]);
    setNewModal(false);
    setNewVendor("");
    setNewItems([{ sku: "", name: "", qty: 1, price: 0 }]);
    toast.success(`${po.id} creada exitosamente`);
  };

  // OCR — editable results
  const triggerOCR = () => {
    setOcrProcessing(true);
    setOcrItems(null);
    setTimeout(() => {
      setOcrProcessing(false);
      setOcrItems([
        { sku: "FM-010", name: "Harina T-55 25kg",        qty: 15, price: 42.00 },
        { sku: "DF-001", name: "Mantequilla 1lb",          qty: 30, price: 4.80  },
        { sku: "HC-005", name: "Huevos Grado A (caja 30)", qty: 10, price: 17.00 },
      ]);
    }, 2500);
  };

  const handleOCRDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setOcrDragging(false);
    triggerOCR();
  }, []);

  const updateOcrItem = (idx: number, field: keyof OcrItem, value: string | number) =>
    setOcrItems((prev) => prev ? prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)) : prev);

  const removeOcrItem = (idx: number) =>
    setOcrItems((prev) => prev ? prev.filter((_, i) => i !== idx) : prev);

  const confirmOCR = () => {
    if (!ocrItems) return;
    const po: PO = {
      id:     `PO-${121 + pos.length}`,
      vendor: "Proveedor (OCR)",
      items:  ocrItems.map((i) => ({ sku: i.sku, name: i.name, qtyOrdered: i.qty, qtyReceived: 0, price: i.price })),
      total:  ocrItems.reduce((s, i) => s + i.qty * i.price, 0),
      date:   new Date().toLocaleDateString("es-PR", { day: "numeric", month: "short" }),
      status: "borrador",
    };
    setPOs((prev) => [po, ...prev]);
    setOcrItems(null);
    toast.success(`${po.id} creada desde factura OCR`);
  };

  // Active POs for main table
  const activePOs = pos.filter((p) => p.status !== "recibida" || activeTab === "activas");

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold">Compras & Recepciones</h1>
            <p className="text-sm text-muted-foreground">Órdenes de compra, recepciones y facturas</p>
          </div>
          <Button
            size="sm"
            className="gap-2 active:scale-95 transition-all text-white"
            style={{ backgroundColor: "#0F6E56" }}
            onClick={() => setNewModal(true)}
          >
            <Plus className="w-3.5 h-3.5" /> Nueva Compra
          </Button>
        </div>

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full p-2.5" style={{ backgroundColor: "#0F6E5615" }}>
                <ShoppingCart className="w-5 h-5" style={{ color: "#0F6E56" }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total POs</p>
                <p className="text-2xl font-bold">{totalPOs}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full p-2.5 bg-amber-50">
                <PackageCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendiente Recepción</p>
                <p className="text-2xl font-bold">{pendingRecv}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full p-2.5 bg-emerald-50">
                <DollarSign className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gasto del Mes</p>
                <p className="text-2xl font-bold">${monthSpend.toLocaleString("en-US", { minimumFractionDigits: 0 })}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 border-b">
          {(["activas", "historial"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#0F6E56] text-[#0F6E56]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "activas" ? "Órdenes Activas" : "Historial (30 días)"}
            </button>
          ))}
        </div>

        {/* ── Historial tab ── */}
        {activeTab === "historial" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{historial.length} POs completadas</p>
              <p className="text-sm font-semibold">Total: <span style={{ color: "#0F6E56" }}>${historialTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></p>
            </div>
            <HistorialChart pos={pos} />
            {historial.length === 0 ? (
              <EmptyState
                icon={<History className="w-7 h-7 text-muted-foreground" />}
                title="Sin historial"
                description="Las órdenes recibidas aparecerán aquí."
              />
            ) : (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-semibold text-muted-foreground">PO#</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground">Proveedor</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground">Productos</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground">Total</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historial.map((po) => (
                          <tr key={po.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="p-4 font-semibold">{po.id}</td>
                            <td className="p-4">{po.vendor}</td>
                            <td className="p-4">
                              <Badge variant="outline" className="text-xs">{po.items.length}</Badge>
                            </td>
                            <td className="p-4 font-semibold" style={{ color: "#0F6E56" }}>
                              ${po.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 text-muted-foreground hidden sm:table-cell">{po.date}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/30">
                          <td colSpan={3} className="p-4 text-right font-semibold text-sm">Total período:</td>
                          <td className="p-4 font-bold" style={{ color: "#0F6E56" }}>
                            ${historialTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="hidden sm:table-cell" />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ── Active POs table ── */}
        {activeTab === "activas" && (
          loading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : activePOs.filter((p) => p.status !== "recibida").length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="w-7 h-7 text-muted-foreground" />}
              title="Sin órdenes activas"
              description="Todas las órdenes están completadas o canceladas."
            />
          ) : (
            <Card className="overflow-hidden animate-fade-in">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 font-semibold text-muted-foreground">PO#</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Proveedor</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Recepción</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Monto</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Fecha</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Estado</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pos.filter((p) => p.status !== "recibida").map((po) => (
                        <>
                          <tr key={po.id} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="p-4 font-semibold">{po.id}</td>
                            <td className="p-4">{po.vendor}</td>
                            <td className="p-4">
                              <ReceiptProgress items={po.items} />
                            </td>
                            <td className="p-4 font-semibold">
                              ${po.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 text-muted-foreground hidden sm:table-cell">{po.date}</td>
                            <td className="p-4">
                              <Badge variant="outline" className={`text-[10px] ${STATUS_STYLE[po.status]}`}>
                                {STATUS_LABEL[po.status]}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1.5">
                                {po.status === "enviada" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7 px-2 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 transition-all"
                                    onClick={() => openReceive(po)}
                                  >
                                    Recibir
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-7 px-2 active:scale-95 transition-all"
                                  onClick={() => setExpandedRow(expandedRow === po.id ? null : po.id)}
                                >
                                  <Eye className="w-3.5 h-3.5 mr-1" />
                                  Ver
                                  <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${expandedRow === po.id ? "rotate-180" : ""}`} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {expandedRow === po.id && (
                            <tr key={`${po.id}-detail`} className="border-b">
                              <td colSpan={7} className="p-0">
                                <div className="bg-muted/20 p-4">
                                  <p className="text-xs font-semibold text-muted-foreground mb-2">Líneas de {po.id}</p>
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left p-2 font-semibold text-muted-foreground">SKU</th>
                                        <th className="text-left p-2 font-semibold text-muted-foreground">Producto</th>
                                        <th className="text-left p-2 font-semibold text-muted-foreground">Ordenado</th>
                                        <th className="text-left p-2 font-semibold text-muted-foreground">Recibido</th>
                                        <th className="text-left p-2 font-semibold text-muted-foreground">Diff</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {po.items.map((item) => {
                                        const diff = item.qtyReceived - item.qtyOrdered;
                                        return (
                                          <tr key={item.sku} className="border-b last:border-0">
                                            <td className="p-2 font-mono">{item.sku}</td>
                                            <td className="p-2">{item.name}</td>
                                            <td className="p-2">{item.qtyOrdered}</td>
                                            <td className="p-2">{item.qtyReceived}</td>
                                            <td className={`p-2 font-semibold ${diff < 0 ? "text-destructive" : diff === 0 ? "text-muted-foreground" : "text-emerald-700"}`}>
                                              {diff > 0 ? `+${diff}` : diff}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {/* ── OCR Section ── */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: "#0F6E56" }} /> Captura de Factura con IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!ocrItems && !ocrProcessing && (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  ocrDragging ? "border-[#0F6E56] bg-emerald-50/50" : "border-border hover:border-[#0F6E56]/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setOcrDragging(true); }}
                onDragLeave={() => setOcrDragging(false)}
                onDrop={handleOCRDrop}
                onClick={triggerOCR}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Arrastra un PDF o imagen de factura aquí</p>
                <p className="text-xs text-muted-foreground mt-1">o haz clic para seleccionar archivo</p>
              </div>
            )}

            {ocrProcessing && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 animate-pulse" style={{ color: "#0F6E56" }} /> Procesando con IA...
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            )}

            {ocrItems && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Líneas extraídas — edita antes de confirmar</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 gap-1 active:scale-95"
                    onClick={() => setOcrItems((prev) => prev ? [...prev, { sku: "", name: "", qty: 1, price: 0 }] : prev)}
                  >
                    <Plus className="w-3 h-3" /> Añadir línea
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 font-semibold text-muted-foreground">SKU</th>
                        <th className="text-left p-2 font-semibold text-muted-foreground">Producto</th>
                        <th className="text-left p-2 font-semibold text-muted-foreground">Cant.</th>
                        <th className="text-left p-2 font-semibold text-muted-foreground">Precio</th>
                        <th className="text-left p-2 font-semibold text-muted-foreground">Subtotal</th>
                        <th className="p-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {ocrItems.map((item, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-1">
                            <Input
                              value={item.sku}
                              onChange={(e) => updateOcrItem(i, "sku", e.target.value)}
                              className="h-7 text-xs font-mono w-24"
                            />
                          </td>
                          <td className="p-1">
                            <Input
                              value={item.name}
                              onChange={(e) => updateOcrItem(i, "name", e.target.value)}
                              className="h-7 text-xs min-w-[140px]"
                            />
                          </td>
                          <td className="p-1">
                            <Input
                              type="number"
                              value={item.qty}
                              min={1}
                              onChange={(e) => updateOcrItem(i, "qty", parseInt(e.target.value) || 0)}
                              className="h-7 text-xs w-16 text-center"
                            />
                          </td>
                          <td className="p-1">
                            <Input
                              type="number"
                              value={item.price}
                              min={0}
                              step={0.01}
                              onChange={(e) => updateOcrItem(i, "price", parseFloat(e.target.value) || 0)}
                              className="h-7 text-xs w-20 text-center"
                            />
                          </td>
                          <td className="p-2 font-semibold whitespace-nowrap">
                            ${(item.qty * item.price).toFixed(2)}
                          </td>
                          <td className="p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeOcrItem(i)}
                              disabled={ocrItems.length <= 1}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30">
                        <td colSpan={4} className="p-2 text-right font-semibold">Total:</td>
                        <td className="p-2 font-bold" style={{ color: "#0F6E56" }}>
                          ${ocrItems.reduce((s, i) => s + i.qty * i.price, 0).toFixed(2)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="active:scale-95 transition-all text-white"
                    style={{ backgroundColor: "#0F6E56" }}
                    onClick={confirmOCR}
                  >
                    Confirmar y crear PO
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="active:scale-95 transition-all"
                    onClick={() => setOcrItems(null)}
                  >
                    Descartar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Receive Modal ── */}
      <Dialog open={!!receiveModal} onOpenChange={(open) => { if (!open) setReceiveModal(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Recibir {receiveModal?.id}</DialogTitle>
            <DialogDescription>Ingresa las cantidades recibidas para cada línea</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {receiveModal?.items.map((item, i) => {
              const diff = (receiveQtys[i] || 0) - item.qtyOrdered;
              return (
                <div key={item.sku} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sku} · Ordenado: {item.qtyOrdered}</p>
                  </div>
                  <Input
                    type="number"
                    className="w-20 text-center"
                    min={0}
                    value={receiveQtys[i] ?? 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setReceiveQtys((prev) => prev.map((q, j) => (j === i ? val : q)));
                    }}
                  />
                  {diff !== 0 && (
                    <span className={`text-xs font-semibold min-w-[40px] text-right ${diff < 0 ? "text-destructive" : "text-emerald-700"}`}>
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <Button
            className="w-full active:scale-95 transition-all mt-2 text-white"
            style={{ backgroundColor: "#0F6E56" }}
            onClick={confirmReceive}
          >
            Confirmar Recepción
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── New PO Modal ── */}
      <Dialog open={newModal} onOpenChange={(open) => { if (!open) setNewModal(false); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Compra</DialogTitle>
            <DialogDescription>Selecciona proveedor y agrega líneas</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <Select value={newVendor} onValueChange={setNewVendor}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                {vendorList.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Líneas</p>
              {newItems.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.5fr_0.7fr_0.7fr_auto] gap-2 items-center">
                  <Input placeholder="SKU"    value={item.sku}   onChange={(e) => updateNewItem(i, "sku",   e.target.value)}                   className="text-xs" />
                  <Input placeholder="Nombre" value={item.name}  onChange={(e) => updateNewItem(i, "name",  e.target.value)}                   className="text-xs" />
                  <Input type="number" placeholder="Cant"   min={1}    value={item.qty}   onChange={(e) => updateNewItem(i, "qty",   parseInt(e.target.value)   || 0)} className="text-xs" />
                  <Input type="number" placeholder="Precio" min={0} step={0.01} value={item.price}  onChange={(e) => updateNewItem(i, "price", parseFloat(e.target.value) || 0)} className="text-xs" />
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeNewItem(i)} disabled={newItems.length <= 1}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="text-xs gap-1 active:scale-95 transition-all" onClick={addNewItem}>
                <Plus className="w-3 h-3" /> Agregar línea
              </Button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-semibold">Total:</span>
              <span className="text-lg font-bold" style={{ color: "#0F6E56" }}>${newTotal.toFixed(2)}</span>
            </div>
          </div>
          <Button
            className="w-full active:scale-95 transition-all text-white"
            style={{ backgroundColor: "#0F6E56" }}
            onClick={createPO}
          >
            Crear Orden de Compra
          </Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
