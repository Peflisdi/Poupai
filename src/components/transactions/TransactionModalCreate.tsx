"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, UserPlus } from "lucide-react";
import { Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { FormCurrencyInput } from "@/components/ui/FormCurrencyInput";
import { FormDateInput } from "@/components/ui/FormDateInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { useCards } from "@/hooks/useCards";
import { usePeople } from "@/hooks/usePeople";
import PersonModal from "@/components/people/PersonModal";
import { showToast } from "@/lib/toast";
import { suggestBillMonth } from "@/lib/cardUtils";
import { installmentService } from "@/services/installmentService";
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from "@/lib/validations/transaction";

interface TransactionModalCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  categories: Category[];
}

export function TransactionModalCreate({
  isOpen,
  onClose,
  onSave,
  categories,
}: TransactionModalCreateProps) {
  const { cards } = useCards();
  const { people, createPerson } = usePeople();

  // Person modal states
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);

  // Installment states
  const [isInstallment, setIsInstallment] = useState(false);
  const [installments, setInstallments] = useState(2);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    control,
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "EXPENSE",
      description: "",
      amount: 0,
      date: new Date(),
      categoryId: categories[0]?.id || null,
      cardId: null,
      paidBy: null,
      isReimbursed: false,
      billMonth: null,
    },
  });

  const type = watch("type");
  const cardId = watch("cardId");
  const date = watch("date");

  // Sugerir mês da fatura quando cartão ou data mudarem
  useEffect(() => {
    if (cardId && date) {
      const selectedCard = cards.find((c) => c.id === cardId);
      if (selectedCard) {
        const suggested = suggestBillMonth(
          date instanceof Date ? date : new Date(date),
          selectedCard.closingDay,
          selectedCard.dueDay
        );
        setValue("billMonth", suggested);
      }
    } else if (!cardId) {
      // Limpar billMonth se não houver cartão selecionado
      setValue("billMonth", null);
    }
  }, [cardId, date, cards, setValue]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        type: "EXPENSE",
        description: "",
        amount: 0,
        date: new Date(),
        categoryId: categories[0]?.id || null,
        cardId: null,
        paidBy: null,
        isReimbursed: false,
        billMonth: null,
      });
    }
  }, [isOpen, categories, reset]);

  const handleCreatePerson = async (personData: {
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
    color?: string;
  }) => {
    try {
      const newPerson = await createPerson(personData);
      if (newPerson) {
        setValue("paidBy", newPerson.name);
      }
      setIsPersonModalOpen(false);
    } catch (error) {
      console.error("Error creating person:", error);
    }
  };

  const onSubmit = async (data: CreateTransactionInput) => {
    try {
      // Se for parcelado, usar API de parcelas
      if (isInstallment && data.cardId) {
        // data.amount já contém o valor POR PARCELA
        // totalAmount = valor da parcela * número de parcelas
        const totalAmount = data.amount * installments;

        await installmentService.createInstallment({
          description: data.description || "",
          totalAmount: totalAmount, // Total da compra
          installments: installments, // Número de parcelas
          startDate: data.date instanceof Date ? data.date.toISOString() : data.date,
          categoryId: data.categoryId || undefined,
          cardId: data.cardId,
          paidBy: data.paidBy || undefined,
          isReimbursed: data.isReimbursed,
        });

        showToast.success(
          `Compra de ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalAmount)} parcelada em ${installments}x de ${new Intl.NumberFormat(
            "pt-BR",
            {
              style: "currency",
              currency: "BRL",
            }
          ).format(data.amount)} criada com sucesso!`
        );
      } else {
        // Transação única
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            date: data.date.toISOString(),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details ? JSON.stringify(error.details) : error.error);
        }

        showToast.success("Transação criada com sucesso!");
      }

      await onSave();
      onClose();
      reset();
      setIsInstallment(false);
      setInstallments(2);
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      showToast.error("Erro ao criar transação");
    }
  };

  const handleClose = () => {
    reset();
    setIsInstallment(false);
    setInstallments(2);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Nova Transação
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Grid de 2 colunas para campos menores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <FormSelect
              label="Tipo"
              {...register("type")}
              error={errors.type}
              options={[
                { value: "EXPENSE", label: "💸 Despesa" },
                { value: "INCOME", label: "💰 Receita" },
              ]}
              required
            />

            {/* Valor com formatação BRL */}
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <FormCurrencyInput
                  label={isInstallment ? "Valor de cada parcela" : "Valor"}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.amount}
                  helperText={isInstallment ? "Digite o valor de UMA parcela" : undefined}
                  required
                />
              )}
            />
          </div>

          {/* Descrição */}
          <FormInput
            label="Descrição"
            {...register("description")}
            error={errors.description}
            placeholder="Ex: Supermercado, Salário..."
            required
          />

          {/* Grid de 2 colunas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data com calendário clicável */}
            <FormDateInput
              label="Data"
              {...register("date", {
                setValueAs: (value) => (value ? new Date(value + "T12:00:00") : new Date()),
              })}
              error={errors.date}
              required
            />

            {/* Categoria */}
            <FormSelect
              label="Categoria"
              {...register("categoryId")}
              error={errors.categoryId}
              options={[
                { value: "", label: "Sem categoria" },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: `${cat.icon} ${cat.name}`,
                })),
              ]}
            />
          </div>

          {/* Cartão de Crédito - só aparece para despesas */}
          {type === "EXPENSE" && (
            <FormSelect
              label="Forma de Pagamento"
              {...register("cardId")}
              error={errors.cardId}
              options={[
                { value: "", label: "💵 Dinheiro/PIX" },
                ...cards.map((card) => ({
                  value: card.id,
                  label: `💳 ${card.name}`,
                })),
              ]}
            />
          )}

          {/* Parcelamento - só aparece quando tem cartão selecionado */}
          {type === "EXPENSE" && cardId && (
            <div className="space-y-3 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInstallment}
                  onChange={(e) => setIsInstallment(e.target.checked)}
                  className="w-4 h-4 rounded border-purple-300 dark:border-purple-700 text-purple-600 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  💳 Parcelar esta compra
                </span>
              </label>

              {isInstallment && (
                <div className="pl-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-purple-800 dark:text-purple-200">
                      Número de parcelas:
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="px-3 py-1 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 2).map((n) => (
                        <option key={n} value={n}>
                          {n}x
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    💡 Total:{" "}
                    <strong>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format((watch("amount") || 0) * installments)}
                    </strong>{" "}
                    ({installments} parcelas de{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(watch("amount") || 0)}
                    )
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    ℹ️ Digite o valor de <strong>cada parcela</strong> acima, não o total
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Mês da Fatura - SEMPRE aparece quando tem cartão selecionado */}
          {type === "EXPENSE" && cardId && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Mês da Fatura
              </label>
              <div
                className="relative cursor-pointer"
                onClick={(e) => {
                  const input = e.currentTarget.querySelector(
                    'input[type="month"]'
                  ) as HTMLInputElement;
                  if (input) input.showPicker?.();
                }}
              >
                <input
                  type="month"
                  {...register("billMonth")}
                  className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent outline-none transition-all cursor-pointer"
                />
              </div>
              {errors.billMonth && (
                <p className="text-sm text-red-500 mt-1">{errors.billMonth.message}</p>
              )}
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                💡{" "}
                {isInstallment
                  ? "Escolha o mês da PRIMEIRA parcela. As próximas virão nos meses seguintes."
                  : "Mês sugerido automaticamente baseado na data e fechamento do cartão."}
              </p>
            </div>
          )}

          {/* Pago Por */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Pago por (opcional)
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsPersonModalOpen(true)}
                className="text-xs"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Nova Pessoa
              </Button>
            </div>
            <div className="relative">
              {watch("paidBy") && people.find((p) => p.name === watch("paidBy")) && (
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-10 pointer-events-none"
                  style={{ backgroundColor: people.find((p) => p.name === watch("paidBy"))?.color }}
                />
              )}
              <select
                {...register("paidBy")}
                className={`w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent outline-none transition-all ${
                  watch("paidBy") && people.find((p) => p.name === watch("paidBy")) ? "pl-9" : ""
                } ${errors.paidBy ? "border-red-500" : ""}`}
              >
                <option value="">Selecione uma pessoa</option>
                {people.map((person) => (
                  <option key={person.id} value={person.name}>
                    {person.name}
                  </option>
                ))}
              </select>
              {errors.paidBy && (
                <p className="text-sm text-red-500 mt-1">{errors.paidBy.message}</p>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              💡 Use quando outra pessoa pagar com seu cartão/dinheiro. Acompanhe os gastos por
              pessoa em Relatórios.
            </p>
          </div>

          {/* Actions - sticky no bottom */}
          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white dark:bg-neutral-900 pb-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Transação"}
            </Button>
          </div>
        </form>
      </div>

      {/* Person Modal */}
      <PersonModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
        onSave={handleCreatePerson}
      />
    </div>
  );
}
