import { z } from "zod";

/**
 * Schema de validação para cartões de crédito
 */
export const cardSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  nickname: z.string().max(100, "Apelido muito longo").optional().nullable(),
  limit: z
    .number({
      required_error: "Limite é obrigatório",
      invalid_type_error: "Limite deve ser um número",
    })
    .positive("Limite deve ser positivo")
    .max(999999999, "Limite muito alto"),
  closingDay: z
    .number({
      required_error: "Dia de fechamento é obrigatório",
      invalid_type_error: "Dia de fechamento deve ser um número",
    })
    .int("Dia de fechamento deve ser inteiro")
    .min(1, "Dia deve ser entre 1 e 31")
    .max(31, "Dia deve ser entre 1 e 31"),
  dueDay: z
    .number({
      required_error: "Dia de vencimento é obrigatório",
      invalid_type_error: "Dia de vencimento deve ser um número",
    })
    .int("Dia de vencimento deve ser inteiro")
    .min(1, "Dia deve ser entre 1 e 31")
    .max(31, "Dia deve ser entre 1 e 31"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um código hexadecimal válido")
    .default("#3B82F6"),
});

/**
 * Schema para criação de cartão
 */
export const createCardSchema = cardSchema.extend({
  id: z.string().optional(),
});

/**
 * Schema para atualização de cartão
 */
export const updateCardSchema = cardSchema.partial().extend({
  id: z.string(),
});

/**
 * Validação adicional: dia de vencimento deve ser após o fechamento
 */
export const validateCardDates = (data: { closingDay: number; dueDay: number }) => {
  if (data.dueDay <= data.closingDay) {
    return {
      success: false,
      error: "Dia de vencimento deve ser após o dia de fechamento",
    };
  }
  return { success: true };
};

/**
 * Tipos TypeScript inferidos
 */
export type CardInput = z.infer<typeof cardSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
