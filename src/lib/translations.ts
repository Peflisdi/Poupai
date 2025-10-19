/**
 * Traduções e labels do sistema
 */

import { PaymentMethod, TransactionType } from "@/types";

/**
 * Traduz métodos de pagamento para português
 */
export const paymentMethodLabels: Record<PaymentMethod, string> = {
  PIX: "PIX",
  CREDIT: "Crédito",
  DEBIT: "Débito",
  CASH: "Dinheiro",
  TRANSFER: "Transferência",
};

/**
 * Traduz tipos de transação para português
 */
export const transactionTypeLabels: Record<TransactionType, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
  TRANSFER: "Transferência",
};

/**
 * Ícones para métodos de pagamento
 */
export const paymentMethodIcons: Record<PaymentMethod, string> = {
  PIX: "🔷",
  CREDIT: "💳",
  DEBIT: "💳",
  CASH: "💵",
  TRANSFER: "🔄",
};

/**
 * Ícones para tipos de transação
 */
export const transactionTypeIcons: Record<TransactionType, string> = {
  INCOME: "📈",
  EXPENSE: "📉",
  TRANSFER: "🔄",
};

/**
 * Retorna label formatado do método de pagamento
 */
export function getPaymentMethodLabel(method: PaymentMethod, withIcon = false): string {
  const label = paymentMethodLabels[method];
  const icon = paymentMethodIcons[method];
  return withIcon ? `${icon} ${label}` : label;
}

/**
 * Retorna label formatado do tipo de transação
 */
export function getTransactionTypeLabel(type: TransactionType, withIcon = false): string {
  const label = transactionTypeLabels[type];
  const icon = transactionTypeIcons[type];
  return withIcon ? `${icon} ${label}` : label;
}
