"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Calendar, DollarSign, Repeat } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Select } from "@/components/ui/Select";
import { useCategories } from "@/hooks/useCategories";
import { useCards } from "@/hooks/useCards";
import { calculateNextBillingDate, formatFrequency } from "@/lib/validations/subscription";
import type { Subscription } from "@/services/subscriptionService";

// Schema para o formulário
const subscriptionFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  amount: z.number().positive("Valor deve ser positivo"),
  frequency: z.enum(["MONTHLY", "YEARLY", "WEEKLY", "CUSTOM"]),
  customDays: z.number().int().min(1).max(365).optional(),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  categoryId: z.string().optional(),
  cardId: z.string().optional(),
  paymentMethod: z.enum(["PIX", "CASH", "DEBIT", "CREDIT", "TRANSFER"]),
  isActive: z.boolean(),
  autoGenerate: z.boolean(),
});

type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>;

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  subscription?: Subscription;
}

const FREQUENCY_OPTIONS = [
  { value: "WEEKLY", label: "Semanal", icon: "📅" },
  { value: "MONTHLY", label: "Mensal", icon: "📆" },
  { value: "YEARLY", label: "Anual", icon: "🗓️" },
  { value: "CUSTOM", label: "Personalizado", icon: "⚙️" },
];

const PAYMENT_METHODS = [
  { value: "PIX", label: "PIX", icon: "💳" },
  { value: "CREDIT", label: "Crédito", icon: "💳" },
  { value: "DEBIT", label: "Débito", icon: "💳" },
  { value: "CASH", label: "Dinheiro", icon: "💵" },
  { value: "TRANSFER", label: "Transferência", icon: "🔄" },
];

export function SubscriptionModal({
  isOpen,
  onClose,
  onSave,
  subscription,
}: SubscriptionModalProps) {
  const { categories } = useCategories();
  const { cards } = useCards();
  const [isLoading, setIsLoading] = useState(false);
  const [nextBillingPreview, setNextBillingPreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: "",
      description: "",
      amount: 0,
      frequency: "MONTHLY",
      customDays: undefined,
      startDate: new Date().toISOString().split("T")[0],
      categoryId: "",
      cardId: "",
      paymentMethod: "PIX",
      isActive: true,
      autoGenerate: true,
    },
  });

  const selectedFrequency = watch("frequency");
  const selectedStartDate = watch("startDate");
  const selectedCustomDays = watch("customDays");
  const selectedAmount = watch("amount");
  const selectedPaymentMethod = watch("paymentMethod");

  // Populate form when editing
  useEffect(() => {
    if (subscription) {
      setValue("name", subscription.name);
      setValue("description", subscription.description || "");
      setValue("amount", subscription.amount);
      setValue("frequency", subscription.frequency as any);
      setValue("customDays", subscription.customDays || undefined);
      setValue(
        "startDate",
        subscription.startDate ? new Date(subscription.startDate).toISOString().split("T")[0] : ""
      );
      setValue("categoryId", subscription.categoryId || "");
      setValue("cardId", subscription.cardId || "");
      setValue("paymentMethod", subscription.paymentMethod as any);
      setValue("isActive", subscription.isActive);
      setValue("autoGenerate", subscription.autoGenerate);
    } else {
      reset();
    }
  }, [subscription, setValue, reset]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setNextBillingPreview("");
    }
  }, [isOpen, reset]);

  // Calculate next billing date preview
  useEffect(() => {
    if (selectedStartDate && selectedFrequency) {
      try {
        const startDate = new Date(selectedStartDate);
        const nextDate = calculateNextBillingDate(
          startDate,
          selectedFrequency as any,
          selectedCustomDays
        );
        setNextBillingPreview(
          nextDate.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        );
      } catch (error) {
        setNextBillingPreview("");
      }
    }
  }, [selectedStartDate, selectedFrequency, selectedCustomDays]);

  const onSubmit = async (data: SubscriptionFormData) => {
    setIsLoading(true);
    try {
      const startDate = new Date(data.startDate);
      const nextBillingDate = calculateNextBillingDate(
        startDate,
        data.frequency as any,
        data.customDays
      );

      await onSave({
        name: data.name,
        description: data.description || undefined,
        amount: data.amount,
        frequency: data.frequency,
        customDays: data.customDays,
        startDate,
        nextBillingDate,
        categoryId: data.categoryId || undefined,
        cardId: data.cardId || undefined,
        paymentMethod: data.paymentMethod,
        isActive: data.isActive,
        autoGenerate: data.autoGenerate,
      });
      reset();
      onClose();
    } catch (error) {
      console.error("Error saving subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const expenseCategories = categories.filter((cat) => !cat.isDefault);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Repeat className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {subscription ? "Editar Assinatura" : "Nova Assinatura"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Grid: Name + Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Nome da Assinatura *"
                error={errors.name?.message}
                {...register("name")}
                placeholder="Ex: Netflix, Spotify, Aluguel..."
              />

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Valor *
                </label>
                <CurrencyInput
                  value={selectedAmount}
                  onChange={(value) => setValue("amount", value)}
                  placeholder="0,00"
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <FormInput
              label="Descrição (Opcional)"
              error={errors.description?.message}
              {...register("description")}
              placeholder="Detalhes sobre a assinatura..."
            />

            {/* Frequency Selector */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Frequência *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {FREQUENCY_OPTIONS.map((freq) => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setValue("frequency", freq.value as any)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      selectedFrequency === freq.value
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-purple-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{freq.icon}</div>
                    <div className="text-xs font-medium">{freq.label}</div>
                  </button>
                ))}
              </div>
              {errors.frequency && (
                <p className="text-red-500 text-xs mt-1">{errors.frequency.message}</p>
              )}
            </div>

            {/* Custom Days (conditional) */}
            {selectedFrequency === "CUSTOM" && (
              <FormInput
                label="A cada quantos dias? *"
                type="number"
                error={errors.customDays?.message}
                {...register("customDays", { valueAsNumber: true })}
                placeholder="Ex: 15 (quinzenal)"
                min={1}
                max={365}
              />
            )}

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                {...register("startDate")}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
              )}
            </div>

            {/* Next Billing Preview */}
            {nextBillingPreview && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Próxima cobrança:</span>
                  <span className="text-sm font-bold">{nextBillingPreview}</span>
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Frequência: {formatFrequency(selectedFrequency as any, selectedCustomDays)}
                </div>
              </div>
            )}

            {/* Grid: Category + Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Categoria (Opcional)
                </label>
                <Select {...register("categoryId")}>
                  <option value="">Sem categoria</option>
                  {expenseCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Cartão (Opcional)
                </label>
                <Select {...register("cardId")}>
                  <option value="">Nenhum cartão</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} {card.nickname && `(${card.nickname})`}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Método de Pagamento *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setValue("paymentMethod", method.value as any)}
                    className={`p-2 rounded-lg border-2 transition-all text-center ${
                      selectedPaymentMethod === method.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-blue-300"
                    }`}
                  >
                    <div className="text-lg mb-1">{method.icon}</div>
                    <div className="text-xs font-medium">{method.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">
                    Assinatura Ativa
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Permite gerar transações
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <input
                  type="checkbox"
                  {...register("autoGenerate")}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">
                    Gerar Automaticamente
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Cria transações na data
                  </div>
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={isLoading}>
                {isLoading ? "Salvando..." : subscription ? "Atualizar" : "Criar Assinatura"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
