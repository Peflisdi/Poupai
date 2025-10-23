"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CreditCard, TrendingDown, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { BillPieChart, CategoryAccordion } from "@/components/cards";
import { showToast } from "@/lib/toast";

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget: number;
  spent: number;
  percentage: number;
  budgetPercentage: number;
  transactions: Array<{
    id: string;
    description: string | null;
    amount: number;
    date: Date | string;
  }>;
}

interface BillData {
  card: {
    id: string;
    name: string;
    nickname?: string;
    limit: number;
    closingDay: number;
    dueDay: number;
    color: string;
  };
  period: {
    start: string;
    end: string;
  };
  totalBill: number;
  totalBudget: number;
  budgetUsagePercentage: number;
  availableLimit: number;
  usagePercentage: number;
  categories: CategoryData[];
}

export default function CardBillPage() {
  const params = useParams();
  const router = useRouter();
  const [billData, setBillData] = useState<BillData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    fetchBillData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.cardId, selectedMonth]);

  const fetchBillData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cards/${params.cardId}/bill?month=${selectedMonth}`);
      if (!response.ok) throw new Error("Erro ao carregar fatura");
      const data = await response.json();
      setBillData(data);
    } catch (error) {
      console.error("Erro ao buscar fatura:", error);
      showToast.error("Erro ao carregar fatura do cartão");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-background-secondary rounded w-1/3"></div>
            <div className="h-64 bg-background-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!billData) {
    return (
      <div className="min-h-screen bg-background-primary p-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-text-secondary">Erro ao carregar fatura</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <div className="min-h-screen bg-background-primary p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-text-primary" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Fatura Detalhada</h1>
              <p className="text-sm text-text-secondary">
                {billData.card.name}
                {billData.card.nickname && ` • ${billData.card.nickname}`}
              </p>
            </div>
          </div>

          {/* Seletor de mês */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
            className="px-4 py-2 bg-background-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          />
        </div>

        {/* Card do Cartão com Período */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: billData.card.color,
            background: `linear-gradient(135deg, ${billData.card.color} 0%, ${billData.card.color}dd 100%)`,
          }}
        >
          <div className="flex items-center justify-between text-white">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-6 w-6" />
                <h2 className="text-xl font-bold">{billData.card.name}</h2>
              </div>
              <div className="flex flex-col gap-1 text-sm opacity-90">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Período: {formatDate(billData.period.start)} - {formatDate(billData.period.end)}
                  </span>
                </div>
                <div className="text-xs opacity-75">
                  💡 Compras após {formatDate(billData.period.end)} vão para a próxima fatura
                </div>
                <div>Vencimento: dia {billData.card.dueDay}</div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75">Limite do Cartão</p>
              <p className="text-2xl font-bold">{formatCurrency(billData.card.limit)}</p>
            </div>
          </div>
        </div>

        {/* Resumo da Fatura */}
        <div className="bg-background-secondary rounded-xl p-6 border border-border-primary">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Resumo da Fatura</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background-primary rounded-lg p-4">
              <p className="text-sm text-text-secondary mb-1">Total da Fatura</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatCurrency(billData.totalBill)}
              </p>
            </div>

            <div className="bg-background-primary rounded-lg p-4">
              <p className="text-sm text-text-secondary mb-1">Orçamento Total</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatCurrency(billData.totalBudget)}
              </p>
            </div>

            <div className="bg-background-primary rounded-lg p-4">
              <p className="text-sm text-text-secondary mb-1">Limite Disponível</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(billData.availableLimit)}
              </p>
            </div>
          </div>

          {/* Mensagem de resumo */}
          <div className="mt-6 p-4 bg-background-primary rounded-lg border-l-4 border-primary">
            <p className="text-text-primary">
              Você já gastou <span className="font-bold">{formatCurrency(billData.totalBill)}</span>{" "}
              neste mês
              {billData.totalBudget > 0 && (
                <>
                  , isso é{" "}
                  <span className="font-bold">{billData.budgetUsagePercentage.toFixed(1)}%</span> do
                  seu orçamento total
                </>
              )}
              .
            </p>
          </div>
        </div>

        {/* Gráfico de Pizza - 1 Coluna */}
        <div className="bg-background-secondary rounded-xl p-6 border border-border-primary">
          <h3 className="text-lg font-semibold text-text-primary mb-6 text-center">
            Gastos por Categoria
          </h3>
          <BillPieChart categories={billData.categories} total={billData.totalBill} />
        </div>

        {/* Accordion de Categorias */}
        <CategoryAccordion categories={billData.categories} />

        {/* Dica sobre orçamentos */}
        {billData.categories.some((cat) => cat.budget === 0) && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Dica: Defina orçamentos para suas categorias
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Configure limites de gastos para cada categoria e acompanhe melhor suas despesas.
                  Você pode fazer isso na página de Categorias.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
