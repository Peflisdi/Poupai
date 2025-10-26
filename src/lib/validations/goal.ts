import { z } from "zod";

/**
 * Schema de validação para metas financeiras
 */
export const goalSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo"),
  targetAmount: z
    .number({
      required_error: "Valor alvo é obrigatório",
      invalid_type_error: "Valor alvo deve ser um número",
    })
    .positive("Valor alvo deve ser positivo")
    .max(999999999, "Valor muito alto"),
  currentAmount: z
    .number({
      invalid_type_error: "Valor atual deve ser um número",
    })
    .nonnegative("Valor atual não pode ser negativo")
    .max(999999999, "Valor muito alto")
    .default(0),
  deadline: z
    .date({
      required_error: "Prazo é obrigatório",
      invalid_type_error: "Prazo inválido",
    })
    .refine((date) => date > new Date(), {
      message: "Prazo deve ser uma data futura",
    }),
  icon: z
    .string()
    .max(10, "Ícone muito longo")
    .regex(/[\p{Emoji}]/u, "Deve ser um emoji válido")
    .default("🎯"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um código hexadecimal válido")
    .default("#10B981"),
});

/**
 * Schema para criação de meta
 */
export const createGoalSchema = goalSchema.extend({
  id: z.string().optional(),
});

/**
 * Schema para atualização de meta
 */
export const updateGoalSchema = goalSchema.partial().extend({
  id: z.string(),
});

/**
 * Validação adicional: valor atual não pode exceder valor alvo
 */
export const validateGoalAmounts = (data: { currentAmount: number; targetAmount: number }) => {
  if (data.currentAmount > data.targetAmount) {
    return {
      success: false,
      error: "Valor atual não pode exceder o valor alvo",
    };
  }
  return { success: true };
};

/**
 * Tipos TypeScript inferidos
 */
export type GoalInput = z.infer<typeof goalSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
