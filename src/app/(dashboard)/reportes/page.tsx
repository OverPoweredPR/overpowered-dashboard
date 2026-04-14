import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, ShoppingCart, Receipt, TrendingUp, Download, Maximize2 } from "lucide-react";
import { toast } from "sonner";

/* ── Static data ── */
const weeklyRevenue = [
  { label: "Sem 1", value: 4200 },
  { label: "Sem 2", value: 5100 },
  { label: "Sem 3", value: 3800 },
  { label: "Sem 4", value: 6400 },
];

const paymentMethods = [
  { label: "ATH Móvil", value: 42, color: "hsl(165 76% 25%)" },
  { label: "Transferencia", value: 28, color: "hsl(210 90% 55%)" },
  { label: "Efectivo", value: 18, color: "hsl(38 92% 50%)" },
  { label: "Tarjeta", value: 12, color: "hsl(280 60% 55%)" },
];

const criticalStock = [
  { product: "Huevos (caja)", pct: 8 },
  { product: "Mantequilla", pct: 15 },
  { product: "Harina integral", pct: 22 },
  { product: "Levadura seca", pct: 30 },
  { product: "Queso crema", pct: 38 },
];

const kpis = [
  { label: "Revenue MTD", value: "$19,500", icon: DollarSign, trend: "+12%", up: true },
  { label: "Órdenes MTD", value: "284", icon: ShoppingCart, trend: "+8%", up: true },
  { label: "Ticket promedio", value: "$68.66", icon: Receipt, trend: "-3%", up: false },
  { label: "Tasa de cobro", value: "87%", icon: TrendingUp, trend: "+5%", up: true },
];

const dateRanges = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "ytd", label: "Año actual" },
];

/* ── SVG chart components ── */

function BarChart({ data, maxVal }: { data: { label: string; value: number }[]; maxVal: number }) {
  const barW = 40;
  const gap = 24;
  const chartW = data.length * (barW + gap) - gap;
  const chartH = 140;

  return (
    <svg viewBox={`0 0 ${chartW + 20} ${chartH + 28}`} className="w-full h-48" preserveAspectRatio="xMidYMid meet">
      {data.map((d, i) => {
        const h = (d.value / maxVal) * chartH;
        const x = i * (barW + gap) + 10;
        return (
          <g key={d.label}>
            <rect x={x} y={chartH - h} width={barW} height={h} rx={4} fill="hsl(165 76% 25%)" opacity={0.85} className="transition-all hover:opacity-100" />
            <text x={x + barW / 2} y={chartH - h - 6} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
              ${(d.value / 1000).toFixed(1)}k
            </text>
            <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" className="fill-muted-foreground text-[9px]">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumAngle = -90;
  const r = 60;
  const cx = 80;
  const cy = 80;

  const slices = data.map((d) => {
    const angle = (d.value / total) * 360;
    const startRad = (cumAngle * Math.PI) / 180;
    const endRad = ((cumAngle + angle) * Math.PI) / 180;
    const largeArc = angle > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
    cumAngle += angle;
    return { ...d, path };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-40 h-40 shrink-0">
        {slices.map((s) => (
          <path key={s.label} d={s.path} fill={s.color} className="transition-opacity hover:opacity-80" stroke="hsl(var(--card))" strokeWidth={2} />
        ))}
      </svg>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-semibold ml-auto">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HBarChart({ data }: { data: { product: string; pct: number }[] }) {
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.product} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground truncate max-w-[160px]">{d.product}</span>
            <span className={`font-semibold ${d.pct <= 15 ? "text-destructive" : d.pct <= 30 ? "text-warning" : "text-primary"}`}>{d.pct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${d.pct <= 15 ? "bg-destructive" : d.pct <= 30 ? "bg-warning" : "bg-primary"}`}
              style={{ width: `${d.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Report card wrapper ── */
function ReportCard({ title, children }: { title: string; children: React.ReactNode }) {
  const [range, setRange] = useState("30d");

  const handleDownload = () => toast.success(`Descargando PDF de "${title}"...`);
  const handleExpand = () => toast.info(`Vista completa: ${title}`);

  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="h-7 w-36 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {dateRanges.map((r) => <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/90 flex-1" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" /> Descargar PDF
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs flex-1" onClick={handleExpand}>
            <Maximize2 className="w-3.5 h-3.5" /> Ver completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Page ── */
export default function Reportes() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="page-title">Reportes & Analytics</h1>
          <p className="text-sm text-muted-foreground">Visualiza métricas clave y descarga reportes</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
          {kpis.map((k, i) => (
            <Card key={k.label} className="hover:shadow-md transition-all" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <k.icon className="w-4 h-4 text-muted-foreground" />
                  <span className={`text-[11px] font-medium ${k.up ? "text-primary" : "text-destructive"}`}>{k.trend}</span>
                </div>
                <p className="text-xl font-bold">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
          <ReportCard title="Ventas por semana">
            <BarChart data={weeklyRevenue} maxVal={7000} />
          </ReportCard>

          <ReportCard title="Pagos por método">
            <PieChart data={paymentMethods} />
          </ReportCard>

          <ReportCard title="Inventario crítico">
            <HBarChart data={criticalStock} />
          </ReportCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
