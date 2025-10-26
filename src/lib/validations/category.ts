import { z } from "zod";

/**
 * Schema de validação para categorias
 */
export const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  icon: z
    .string()
    .min(1, "Ícone é obrigatório")
    .max(10, "Ícone muito longo")
    .regex(/[\p{Emoji}]/u, "Deve ser um emoji válido"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um código hexadecimal válido")
    .default("#6B7280"),
  budget: z
    .number({
      invalid_type_error: "Orçamento deve ser um número",
    })
    .nonnegative("Orçamento não pode ser negativo")
    .max(999999999, "Orçamento muito alto")
    .default(0),
  type: z
    .enum(["INCOME", "EXPENSE"], {
      required_error: "Tipo é obrigatório",
      invalid_type_error: "Tipo deve ser INCOME ou EXPENSE",
    })
    .default("EXPENSE"),
});

/**
 * Schema para criação de categoria
 */
export const createCategorySchema = categorySchema.extend({
  id: z.string().optional(),
});

/**
 * Schema para atualização de categoria
 */
export const updateCategorySchema = categorySchema.partial().extend({
  id: z.string(),
});

/**
 * Tipos TypeScript inferidos
 */
export type CategoryInput = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
