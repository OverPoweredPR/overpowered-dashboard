"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Loader2, AlertCircle } from "lucide-react";

type LoginState = "idle" | "loading" | "success" | "error";

const TENANTS = ["Baguettes de PR", "Borinquen Natural", "Wasabi Signature", "Celebra"];

export default function Login() {
  const [email, setEmail] = useState("");
  const [tenant, setTenant] = useState(TENANTS[0]);
  const [state, setState] = useState<LoginState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  const showTenant = isValidEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setState("error");
      setErrorMsg("Por favor ingresa un correo electrónico válido");
      return;
    }
    setState("loading");
    await new Promise((r) => setTimeout(r, 1500));
    localStorage.setItem("op_auth", email.trim());
    localStorage.setItem("op_tenant", tenant);
    setState("success");
    setTimeout(() => router.push("/home"), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: "#0F1117" }}>
      <Card className="w-full max-w-sm p-8 border-[#1e2030] bg-[#161825] shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4"
            style={{ backgroundColor: "#0F6E56" }}
          >
            OP
          </div>
          <h1 className="text-xl font-bold text-white">Baguettes de PR</h1>
          <p className="text-sm text-slate-400 mt-1">Sistema de gestión</p>
        </div>

        {state === "success" ? (
          <div className="flex flex-col items-center text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-bounce" style={{ backgroundColor: "rgba(15,110,86,0.15)" }}>
              <Mail className="h-8 w-8" style={{ color: "#0F6E56" }} />
            </div>
            <h2 className="text-base font-semibold text-white mb-2">Revisa tu correo</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Te enviamos un enlace de acceso a{" "}
              <span className="text-white font-medium">{email}</span>
            </p>
            <Button
              variant="ghost"
              className="mt-6 text-xs text-slate-500 hover:text-slate-300"
              onClick={() => { setState("idle"); setEmail(""); }}
            >
              Usar otro correo
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                Correo electrónico
              </label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                className="bg-[#0F1117] border-[#2a2d3a] text-white placeholder:text-slate-600 focus:border-[#0F6E56] focus:ring-[#0F6E56]"
                disabled={state === "loading"}
                autoFocus
              />
              {state === "error" && (
                <div className="flex items-center gap-1.5 mt-2 text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span className="text-xs">{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Tenant selector — appears after valid email */}
            <div className={`transition-all duration-300 overflow-hidden ${showTenant ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                Seleccionar negocio
              </label>
              <Select value={tenant} onValueChange={setTenant} disabled={state === "loading"}>
                <SelectTrigger className="bg-[#0F1117] border-[#2a2d3a] text-white focus:ring-[#0F6E56] [&>span]:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161825] border-[#2a2d3a]">
                  {TENANTS.map((t) => (
                    <SelectItem key={t} value={t} className="text-white focus:bg-[#0F6E56]/20 focus:text-white">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full text-white font-medium active:scale-[0.98] transition-all"
              style={{ backgroundColor: "#0F6E56" }}
              disabled={state === "loading" || !email.trim()}
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar enlace de acceso
                </>
              )}
            </Button>
          </form>
        )}
      </Card>

      <p className="mt-8 text-xs text-slate-600">Powered by OverPowered PR</p>
    </div>
  );
}
