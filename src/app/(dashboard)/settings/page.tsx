"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Construction } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Configurações</h1>
        <p className="mt-1 text-text-secondary">Personalize sua experiência no Finaçassss</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <Construction className="h-16 w-16 text-text-tertiary mb-4" />
            <CardTitle className="mb-2">Em Desenvolvimento</CardTitle>
            <CardDescription className="text-center max-w-md">
              Esta página está sendo construída. Em breve você poderá configurar perfil,
              preferências e notificações.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
