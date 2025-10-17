"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "INCOME":
        return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "EXPENSE":
        return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "TRANSFER":
        return <ArrowRightLeft className="h-4 w-4 text-text-tertiary" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "INCOME":
        return "Receita";
      case "EXPENSE":
        return "Despesa";
      case "TRANSFER":
        return "Transferência";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
        <CardDescription>Últimas {transactions.length} transações registradas</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-text-tertiary">Nenhuma transação encontrada</div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg border border-border-primary p-4 transition-colors hover:bg-background-secondary"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background-tertiary">
                    {getTypeIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-sm text-text-tertiary">
                      <span>{getTypeLabel(transaction.type)}</span>
                      {transaction.category && (
                        <>
                          <span>•</span>
                          <span>{transaction.category.name}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>
                <div
                  className={`text-lg font-semibold ${
                    transaction.type === "INCOME"
                      ? "text-green-600 dark:text-green-400"
                      : transaction.type === "EXPENSE"
                      ? "text-red-600 dark:text-red-400"
                      : "text-text-primary"
                  }`}
                >
                  {transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "-" : ""}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
