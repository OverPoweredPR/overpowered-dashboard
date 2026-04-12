import {
  Home, Package, CreditCard, BarChart3, ShoppingCart,
  FileText, Search, CheckCircle, LogOut
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Órdenes", url: "/ordenes", icon: Package },
  { title: "Pagos", url: "/pagos", icon: CreditCard },
  { title: "Inventario", url: "/inventario", icon: BarChart3 },
  { title: "Compras", url: "/compras", icon: ShoppingCart },
  { title: "Facturas", url: "/facturas", icon: FileText },
  { title: "Auditoría", url: "/auditoria", icon: Search },
  { title: "Resoluciones", url: "/resoluciones", icon: CheckCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("op_auth");
  const tenantName = localStorage.getItem("op_tenant") || "Baguettes de PR";

  const handleLogout = () => {
    localStorage.removeItem("op_auth");
    localStorage.removeItem("op_tenant");
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm">
              OP
            </div>
            <div>
              <p className="text-[11px] font-medium text-sidebar-foreground/60 uppercase tracking-wider">OverPowered</p>
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
              {items.map((item) => {
                const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        activeClassName="!bg-sidebar-primary !text-sidebar-primary-foreground hover:!bg-sidebar-primary hover:!text-sidebar-primary-foreground"
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {!collapsed && <span className="font-medium text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
  );
}
