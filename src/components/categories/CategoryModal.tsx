"use client";

import { useState } from "react";
import { X, Palette } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Category } from "@/types";
import { showToast, toastMessages } from "@/lib/toast";
import { categoryValidations, ValidationError } from "@/lib/validations";
import { formatCurrency, parseCurrency } from "@/lib/currency";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  category?: Category | null;
  categories?: Category[]; // Para selecionar categoria pai
}

const CATEGORY_ICONS = [
  "🍕",
  "🛒",
  "🏠",
  "🚗",
  "⚡",
  "💊",
  "🎓",
  "🎮",
  "👕",
  "✈️",
  "🎬",
  "📱",
  "💰",
  "🎁",
  "🏋️",
  "🐕",
  "📚",
  "🍺",
  "☕",
  "🚕",
  "🏥",
  "💇",
  "🧹",
  "🔧",
];

const CATEGORY_COLORS = [
  "#EF4444", // red
  "#F97316", // orange
  "#F59E0B", // amber
  "#EAB308", // yellow
  "#84CC16", // lime
  "#22C55E", // green
  "#10B981", // emerald
  "#14B8A6", // teal
  "#06B6D4", // cyan
  "#0EA5E9", // sky
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#8B5CF6", // violet
  "#A855F7", // purple
  "#D946EF", // fuchsia
  "#EC4899", // pink
];

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  categories = [],
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    icon: category?.icon || "🍕",
    color: category?.color || "#3B82F6",
    budget: category?.budget?.toString() || "",
    parentId: category?.parentId || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar erros anteriores
    setValidationErrors([]);

    // Validar formulário
    const validation = categoryValidations.validate({
      name: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
      budget: formData.budget ? parseCurrency(formData.budget) : undefined,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      showToast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setIsLoading(true);
    try {
      const data: any = {
        name: formData.name.trim(),
        icon: formData.icon,
        color: formData.color,
        budget: formData.budget ? parseCurrency(formData.budget) : undefined,
        parentId: formData.parentId || undefined,
      };

      if (category) {
        data.id = category.id;
      }

      await onSave(data);
      showToast.success(
        category ? toastMessages.categories.updated : toastMessages.categories.created
      );
      onClose();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      showToast.error(toastMessages.categories.error);
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

  // Filtrar categorias pai (apenas principais, sem parent)
  const parentCategories = categories.filter((c) => !c.parentId && c.id !== category?.id);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 dark:bg-black/95"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ margin: 0 }}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ margin: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {category ? "Editar Categoria" : "Nova Categoria"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Nome da Categoria *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Alimentação"
              required
              className={hasError("Nome") ? "border-red-500 dark:border-red-500" : ""}
            />
            {hasError("Nome") && (
              <p className="text-xs text-red-500 mt-1">{getErrorMessage("Nome")}</p>
            )}
          </div>

          {/* Ícone */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Ícone
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {CATEGORY_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center ${
                    formData.icon === icon
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Cor */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Palette className="w-4 h-4" />
              Cor
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-full h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                    formData.color === color
                      ? "border-neutral-900 dark:border-white ring-2 ring-offset-2 ring-neutral-900 dark:ring-white"
                      : "border-neutral-200 dark:border-neutral-700"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Orçamento Mensal (Opcional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
                R$
              </span>
              <Input
                type="text"
                value={formData.budget}
                onChange={(e) => {
                  const value = e.target.value;
                  // Remove tudo exceto números, vírgula e ponto
                  const cleaned = value.replace(/[^\d,.]/g, "");
                  setFormData({ ...formData, budget: cleaned });
                }}
                onBlur={(e) => {
                  // Formata ao sair do campo
                  const value = e.target.value;
                  if (value) {
                    const number = parseCurrency(value);
                    setFormData({ ...formData, budget: number.toFixed(2).replace(".", ",") });
                  }
                }}
                placeholder="0,00"
                className={`pl-10 ${hasError("Orçamento") ? "border-red-500 dark:border-red-500" : ""}`}
              />
            </div>
            {hasError("Orçamento") ? (
              <p className="text-xs text-red-500 mt-1">{getErrorMessage("Orçamento")}</p>
            ) : (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Define um limite de gastos mensais para esta categoria
              </p>
            )}
          </div>

          {/* Categoria Pai (Subcategoria) */}
          {parentCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Categoria Pai (Opcional)
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Categoria Principal</option>
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Transforme esta categoria em uma subcategoria
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              Pré-visualização
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${formData.color}20`, color: formData.color }}
              >
                {formData.icon}
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {formData.name || "Nome da Categoria"}
                </p>
                {formData.budget && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Orçamento: {formatCurrency(parseCurrency(formData.budget))}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Salvando..." : category ? "Atualizar" : "Criar Categoria"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
