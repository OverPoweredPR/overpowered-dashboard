"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const suggestedQuestions = [
  "¿Cuántas órdenes hay hoy?",
  "¿Cuál es el pago más urgente?",
  "¿Qué productos están en stock crítico?",
];

const mockResponses: Record<string, string> = {
  "¿Cuántas órdenes hay hoy?": "Hoy tienes **18 órdenes** activas. 12 están confirmadas, 4 en preparación y 2 pendientes de pago. El valor total es **$8,432.00**.",
  "¿Cuál es el pago más urgente?": "El pago más urgente es la factura **#F-0091** de **Hotel Miramar** por **$3,450.00**, que vence en **3 días** (17 de abril). Recomiendo enviar un recordatorio por WhatsApp.",
  "¿Qué productos están en stock crítico?": "⚠️ Hay **4 productos** en stock crítico:\n\n• **Harina de trigo** — 8 unidades (mín. 10)\n• **Mantequilla** — 3 unidades (mín. 5)\n• **Levadura** — 12 unidades (mín. 15)\n• **Azúcar glass** — 2 unidades (mín. 10)\n\nRecomiendo generar una orden de compra urgente.",
};

export function AriaChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "¡Hola! Soy **Aria**, tu asistente IA. Pregúntame sobre tus automatizaciones, llamadas, mensajes o workflows. 🤖" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = mockResponses[text] || "Déjame revisar eso... Según los datos del dashboard, todo parece estar funcionando normalmente. ¿Hay algo específico que quieras saber?";
      setMessages((p) => [...p, { role: "assistant", content: response }]);
      setTyping(false);
    }, 1200 + Math.random() * 800);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform flex items-center justify-center group"
        >
          <Sparkles className="h-6 w-6" />
          <span className="absolute -top-8 right-0 bg-card border border-border text-foreground text-xs rounded-lg px-2.5 py-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Pregúntale a Aria
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[500px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Aria · Asistente IA</span>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[200px] max-h-[340px]">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "assistant" ? "justify-start" : "justify-end")}>
                <div className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-line",
                  m.role === "assistant"
                    ? "bg-muted/60 text-foreground rounded-tl-none"
                    : "bg-primary text-primary-foreground rounded-tr-none"
                )}>
                  {m.content.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                    part.startsWith("**") && part.endsWith("**")
                      ? <strong key={j}>{part.slice(2, -2)}</strong>
                      : <span key={j}>{part}</span>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-muted/60 rounded-xl rounded-tl-none px-3 py-2 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 2 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] bg-primary/10 text-primary rounded-full px-2.5 py-1 hover:bg-primary/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Escribe tu pregunta..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none px-2"
            />
            <Button size="icon" className="h-8 w-8 rounded-full" onClick={() => sendMessage(input)} disabled={!input.trim()}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
