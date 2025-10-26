import { z } from "zod";

/**
 * Schema de validação para empréstimos
 */
export const loanSchema = z.object({
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(255, "Descrição muito longa"),
  amount: z
    .number({
      required_error: "Valor é obrigatório",
      invalid_type_error: "Valor deve ser um número",
    })
    .positive("Valor deve ser positivo")
    .max(999999999, "Valor muito alto"),
  type: z.enum(["LENT", "BORROWED"], {
    required_error: "Tipo é obrigatório",
    invalid_type_error: "Tipo deve ser LENT ou BORROWED",
  }),
  personName: z
    .string()
    .min(1, "Nome da pessoa é obrigatório")
    .max(100, "Nome muito longo"),
  date: z.date({
    required_error: "Data é obrigatória",
    invalid_type_error: "Data inválida",
  }),
  dueDate: z
    .date({
      invalid_type_error: "Data de vencimento inválida",
    })
    .optional()
    .nullable(),
  isPaid: z.boolean().default(false),
  notes: z.string().max(500, "Notas muito longas").optional().nullable(),
});

/**
 * Schema para criação de empréstimo
 */
export const createLoanSchema = loanSchema.extend({
  id: z.string().optional(),
});

/**
 * Schema para atualização de empréstimo
 */
export const updateLoanSchema = loanSchema.partial().extend({
  id: z.string(),
});

/**
 * Validação adicional: data de vencimento deve ser após a data do empréstimo
 */
export const validateLoanDates = (data: { date: Date; dueDate?: Date | null }) => {
  if (data.dueDate && data.dueDate <= data.date) {
    return {
      success: false,
      error: "Data de vencimento deve ser após a data do empréstimo",
    };
  }
  return { success: true };
};

/**
 * Tipos TypeScript inferidos
 */
export type LoanInput = z.infer<typeof loanSchema>;
export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;
