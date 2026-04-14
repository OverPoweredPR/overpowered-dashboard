"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

const shortcuts = [
  { keys: ["G", "H"], label: "Ir a Home" },
  { keys: ["G", "O"], label: "Ir a Órdenes" },
  { keys: ["G", "P"], label: "Ir a Pagos" },
  { keys: ["G", "I"], label: "Ir a Inventario" },
  { keys: ["?"], label: "Mostrar atajos" },
];

const routeMap: Record<string, string> = {
  h: "/", o: "/ordenes", p: "/pagos", i: "/inventario",
};

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const [gPressed, setGPressed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      if (e.key === "?") { setShowHelp(true); return; }

      if (e.key.toLowerCase() === "g" && !gPressed) {
        setGPressed(true);
        timer = setTimeout(() => setGPressed(false), 1000);
        return;
      }

      if (gPressed) {
        const route = routeMap[e.key.toLowerCase()];
        if (route) { e.preventDefault(); router.push(route); }
        setGPressed(false);
        clearTimeout(timer);
      }
    };

    document.addEventListener("keydown", handler);
    return () => { document.removeEventListener("keydown", handler); clearTimeout(timer); };
  }, [gPressed, router]);

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" /> Atajos de teclado
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map(s => (
            <div key={s.label} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="flex gap-1">
                {s.keys.map(k => (
                  <kbd key={k} className="px-2 py-0.5 bg-muted rounded text-xs font-mono font-medium">{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
