"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SummaryCardsProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

export function SummaryCards({ balance, totalIncome, totalExpenses }: SummaryCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Saldo Total */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Saldo Total</CardTitle>
            <div className="rounded-full bg-background-tertiary p-2">
              <Wallet className="h-5 w-5 text-text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-text-primary">{formatCurrency(balance)}</p>
          <p className="mt-2 text-sm text-text-tertiary">Saldo disponível nas contas</p>
        </CardContent>
      </Card>

      {/* Receitas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Receitas</CardTitle>
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalIncome)}
          </p>
          <p className="mt-2 text-sm text-text-tertiary">Total recebido no mês</p>
        </CardContent>
      </Card>

      {/* Despesas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Despesas</CardTitle>
            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="mt-2 text-sm text-text-tertiary">Total gasto no mês</p>
        </CardContent>
      </Card>
    </div>
  );
}
