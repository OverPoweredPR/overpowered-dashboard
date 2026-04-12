"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Home,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  CreditCard,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

const navItems = [
  { label: "Home", url: "/home", icon: Home },
  { label: "Inventario", url: "/inventario", icon: BarChart3 },
  { label: "Compras", url: "/compras", icon: ShoppingCart },
  { label: "Facturas", url: "/facturas", icon: FileText },
  { label: "Órdenes", url: "/ordenes", icon: Package },
  { label: "Pagos", url: "/pagos", icon: CreditCard },
  { label: "Resoluciones", url: "/resoluciones", icon: ClipboardList },
  { label: "Auditoría", url: "/auditoria", icon: ShieldCheck },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3 border-b">
        <span className="font-bold text-base text-primary">Borinquen Natural</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
