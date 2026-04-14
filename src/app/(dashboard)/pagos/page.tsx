"use client"
import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { KanbanSkeleton } from "@/components/Skeletons";
import { Camera, CheckCircle, AlertTriangle, CreditCard, Search, DollarSign, Clock as ClockIcon, XCircle } from "lucide-react";
import { toast } from "sonner";

type PaymentMethod = "ATH Móvil" | "Transferencia" | "Efectivo" | "Tarjeta";
type ColumnKey = "pendiente" | "evidencia" | "confirmado" | "rechazado";

interface PaymentCard {
  id: string;
  client: string;
  amount: string;
  numAmount: number;
  method: PaymentMethod;
  createdAt: Date;
  column: ColumnKey;
}

const methodStyles: Record<PaymentMethod, string> = {
  "ATH Móvil": "bg-primary/10 text-primary border-primary/30",
  "Transferencia": "bg-info/10 text-info border-info/30",
  "Efectivo": "bg-primary/15 text-primary border-primary/25",
  "Tarjeta": "bg-muted text-muted-foreground border-border",
};

const columnMeta: { key: ColumnKey; title: string; accent: string }[] = [
  { key: "pendiente", title: "Pendiente Evidencia", accent: "bg-warning" },
  { key: "evidencia", title: "Evidencia Subida", accent: "bg-info" },
  { key: "confirmado", title: "Confirmado", accent: "bg-primary" },
  { key: "rechazado", title: "Rechazado", accent: "bg-destructive" },
];

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

function elapsedLabel(date: Date): string {
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

const initialCards: PaymentCard[] = [
  { id: "ORD-401", client: "Hotel San Juan", amount: "$520.00", numAmount: 520, method: "ATH Móvil", createdAt: hoursAgo(2), column: "pendiente" },
  { id: "ORD-398", client: "Café La Plaza", amount: "$178.50", numAmount: 178.5, method: "Transferencia", createdAt: hoursAgo(30), column: "pendiente" },
  { id: "ORD-395", client: "Restaurante El Coquí", amount: "$245.00", numAmount: 245, method: "Efectivo", createdAt: hoursAgo(48), column: "pendiente" },
  { id: "ORD-390", client: "Deli Boricua", amount: "$350.00", numAmount: 350, method: "ATH Móvil", createdAt: hoursAgo(5), column: "evidencia" },
  { id: "ORD-388", client: "Bistro 787", amount: "$420.00", numAmount: 420, method: "Tarjeta", createdAt: hoursAgo(28), column: "evidencia" },
  { id: "ORD-380", client: "Panadería Express", amount: "$198.00", numAmount: 198, method: "Transferencia", createdAt: hoursAgo(72), column: "confirmado" },
  { id: "ORD-375", client: "Hotel Caribe", amount: "$610.00", numAmount: 610, method: "ATH Móvil", createdAt: hoursAgo(96), column: "confirmado" },
  { id: "ORD-370", client: "Bar La Esquina", amount: "$89.00", numAmount: 89, method: "Efectivo", createdAt: hoursAgo(50), column: "rechazado" },
];

function isOverdue(date: Date) {
  return now.getTime() - date.getTime() > 24 * 60 * 60 * 1000;
}

function sumByColumn(cards: PaymentCard[], col: ColumnKey) {
  return cards.filter((c) => c.column === col).reduce((s, c) => s + c.numAmount, 0);
}

export default function Pagos() {
  const isMobile = useIsMobile();
  const [cards, setCards] = useState<PaymentCard[]>(initialCards);
  const [pinModalCard, setPinModalCard] = useState<PaymentCard | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  const filteredCards = useMemo(() => {
    if (!search.trim()) return cards;
    const q = search.toLowerCase();
    return cards.filter((c) => c.id.toLowerCase().includes(q) || c.client.toLowerCase().includes(q));
  }, [cards, search]);

  const totals = useMemo(() => ({
    pendiente: sumByColumn(cards, "pendiente") + sumByColumn(cards, "evidencia"),
    confirmado: sumByColumn(cards, "confirmado"),
    rechazado: sumByColumn(cards, "rechazado"),
  }), [cards]);

  const moveCard = (id: string, to: ColumnKey) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, column: to } : c)));
  };

  const handleUploadEvidence = (card: PaymentCard) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.onchange = () => {
      moveCard(card.id, "evidencia");
      toast.success(`Evidencia subida para ${card.id}`);
    };
    input.click();
  };

  const handleConfirmPin = () => {
    if (pin.length === 6 && pinModalCard) {
      moveCard(pinModalCard.id, "confirmado");
      toast.success(`Pago ${pinModalCard.id} confirmado`);
      setPinModalCard(null);
      setPin("");
    }
  };

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="page-title">Pagos</h1>
          <p className="text-sm text-muted-foreground">Tablero de cobranza y seguimiento de pagos</p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
          <Card className="shadow-sm border-warning/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
                <ClockIcon className="h-4.5 w-4.5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Pendiente</p>
                <p className="text-lg font-bold text-warning">{fmt(totals.pendiente)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-primary/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Confirmado Hoy</p>
                <p className="text-lg font-bold text-primary">{fmt(totals.confirmado)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-destructive/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-4.5 w-4.5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Rechazado</p>
                <p className="text-lg font-bold text-destructive">{fmt(totals.rechazado)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search bar */}
        <div className="relative animate-fade-in max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por orden o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="overflow-x-auto -mx-4 px-4 pb-4 md:mx-0 md:px-0">
            <KanbanSkeleton columns={4} />
          </div>
        ) : (
          <>
          {isMobile ? (
            <div className="space-y-6">
              {columnMeta.map((col) => {
                const colCards = filteredCards.filter((c) => c.column === col.key);
                return (
                  <div key={col.key} className="space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2 sticky top-0 bg-background py-1 z-10">
                      <div className={`w-3 h-3 rounded-full ${col.accent}`} />
                      <h3 className="text-sm font-semibold">{col.title}</h3>
                      <span className="ml-auto text-xs font-bold bg-muted rounded-full w-6 h-6 flex items-center justify-center">{colCards.length}</span>
                    </div>
                    {colCards.length === 0 ? (
                      <div className="border border-dashed rounded-lg p-6 text-center">
                        <CreditCard className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Sin pagos</p>
                      </div>
                    ) : (
                      colCards.map((card) => {
                        const overdue = isOverdue(card.createdAt);
                        return (
                          <Card key={card.id} className={`shadow-sm ${overdue ? "border-destructive/70 border-2" : ""}`}>
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-muted-foreground">{card.id}</span>
                                {overdue && (
                                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 gap-1">
                                    <AlertTriangle className="w-3 h-3" /> +24h
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium text-sm">{card.client}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold">{card.amount}</span>
                                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${methodStyles[card.method]}`}>{card.method}</Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" /> {elapsedLabel(card.createdAt)}
                              </p>
                              {col.key === "pendiente" && (
                                <Button size="sm" className="w-full gap-2 bg-primary hover:bg-primary/90" onClick={() => handleUploadEvidence(card)}>
                                  <Camera className="w-4 h-4" /> Subir Evidencia
                                </Button>
                              )}
                              {col.key === "evidencia" && (
                                <Button size="sm" className="w-full gap-2 bg-primary hover:bg-primary/90" onClick={() => { setPinModalCard(card); setPin(""); }}>
                                  <CheckCircle className="w-4 h-4" /> Confirmar Pago
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Desktop: horizontal kanban */
            <div className="overflow-x-auto -mx-4 px-4 pb-4 md:mx-0 md:px-0">
              <div className="flex gap-4 min-w-[900px] xl:grid xl:grid-cols-4 xl:min-w-0">
                {columnMeta.map((col) => {
                  const colCards = filteredCards.filter((c) => c.column === col.key);
                  return (
                    <div key={col.key} className="flex-1 min-w-[220px] space-y-3 animate-fade-in">
                      <div className="flex items-center gap-2 sticky top-0 bg-background py-1 z-10">
                        <div className={`w-3 h-3 rounded-full ${col.accent}`} />
                        <h3 className="section-label normal-case tracking-normal text-sm font-semibold">{col.title}</h3>
                        <span className="ml-auto shrink-0 text-xs font-bold bg-muted rounded-full w-6 h-6 flex items-center justify-center">{colCards.length}</span>
                      </div>
                      <div className="space-y-2">
                        {colCards.length === 0 ? (
                          <div className="border border-dashed rounded-lg p-8 text-center">
                            <CreditCard className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Sin pagos</p>
                          </div>
                        ) : (
                          colCards.map((card) => {
                            const overdue = isOverdue(card.createdAt);
                            return (
                              <Card key={card.id} className={`shadow-sm transition-all duration-200 hover:shadow-md ${overdue ? "border-destructive/70 border-2" : ""}`}>
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-xs font-mono text-muted-foreground">{card.id}</span>
                                    {overdue && (
                                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 gap-1">
                                        <AlertTriangle className="w-3 h-3" /> +24h
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-medium text-sm leading-tight">{card.client}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold">{card.amount}</span>
                                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${methodStyles[card.method]}`}>{card.method}</Badge>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3" /> {elapsedLabel(card.createdAt)}
                                  </p>
                                  {col.key === "pendiente" && (
                                    <Button size="sm" className="w-full gap-2 bg-primary hover:bg-primary/90 active:scale-[0.97] transition-all" onClick={() => handleUploadEvidence(card)}>
                                      <Camera className="w-4 h-4" /> Subir Evidencia
                                    </Button>
                                  )}
                                  {col.key === "evidencia" && (
                                    <Button size="sm" className="w-full gap-2 bg-primary hover:bg-primary/90 active:scale-[0.97] transition-all" onClick={() => { setPinModalCard(card); setPin(""); }}>
                                      <CheckCircle className="w-4 h-4" /> Confirmar Pago
                                    </Button>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </>
        )}
      </div>

      <Dialog open={!!pinModalCard} onOpenChange={(open) => { if (!open) { setPinModalCard(null); setPin(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Pago</DialogTitle>
            <DialogDescription>
              Ingresa el PIN de 6 dígitos para confirmar el pago{" "}
              <span className="font-semibold text-foreground">{pinModalCard?.id}</span> —{" "}
              <span className="font-semibold text-foreground">{pinModalCard?.amount}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <InputOTP maxLength={6} value={pin} onChange={setPin} onComplete={handleConfirmPin}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all" disabled={pin.length < 6} onClick={handleConfirmPin}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
