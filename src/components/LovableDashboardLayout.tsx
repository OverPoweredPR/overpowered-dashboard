import { useState } from "react";
import {
  Home, Package, CreditCard, BarChart3, ShoppingCart,
  FileText, Search, CheckCircle, LogOut, Settings, PieChart, Users, Truck, UserCheck, Wallet, ChefHat, Route, CalendarDays, Activity, Boxes, HelpCircle, Tag, BadgePercent, ScrollText, Bot, Lock
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WhatsNewBadge } from "@/components/WhatsNew";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useModuleGating, ALL_MODULES } from "@/hooks/use-module-gating";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  home: Home, ordenes: Package, pagos: CreditCard, inventario: BarChart3,
  compras: ShoppingCart, facturas: FileText, auditoria: Search, resoluciones: CheckCircle,
  clientes: Users, proveedores: Truck, empleados: UserCheck, finanzas: Wallet,
  produccion: ChefHat, rutas: Route, calendario: CalendarDays, metricas: Activity,
  "inventario-avanzado": Boxes, precios: Tag, descuentos: BadgePercent,
  contratos: ScrollText, automatizaciones: Bot, reportes: PieChart,
  soporte: HelpCircle, settings: Settings,
};

const badgeMap: Record<string, number> = { auditoria: 3 };

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("op_auth");
  const tenantName = localStorage.getItem("op_tenant") || "Baguettes de PR";
  const { isModuleEnabled, isModuleLocked } = useModuleGating();
  const [upgradeModule, setUpgradeModule] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("op_auth");
    localStorage.removeItem("op_tenant");
    navigate("/login");
  };
  // Split into enabled and locked
  const enabledItems = ALL_MODULES.filter((m) => !isModuleLocked(m.id));
  const lockedItems = ALL_MODULES.filter((m) => isModuleLocked(m.id));

  const renderItem = (item: any, locked: boolean) => {
    const Icon = iconMap[item.id] || Home;
    const badge = badgeMap[item.id];
    const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);

    if (locked) {
      return (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton tooltip={`${item.label} 🔒`}>
            <button
              onClick={() => setUpgradeModule(item.label)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left opacity-40 cursor-pointer hover:opacity-60 transition-opacity"
            >
              <div className="relative shrink-0">
                <Icon className="w-4 h-4" />
                {!collapsed && <Lock className="w-2.5 h-2.5 absolute -bottom-0.5 -right-1 text-muted-foreground" />}
              </div>
              {!collapsed && <span className="font-medium text-sm text-muted-foreground">{item.label}</span>}
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
          <NavLink
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeClassName="!bg-sidebar-primary !text-sidebar-primary-foreground hover:!bg-sidebar-primary hover:!text-sidebar-primary-foreground"
          >
            <div className="relative shrink-0">
              <Icon className="w-4 h-4" />
              {badge && badge > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </div>
            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r-0">
        <SidebarHeader className="p-4">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm">
                OP
              </div>
              <div>
                <p className="text-[11px] font-medium text-sidebar-primary uppercase tracking-wider">OverPowered</p>
                <h2 className="font-bold text-sm text-sidebar-accent-foreground leading-tight">{tenantName}</h2>
                {userEmail && (
                  <p className="text-[10px] text-sidebar-foreground/40 truncate max-w-[140px]">{userEmail}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm mx-auto">
              OP
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {enabledItems.map((item: any) => renderItem(item, false))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {lockedItems.length > 0 && (
            <SidebarGroup>
              {!collapsed && (
                <div className="px-3 py-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">🔒 Requiere Pro</p>
                </div>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {lockedItems.map((item: any) => renderItem(item, true))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <div className="px-2 mt-2">
            <WhatsNewBadge collapsed={collapsed} />
          </div>
        </SidebarContent>

        <SidebarFooter className="p-3">
          {!collapsed ? (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="mx-auto text-sidebar-foreground/50 hover:text-sidebar-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </SidebarFooter>
      </Sidebar>

      <UpgradeModal
        open={!!upgradeModule}
        onOpenChange={() => setUpgradeModule(null)}
        moduleName={upgradeModule || undefined}
      />
    </>
  );
}
