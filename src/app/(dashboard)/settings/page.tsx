"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Palette, Globe, Bell, Database, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { showToast } from "@/lib/toast";

type ThemeMode = "light" | "dark" | "system";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Dados do usuário
  const [name, setName] = useState(session?.user?.name || "");
  const [email] = useState(session?.user?.email || "");

  // Preferências
  const [currency, setCurrency] = useState("BRL");
  const [firstDayOfMonth, setFirstDayOfMonth] = useState(1);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<string>("");

  // Tema
  const [theme, setTheme] = useState<ThemeMode>("system");

  // Notificações
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [goalAlerts, setGoalAlerts] = useState(true);

  useEffect(() => {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem("theme") as ThemeMode;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Carregar método de pagamento padrão
    const loadUserPreferences = async () => {
      try {
        const res = await fetch("/api/user/preferences");
        if (res.ok) {
          const data = await res.json();
          setDefaultPaymentMethod(data.defaultPaymentMethod || "");
        }
      } catch (error) {
        console.error("Erro ao carregar preferências:", error);
      }
    };

    loadUserPreferences();
  }, []);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Simulação - você pode implementar a API depois
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      showToast.error("Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Salvar método de pagamento padrão
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultPaymentMethod: defaultPaymentMethod || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar preferências");
      }

      showToast.success("Preferências atualizadas com sucesso!");
    } catch (error) {
      showToast.error("Erro ao atualizar preferências");
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Aplicar tema imediatamente
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    showToast.success("Tema atualizado!");
  };

  const handleExportData = async () => {
    try {
      showToast.success("Exportação em desenvolvimento!");
      // TODO: Implementar exportação CSV
    } catch (error) {
      showToast.error("Erro ao exportar dados");
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="space-y-6 max-w-4xl w-full">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Configurações</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>

        {/* Perfil do Usuário */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Perfil</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Informações básicas da sua conta
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Nome
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                disabled
                className="bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                O email não pode ser alterado
              </p>
            </div>

            <Button onClick={handleSaveProfile} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Perfil"}
            </Button>
          </div>
        </div>

        {/* Preferências Financeiras */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Preferências Financeiras
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Configure moeda e período de fechamento
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Moeda
              </label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="BRL">BRL - Real Brasileiro (R$)</option>
                <option value="USD">USD - Dólar Americano ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - Libra Esterlina (£)</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Primeiro dia do mês financeiro
              </label>
              <Select
                value={String(firstDayOfMonth)}
                onChange={(e) => setFirstDayOfMonth(Number(e.target.value))}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Dia {day}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Define o início do seu ciclo mensal de gastos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Método de Pagamento Padrão
              </label>
              <Select
                value={defaultPaymentMethod}
                onChange={(e) => setDefaultPaymentMethod(e.target.value)}
              >
                <option value="">Nenhum (Selecionar sempre)</option>
                <option value="PIX">PIX</option>
                <option value="CREDIT">Crédito</option>
                <option value="DEBIT">Débito</option>
                <option value="CASH">Dinheiro</option>
                <option value="TRANSFER">Transferência</option>
              </Select>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Será selecionado automaticamente ao criar novas transações
              </p>
            </div>

            <Button onClick={handleSavePreferences} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Preferências"}
            </Button>
          </div>
        </div>

        {/* Aparência */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Aparência</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Personalize o tema do aplicativo
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Tema
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleThemeChange("light")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === "light"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">☀️</div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">Claro</div>
                </div>
              </button>

              <button
                onClick={() => handleThemeChange("dark")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === "dark"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🌙</div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">Escuro</div>
                </div>
              </button>

              <button
                onClick={() => handleThemeChange("system")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === "system"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">💻</div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">
                    Sistema
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Notificações
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Gerencie suas preferências de notificação
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700 last:border-0">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">
                  Notificações por email
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Receba atualizações importantes por email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700 last:border-0">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Alertas de orçamento</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Notificar quando ultrapassar 80% do orçamento
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={budgetAlerts}
                  onChange={(e) => setBudgetAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Alertas de metas</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Notificar sobre progresso das metas
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={goalAlerts}
                  onChange={(e) => setGoalAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Dados e Privacidade */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
              <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Dados e Privacidade
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Gerencie seus dados e privacidade
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-2">Exportar dados</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                Baixe todas as suas transações em formato CSV
              </p>
              <Button
                onClick={handleExportData}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">Zona de perigo</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                Ações irreversíveis que afetam sua conta
              </p>
              <Button
                variant="secondary"
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
              >
                Excluir conta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
