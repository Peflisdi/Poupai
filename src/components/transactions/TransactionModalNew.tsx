"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, AlertCircle } from "lucide-react";
import { Transaction, Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormCheckbox } from "@/components/ui/FormCheckbox";
import { useCards } from "@/hooks/useCards";
import { showToast } from "@/lib/toast";
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

  // Verificar se é parcela
  const isInstallment = transaction?.installmentPurchaseId != null;

  // Checkbox MARCADO por padrão para parcelas (comportamento esperado)
  const [updateAllInstallments, setUpdateAllInstallments] = useState(isInstallment);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
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

  const installmentInfo = isInstallment
    ? `Parcela ${transaction?.installmentNumber || 1} de ${
        transaction?.installmentPurchase?.installments || 1
      }`
    : null;

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
        });
      }
    }
  }, [isOpen, transaction, categories, reset, isInstallment]);

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
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Tipo */}
          <FormSelect
            label="Tipo"
            {...register("type")}
            error={errors.type}
            options={[
              { value: "EXPENSE", label: "Despesa" },
              { value: "INCOME", label: "Receita" },
            ]}
            required
          />

          {/* Descrição */}
          <FormInput
            label="Descrição"
            {...register("description")}
            error={errors.description}
            placeholder="Ex: Supermercado, Salário..."
            required
          />

          {/* Valor e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Valor"
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              error={errors.amount}
              placeholder="0,00"
              required
            />

            <FormInput
              label="Data"
              type="date"
              {...register("date", {
                setValueAs: (value) => (value ? new Date(value + "T12:00:00") : new Date()),
              })}
              error={errors.date}
              required
            />
          </div>

          {/* Categoria */}
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

          {/* Cartão de Crédito */}
          {type === "EXPENSE" && (
            <FormSelect
              label="Cartão de Crédito"
              {...register("cardId")}
              error={errors.cardId}
              options={[
                { value: "", label: "Nenhum (Dinheiro/PIX)" },
                ...cards.map((card) => ({
                  value: card.id,
                  label: card.name,
                })),
              ]}
            />
          )}

          {/* Pago Por */}
          <FormInput
            label="Pago por (opcional)"
            {...register("paidBy")}
            error={errors.paidBy}
            placeholder="Nome da pessoa que pagou"
          />

          {/* Reembolsado */}
          {watch("paidBy") && (
            <FormCheckbox
              label="Já foi reembolsado"
              {...register("isReimbursed")}
              error={errors.isReimbursed}
            />
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : transaction ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
