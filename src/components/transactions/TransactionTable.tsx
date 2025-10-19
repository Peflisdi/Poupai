"use client";

import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPaymentMethodLabel } from "@/lib/translations";
import { Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-text-tertiary">
        <p className="text-lg">Nenhuma transação encontrada</p>
        <p className="text-sm mt-2">Tente ajustar os filtros ou adicione uma nova transação</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-primary">
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Tipo</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
              Descrição
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
              Categoria
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Data</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
              Método
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">
              Pago por
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-text-secondary">
              Valor
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-text-secondary">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="border-b border-border-primary hover:bg-background-secondary transition-colors"
            >
              {/* Tipo */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  {transaction.type === "INCOME" ? (
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                </div>
              </td>

              {/* Descrição */}
              <td className="py-4 px-4">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-text-primary">{transaction.description}</span>
                  {transaction.installmentNumber && transaction.installmentPurchase && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full w-fit">
                      💳 Parcela {transaction.installmentNumber}/
                      {transaction.installmentPurchase.installments}
                    </span>
                  )}
                </div>
              </td>

              {/* Categoria */}
              <td className="py-4 px-4">
                {transaction.category && (
                  <div className="flex items-center gap-2">
                    <span>{transaction.category.icon}</span>
                    <span className="text-sm text-text-secondary">{transaction.category.name}</span>
                  </div>
                )}
              </td>

              {/* Data */}
              <td className="py-4 px-4">
                <span className="text-sm text-text-tertiary">{formatDate(transaction.date)}</span>
              </td>

              {/* Método */}
              <td className="py-4 px-4">
                <span className="text-xs px-2 py-1 bg-background-tertiary rounded-full text-text-secondary">
                  {getPaymentMethodLabel(transaction.paymentMethod)}
                </span>
              </td>

              {/* Pago por */}
              <td className="py-4 px-4">
                {transaction.paidBy ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full">
                      👤 {transaction.paidBy}
                    </span>
                    {transaction.isReimbursed && (
                      <span className="text-xs text-green-600 dark:text-green-400" title="Reembolsado">
                        ✓
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-text-tertiary">-</span>
                )}
              </td>

              {/* Valor */}
              <td className="py-4 px-4 text-right">
                <span
                  className={`font-semibold ${
                    transaction.type === "INCOME"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </td>

              {/* Ações */}
              <td className="py-4 px-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4 text-text-tertiary hover:text-text-primary" />
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4 text-text-tertiary hover:text-red-600 dark:hover:text-red-400" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
