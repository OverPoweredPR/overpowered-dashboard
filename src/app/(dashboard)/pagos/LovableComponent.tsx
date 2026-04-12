import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Camera, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type PaymentMethod = "ATH Móvil" | "Transferencia" | "Efectivo" | "Tarjeta";
type ColumnKey = "pendiente" | "evidencia" | "confirmado" | "rechazado";

interface PaymentCard {
  id: string;
  client: string;
  amount: string;
  method: PaymentMethod;
  createdAt: Date;
  column: ColumnKey;
}

const methodStyles: Record<PaymentMethod, string> = {
  "ATH Móvil": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Transferencia": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Efectivo": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Tarjeta": "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const columnMeta: { key: ColumnKey; title: string; accent: string }[] = [
  { key: "pendiente", title: "Pendiente Evidencia", accent: "bg-warning" },
  { key: "evidencia", title: "Evidencia Subida", accent: "bg-info" },
  { key: "confirmado", title: "Confirmado", accent: "bg-success" },
  { key: "rechazado", title: "Rechazado", accent: "bg-destructive" },
];

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

const initialCards: PaymentCard[] = [
  { id: "ORD-401", client: "Hotel San Juan", amount: "$520.00", method: "ATH Móvil", createdAt: hoursAgo(2), column: "pendiente" },
  { id: "ORD-398", client: "Café La Plaza", amount: "$178.50", method: "Transferencia", createdAt: hoursAgo(30), column: "pendiente" },
  { id: "ORD-395", client: "Restaurante El Coquí", amount: "$245.00", method: "Efectivo", createdAt: hoursAgo(48), column: "pendiente" },
  { id: "ORD-390", client: "Deli Boricua", amount: "$350.00", method: "ATH Móvil", createdAt: hoursAgo(5), column: "evidencia" },
  { id: "ORD-388", client: "Bistro 787", amount: "$420.00", method: "Tarjeta", createdAt: hoursAgo(28), column: "evidencia" },
  { id: "ORD-380", client: "Panadería Express", amount: "$198.00", method: "Transferencia", createdAt: hoursAgo(72), column: "confirmado" },
  { id: "ORD-375", client: "Hotel Caribe", amount: "$610.00", method: "ATH Móvil", createdAt: hoursAgo(96), column: "confirmado" },
  { id: "ORD-370", client: "Bar La Esquina", amount: "$89.00", method: "Efectivo", createdAt: hoursAgo(50), column: "rechazado" },
];

function isOverdue(date: Date) {
  return now.getTime() - date.getTime() > 24 * 60 * 60 * 1000;
}

export default function Pagos() {
  const [cards, setCards] = useState<PaymentCard[]>(initialCards);
  const [pinModalCard, setPinModalCard] = useState<PaymentCard | null>(null);
  const [pin, setPin] = useState("");

  const moveCard = (id: string, to: ColumnKey) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, column: to } : c)));
  };

  const handleUploadEvidence = (card: PaymentCard) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pagos</h1>
          <p className="text-sm text-muted-foreground">Tablero de cobranza y seguimiento de pagos</p>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 pb-4 md:mx-0 md:px-0">
          <div className="flex gap-4 min-w-[900px] xl:grid xl:grid-cols-4 xl:min-w-0">
            {columnMeta.map((col) => {
              const colCards = cards.filter((c) => c.column === col.key);
              return (
                <div key={col.key} className="flex-1 min-w-[220px] space-y-3">
                  <div className="flex items-center gap-2 sticky top-0 bg-background py-1 z-10">
                    <div className={`w-3 h-3 rounded-full ${col.accent}`} />
                    <h3 className="font-semibold text-sm truncate">{col.title}</h3>
                    <span className="ml-auto shrink-0 text-xs font-bold bg-muted rounded-full w-6 h-6 flex items-center justify-center">
                      {colCards.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {colCards.map((card) => {
                      const overdue = isOverdue(card.createdAt);
                      return (
                        <Card
                          key={card.id}
                          className={`transition-shadow hover:shadow-md ${
                            overdue ? "border-destructive/70 border-2" : ""
                          }`}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-mono text-muted-foreground">{card.id}</span>
                              {overdue && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0 gap-1">
                                  <AlertTriangle className="w-3 h-3" /> +24h
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium text-sm leading-tight">{card.client}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold">{card.amount}</span>
                              <Badge variant="outline" className={`text-[10px] ${methodStyles[card.method]}`}>
                                {card.method}
                              </Badge>
                            </div>

                            {col.key === "pendiente" && (
                              <Button
                                size="sm"
                                className="w-full gap-2 bg-primary hover:bg-primary/90"
                                onClick={() => handleUploadEvidence(card)}
                              >
                                <Camera className="w-4 h-4" /> Subir Evidencia
                              </Button>
                            )}
                            {col.key === "evidencia" && (
                              <Button
                                size="sm"
                                className="w-full gap-2 bg-success hover:bg-success/90 text-success-foreground"
                                onClick={() => { setPinModalCard(card); setPin(""); }}
                              >
                                <CheckCircle className="w-4 h-4" /> Confirmar Pago
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                    {colCards.length === 0 && (
                      <div className="border border-dashed rounded-lg p-6 text-center text-xs text-muted-foreground">
                        Sin pagos
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PIN Confirmation Modal */}
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
            <Button className="w-full bg-success hover:bg-success/90 text-success-foreground" disabled={pin.length < 6} onClick={handleConfirmPin}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
