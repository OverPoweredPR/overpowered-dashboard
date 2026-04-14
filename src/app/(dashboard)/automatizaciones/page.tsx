"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MessageCircle, Workflow } from "lucide-react";
import { LlamadasTab } from "@/components/automatizaciones/LlamadasTab";
import { WhatsAppTab } from "@/components/automatizaciones/WhatsAppTab";
import { FlujosTab } from "@/components/automatizaciones/FlujosTab";
import { AriaChat } from "@/components/automatizaciones/AriaChat";

export default function Automatizaciones() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Automatizaciones & IA</h1>

        <Tabs defaultValue="calls">
          <TabsList>
            <TabsTrigger value="calls" className="gap-1.5"><Phone className="h-4 w-4" /> Llamadas IA</TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-1.5"><MessageCircle className="h-4 w-4" /> Mensajes</TabsTrigger>
            <TabsTrigger value="flows" className="gap-1.5"><Workflow className="h-4 w-4" /> Flujos</TabsTrigger>
          </TabsList>

          <TabsContent value="calls" className="space-y-4 mt-4">
            <LlamadasTab />
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4 mt-4">
            <WhatsAppTab />
          </TabsContent>

          <TabsContent value="flows" className="space-y-4 mt-4">
            <FlujosTab />
          </TabsContent>
        </Tabs>
      </div>

      <AriaChat />
    </DashboardLayout>
  );
}
