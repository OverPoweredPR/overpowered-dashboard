"use client";

import { useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Home, Package, CreditCard, BarChart3, AlertTriangle, Info, XCircle } from "lucide-react";

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
  { label: "Inventario", url: "/inventario", icon: BarChart3 },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [animating, setAnimating] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = recentAlerts.filter((a) => a.severity === "error" || a.severity === "warning").length;

  useEffect(() => {
    setAnimating(true);
    const t = setTimeout(() => {
      setDisplayChildren(children);
      setAnimating(false);
    }, 150);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    setDisplayChildren(children);
  }, [children]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 flex items-center border-b bg-card px-4 sticky top-0 z-20">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Clover POS sincronizado</span>
            </div>

            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto relative hover:bg-muted active:scale-95 transition-all">
                  <Bell className="h-4 w-4" />
                  {unread > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                      {unread}
                    </Badge>
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
                  <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                    <Link href="/auditoria" onClick={() => setNotifOpen(false)}>Ver todas las alertas</Link>
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
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.url}
                  href={item.url}
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
        </div>
      </div>
    </SidebarProvider>
  );
}
