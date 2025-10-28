"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Palette } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { Category } from "@/types";
import { showToast, toastMessages } from "@/lib/toast";
import { createCategorySchema, type CreateCategoryInput } from "@/lib/validations/category";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  category?: Category | null;
  categories?: Category[]; // Para selecionar categoria pai
}

const CATEGORY_ICONS = [
  "🍕", "🛒", "🏠", "🚗", "⚡", "💊", "🎓", "🎮",
  "👕", "✈️", "🎬", "📱", "💰", "🎁", "🏋️", "🐕",
  "📚", "🍺", "☕", "🚕", "🏥", "💇", "🧹", "🔧",
];

const CATEGORY_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#10B981", "#14B8A6",
  "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
];

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  categories = [],
}: CategoryModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      icon: "🍕",
      color: "#3B82F6",
      budget: undefined,
      parentId: undefined,
    },
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");
  const watchedName = watch("name");
  const watchedBudget = watch("budget");

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          icon: category.icon,
          color: category.color,
          budget: category.budget || undefined,
          parentId: category.parentId || undefined,
        });
      } else {
        reset({
          name: "",
          icon: "🍕",
          color: "#3B82F6",
          budget: undefined,
          parentId: undefined,
        });
      }
    }
  }, [isOpen, category, reset]);

  const onSubmit = async (data: CreateCategoryInput) => {
    try {
      const categoryData: any = {
        name: data.name.trim(),
        icon: data.icon,
        color: data.color,
        budget: data.budget || undefined,
        parentId: data.parentId || undefined,
      };

      if (category) {
        categoryData.id = category.id;
      }

      await onSave(categoryData);
      showToast.success(
        category ? toastMessages.categories.updated : toastMessages.categories.created
      );

      onClose();
      reset();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      showToast.error(toastMessages.categories.error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  // Filtrar categorias pai (apenas principais, sem parent)
  const parentCategories = categories.filter((c) => !c.parentId && c.id !== category?.id);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {category ? "Editar Categoria" : "Nova Categoria"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Nome e Orçamento em grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <FormInput
              label="Nome da Categoria"
              {...register("name")}
              error={errors.name}
              placeholder="Ex: Alimentação"
              required
            />

            {/* Budget */}
            <FormInput
              label="Orçamento Mensal (Opcional)"
              type="number"
              step="0.01"
              {...register("budget", { 
                setValueAs: (value) => value === "" ? undefined : parseFloat(value)
              })}
              error={errors.budget}
              placeholder="0,00"
            />
          </div>

          {/* Ícone */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Ícone
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
              {CATEGORY_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue("icon", icon)}
                  className={`p-2 text-2xl rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center aspect-square ${
                    selectedIcon === icon
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
                  aria-label={`Ícone ${icon}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Cor */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              <Palette className="w-4 h-4" />
              Cor
            </label>
            <div className="grid grid-cols-8 gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={`w-full h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                    selectedColor === color
                      ? "border-neutral-900 dark:border-white ring-2 ring-offset-2 ring-neutral-900 dark:ring-white scale-105"
                      : "border-neutral-200 dark:border-neutral-700"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                  aria-label={`Cor ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Categoria Pai (Subcategoria) */}
          {parentCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Categoria Pai (Opcional)
              </label>
              <select
                {...register("parentId")}
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
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-3">
              Pré-visualização
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all"
                style={{ 
                  backgroundColor: `${selectedColor}20`, 
                  color: selectedColor 
                }}
              >
                {selectedIcon}
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {watchedName || "Nome da Categoria"}
                </p>
                {watchedBudget && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Orçamento: R$ {watchedBudget.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : category ? "Atualizar" : "Criar Categoria"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
