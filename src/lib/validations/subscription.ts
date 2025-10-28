import { z } from "zod";

/**
 * Enum para frequência de assinaturas
 */
export const SubscriptionFrequency = {
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
  WEEKLY: "WEEKLY",
  CUSTOM: "CUSTOM",
} as const;

export type SubscriptionFrequencyType = keyof typeof SubscriptionFrequency;

/**
 * Schema base para assinaturas (sem validações customizadas)
 */
const subscriptionBaseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  description: z.string().max(500, "Descrição muito longa").optional().nullable(),
  amount: z
    .number({
      required_error: "Valor é obrigatório",
      invalid_type_error: "Valor deve ser um número",
    })
    .positive("Valor deve ser positivo")
    .max(999999999, "Valor muito alto"),
  frequency: z.enum(["MONTHLY", "YEARLY", "WEEKLY", "CUSTOM"], {
    required_error: "Frequência é obrigatória",
    invalid_type_error: "Frequência inválida",
  }),
  customDays: z
    .number()
    .int("Deve ser um número inteiro")
    .min(1, "Mínimo 1 dia")
    .max(365, "Máximo 365 dias")
    .optional()
    .nullable(),
  startDate: z.date({
    required_error: "Data de início é obrigatória",
    invalid_type_error: "Data inválida",
  }),
  nextBillingDate: z.date({
    required_error: "Próxima cobrança é obrigatória",
    invalid_type_error: "Data inválida",
  }),
  categoryId: z.string().optional().nullable(),
  cardId: z.string().optional().nullable(),
  paymentMethod: z
    .enum(["PIX", "CASH", "DEBIT", "CREDIT", "TRANSFER"], {
      invalid_type_error: "Método de pagamento inválido",
    })
    .default("PIX"),
  isActive: z.boolean().default(true),
  autoGenerate: z.boolean().default(true),
});

/**
 * Schema de validação para assinaturas (com validações customizadas)
 */
export const subscriptionSchema = subscriptionBaseSchema
  .refine(
    (data) => {
      // Se frequency for CUSTOM, customDays é obrigatório
      if (data.frequency === "CUSTOM" && !data.customDays) {
        return false;
      }
      return true;
    },
    {
      message: "Para frequência personalizada, informe o número de dias",
      path: ["customDays"],
    }
  )
  .refine(
    (data) => {
      // nextBillingDate deve ser após startDate
      return data.nextBillingDate >= data.startDate;
    },
    {
      message: "Próxima cobrança deve ser igual ou após a data de início",
      path: ["nextBillingDate"],
    }
  );

/**
 * Schema para criação de assinatura
 */
export const createSubscriptionSchema = subscriptionBaseSchema.extend({
  id: z.string().optional(),
});

/**
 * Schema para atualização de assinatura
 */
export const updateSubscriptionSchema = subscriptionBaseSchema.partial().extend({
  id: z.string(),
});

/**
 * Type inference
 */
export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
export type CreateSubscriptionData = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionData = z.infer<typeof updateSubscriptionSchema>;

/**
 * Função helper para calcular próxima data de cobrança
 */
export function calculateNextBillingDate(
  startDate: Date,
  frequency: SubscriptionFrequencyType,
  customDays?: number | null
): Date {
  const next = new Date(startDate);

  switch (frequency) {
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
    case "CUSTOM":
      if (customDays) {
        next.setDate(next.getDate() + customDays);
      }
      break;
  }

  return next;
}

/**
 * Função helper para formatar frequência em português
 */
export function formatFrequency(
  frequency: SubscriptionFrequencyType,
  customDays?: number | null
): string {
  switch (frequency) {
    case "WEEKLY":
      return "Semanal";
    case "MONTHLY":
      return "Mensal";
    case "YEARLY":
      return "Anual";
    case "CUSTOM":
      return customDays ? `A cada ${customDays} dias` : "Personalizado";
    default:
      return frequency;
  }
}
