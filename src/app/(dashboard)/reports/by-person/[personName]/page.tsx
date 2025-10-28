"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Users,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Download,
  CreditCard,
  Smartphone,
  Banknote,
  ChevronDown,
  ChevronUp,
  HandCoins,
  TrendingUp,
} from "lucide-react";
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
    category?: {
      name: string;
      icon: string;
      color: string;
    };
    card?: {
      name: string;
      color: string;
    };
  }>;
}

interface CardBill {
  cardName: string;
  cardColor: string;
  closingDay: number;
  billMonth: string;
  transactions: Array<{
    id: string;
    description: string | null;
    amount: number;
    date: Date | string;
    isReimbursed: boolean;
    category?: {
      name: string;
      icon: string;
      color: string;
    };
  }>;
  total: number;
}

interface DirectTransaction {
  id: string;
  description: string | null;
  amount: number;
  date: Date | string;
  isReimbursed: boolean;
  category?: {
    name: string;
    icon: string;
    color: string;
  };
}

interface LoanData {
  id: string;
  type: string;
  description: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installments: number;
  dueDate: Date | string | null;
  status: string;
  createdAt: Date | string;
  payments: Array<{
    id: string;
    amount: number;
    date: Date | string;
    notes: string | null;
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
  // Novos campos da API
  cardBills?: CardBill[];
  directTransactions?: DirectTransaction[];
  totalCard?: number;
  totalDirect?: number;
  // Empréstimos
  loans?: LoanData[];
  totalLoans?: number;
  totalLoansPaid?: number;
  totalLoansRemaining?: number;
}

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [detailData, setDetailData] = useState<PersonDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedDirect, setExpandedDirect] = useState(false);
  const [expandedLoans, setExpandedLoans] = useState(false);
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

  const toggleCard = (key: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header com Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 hover:bg-white dark:hover:bg-neutral-900 rounded-xl transition-colors border border-neutral-200 dark:border-neutral-800"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                <span>Relatórios</span>
                <span>›</span>
                <span>Gastos por Pessoa</span>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{personName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30 font-medium"
            >
              <Download className="h-4 w-4" />
              <span>Exportar PDF</span>
            </button>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              className="px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer font-medium"
            />
          </div>
        </div>

        {/* Cards de Resumo - Grid 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Gasto */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Banknote className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Total Gasto</p>
                <p className="text-2xl font-bold">{formatCurrency(detailData.total)}</p>
              </div>
            </div>
            <div className="text-xs opacity-75">
              {detailData.transactionCount} transação
              {detailData.transactionCount !== 1 ? "ões" : ""}
            </div>
          </div>

          {/* Pendente */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border-2 border-orange-500/20 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Pendente</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(detailData.totalPending)}
                </p>
              </div>
            </div>
            <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                style={{
                  width: `${
                    detailData.total > 0 ? (detailData.totalPending / detailData.total) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Reembolsado */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border-2 border-green-500/20 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Reembolsado</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(detailData.totalReimbursed)}
                </p>
              </div>
            </div>
            <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600"
                style={{ width: `${reimbursementPercentage}%` }}
              />
            </div>
          </div>

          {/* Progresso */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-lg">
            <div className="text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                Progresso de Reembolso
              </p>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-neutral-200 dark:text-neutral-800"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - reimbursementPercentage / 100)}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {reimbursementPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhamento por Método de Pagamento */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-purple-600" />
            Detalhamento por Método de Pagamento
          </h2>

          {/* Faturas de Cartão */}
          {detailData.cardBills && detailData.cardBills.length > 0 && (
            <div className="space-y-3">
              {detailData.cardBills.map((bill, index) => {
                const key = `${bill.cardName}-${bill.billMonth}`;
                const isExpanded = expandedCards.has(key);

                // Parsear o mês corretamente (formato: "2025-11")
                const [year, month] = bill.billMonth.split("-").map(Number);
                const billDate = new Date(year, month - 1, 1); // month - 1 porque JS usa 0-11
                const monthName = billDate.toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                });

                return (
                  <div
                    key={key}
                    className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleCard(key)}
                      className="w-full p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner"
                            style={{ backgroundColor: `${bill.cardColor}20` }}
                          >
                            <CreditCard className="h-7 w-7" style={{ color: bill.cardColor }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                {bill.cardName}
                              </h3>
                              <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                Cartão
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Fatura de {monthName}
                              </p>
                              <span className="text-neutral-300 dark:text-neutral-700">•</span>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {bill.transactions.length} transação
                                {bill.transactions.length !== 1 ? "ões" : ""}
                              </p>
                              <span className="text-neutral-300 dark:text-neutral-700">•</span>
                              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                                Fecha dia {bill.closingDay}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                              {formatCurrency(bill.total)}
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-neutral-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-neutral-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 bg-neutral-50 dark:bg-neutral-800/30">
                        <div className="space-y-2">
                          {bill.transactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <p className="font-semibold text-neutral-900 dark:text-white">
                                    {transaction.description || "Sem descrição"}
                                  </p>
                                  {transaction.isReimbursed ? (
                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-xs font-medium">
                                      Reembolsado
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-md text-xs font-medium">
                                      Pendente
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>
                                    {new Date(transaction.date).toLocaleDateString("pt-BR")}
                                  </span>
                                  {transaction.category && (
                                    <>
                                      <span>•</span>
                                      <span>{transaction.category.icon}</span>
                                      <span>{transaction.category.name}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <span className="font-bold text-lg text-neutral-900 dark:text-white ml-4">
                                {formatCurrency(transaction.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Gastos Diretos (PIX, Transferência, Dinheiro) */}
          {detailData.directTransactions && detailData.directTransactions.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setExpandedDirect(!expandedDirect)}
                className="w-full p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Smartphone className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                          Gastos Diretos
                        </h3>
                        <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                          PIX / Transferência
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {detailData.directTransactions.length} transação
                        {detailData.directTransactions.length !== 1 ? "ões" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {formatCurrency(detailData.totalDirect || 0)}
                      </p>
                    </div>
                    {expandedDirect ? (
                      <ChevronUp className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-neutral-400" />
                    )}
                  </div>
                </div>
              </button>

              {expandedDirect && (
                <div className="px-6 pb-6 bg-neutral-50 dark:bg-neutral-800/30">
                  <div className="space-y-2">
                    {detailData.directTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="font-semibold text-neutral-900 dark:text-white">
                              {transaction.description || "Sem descrição"}
                            </p>
                            {transaction.isReimbursed ? (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-xs font-medium">
                                Reembolsado
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-md text-xs font-medium">
                                Pendente
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(transaction.date).toLocaleDateString("pt-BR")}</span>
                            {transaction.category && (
                              <>
                                <span>•</span>
                                <span>{transaction.category.icon}</span>
                                <span>{transaction.category.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-lg text-neutral-900 dark:text-white ml-4">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empréstimos */}
          {detailData.loans && detailData.loans.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setExpandedLoans(!expandedLoans)}
                className="w-full p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                      <HandCoins className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                          Empréstimos
                        </h3>
                        <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                          Gestão de Dívidas
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {detailData.loans.length} empréstimo
                          {detailData.loans.length !== 1 ? "s" : ""}
                        </p>
                        <span className="text-neutral-300 dark:text-neutral-700">•</span>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          {formatCurrency(detailData.totalLoansRemaining || 0)} restante
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Total</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {formatCurrency(detailData.totalLoans || 0)}
                      </p>
                    </div>
                    {expandedLoans ? (
                      <ChevronUp className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-neutral-400" />
                    )}
                  </div>
                </div>
              </button>

              {expandedLoans && (
                <div className="px-6 pb-6 bg-neutral-50 dark:bg-neutral-800/30">
                  <div className="space-y-3">
                    {detailData.loans.map((loan) => {
                      const isLent = loan.type === "LENT";
                      const progress =
                        loan.totalAmount > 0 ? (loan.paidAmount / loan.totalAmount) * 100 : 0;

                      return (
                        <div
                          key={loan.id}
                          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-neutral-900 dark:text-white">
                                  {loan.description || (isLent ? "Emprestei" : "Peguei emprestado")}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                                    isLent
                                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                  }`}
                                >
                                  {isLent ? "Emprestei" : "Devo"}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                                    loan.status === "PAID"
                                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                      : loan.status === "PARTIAL"
                                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                      : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                                  }`}
                                >
                                  {loan.status === "PAID"
                                    ? "Pago"
                                    : loan.status === "PARTIAL"
                                    ? "Parcial"
                                    : "Pendente"}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                  Criado em {new Date(loan.createdAt).toLocaleDateString("pt-BR")}
                                </span>
                                {loan.dueDate && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      Vence em {new Date(loan.dueDate).toLocaleDateString("pt-BR")}
                                    </span>
                                  </>
                                )}
                                {loan.installments > 1 && (
                                  <>
                                    <span>•</span>
                                    <span>{loan.installments}x</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Total
                              </p>
                              <p className="text-xl font-bold text-neutral-900 dark:text-white">
                                {formatCurrency(loan.totalAmount)}
                              </p>
                            </div>
                          </div>

                          {/* Barra de progresso */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                              <span>
                                Pago: {formatCurrency(loan.paidAmount)} de{" "}
                                {formatCurrency(loan.totalAmount)}
                              </span>
                              <span className="font-semibold">{progress.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  isLent
                                    ? "bg-gradient-to-r from-green-500 to-green-600"
                                    : "bg-gradient-to-r from-red-500 to-red-600"
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            {loan.remainingAmount > 0 && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                Restante: {formatCurrency(loan.remainingAmount)}
                              </p>
                            )}
                          </div>

                          {/* Pagamentos */}
                          {loan.payments.length > 0 && (
                            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
                              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                                Últimos Pagamentos:
                              </p>
                              <div className="space-y-1.5">
                                {loan.payments.slice(0, 3).map((payment) => (
                                  <div
                                    key={payment.id}
                                    className="flex items-center justify-between text-xs"
                                  >
                                    <span className="text-neutral-600 dark:text-neutral-400">
                                      {new Date(payment.date).toLocaleDateString("pt-BR")}
                                      {payment.notes && ` - ${payment.notes}`}
                                    </span>
                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                      {formatCurrency(payment.amount)}
                                    </span>
                                  </div>
                                ))}
                                {loan.payments.length > 3 && (
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                                    +{loan.payments.length - 3} pagamento
                                    {loan.payments.length - 3 > 1 ? "s" : ""}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mensagem se não houver dados */}
          {(!detailData.cardBills || detailData.cardBills.length === 0) &&
            (!detailData.directTransactions || detailData.directTransactions.length === 0) &&
            (!detailData.loans || detailData.loans.length === 0) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Banknote className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  Nenhuma transação encontrada
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Não há transações para {personName} neste período
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
