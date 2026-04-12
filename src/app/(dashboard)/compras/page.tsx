"use client";
import { useState, useEffect, useCallback } from "react";
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
import { Upload, FileText, ShoppingCart, Plus, Eye, PackageCheck, Trash2, ChevronDown, Sparkles } from "lucide-react";
import { toast } from "sonner";

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

const initialPOs: PO[] = [
  {
    id: "PO-120", vendor: "Dairy Fresh", total: 890, date: "11 Abr", status: "recibida",
    items: [
      { sku: "DF-001", name: "Mantequilla 1lb", qtyOrdered: 50, qtyReceived: 50, price: 4.80 },
      { sku: "DF-002", name: "Crema Heavy 1qt", qtyOrdered: 30, qtyReceived: 30, price: 6.50 },
      { sku: "DF-003", name: "Leche Entera 1gal", qtyOrdered: 40, qtyReceived: 38, price: 5.20 },
    ],
  },
  {
    id: "PO-119", vendor: "Flour Mill PR", total: 1250, date: "10 Abr", status: "enviada",
    items: [
      { sku: "FM-010", name: "Harina T-55 25kg", qtyOrdered: 20, qtyReceived: 0, price: 42.00 },
      { sku: "FM-011", name: "Harina Integral 10kg", qtyOrdered: 10, qtyReceived: 0, price: 28.00 },
    ],
  },
  {
    id: "PO-118", vendor: "Huevos del Campo", total: 340, date: "9 Abr", status: "enviada",
    items: [
      { sku: "HC-005", name: "Huevos Grado A (caja 30)", qtyOrdered: 20, qtyReceived: 0, price: 17.00 },
    ],
  },
  {
    id: "PO-117", vendor: "Caribbean Sugar Co", total: 560, date: "8 Abr", status: "borrador",
    items: [
      { sku: "CS-001", name: "Azúcar Refinada 50lb", qtyOrdered: 15, qtyReceived: 0, price: 24.00 },
      { sku: "CS-002", name: "Azúcar Morena 25lb", qtyOrdered: 10, qtyReceived: 0, price: 20.00 },
    ],
  },
  {
    id: "PO-116", vendor: "Dairy Fresh", total: 720, date: "7 Abr", status: "cancelada",
    items: [
      { sku: "DF-001", name: "Mantequilla 1lb", qtyOrdered: 60, qtyReceived: 0, price: 4.80 },
      { sku: "DF-004", name: "Queso Crema 8oz", qtyOrdered: 40, qtyReceived: 0, price: 3.50 },
    ],
  },
];

const vendors = ["Dairy Fresh", "Flour Mill PR", "Huevos del Campo", "Caribbean Sugar Co", "Levadura PR"];

const statusStyle: Record<string, string> = {
  borrador: "bg-muted text-muted-foreground border-border",
  enviada: "bg-info/10 text-info border-info/30",
  recibida: "bg-success/10 text-success border-success/30",
  cancelada: "bg-destructive/10 text-destructive border-destructive/30",
};

const statusLabel: Record<string, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  recibida: "Recibida",
  cancelada: "Cancelada",
};

export default function Compras() {
  const [pos, setPOs] = useState(initialPOs);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [receiveModal, setReceiveModal] = useState<PO | null>(null);
  const [receiveQtys, setReceiveQtys] = useState<number[]>([]);
  const [newModal, setNewModal] = useState(false);
  const [newVendor, setNewVendor] = useState("");
  const [newItems, setNewItems] = useState<{ sku: string; name: string; qty: number; price: number }[]>([{ sku: "", name: "", qty: 1, price: 0 }]);

  // OCR state
  const [ocrDragging, setOcrDragging] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResults, setOcrResults] = useState<{ sku: string; name: string; qty: number; price: number }[] | null>(null);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  const openCount = pos.filter((p) => p.status === "borrador" || p.status === "enviada").length;
  const pendingRecv = pos.filter((p) => p.status === "enviada").length;
  const monthSpend = pos.filter((p) => p.status === "recibida").reduce((s, p) => s + p.total, 0);

  // Receive modal
  const openReceive = (po: PO) => {
    setReceiveModal(po);
    setReceiveQtys(po.items.map((i) => i.qtyReceived));
  };

  const confirmReceive = () => {
    if (!receiveModal) return;
    setPOs((prev) => prev.map((p) => {
      if (p.id !== receiveModal.id) return p;
      return {
        ...p,
        status: "recibida" as const,
        items: p.items.map((item, i) => ({ ...item, qtyReceived: receiveQtys[i] })),
      };
    }));
    setReceiveModal(null);
    toast.success(`${receiveModal.id} marcada como recibida`);
  };

  // New PO
  const addNewItem = () => setNewItems((prev) => [...prev, { sku: "", name: "", qty: 1, price: 0 }]);
  const removeNewItem = (idx: number) => setNewItems((prev) => prev.filter((_, i) => i !== idx));
  const updateNewItem = (idx: number, field: string, value: string | number) => {
    setNewItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const newTotal = newItems.reduce((s, i) => s + i.qty * i.price, 0);

  const createPO = () => {
    if (!newVendor || newItems.some((i) => !i.sku || !i.name)) {
      toast.error("Completa todos los campos requeridos");
      return;
    }
    const po: PO = {
      id: `PO-${121 + pos.length}`,
      vendor: newVendor,
      items: newItems.map((i) => ({ sku: i.sku, name: i.name, qtyOrdered: i.qty, qtyReceived: 0, price: i.price })),
      total: newTotal,
      date: "12 Abr",
      status: "borrador",
    };
    setPOs((prev) => [po, ...prev]);
    setNewModal(false);
    setNewVendor("");
    setNewItems([{ sku: "", name: "", qty: 1, price: 0 }]);
    toast.success(`${po.id} creada exitosamente`);
  };

  // OCR simulation
  const handleOCRDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setOcrDragging(false);
    setOcrProcessing(true);
    setOcrResults(null);
    setTimeout(() => {
      setOcrProcessing(false);
      setOcrResults([
        { sku: "FM-010", name: "Harina T-55 25kg", qty: 15, price: 42.00 },
        { sku: "DF-001", name: "Mantequilla 1lb", qty: 30, price: 4.80 },
        { sku: "HC-005", name: "Huevos Grado A (caja 30)", qty: 10, price: 17.00 },
      ]);
    }, 2500);
  }, []);

  const confirmOCR = () => {
    if (!ocrResults) return;
    const po: PO = {
      id: `PO-${121 + pos.length}`,
      vendor: "Proveedor (OCR)",
      items: ocrResults.map((i) => ({ sku: i.sku, name: i.name, qtyOrdered: i.qty, qtyReceived: 0, price: i.price })),
      total: ocrResults.reduce((s, i) => s + i.qty * i.price, 0),
      date: "12 Abr",
      status: "borrador",
    };
    setPOs((prev) => [po, ...prev]);
    setOcrResults(null);
    toast.success(`${po.id} creada desde factura OCR`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold">Compras & Recepciones</h1>
            <p className="text-sm text-muted-foreground">Órdenes de compra, recepciones y facturas</p>
          </div>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 active:scale-95 transition-all" onClick={() => setNewModal(true)}>
            <Plus className="w-3.5 h-3.5" /> Nueva Compra
          </Button>
        </div>

        {/* Stat chips */}
        <div className="flex flex-wrap gap-2 animate-fade-in">
          <Badge variant="outline" className="bg-info/10 text-info border-info/30 gap-1.5 py-1.5 px-3 text-xs">
            <ShoppingCart className="w-3.5 h-3.5" /> Órdenes Abiertas: <span className="font-bold">{openCount}</span>
          </Badge>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1.5 py-1.5 px-3 text-xs">
            <PackageCheck className="w-3.5 h-3.5" /> Pendiente Recepción: <span className="font-bold">{pendingRecv}</span>
          </Badge>
          <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1.5 py-1.5 px-3 text-xs">
            Gasto del Mes: <span className="font-bold">${monthSpend.toLocaleString()}</span>
          </Badge>
        </div>

        {/* Main table */}
        {loading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : pos.length === 0 ? (
          <EmptyState icon={<ShoppingCart className="w-7 h-7 text-muted-foreground" />} title="Sin órdenes de compra" description="Crea tu primera orden de compra." />
        ) : (
          <Card className="overflow-hidden animate-fade-in">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold text-muted-foreground">PO#</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Proveedor</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Productos</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Monto</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Fecha</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Estado</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pos.map((po) => (
                      <>
                        <tr key={po.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-semibold">{po.id}</td>
                          <td className="p-4">{po.vendor}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-xs">{po.items.length}</Badge>
                          </td>
                          <td className="p-4 font-semibold">${po.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                          <td className="p-4 text-muted-foreground hidden sm:table-cell">{po.date}</td>
                          <td className="p-4">
                            <Badge variant="outline" className={`text-[10px] ${statusStyle[po.status]}`}>
                              {statusLabel[po.status]}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1.5">
                              {po.status === "enviada" && (
                                <Button variant="outline" size="sm" className="text-xs h-7 px-2 hover:bg-success/10 hover:text-success active:scale-95 transition-all" onClick={() => openReceive(po)}>
                                  Recibir
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="text-xs h-7 px-2 active:scale-95 transition-all" onClick={() => setExpandedRow(expandedRow === po.id ? null : po.id)}>
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
                                      <th className="text-left p-2 font-semibold text-muted-foreground">Cant. Ordenada</th>
                                      <th className="text-left p-2 font-semibold text-muted-foreground">Cant. Recibida</th>
                                      <th className="text-left p-2 font-semibold text-muted-foreground">Diferencia</th>
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
                                          <td className={`p-2 font-semibold ${diff < 0 ? "text-destructive" : diff === 0 ? "text-muted-foreground" : "text-success"}`}>
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
        )}

        {/* OCR Section */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Captura de Factura con IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${ocrDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
              onDragOver={(e) => { e.preventDefault(); setOcrDragging(true); }}
              onDragLeave={() => setOcrDragging(false)}
              onDrop={handleOCRDrop}
              onClick={() => {
                // simulate file select
                setOcrProcessing(true);
                setOcrResults(null);
                setTimeout(() => {
                  setOcrProcessing(false);
                  setOcrResults([
                    { sku: "FM-010", name: "Harina T-55 25kg", qty: 15, price: 42.00 },
                    { sku: "DF-001", name: "Mantequilla 1lb", qty: 30, price: 4.80 },
                    { sku: "HC-005", name: "Huevos Grado A (caja 30)", qty: 10, price: 17.00 },
                  ]);
                }, 2500);
              }}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Arrastra un PDF o imagen de factura aquí</p>
              <p className="text-xs text-muted-foreground mt-1">o haz clic para seleccionar archivo</p>
            </div>

            {ocrProcessing && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" /> Procesando con IA...
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            )}

            {ocrResults && (
              <div className="space-y-3">
                <p className="text-sm font-semibold">Líneas extraídas — revisa antes de confirmar</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 font-semibold text-muted-foreground">SKU</th>
                        <th className="text-left p-2 font-semibold text-muted-foreground">Producto</th>
                        <th className="text-left p-2 font-semibold text-muted-foreground">Cantidad</th>
                        <th className="text-left p-2 font-semibold text-muted-foreground">Precio</th>
                        <th className="text-left p-2 font-semibold text-muted-foreground">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ocrResults.map((item, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-2 font-mono">{item.sku}</td>
                          <td className="p-2">{item.name}</td>
                          <td className="p-2">{item.qty}</td>
                          <td className="p-2">${item.price.toFixed(2)}</td>
                          <td className="p-2 font-semibold">${(item.qty * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30">
                        <td colSpan={4} className="p-2 text-right font-semibold">Total:</td>
                        <td className="p-2 font-bold">${ocrResults.reduce((s, i) => s + i.qty * i.price, 0).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 active:scale-95 transition-all" onClick={confirmOCR}>
                    Confirmar y crear PO
                  </Button>
                  <Button variant="outline" size="sm" className="active:scale-95 transition-all" onClick={() => setOcrResults(null)}>
                    Descartar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Receive Modal */}
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
                      setReceiveQtys((prev) => prev.map((q, j) => j === i ? val : q));
                    }}
                  />
                  {diff !== 0 && (
                    <span className={`text-xs font-semibold min-w-[40px] text-right ${diff < 0 ? "text-destructive" : "text-success"}`}>
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 active:scale-95 transition-all mt-2" onClick={confirmReceive}>
            Confirmar Recepción
          </Button>
        </DialogContent>
      </Dialog>

      {/* New PO Modal */}
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
                {vendors.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Líneas</p>
              {newItems.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.5fr_0.7fr_0.7fr_auto] gap-2 items-center">
                  <Input placeholder="SKU" value={item.sku} onChange={(e) => updateNewItem(i, "sku", e.target.value)} className="text-xs" />
                  <Input placeholder="Nombre" value={item.name} onChange={(e) => updateNewItem(i, "name", e.target.value)} className="text-xs" />
                  <Input type="number" placeholder="Cant" min={1} value={item.qty} onChange={(e) => updateNewItem(i, "qty", parseInt(e.target.value) || 0)} className="text-xs" />
                  <Input type="number" placeholder="Precio" min={0} step={0.01} value={item.price} onChange={(e) => updateNewItem(i, "price", parseFloat(e.target.value) || 0)} className="text-xs" />
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
              <span className="text-lg font-bold">${newTotal.toFixed(2)}</span>
            </div>
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 active:scale-95 transition-all" onClick={createPO}>
            Crear Orden de Compra
          </Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
