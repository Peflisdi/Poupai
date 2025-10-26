import { z } from "zod";

/**
 * Schema de validação para transações
 * Usado tanto no cliente quanto no servidor para garantir consistência
 */
export const transactionSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória").max(255, "Descrição muito longa"),
  amount: z
    .number({
      required_error: "Valor é obrigatório",
      invalid_type_error: "Valor deve ser um número",
    })
    .positive("Valor deve ser positivo")
    .max(999999999, "Valor muito alto"),
  date: z.date({
    required_error: "Data é obrigatória",
    invalid_type_error: "Data inválida",
  }),
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Tipo é obrigatório",
    invalid_type_error: "Tipo deve ser INCOME ou EXPENSE",
  }),
  categoryId: z.string().optional().nullable(),
  cardId: z.string().optional().nullable(),
  installments: z
    .number()
    .int("Número de parcelas deve ser inteiro")
    .min(1, "Mínimo 1 parcela")
    .max(120, "Máximo 120 parcelas")
    .optional()
    .nullable(),
  installmentNumber: z.number().int().optional().nullable(),
  parentTransactionId: z.string().optional().nullable(),
  paidBy: z.string().max(100, "Nome muito longo").optional().nullable(),
  isReimbursed: z.boolean().default(false),
});

/**
 * Schema para criação de transação (campos opcionais diferentes)
 */
export const createTransactionSchema = transactionSchema.extend({
  id: z.string().optional(),
});

/**
 * Schema para atualização de transação (todos os campos opcionais)
 */
export const updateTransactionSchema = transactionSchema.partial().extend({
  id: z.string(),
});

/**
 * Tipos TypeScript inferidos dos schemas
 */
export type TransactionInput = z.infer<typeof transactionSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

/**
 * Schema para query params de listagem de transações
 */
export const transactionQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().optional(),
  cardId: z.string().optional(),
  paidBy: z.string().optional(),
  isReimbursed: z.boolean().optional(),
});

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
