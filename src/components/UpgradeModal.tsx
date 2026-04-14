import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, Sparkles, ExternalLink } from "lucide-react";

const proFeatures = [
  "Todos los módulos del dashboard",
  "Automatizaciones con IA (VAPI + WhatsApp)",
  "Reportes avanzados y métricas",
  "Gestión de contratos y precios",
  "Inventario avanzado con alertas",
  "Rutas de entrega optimizadas",
  "Producción y planificación",
  "Soporte prioritario",
];

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleName?: string;
}

export function UpgradeModal({ open, onOpenChange, moduleName }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="h-5 w-5 text-primary" />
            <DialogTitle>Módulo bloqueado</DialogTitle>
          </div>
          <DialogDescription>
            {moduleName
              ? `"${moduleName}" requiere el Plan Pro para funcionar.`
              : "Este módulo requiere el Plan Pro."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Plan Pro incluye:</span>
          </div>
          <ul className="space-y-2">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button className="w-full gap-2" onClick={() => window.open("https://overpowered.pr", "_blank")}>
            <ExternalLink className="h-4 w-4" /> Contactar a OverPowered PR
          </Button>
          <Button variant="ghost" className="w-full text-sm" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
