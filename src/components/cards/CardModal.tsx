"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CreateCardData, UpdateCardData } from "@/services/cardService";
import { showToast, toastMessages } from "@/lib/toast";
import { cardValidations, ValidationError } from "@/lib/validations";

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

export function CardModal({ isOpen, onClose, onSave, card }: CardModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    limit: "" as string | number,
    closingDay: "" as string | number,
    dueDay: "" as string | number,
    color: "#000000",
    isDefault: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        nickname: card.nickname || "",
        limit: card.limit,
        closingDay: card.closingDay,
        dueDay: card.dueDay,
        color: card.color,
        isDefault: card.isDefault || false,
      });
    } else {
      setFormData({
        name: "",
        nickname: "",
        limit: "",
        closingDay: "",
        dueDay: "",
        color: "#000000",
        isDefault: false,
      });
    }
  }, [card, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar erros anteriores
    setValidationErrors([]);

    // Validar formulário
    const validation = cardValidations.validate({
      name: formData.name,
      limit: Number(formData.limit),
      closingDay: Number(formData.closingDay),
      dueDay: Number(formData.dueDay),
      color: formData.color,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      showToast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        name: formData.name,
        nickname: formData.nickname || undefined,
        limit: Number(formData.limit),
        closingDay: Number(formData.closingDay),
        dueDay: Number(formData.dueDay),
        color: formData.color,
        isDefault: formData.isDefault,
      };

      if (card) {
        await onSave({ ...data, id: card.id });
        showToast.success(toastMessages.cards.updated);
      } else {
        await onSave(data);
        showToast.success(toastMessages.cards.created);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      showToast.error(toastMessages.cards.error);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (field: string): string | undefined => {
    const error = validationErrors.find((e) => e.field === field);
    return error?.message;
  };

  const hasError = (field: string): boolean => {
    return validationErrors.some((e) => e.field === field);
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {card ? "Editar Cartão" : "Novo Cartão"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome do Cartão */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Nome do Cartão
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Nubank Mastercard, Inter Visa..."
              required
              className={hasError("Nome") ? "border-red-500 dark:border-red-500" : ""}
            />
            {hasError("Nome") && (
              <p className="text-xs text-red-500 mt-1">{getErrorMessage("Nome")}</p>
            )}
          </div>

          {/* Apelido (opcional) */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Apelido (Opcional)
            </label>
            <Input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              placeholder="Ex: Cartão Principal, Cartão de Viagens..."
            />
          </div>

          {/* Limite */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Limite do Cartão
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              placeholder="Digite o limite"
              required
              className={hasError("Limite") ? "border-red-500 dark:border-red-500" : ""}
            />
            {hasError("Limite") && (
              <p className="text-xs text-red-500 mt-1">{getErrorMessage("Limite")}</p>
            )}
          </div>

          {/* Dias de fechamento e vencimento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Dia de Fechamento
              </label>
              <Input
                type="number"
                min="1"
                max="31"
                value={formData.closingDay}
                onChange={(e) => setFormData({ ...formData, closingDay: e.target.value })}
                placeholder="1-31"
                required
                className={
                  hasError("Dia de fechamento") ? "border-red-500 dark:border-red-500" : ""
                }
              />
              {hasError("Dia de fechamento") && (
                <p className="text-xs text-red-500 mt-1">{getErrorMessage("Dia de fechamento")}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Dia de Vencimento
              </label>
              <Input
                type="number"
                min="1"
                max="31"
                value={formData.dueDay}
                onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                placeholder="1-31"
                required
                className={
                  hasError("Dia de vencimento") ? "border-red-500 dark:border-red-500" : ""
                }
              />
              {hasError("Dia de vencimento") && (
                <p className="text-xs text-red-500 mt-1">{getErrorMessage("Dia de vencimento")}</p>
              )}
            </div>
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
                  onClick={() => setFormData({ ...formData, color: colorOption.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.color === colorOption.value
                      ? "border-accent scale-105"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-border-secondary"
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.name}
                >
                  <span className="sr-only">{colorOption.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cartão Padrão */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
            <label htmlFor="isDefault" className="flex-1 cursor-pointer">
              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Marcar como cartão padrão
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Será selecionado automaticamente em novas transações de crédito
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
              {isLoading ? "Salvando..." : card ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
