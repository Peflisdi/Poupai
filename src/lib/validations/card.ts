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
 * Validação adicional de datas do cartão
 *
 * NOTA: Removida validação de dueDay > closingDay pois é comum
 * cartões fecharem no final do mês (ex: dia 31) e vencerem no início
 * do mês seguinte (ex: dia 7).
 *
 * Exemplo válido: fecha 31/10, vence 07/11
 */
export const validateCardDates = (data: { closingDay: number; dueDay: number }) => {
  // Não há validação necessária além das já feitas pelo Zod
  // Os dias já são validados como 1-31 pelo schema
  return { success: true };
};

/**
 * Tipos TypeScript inferidos
 */
export type CardInput = z.infer<typeof cardSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
