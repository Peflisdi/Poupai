"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { useTransactions } from "@/hooks/useTransactions";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { DonutChartWithIcons } from "@/components/dashboard/DonutChartWithIcons";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";
import { StatCardSkeleton, ChartSkeleton, ListSkeleton } from "@/components/ui/Skeleton";
import { useState } from "react";

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { summary, isLoading: isSummaryLoading } = useDashboard(selectedMonth);
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();

  if (isSummaryLoading || isTransactionsLoading) {
    return (
      <div className="space-y-6">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        {/* Recent Transactions Skeleton */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="mb-4">
            <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
          <ListSkeleton rows={5} />
        </div>
      </div>
    );
  }

  // Preparar dados para os gráficos
  const expensesByCategoryData =
    summary?.expensesByCategory.map((item) => ({
      category: item.categoryName,
      amount: item.amount,
      percentage: item.percentage,
      icon: item.categoryIcon,
      color: item.categoryColor,
    })) || [];

  // Agrupar transações por mês para o gráfico de tendência
  const monthlyTrendData =
    transactions?.reduce((acc: any[], transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;

      const existing = acc.find((item) => item.month === monthKey);

      if (existing) {
        if (transaction.type === "INCOME") {
          existing.income += transaction.amount;
        } else if (transaction.type === "EXPENSE") {
          existing.expenses += transaction.amount;
        }
      } else {
        acc.push({
          month: monthKey,
          income: transaction.type === "INCOME" ? transaction.amount : 0,
          expenses: transaction.type === "EXPENSE" ? transaction.amount : 0,
        });
      }

      return acc;
    }, []) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-text-secondary">Visão geral das suas finanças</p>
      </div>

      {summary && (
        <SummaryCards
          balance={summary.currentBalance}
          totalIncome={summary.monthIncome}
          totalExpenses={summary.monthExpenses}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <DonutChartWithIcons
          data={expensesByCategoryData}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
        <MonthlyTrendChart data={monthlyTrendData} />
      </div>

      <RecentTransactions transactions={transactions?.slice(0, 10) || []} />
    </div>
  );
}
