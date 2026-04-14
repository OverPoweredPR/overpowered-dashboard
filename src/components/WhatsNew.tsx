import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const updates = [
  { id: 1, title: "Auto-reconciliación nocturna", description: "23 transacciones reconciliadas automáticamente", time: "Hoy, 6:00 AM" },
  { id: 2, title: "Alerta de precio: Mantequilla +8%", description: "Workflow de monitoreo de precios activado", time: "Ayer, 4:15 PM" },
  { id: 3, title: "Sync Clover POS completado", description: "47 órdenes importadas sin errores", time: "Ayer, 11:30 AM" },
];

export function WhatsNewBadge({ collapsed }: { collapsed: boolean }) {
  const [seen, setSeen] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) setSeen(true); }}>
      <PopoverTrigger asChild>
        <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full ${collapsed ? "justify-center" : ""}`}>
          <div className="relative shrink-0">
            <Sparkles className="w-4 h-4" />
            {!seen && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          {!collapsed && (
            <span className="text-sm font-medium flex-1 text-left">What's New</span>
          )}
          {!collapsed && !seen && (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-primary/20 text-primary border-0">3</Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-72 p-0">
        <div className="p-3 border-b flex items-center justify-between">
          <h4 className="text-sm font-semibold flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> What's New</h4>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {updates.map(u => (
            <div key={u.id} className="p-3 border-b last:border-0 hover:bg-muted/50 transition-colors">
              <p className="text-xs font-semibold">{u.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{u.description}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{u.time}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
