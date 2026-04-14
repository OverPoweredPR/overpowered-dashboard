import { useState, useCallback, useEffect } from "react";

export type PlanTier = "basico" | "pro" | "enterprise";

export interface ModuleDef {
  id: string;
  label: string;
  url: string;
  minPlan: PlanTier;
}

const STORAGE_KEY = "op_enabled_modules";
const PLAN_KEY = "op_plan_tier";

const BASIC_MODULES = ["home", "ordenes", "pagos", "inventario"];

// All modules with their min plan requirement
export const ALL_MODULES: ModuleDef[] = [
  { id: "home", label: "Home", url: "/", minPlan: "basico" },
  { id: "ordenes", label: "Órdenes", url: "/ordenes", minPlan: "basico" },
  { id: "pagos", label: "Pagos", url: "/pagos", minPlan: "basico" },
  { id: "inventario", label: "Inventario", url: "/inventario", minPlan: "basico" },
  { id: "compras", label: "Compras", url: "/compras", minPlan: "pro" },
  { id: "facturas", label: "Facturas", url: "/facturas", minPlan: "pro" },
  { id: "auditoria", label: "Auditoría", url: "/auditoria", minPlan: "pro" },
  { id: "resoluciones", label: "Resoluciones", url: "/resoluciones", minPlan: "pro" },
  { id: "clientes", label: "Clientes", url: "/clientes", minPlan: "pro" },
  { id: "proveedores", label: "Proveedores", url: "/proveedores", minPlan: "pro" },
  { id: "empleados", label: "Empleados", url: "/empleados", minPlan: "pro" },
  { id: "finanzas", label: "Finanzas", url: "/finanzas", minPlan: "pro" },
  { id: "produccion", label: "Producción", url: "/produccion", minPlan: "pro" },
  { id: "rutas", label: "Rutas", url: "/rutas", minPlan: "pro" },
  { id: "calendario", label: "Calendario", url: "/calendario", minPlan: "pro" },
  { id: "metricas", label: "Métricas", url: "/metricas", minPlan: "pro" },
  { id: "inventario-avanzado", label: "Inv. Avanzado", url: "/inventario-avanzado", minPlan: "pro" },
  { id: "precios", label: "Precios", url: "/precios", minPlan: "pro" },
  { id: "descuentos", label: "Descuentos", url: "/descuentos", minPlan: "pro" },
  { id: "contratos", label: "Contratos", url: "/contratos", minPlan: "pro" },
  { id: "automatizaciones", label: "Automaciones", url: "/automatizaciones", minPlan: "pro" },
  { id: "reportes", label: "Reportes", url: "/reportes", minPlan: "pro" },
  { id: "soporte", label: "Soporte", url: "/soporte", minPlan: "basico" },
  { id: "settings", label: "Configuración", url: "/settings", minPlan: "basico" },
];

function loadEnabled(): string[] {
  if (typeof window === "undefined") return BASIC_MODULES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return BASIC_MODULES;
}

function loadPlan(): PlanTier {
  if (typeof window === "undefined") return "basico";
  return (localStorage.getItem(PLAN_KEY) as PlanTier) || "basico";
}

export function useModuleGating() {
  const [enabledModules, setEnabledModules] = useState<string[]>(loadEnabled);
  const [plan, setPlanState] = useState<PlanTier>(loadPlan);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enabledModules));
  }, [enabledModules]);

  useEffect(() => {
    localStorage.setItem(PLAN_KEY, plan);
  }, [plan]);

  const isModuleEnabled = useCallback(
    (moduleId: string) => enabledModules.includes(moduleId),
    [enabledModules]
  );

  const isModuleLocked = useCallback(
    (moduleId: string) => {
      const mod = ALL_MODULES.find((m) => m.id === moduleId);
      if (!mod) return false;
      if (mod.minPlan === "basico") return false;
      if (mod.minPlan === "pro" && (plan === "pro" || plan === "enterprise")) return false;
      if (mod.minPlan === "enterprise" && plan === "enterprise") return false;
      return true;
    },
    [plan]
  );

  const toggleModule = useCallback(
    (moduleId: string) => {
      setEnabledModules((prev) =>
        prev.includes(moduleId)
          ? prev.filter((id) => id !== moduleId)
          : [...prev, moduleId]
      );
    },
    []
  );

  const setPlan = useCallback((tier: PlanTier) => {
    setPlanState(tier);
    if (tier === "pro" || tier === "enterprise") {
      setEnabledModules(ALL_MODULES.map((m) => m.id));
    } else {
      setEnabledModules(BASIC_MODULES);
    }
  }, []);

  return { enabledModules, plan, isModuleEnabled, isModuleLocked, toggleModule, setPlan };
}
