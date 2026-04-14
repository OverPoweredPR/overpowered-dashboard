import { useState, useEffect, useCallback, ReactNode } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Bell, Home, Package, CreditCard, BarChart3, AlertTriangle, Info, XCircle, ShoppingCart, FileText, Shield, Scale, MoreHorizontal, PieChart, Settings, Plus, X, Moon, Sun } from "lucide-react";
import { GlobalSearch } from "@/components/GlobalSearch";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";

const quickActions = [
  { label: "Nueva Orden", emoji: "📦", url: "/ordenes" },
  { label: "Subir Pago", emoji: "💳", url: "/pagos" },
  { label: "Nueva Factura", emoji: "🧾", url: "/facturas" },
  { label: "Nueva Compra", emoji: "🛒", url: "/compras" },
];

const recentAlerts = [
  { id: 1, message: "Stock cero: Huevos — reabastecimiento requerido", severity: "error", time: "Hace 5 min" },
  { id: 2, message: "Pago ORD-398 vencido +24h — Café La Plaza", severity: "warning", time: "Hace 12 min" },
  { id: 3, message: "Reconciliación nocturna completada", severity: "info", time: "Hace 2 hr" },
  { id: 4, message: "Precio de mantequilla aumentó 8%", severity: "warning", time: "Hace 3 hr" },
  { id: 5, message: "Clover POS sincronizado — 23 transacciones", severity: "info", time: "Hace 4 hr" },
];

const severityIcon: Record<string, typeof XCircle> = { error: XCircle, warning: AlertTriangle, info: Info };
const severityStyle: Record<string, string> = {
  error: "text-destructive",
  warning: "text-warning",
  info: "text-info",
};

const mobileNavItems = [
  { label: "Home", url: "/", icon: Home },
  { label: "Órdenes", url: "/ordenes", icon: Package },
  { label: "Pagos", url: "/pagos", icon: CreditCard },
  { label: "Más", url: "__more__", icon: MoreHorizontal },
];

const moreNavItems = [
  { label: "Inventario", url: "/inventario", icon: BarChart3 },
  { label: "Compras", url: "/compras", icon: ShoppingCart },
  { label: "Facturas", url: "/facturas", icon: FileText },
  { label: "Auditoría", url: "/auditoria", icon: Shield },
  { label: "Resoluciones", url: "/resoluciones", icon: Scale },
  { label: "Reportes", url: "/reportes", icon: PieChart },
  { label: "Configuración", url: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [animating, setAnimating] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [notifOpen, setNotifOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const unread = recentAlerts.filter((a) => a.severity === "error" || a.severity === "warning").length;

  // Close FAB on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFabOpen(false);
    };
    if (fabOpen) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [fabOpen]);

  useEffect(() => {
    setAnimating(true);
    const t = setTimeout(() => {
      setDisplayChildren(children);
      setAnimating(false);
    }, 150);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    setDisplayChildren(children);
  }, [children]);

  return (
    <SidebarProvider>
      <KeyboardShortcuts />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 flex items-center border-b bg-card px-4 sticky top-0 z-20">
            <SidebarTrigger className="mr-4" />
            <div className="hidden sm:flex items-center gap-2 mr-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">Clover POS sincronizado</span>
            </div>
            <GlobalSearch />

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="ml-auto hover:bg-muted active:scale-95 transition-all">
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </Button>

            {/* Notification Bell */}
            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-muted active:scale-95 transition-all">
                  <Bell className="h-4.5 w-4.5" />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b">
                  <h4 className="font-semibold text-sm">Notificaciones</h4>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {recentAlerts.map((a) => {
                    const Icon = severityIcon[a.severity];
                    return (
                      <div key={a.id} className="flex items-start gap-3 p-3 border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${severityStyle[a.severity]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-snug">{a.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full text-xs hover:bg-muted active:scale-[0.98] transition-all" asChild>
                    <Link to="/auditoria" onClick={() => setNotifOpen(false)}>Ver todas las alertas</Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </header>

          {/* Main content with page transitions */}
          <main className={`flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6 transition-all duration-200 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            {displayChildren}
          </main>

          {/* Mobile bottom nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t flex items-center justify-around h-14 px-2">
            {mobileNavItems.map((item) => {
              if (item.url === "__more__") {
                const isMoreActive = moreNavItems.some((m) => location.pathname === m.url);
                return (
                  <Drawer key="more" open={moreOpen} onOpenChange={setMoreOpen}>
                    <DrawerTrigger asChild>
                      <button
                        className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all active:scale-95 ${
                          isMoreActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                      </button>
                    </DrawerTrigger>
                    <DrawerContent className="bg-[#0F1117] border-[#1e2030]">
                      <div className="p-4 pb-8">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Más módulos</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {moreNavItems.map((m) => {
                            const active = location.pathname === m.url;
                            return (
                              <Link
                                key={m.url}
                                to={m.url}
                                onClick={() => setMoreOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all active:scale-95 ${
                                  active
                                    ? "bg-primary text-primary-foreground"
                                    : "text-slate-300 hover:bg-[#1e2030]"
                                }`}
                              >
                                <m.icon className="h-5 w-5" />
                                <span className="text-sm font-medium">{m.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </DrawerContent>
                  </Drawer>
                );
              }
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all active:scale-95 ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          {/* Mobile FAB */}
          <div className="md:hidden">
            {fabOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setFabOpen(false)}
              />
            )}
            <div className="fixed bottom-20 right-4 z-50 flex flex-col-reverse items-end gap-3">
              {fabOpen && quickActions.map((action, i) => (
                <button
                  key={action.label}
                  onClick={() => { setFabOpen(false); navigate(action.url); }}
                  className="flex items-center gap-2 bg-card border rounded-full pl-4 pr-5 py-2.5 shadow-lg animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: "backwards" }}
                >
                  <span className="text-lg">{action.emoji}</span>
                  <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setFabOpen((v) => !v)}
              className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{ backgroundColor: "#0F6E56" }}
            >
              {fabOpen ? (
                <X className="h-6 w-6 text-white transition-transform duration-200 rotate-0" />
              ) : (
                <Plus className="h-6 w-6 text-white transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
