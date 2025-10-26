"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Transaction, Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormCheckbox } from "@/components/ui/FormCheckbox";
import { useCards } from "@/hooks/useCards";
import { showToast } from "@/lib/toast";
import { createTransactionSchema, type CreateTransactionInput } from "@/lib/validations/transaction";

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

  // Reset form when modal opens/closes or transaction changes
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, transaction, categories, reset]);

  const onSubmit = async (data: CreateTransactionInput) => {
    try {
      const endpoint = transaction
        ? `/api/transactions/${transaction.id}`
        : "/api/transactions";
      
      const method = transaction ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
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

      showToast.success(
        transaction ? "Transação atualizada com sucesso!" : "Transação criada com sucesso!"
      );
      
      await onSave();
      onClose();
      reset();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      showToast.error("Erro ao salvar transação");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  // Filtrar categorias por tipo (se tiver a propriedade type)
  const filteredCategories = categories;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-primary">
          <h2 className="text-xl font-semibold text-text-primary">
            {transaction ? "Editar Transação" : "Nova Transação"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

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
                setValueAs: (value) => value ? new Date(value + "T12:00:00") : new Date() 
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
