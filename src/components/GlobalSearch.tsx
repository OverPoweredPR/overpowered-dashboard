"use client"
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, CreditCard, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const searchableItems = [
  { type: "order", id: "ORD-2087", label: "Orden #2087 — Café La Plaza", url: "/ordenes", icon: Package },
  { type: "order", id: "ORD-2086", label: "Orden #2086 — Restaurante El Coquí", url: "/ordenes", icon: Package },
  { type: "order", id: "ORD-2085", label: "Orden #2085 — Panadería Don Juan", url: "/ordenes", icon: Package },
  { type: "order", id: "ORD-2084", label: "Orden #2084 — Hotel Condado", url: "/ordenes", icon: Package },
  { type: "payment", id: "PAY-1042", label: "Pago #1042 — $1,250 ATH Móvil", url: "/pagos", icon: CreditCard },
  { type: "payment", id: "PAY-1041", label: "Pago #1041 — $890 Transferencia", url: "/pagos", icon: CreditCard },
  { type: "payment", id: "PAY-1040", label: "Pago #1040 — $2,100 Tarjeta", url: "/pagos", icon: CreditCard },
  { type: "invoice", id: "FAC-301", label: "Factura #301 — Café La Plaza — $4,200", url: "/facturas", icon: FileText },
  { type: "invoice", id: "FAC-300", label: "Factura #300 — Restaurante El Coquí — $1,850", url: "/facturas", icon: FileText },
  { type: "invoice", id: "FAC-299", label: "Factura #299 — Hotel Condado — $6,300", url: "/facturas", icon: FileText },
];

const typeLabels: Record<string, string> = { order: "Orden", payment: "Pago", invoice: "Factura" };

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.length >= 2
    ? searchableItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()) || i.id.toLowerCase().includes(query.toLowerCase()))
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[selectedIdx]) {
      router.push(results[selectedIdx].url);
      setQuery(""); setOpen(false);
    } else if (e.key === "Escape") { setQuery(""); setOpen(false); }
  };

  const handleSelect = (item: typeof searchableItems[0]) => {
    router.push(item.url);
    setQuery(""); setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full max-w-xs lg:max-w-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar órdenes, pagos, facturas…"
          className="pl-8 pr-8 h-8 text-xs bg-muted/50 border-transparent focus-visible:border-input focus-visible:ring-1"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((item, i) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors ${i === selectedIdx ? "bg-muted/50" : ""}`}
            >
              <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.label}</p>
              </div>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{typeLabels[item.type]}</span>
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 p-4 text-center">
          <p className="text-xs text-muted-foreground">No se encontraron resultados para "{query}"</p>
        </div>
      )}
    </div>
  );
}
