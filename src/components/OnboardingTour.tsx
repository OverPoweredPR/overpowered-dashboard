"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, PartyPopper } from "lucide-react";

const STORAGE_KEY = "op_tour_done";

interface TourStep {
  title: string;
  description: string;
  route: string;
  targetSelector: string;
  position: "bottom" | "right" | "top" | "left";
}

const steps: TourStep[] = [
  {
    title: "Navegación principal",
    description: "Usa el sidebar para moverte entre módulos: Órdenes, Pagos, Inventario y más.",
    route: "/",
    targetSelector: "[data-sidebar='sidebar']",
    position: "right",
  },
  {
    title: "Métricas en tiempo real",
    description: "El dashboard muestra tus KPIs más importantes: ingresos, órdenes pendientes, y alertas.",
    route: "/",
    targetSelector: "[data-tour='metrics']",
    position: "bottom",
  },
  {
    title: "Pagos estilo Kanban",
    description: "Visualiza el estado de todos los pagos en columnas arrastrables: Pendiente, Parcial y Pagado.",
    route: "/pagos",
    targetSelector: "[data-tour='pagos-board']",
    position: "bottom",
  },
  {
    title: "Alertas y Auditoría",
    description: "Monitorea alertas críticas, stock bajo y pagos vencidos desde el módulo de Auditoría.",
    route: "/auditoria",
    targetSelector: "[data-tour='audit-table']",
    position: "bottom",
  },
  {
    title: "Acciones rápidas (móvil)",
    description: "En móvil, usa el botón + flotante para crear órdenes, pagos y facturas al instante.",
    route: "/",
    targetSelector: "[data-tour='fab']",
    position: "top",
  },
];

function Confetti() {
  const [particles] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 1.5,
      size: 4 + Math.random() * 6,
      color: ["#0F6E56", "#10B981", "#34D399", "#FCD34D", "#F59E0B", "#3B82F6"][Math.floor(Math.random() * 6)],
      rotation: Math.random() * 360,
    }))
  );

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          <div
            style={{
              width: p.size,
              height: p.size * 1.5,
              backgroundColor: p.color,
              borderRadius: 2,
              transform: `rotate(${p.rotation}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const positionTooltip = useCallback(() => {
    if (!active) return;
    const step = steps[currentStep];
    const el = document.querySelector(step.targetSelector);
    if (!el) {
      // Fallback: center of screen
      setTooltipStyle({
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
      return;
    }
    const rect = el.getBoundingClientRect();
    const gap = 12;
    let style: React.CSSProperties = {};

    switch (step.position) {
      case "right":
        style = { top: rect.top + rect.height / 2, left: rect.right + gap, transform: "translateY(-50%)" };
        break;
      case "bottom":
        style = { top: rect.bottom + gap, left: rect.left + rect.width / 2, transform: "translateX(-50%)" };
        break;
      case "top":
        style = { bottom: window.innerHeight - rect.top + gap, left: rect.left + rect.width / 2, transform: "translateX(-50%)" };
        break;
      case "left":
        style = { top: rect.top + rect.height / 2, right: window.innerWidth - rect.left + gap, transform: "translateY(-50%)" };
        break;
    }
    setTooltipStyle(style);
  }, [active, currentStep]);

  // Navigate to step route + position tooltip
  useEffect(() => {
    if (!active) return;
    const step = steps[currentStep];
    if (pathname !== step.route) {
      router.push(step.route);
    }
    const timer = setTimeout(positionTooltip, 300);
    window.addEventListener("resize", positionTooltip);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", positionTooltip);
    };
  }, [active, currentStep, pathname, router, positionTooltip]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setActive(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setActive(false);
  };

  if (!active && !showConfetti) return null;

  if (showConfetti) return <Confetti />;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]" />

      {/* Tooltip */}
      <div
        className="fixed z-[101] w-80 bg-card border rounded-xl shadow-2xl p-5 animate-scale-in"
        style={tooltipStyle}
      >
        {/* Close */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step badge */}
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
          Paso {currentStep + 1} de {steps.length}
        </span>

        <h3 className="text-base font-bold mt-1.5 mb-1 text-foreground">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Saltar tour
          </button>
          <Button
            size="sm"
            onClick={handleNext}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Finalizar <PartyPopper className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Siguiente <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === currentStep
                  ? "w-4 bg-primary"
                  : i < currentStep
                  ? "w-1.5 bg-primary/50"
                  : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
