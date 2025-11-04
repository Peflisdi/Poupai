"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { FormCheckbox } from "@/components/ui/FormCheckbox";
import { FormColorPicker } from "@/components/ui/FormColorPicker";
import { Card } from "@/services/cardService";
import { showToast, toastMessages } from "@/lib/toast";
import { createCardSchema, type CreateCardInput } from "@/lib/validations/card";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  card?: Card | null;
}

const CARD_COLORS = [
  { name: "Preto", value: "#000000" },
  { name: "Azul", value: "#3B82F6" },
  { name: "Verde", value: "#10B981" },
  { name: "Vermelho", value: "#EF4444" },
  { name: "Roxo", value: "#8B5CF6" },
  { name: "Laranja", value: "#F97316" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Cinza", value: "#6B7280" },
];

export function CardModalNew({ isOpen, onClose, onSave, card }: CardModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    setError,
  } = useForm<CreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      name: "",
      nickname: "",
      limit: 0,
      closingDay: 1,
      dueDay: 10,
      color: "#3B82F6",
    },
  });

  const selectedColor = watch("color");
  const closingDay = watch("closingDay");
  const dueDay = watch("dueDay");

  // Reset form when modal opens/closes or card changes
  useEffect(() => {
    if (isOpen) {
      if (card) {
        reset({
          name: card.name,
          nickname: card.nickname || "",
          limit: card.limit,
          closingDay: card.closingDay,
          dueDay: card.dueDay,
          color: card.color,
        });
      } else {
        reset({
          name: "",
          nickname: "",
          limit: 0,
          closingDay: 1,
          dueDay: 10,
          color: "#3B82F6",
        });
      }
    }
  }, [isOpen, card, reset]);

  const onSubmit = async (data: CreateCardInput) => {
    try {
      // Validação de datas removida - agora permitimos qualquer combinação
      // pois é comum cartões fecharem no final do mês e vencerem no início do próximo

      const endpoint = card ? `/api/cards/${card.id}` : "/api/cards";
      const method = card ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details ? JSON.stringify(error.details) : error.error);
      }

      showToast.success(card ? toastMessages.cards.updated : toastMessages.cards.created);

      await onSave();
      onClose();
      reset();
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      showToast.error(toastMessages.cards.error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      style={{ margin: 0 }}
    >
      <div
        className="bg-white dark:bg-neutral-900 backdrop-blur-sm rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        style={{ margin: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {card ? "Editar Cartão" : "Novo Cartão"}
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
          {/* Nome do Cartão */}
          <FormInput
            label="Nome do Cartão"
            {...register("name")}
            error={errors.name}
            placeholder="Ex: Nubank Mastercard, Inter Visa..."
            required
          />

          {/* Apelido (opcional) */}
          <FormInput
            label="Apelido (Opcional)"
            {...register("nickname")}
            error={errors.nickname}
            placeholder="Ex: Cartão Principal, Cartão de Viagens..."
          />

          {/* Limite */}
          <FormInput
            label="Limite do Cartão"
            type="number"
            step="0.01"
            {...register("limit", { valueAsNumber: true })}
            error={errors.limit}
            placeholder="0,00"
            required
          />

          {/* Dias de fechamento e vencimento */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Dia de Fechamento"
              type="number"
              min={1}
              max={31}
              {...register("closingDay", { valueAsNumber: true })}
              error={errors.closingDay}
              placeholder="1-31"
              helperText="Dia que fecha a fatura"
              required
            />

            <FormInput
              label="Dia de Vencimento"
              type="number"
              min={1}
              max={31}
              {...register("dueDay", { valueAsNumber: true })}
              error={errors.dueDay}
              placeholder="1-31"
              helperText="Dia do pagamento"
              required
            />
          </div>

          {/* Exemplo de ciclo de fatura */}
          {closingDay && dueDay && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Exemplo:</strong>{" "}
                {dueDay < closingDay
                  ? `Fecha dia ${closingDay}, vence dia ${dueDay} do mês seguinte`
                  : `Fecha dia ${closingDay}, vence dia ${dueDay} do mesmo mês`}
              </p>
            </div>
          )}

          {/* Cor do Cartão */}
          <FormColorPicker
            label="Cor do Cartão"
            value={selectedColor}
            onChange={(color) => setValue("color", color)}
            colors={CARD_COLORS}
            error={errors.color}
          />

          {/* Informações úteis */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Dica:</strong> O dia de fechamento é quando a fatura fecha e o dia de
              vencimento é quando você deve pagar.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : card ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
