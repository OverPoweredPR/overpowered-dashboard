import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Bell, AlertTriangle, CreditCard, Package, Settings2,
  XCircle, Info, CheckCheck, Trash2, DollarSign, TruckIcon, Wifi,
} from "lucide-react";

type Category = "alertas" | "pagos" | "inventario" | "sistema";

interface Notification {
  id: number;
  category: Category;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const categoryMeta: Record<Category, { label: string; icon: typeof Bell; color: string }> = {
  alertas: { label: "Alertas", icon: AlertTriangle, color: "text-destructive" },
  pagos: { label: "Pagos", icon: DollarSign, color: "text-primary" },
  inventario: { label: "Inventario", icon: Package, color: "text-warning" },
  sistema: { label: "Sistema", icon: Settings2, color: "text-info" },
};

const allCategories: Category[] = ["alertas", "pagos", "inventario", "sistema"];

const initialNotifications: Notification[] = [
  { id: 1, category: "alertas", title: "Stock cero detectado", description: "Huevos orgánicos — reabastecimiento urgente requerido.", time: "Hace 5 min", read: false },
  { id: 2, category: "alertas", title: "Pago vencido +24h", description: "ORD-398 de Café La Plaza sin confirmar.", time: "Hace 12 min", read: false },
  { id: 3, category: "pagos", title: "Pago confirmado", description: "ATH Móvil $1,250.00 — Pan Artesanal SJ.", time: "Hace 30 min", read: false },
  { id: 4, category: "pagos", title: "Evidencia recibida", description: "Transferencia $890.00 pendiente de verificación.", time: "Hace 1 hr", read: false },
  { id: 5, category: "inventario", title: "Precio actualizado", description: "Mantequilla importada aumentó 8% vs. último pedido.", time: "Hace 2 hr", read: true },
  { id: 6, category: "inventario", title: "Entrega recibida", description: "Pedido #C-047 de Distribuidora Central — 23 ítems.", time: "Hace 3 hr", read: true },
  { id: 7, category: "sistema", title: "Sincronización Clover POS", description: "23 transacciones importadas exitosamente.", time: "Hace 4 hr", read: true },
  { id: 8, category: "sistema", title: "Reconciliación nocturna", description: "Proceso completado — 0 discrepancias encontradas.", time: "Hace 6 hr", read: true },
];

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = activeFilter === "all"
    ? notifications
    : notifications.filter((n) => n.category === activeFilter);

  const handleOpen = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Auto-mark all as read after a short delay
      setTimeout(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }, 1500);
    }
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-muted active:scale-95 transition-all">
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-scale-in">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96 p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-4 pb-3 border-b space-y-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">Notificaciones</SheetTitle>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {unreadCount} sin leer
              </Badge>
            )}
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5" /> Marcar leídas
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground" onClick={clearAll}>
              <Trash2 className="h-3.5 w-3.5" /> Limpiar
            </Button>
          </div>
        </SheetHeader>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              activeFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Todas
          </button>
          {allCategories.map((cat) => {
            const meta = categoryMeta[cat];
            const count = notifications.filter((n) => n.category === cat && !n.read).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  activeFilter === cat
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {meta.label}
                {count > 0 && (
                  <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                    activeFilter === cat ? "bg-primary-foreground/20" : "bg-destructive text-destructive-foreground"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Sin notificaciones</p>
              <p className="text-xs mt-1">Todo está al día</p>
            </div>
          ) : (
            filtered.map((n) => {
              const meta = categoryMeta[n.category];
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors hover:bg-muted/50 ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold leading-snug truncate">{n.title}</p>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.description}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{n.time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
