"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { Card, CreateCardData, UpdateCardData } from "@/services/cardService";
import { showToast, toastMessages } from "@/lib/toast";
import { createCardSchema, type CreateCardInput } from "@/lib/validations/card";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCardData | UpdateCardData) => Promise<void>;
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

// Tipo para os inputs do formulário
type CardFormInput = Omit<CreateCardInput, "color"> & {
  color: string;
  isDefault?: boolean;
};

export function CardModal({ isOpen, onClose, onSave, card }: CardModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CardFormInput>({
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

  const onSubmit = async (data: CardFormInput) => {
    try {
      const cardData: CreateCardData | UpdateCardData = {
        name: data.name,
        nickname: data.nickname || undefined,
        limit: data.limit,
        closingDay: data.closingDay,
        dueDay: data.dueDay,
        color: data.color,
      };

      if (card) {
        await onSave({ ...cardData, id: card.id } as UpdateCardData);
        showToast.success(toastMessages.cards.updated);
      } else {
        await onSave(cardData);
        showToast.success(toastMessages.cards.created);
      }

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
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
          {/* Grid 2 colunas para Nome e Apelido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome do Cartão */}
            <FormInput
              label="Nome do Cartão"
              {...register("name")}
              error={errors.name}
              placeholder="Ex: Nubank, Inter..."
              required
            />

            {/* Apelido (opcional) */}
            <FormInput
              label="Apelido (Opcional)"
              {...register("nickname")}
              error={errors.nickname}
              placeholder="Ex: Cartão Principal"
            />
          </div>

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
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Dia de Fechamento"
              type="number"
              min="1"
              max="31"
              {...register("closingDay", { valueAsNumber: true })}
              error={errors.closingDay}
              placeholder="1-31"
              required
            />

            <FormInput
              label="Dia de Vencimento"
              type="number"
              min="1"
              max="31"
              {...register("dueDay", { valueAsNumber: true })}
              error={errors.dueDay}
              placeholder="1-31"
              required
            />
          </div>

          {/* Cor do Cartão */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Cor do Cartão
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CARD_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setValue("color", colorOption.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedColor === colorOption.value
                      ? "border-blue-500 scale-105 ring-2 ring-blue-200 dark:ring-blue-800"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.name}
                  aria-label={colorOption.name}
                >
                  <span className="sr-only">{colorOption.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : card ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
