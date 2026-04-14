"use client"
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Puzzle, Palette, Save, RefreshCw, CheckCircle2, XCircle, Moon, Sun, Globe, Crown, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useModuleGating, ALL_MODULES, type PlanTier } from "@/hooks/use-module-gating";

interface Integration {
  name: string;
  icon: string;
  connected: boolean;
  lastSync: string | null;
}

const initialIntegrations: Integration[] = [
  { name: "Shopify", icon: "🛍️", connected: true, lastSync: "Hace 12 min" },
  { name: "Airtable", icon: "📊", connected: true, lastSync: "Hace 3 hr" },
  { name: "Clover POS", icon: "💳", connected: true, lastSync: "Hace 5 min" },
  { name: "WhatsApp", icon: "💬", connected: false, lastSync: null },
];

export default function Settings() {
  const { plan, isModuleLocked, isModuleEnabled, toggleModule, setPlan } = useModuleGating();

  const [userEmail, setUserEmail] = useState("usuario@email.com");
  const [tenantName, setTenantName] = useState("Baguettes de PR");

  useEffect(() => {
    setUserEmail(localStorage.getItem("op_auth") || "usuario@email.com");
    setTenantName(localStorage.getItem("op_tenant") || "Baguettes de PR");
  }, []);

  // Perfil
  const [name, setName] = useState("Admin Principal");
  const [role] = useState("Administrador");

  // Notificaciones
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);

  // Integraciones
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [reconnecting, setReconnecting] = useState<string | null>(null);

  // Apariencia
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState("es");

  const handleSave = (section: string) => {
    toast.success(`${section} guardado correctamente`);
  };

  const handleReconnect = async (integrationName: string) => {
    setReconnecting(integrationName);
    await new Promise((r) => setTimeout(r, 2000));
    setIntegrations((prev) =>
      prev.map((i) =>
        i.name === integrationName ? { ...i, connected: true, lastSync: "Ahora" } : i
      )
    );
    setReconnecting(null);
    toast.success(`${integrationName} reconectado`);
  };

  const handleDisconnect = (integrationName: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.name === integrationName ? { ...i, connected: false, lastSync: null } : i
      )
    );
    toast.success(`${integrationName} desconectado`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="animate-fade-in">
          <h1 className="page-title">Configuración</h1>
          <p className="text-sm text-muted-foreground">Gestiona tu perfil, notificaciones e integraciones</p>
        </div>

        <Tabs defaultValue="perfil" className="animate-fade-in">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="perfil" className="gap-1.5 text-xs"><User className="w-3.5 h-3.5" /> Perfil</TabsTrigger>
            <TabsTrigger value="plan" className="gap-1.5 text-xs"><Crown className="w-3.5 h-3.5" /> Plan & Módulos</TabsTrigger>
            <TabsTrigger value="notificaciones" className="gap-1.5 text-xs"><Bell className="w-3.5 h-3.5" /> Notificaciones</TabsTrigger>
            <TabsTrigger value="integraciones" className="gap-1.5 text-xs"><Puzzle className="w-3.5 h-3.5" /> Integraciones</TabsTrigger>
            <TabsTrigger value="apariencia" className="gap-1.5 text-xs"><Palette className="w-3.5 h-3.5" /> Apariencia</TabsTrigger>
          </TabsList>

          {/* ── Perfil ── */}
          <TabsContent value="perfil" className="mt-6 space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información del perfil</CardTitle>
                <CardDescription>Tu información personal y rol en {tenantName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nombre</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Correo electrónico</label>
                  <Input value={userEmail} disabled className="opacity-60" />
                  <p className="text-[11px] text-muted-foreground mt-1">El correo no se puede modificar</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Rol</label>
                  <Badge className="bg-primary/15 text-primary border-primary/30" variant="outline">{role}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Negocio</label>
                  <p className="text-sm text-muted-foreground">{tenantName}</p>
                </div>
                <Separator />
                <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => handleSave("Perfil")}>
                  <Save className="w-4 h-4" /> Guardar perfil
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Plan & Módulos ── */}
          <TabsContent value="plan" className="mt-6 space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" /> Plan actual
                </CardTitle>
                <CardDescription>Gestiona tu suscripción y los módulos habilitados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Plan:</span>
                  <Select value={plan} onValueChange={(v) => setPlan(v as PlanTier)}>
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">🥉 Básico</SelectItem>
                      <SelectItem value="pro">⭐ Pro</SelectItem>
                      <SelectItem value="enterprise">💎 Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge className={plan === "basico" ? "bg-muted text-muted-foreground" : plan === "pro" ? "bg-primary/15 text-primary border-primary/30" : "bg-amber-500/15 text-amber-600 border-amber-500/30"} variant="outline">
                    {plan === "basico" ? "Básico" : plan === "pro" ? "Pro" : "Enterprise"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {plan === "basico" ? "Acceso a 4 módulos esenciales. Upgrade para desbloquear todo." : plan === "pro" ? "Todos los módulos desbloqueados." : "Acceso completo con soporte premium."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Módulos</CardTitle>
                <CardDescription>Habilita o deshabilita módulos según tu plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ALL_MODULES.filter((m) => m.id !== "home" && m.id !== "settings").map((mod) => {
                    const locked = isModuleLocked(mod.id);
                    const enabled = isModuleEnabled(mod.id);
                    return (
                      <div
                        key={mod.id}
                        className={`flex items-center justify-between rounded-lg border p-3 transition-all ${locked ? "opacity-50 border-dashed" : "border-border"}`}
                      >
                        <div className="flex items-center gap-2">
                          {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                          <span className="text-sm font-medium text-foreground">{mod.label}</span>
                          {locked && (
                            <Badge variant="outline" className="text-[9px] border-0 bg-amber-500/10 text-amber-600">
                              Requiere Pro
                            </Badge>
                          )}
                          {mod.minPlan === "basico" && (
                            <Badge variant="outline" className="text-[9px] border-0 bg-primary/10 text-primary">
                              Básico
                            </Badge>
                          )}
                        </div>
                        {locked ? (
                          <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => window.open("https://overpowered.pr", "_blank")}>
                            <Sparkles className="h-3 w-3" /> Upgrade
                          </Button>
                        ) : (
                          <Switch
                            checked={enabled}
                            onCheckedChange={() => toggleModule(mod.id)}
                            disabled={mod.minPlan === "basico"}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Notificaciones ── */}
          <TabsContent value="notificaciones" className="mt-6 space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preferencias de notificación</CardTitle>
                <CardDescription>Configura cómo y cuándo recibes alertas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Alertas por WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Recibe notificaciones en tu WhatsApp</p>
                  </div>
                  <Switch checked={whatsappAlerts} onCheckedChange={setWhatsappAlerts} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Alertas por correo</p>
                    <p className="text-xs text-muted-foreground">Recibe un resumen diario por email</p>
                  </div>
                  <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Solo alertas críticas</p>
                    <p className="text-xs text-muted-foreground">Ignora advertencias, solo errores graves</p>
                  </div>
                  <Switch checked={criticalOnly} onCheckedChange={setCriticalOnly} />
                </div>
                <Separator />
                <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => handleSave("Notificaciones")}>
                  <Save className="w-4 h-4" /> Guardar notificaciones
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Integraciones ── */}
          <TabsContent value="integraciones" className="mt-6 space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Integraciones conectadas</CardTitle>
                <CardDescription>Servicios externos vinculados a {tenantName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {integrations.map((integ) => (
                  <div key={integ.name} className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-sm transition-all">
                    <span className="text-2xl">{integ.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{integ.name}</p>
                        {integ.connected ? (
                          <Badge variant="outline" className="text-[10px] bg-success/10 text-primary border-success/30 gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Conectado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30 gap-1">
                            <XCircle className="w-3 h-3" /> Desconectado
                          </Badge>
                        )}
                      </div>
                      {integ.lastSync && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">Última sincronización: {integ.lastSync}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {integ.connected ? (
                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => handleDisconnect(integ.name)}>
                          Desconectar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="text-xs h-8 gap-1.5 bg-primary hover:bg-primary/90"
                          disabled={reconnecting === integ.name}
                          onClick={() => handleReconnect(integ.name)}
                        >
                          {reconnecting === integ.name ? (
                            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Conectando...</>
                          ) : (
                            "Reconectar"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Apariencia ── */}
          <TabsContent value="apariencia" className="mt-6 space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Apariencia y lenguaje</CardTitle>
                <CardDescription>Personaliza la interfaz del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-warning" />}
                    <div>
                      <p className="text-sm font-medium">Modo oscuro</p>
                      <p className="text-xs text-muted-foreground">Cambiar entre tema claro y oscuro</p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Idioma</p>
                      <p className="text-xs text-muted-foreground">Selecciona el idioma de la interfaz</p>
                    </div>
                  </div>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">🇪🇸 Español</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => handleSave("Apariencia")}>
                  <Save className="w-4 h-4" /> Guardar apariencia
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
