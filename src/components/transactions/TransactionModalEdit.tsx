"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, AlertCircle, UserPlus } from "lucide-react";
import { Transaction, Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { FormCurrencyInput } from "@/components/ui/FormCurrencyInput";
import { FormDateInput } from "@/components/ui/FormDateInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormCheckbox } from "@/components/ui/FormCheckbox";
import { useCards } from "@/hooks/useCards";
import { usePeople } from "@/hooks/usePeople";
import PersonModal from "@/components/people/PersonModal";
import { showToast } from "@/lib/toast";
import { suggestBillMonth } from "@/lib/cardUtils";
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from "@/lib/validations/transaction";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  transaction?: Transaction | null;
  categories: Category[];
}

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction,
  categories,
}: TransactionModalProps) {
  const { cards } = useCards();
  const { people, createPerson } = usePeople();

  // Verificar se é parcela
  const isInstallment = transaction?.installmentPurchaseId != null;

  // Checkbox MARCADO por padrão para parcelas (comportamento esperado)
  const [updateAllInstallments, setUpdateAllInstallments] = useState(isInstallment);

  // Person modal states
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);

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
    },
  });

  const type = watch("type");
  const cardId = watch("cardId");
  const date = watch("date");

  const installmentInfo = isInstallment
    ? `Parcela ${transaction?.installmentNumber || 1} de ${
        transaction?.installmentPurchase?.installments || 1
      }`
    : null;

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

  // Reset form when modal opens/closes or transaction changes
  useEffect(() => {
    if (isOpen) {
      // Atualizar checkbox baseado se é parcela ou não
      setUpdateAllInstallments(isInstallment);

      if (transaction) {
        const transactionType = transaction.type === "TRANSFER" ? "EXPENSE" : transaction.type;
        reset({
          type: transactionType as "INCOME" | "EXPENSE",
          description: transaction.description || "",
          amount: Number(transaction.amount),
          date: new Date(transaction.date),
          categoryId: transaction.categoryId || null,
          cardId: transaction.cardId || null,
          paidBy: transaction.paidBy || null,
          isReimbursed: transaction.isReimbursed || false,
          billMonth: transaction.billMonth || null,
        });
      } else {
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
    }
  }, [isOpen, transaction, categories, reset, isInstallment]);

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
      const endpoint = transaction ? `/api/transactions/${transaction.id}` : "/api/transactions";

      const method = transaction ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: data.date.toISOString(),
          updateAllInstallments: isInstallment && updateAllInstallments, // Flag para atualizar todas as parcelas
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details ? JSON.stringify(error.details) : error.error);
      }

      const result = await response.json();

      // Mensagem personalizada se atualizou múltiplas parcelas
      if (result.updatedCount && result.updatedCount > 1) {
        showToast.success(`${result.updatedCount} parcelas atualizadas com sucesso!`);
      } else {
        showToast.success(
          transaction ? "Transação atualizada com sucesso!" : "Transação criada com sucesso!"
        );
      }

      await onSave();
      onClose();
      reset();
      setUpdateAllInstallments(false);
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      showToast.error("Erro ao salvar transação");
    }
  };

  const handleClose = () => {
    reset();
    setUpdateAllInstallments(false);
    onClose();
  };

  if (!isOpen) return null;

  // Filtrar categorias por tipo (se tiver a propriedade type)
  const filteredCategories = categories;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {transaction ? "Editar Transação" : "Nova Transação"}
            </h2>
            {isInstallment && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {installmentInfo}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Alerta de Parcela */}
        {isInstallment && transaction && (
          <div className="mx-6 mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  ⚠️ Esta é uma compra parcelada
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  As parcelas são um <strong>grupo único</strong>. Por padrão, alterações serão
                  aplicadas em{" "}
                  <strong>todas as {transaction.installmentPurchase?.installments} parcelas</strong>
                  .
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  💡 Exemplo: Se você mudar a categoria ou quem pagou, todas as parcelas serão
                  atualizadas juntas.
                </p>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateAllInstallments}
                    onChange={(e) => setUpdateAllInstallments(e.target.checked)}
                    className="w-4 h-4 rounded border-blue-300 dark:border-blue-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Atualizar todas as {transaction.installmentPurchase?.installments} parcelas
                    (recomendado)
                  </span>
                </label>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 ml-6">
                  Desmarque apenas se quiser editar somente esta parcela específica.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Linha 1: Tipo e Descrição */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="md:col-span-2">
              <FormInput
                label="Descrição"
                {...register("description")}
                error={errors.description}
                placeholder="Ex: Supermercado, Salário..."
                required
              />
            </div>
          </div>

          {/* Linha 2: Valor, Data e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <FormCurrencyInput
                  label="Valor"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.amount}
                  required
                />
              )}
            />

            <FormDateInput
              label="Data"
              {...register("date", {
                setValueAs: (value) => (value ? new Date(value + "T12:00:00") : new Date()),
              })}
              error={errors.date}
              required
            />

            <FormSelect
              label="Categoria"
              {...register("categoryId")}
              error={errors.categoryId}
              options={[
                { value: "", label: "Sem categoria" },
                ...filteredCategories.map((cat) => ({
                  value: cat.id,
                  label: `${cat.icon} ${cat.name}`,
                })),
              ]}
            />
          </div>

          {/* Linha 3: Cartão e Mês da Fatura (só para despesas) */}
          {type === "EXPENSE" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Cartão de Crédito"
                {...register("cardId")}
                error={errors.cardId}
                options={[
                  { value: "", label: "💵 Nenhum (Dinheiro/PIX)" },
                  ...cards.map((card) => ({
                    value: card.id,
                    label: `💳 ${card.name}`,
                  })),
                ]}
              />

              {/* Mês da Fatura - só aparece quando tem cartão */}
              {cardId && (
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
                    💡 Sugestão automática baseada na data e fechamento do cartão
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Linha 4: Pago Por (opcional, só aparece se usuário quiser) */}
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Opções Avançadas (Pago por, Reembolso)
              </span>
              <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-4 space-y-4 pl-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Pago por
                  </span>
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
                      style={{
                        backgroundColor: people.find((p) => p.name === watch("paidBy"))?.color,
                      }}
                    />
                  )}
                  <select
                    {...register("paidBy")}
                    className={`w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent outline-none transition-all ${
                      watch("paidBy") && people.find((p) => p.name === watch("paidBy"))
                        ? "pl-9"
                        : ""
                    } ${errors.paidBy ? "border-red-500" : ""}`}
                  >
                    <option value="">Nenhuma pessoa</option>
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
                  Use quando outra pessoa pagar por você
                </p>
              </div>
            </div>
          </details>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : transaction ? "Atualizar" : "Criar"}
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
