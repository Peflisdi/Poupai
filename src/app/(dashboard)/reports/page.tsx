"use client";

import { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { BarChart } from "@/components/reports/BarChart";
import { LineChart } from "@/components/reports/LineChart";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
} from "lucide-react";
import { StatCardSkeleton, ChartSkeleton, CardSkeleton } from "@/components/ui/Skeleton";

export default function ReportsPage() {
  const { transactions, isLoading } = useTransactions();
  const { categories } = useCategories();
  const [selectedPeriod, setSelectedPeriod] = useState<"6months" | "year">("6months");

  // Processar dados
  const reportData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        monthlyData: [],
        categoryData: [],
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        avgMonthlyIncome: 0,
        avgMonthlyExpense: 0,
        topExpenseCategory: null as {
          name: string;
          total: number;
          icon: string;
          color: string;
        } | null,
        topIncomeCategory: null as {
          name: string;
          total: number;
          icon: string;
          color: string;
        } | null,
      };
    }

    const now = new Date();
    const monthsToShow = selectedPeriod === "6months" ? 6 : 12;

    // Criar array de meses
    const months = Array.from({ length: monthsToShow }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (monthsToShow - 1 - i), 1);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: date.toLocaleDateString("pt-BR", { month: "short" }),
        income: 0,
        expense: 0,
      };
    });

    // Agregar transações por mês
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const month = months.find((m) => m.key === monthKey);

      if (month) {
        if (t.type === "INCOME") {
          month.income += t.amount;
        } else {
          month.expense += t.amount;
        }
      }
    });

    // Agregar por categoria
    const categoryMap = new Map<
      string,
      { name: string; income: number; expense: number; icon: string; color: string }
    >();

    transactions.forEach((t) => {
      const category = categories?.find((c) => c.id === t.categoryId);
      const categoryId = t.categoryId || "sem-categoria";
      const categoryName = category?.name || "Sem Categoria";
      const categoryIcon = category?.icon || "❓";
      const categoryColor = category?.color || "#999999";

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          name: categoryName,
          income: 0,
          expense: 0,
          icon: categoryIcon,
          color: categoryColor,
        });
      }

      const catData = categoryMap.get(categoryId)!;
      if (t.type === "INCOME") {
        catData.income += t.amount;
      } else {
        catData.expense += t.amount;
      }
    });

    const categoryData = Array.from(categoryMap.values())
      .sort((a, b) => b.expense - a.expense)
      .slice(0, 10);

    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthsWithData = months.filter((m) => m.income > 0 || m.expense > 0).length;
    const avgMonthlyIncome = monthsWithData > 0 ? totalIncome / monthsWithData : 0;
    const avgMonthlyExpense = monthsWithData > 0 ? totalExpense / monthsWithData : 0;

    const topExpenseCategory =
      categoryData.length > 0
        ? {
            name: categoryData[0].name,
            total: categoryData[0].expense,
            icon: categoryData[0].icon,
            color: categoryData[0].color,
          }
        : null;

    const topIncomeCategory = categoryData
      .sort((a, b) => b.income - a.income)
      .find((c) => c.income > 0);

    return {
      monthlyData: months,
      categoryData: categoryData.map((c) => ({
        label: c.name,
        value: c.expense,
        color: c.color,
      })),
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      avgMonthlyIncome,
      avgMonthlyExpense,
      topExpenseCategory,
      topIncomeCategory: topIncomeCategory
        ? {
            name: topIncomeCategory.name,
            total: topIncomeCategory.income,
            icon: topIncomeCategory.icon,
            color: topIncomeCategory.color,
          }
        : null,
    };
  }, [transactions, categories, selectedPeriod]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-4 w-72 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Charts Skeleton */}
        <ChartSkeleton />

        {/* Category Rankings Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        {/* Insights Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Relatórios</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Análises detalhadas das suas finanças
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
          <button
            onClick={() => setSelectedPeriod("6months")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPeriod === "6months"
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            6 Meses
          </button>
          <button
            onClick={() => setSelectedPeriod("year")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPeriod === "year"
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            12 Meses
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Total</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Receitas</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(reportData.totalIncome)}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            Média: {formatCurrency(reportData.avgMonthlyIncome)}/mês
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Total</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Despesas</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(reportData.totalExpense)}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            Média: {formatCurrency(reportData.avgMonthlyExpense)}/mês
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                reportData.balance >= 0
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : "bg-orange-100 dark:bg-orange-900/30"
              }`}
            >
              <Wallet
                className={`w-5 h-5 ${
                  reportData.balance >= 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-orange-600 dark:text-orange-400"
                }`}
              />
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Saldo</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Balanço</p>
          <p
            className={`text-2xl font-bold ${
              reportData.balance >= 0
                ? "text-blue-600 dark:text-blue-400"
                : "text-orange-600 dark:text-orange-400"
            }`}
          >
            {formatCurrency(reportData.balance)}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            {reportData.balance >= 0 ? "Positivo" : "Negativo"}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {((reportData.totalExpense / (reportData.totalIncome || 1)) * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Taxa de Gasto</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {reportData.totalIncome > 0
              ? `${((reportData.totalExpense / reportData.totalIncome) * 100).toFixed(1)}%`
              : "0%"}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            do total de receitas
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Evolução Mensal
            </h2>
          </div>
          <LineChart data={reportData.monthlyData} height={300} />
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Top Categorias de Gastos
            </h2>
          </div>
          {reportData.categoryData.length > 0 ? (
            <BarChart data={reportData.categoryData} height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-neutral-500 dark:text-neutral-400">
              Nenhum dado disponível
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {reportData.topExpenseCategory && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
            <h3 className="text-sm font-medium text-red-900 dark:text-red-100 mb-4">
              💸 Categoria com Mais Gastos
            </h3>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${reportData.topExpenseCategory.color}20` }}
              >
                {reportData.topExpenseCategory.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {reportData.topExpenseCategory.name}
                </p>
                <p className="text-lg text-red-700 dark:text-red-300">
                  {formatCurrency(reportData.topExpenseCategory.total)}
                </p>
              </div>
            </div>
          </div>
        )}

        {reportData.topIncomeCategory && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
            <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-4">
              💰 Categoria com Mais Receitas
            </h3>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${reportData.topIncomeCategory.color}20` }}
              >
                {reportData.topIncomeCategory.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {reportData.topIncomeCategory.name}
                </p>
                <p className="text-lg text-green-700 dark:text-green-300">
                  {formatCurrency(reportData.topIncomeCategory.total)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
