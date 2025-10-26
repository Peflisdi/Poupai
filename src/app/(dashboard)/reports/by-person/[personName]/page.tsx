"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Users, TrendingDown, CheckCircle, AlertCircle, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { generatePersonExpensesPDF } from "@/utils/pdfGenerator";

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  color: string;
  spent: number;
  percentage: number;
  transactions: Array<{
    id: string;
    description: string | null;
    amount: number;
    date: Date | string;
    isReimbursed: boolean;
    card?: {
      name: string;
      color: string;
    };
  }>;
}

interface PersonDetailData {
  personName: string;
  period: {
    start: string;
    end: string;
  };
  total: number;
  totalPending: number;
  totalReimbursed: number;
  transactionCount: number;
  categories: CategoryData[];
}

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [detailData, setDetailData] = useState<PersonDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const personName = decodeURIComponent(params.personName as string);

  useEffect(() => {
    fetchDetailData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personName, selectedMonth]);

  const fetchDetailData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/reports/by-person/detail?person=${encodeURIComponent(
          personName
        )}&month=${selectedMonth}`
      );
      if (!response.ok) throw new Error("Erro ao carregar detalhes");
      const data = await response.json();
      setDetailData(data);
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
      showToast.error("Erro ao carregar detalhes da pessoa");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const handleExportPDF = () => {
    if (!detailData) return;
    
    try {
      generatePersonExpensesPDF(detailData);
      showToast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      showToast.error("Erro ao gerar PDF. Tente novamente.");
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

  if (!detailData) {
    return (
      <div className="min-h-screen bg-background-primary p-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-text-secondary">Erro ao carregar detalhes</p>
        </div>
      </div>
    );
  }

  const reimbursementPercentage =
    detailData.total > 0 ? (detailData.totalReimbursed / detailData.total) * 100 : 0;

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
              <h1 className="text-2xl font-bold text-text-primary">Detalhamento de Gastos</h1>
              <p className="text-sm text-text-secondary">{personName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Botão Exportar PDF */}
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exportar PDF</span>
            </button>

            {/* Seletor de mês */}
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              className="px-4 py-2 bg-background-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Card da Pessoa com Período */}
        <div className="rounded-xl p-6 bg-gradient-to-br from-purple-500 to-pink-500">
          <div className="flex items-center justify-between text-white">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {personName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{personName}</h2>
                  <p className="text-sm opacity-90">{detailData.transactionCount} transações</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-sm opacity-90 mt-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Período: {formatDate(detailData.period.start)} -{" "}
                    {formatDate(detailData.period.end)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75">Total Gasto</p>
              <p className="text-3xl font-bold">{formatCurrency(detailData.total)}</p>
            </div>
          </div>
        </div>

        {/* Resumo de Reembolsos */}
        <div className="bg-background-secondary rounded-xl p-6 border border-border-primary">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Status de Reembolso</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-background-primary rounded-lg p-4">
              <p className="text-sm text-text-secondary mb-1">Total Gasto</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatCurrency(detailData.total)}
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Pendente</p>
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(detailData.totalPending)}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Reembolsado
                </p>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(detailData.totalReimbursed)}
              </p>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div>
            <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
              <span>Progresso de Reembolso</span>
              <span className="font-semibold">{reimbursementPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                style={{ width: `${reimbursementPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Detalhamento por Categoria */}
        <div className="bg-background-secondary rounded-xl border border-border-primary overflow-hidden">
          <div className="p-6 border-b border-border-primary">
            <h3 className="text-lg font-semibold text-text-primary">Detalhamento por Categoria</h3>
          </div>

          <div className="divide-y divide-border-primary">
            {detailData.categories.map((category) => (
              <div key={category.id}>
                {/* Category Header - Clicável */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-6 hover:bg-background-primary transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary">{category.name}</h4>
                        <p className="text-sm text-text-secondary">
                          {category.transactions.length} transação
                          {category.transactions.length !== 1 ? "ões" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right mr-4">
                      <p className="text-xl font-bold text-text-primary">
                        {formatCurrency(category.spent)}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {category.percentage.toFixed(1)}%
                      </p>
                    </div>

                    <div
                      className={`transform transition-transform ${
                        expandedCategories.has(category.id) ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Category Transactions - Expansível */}
                {expandedCategories.has(category.id) && (
                  <div className="px-6 pb-6 bg-background-primary">
                    <div className="space-y-2">
                      {category.transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-background-secondary rounded-lg border border-border-primary"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-text-primary">
                                {transaction.description || "Sem descrição"}
                              </p>
                              {transaction.isReimbursed ? (
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                              <span>{new Date(transaction.date).toLocaleDateString("pt-BR")}</span>
                              {transaction.card && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: transaction.card.color }}
                                    />
                                    <span>{transaction.card.name}</span>
                                  </div>
                                </>
                              )}
                              <span>•</span>
                              <span className="text-text-tertiary">
                                {transaction.isReimbursed ? "Reembolsado" : "Pendente"}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-text-primary ml-4">
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
