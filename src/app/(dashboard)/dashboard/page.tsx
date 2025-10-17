"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { useTransactions } from "@/hooks/useTransactions";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { DonutChartWithIcons } from "@/components/dashboard/DonutChartWithIcons";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";
import { useState } from "react";

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { summary, isLoading: isSummaryLoading } = useDashboard(selectedMonth);
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();

  if (isSummaryLoading || isTransactionsLoading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-text-tertiary border-t-text-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Carregando dashboard...</p>
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
