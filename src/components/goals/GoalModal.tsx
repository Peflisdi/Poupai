"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { Goal, goalService } from "@/services/goalService";
import { showToast, toastMessages } from "@/lib/toast";
import { createGoalSchema, type CreateGoalInput } from "@/lib/validations/goal";

interface GoalModalProps {
  goal?: Goal | null;
  onClose: () => void;
  onSave: () => void;
}

const GOAL_ICONS = ["🎯", "🏠", "🚗", "✈️", "💰", "💍", "🎓", "💻", "📱", "🎮", "🏖️", "🏥"];
const GOAL_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#84CC16",
  "#22C55E", "#14B8A6", "#06B6D4", "#3B82F6",
  "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E",
];

export function GoalModal({ goal, onClose, onSave }: GoalModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: undefined,
      icon: "🎯",
      color: "#10B981",
    },
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");
  const watchedName = watch("name");
  const watchedTargetAmount = watch("targetAmount");
  const watchedCurrentAmount = watch("currentAmount");

  // Calcular progresso
  const progress = watchedTargetAmount > 0 
    ? Math.min((watchedCurrentAmount || 0) / watchedTargetAmount * 100, 100)
    : 0;

  // Reset form when modal opens/closes or goal changes
  useEffect(() => {
    if (goal) {
      reset({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount || 0,
        deadline: goal.deadline ? new Date(goal.deadline) : undefined,
        icon: goal.icon,
        color: goal.color,
      });
    } else {
      reset({
        name: "",
        targetAmount: 0,
        currentAmount: 0,
        deadline: undefined,
        icon: "🎯",
        color: "#10B981",
      });
    }
  }, [goal, reset]);

  const onSubmit = async (data: CreateGoalInput) => {
    try {
      const goalData = {
        name: data.name.trim(),
        targetAmount: data.targetAmount.toString(),
        deadline: data.deadline ? new Date(data.deadline).toISOString().split("T")[0] : undefined,
        icon: data.icon,
        color: data.color,
      };

      if (goal) {
        await goalService.updateGoal({ ...goalData, id: goal.id });
        showToast.success(toastMessages.goals.updated);
      } else {
        await goalService.createGoal(goalData);
        showToast.success(toastMessages.goals.created);
      }

      onSave();
      onClose();
      reset();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : toastMessages.goals.error;
      showToast.error(errorMessage);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {goal ? "Editar Meta" : "Nova Meta"}
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
          {/* Grid 2 colunas - Nome e Valor Alvo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <FormInput
              label="Nome da Meta"
              {...register("name")}
              error={errors.name}
              placeholder="Ex: Viagem para Europa"
              required
            />

            {/* Valor Alvo */}
            <FormInput
              label="Valor Alvo"
              type="number"
              step="0.01"
              min="0"
              {...register("targetAmount", { valueAsNumber: true })}
              error={errors.targetAmount}
              placeholder="0,00"
              required
            />
          </div>

          {/* Prazo */}
          <FormInput
            label="Prazo (opcional)"
            type="date"
            {...register("deadline", {
              setValueAs: (value) => value ? new Date(value + "T12:00:00") : undefined,
            })}
            error={errors.deadline}
          />

          {/* Ícone */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Ícone
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
              {GOAL_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue("icon", icon)}
                  className={`p-2 rounded-lg text-2xl transition-all hover:scale-110 flex items-center justify-center aspect-square ${
                    selectedIcon === icon
                      ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 scale-105"
                      : "bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700"
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
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Cor
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
              {GOAL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={`h-10 rounded-lg transition-all hover:scale-110 ${
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 scale-105"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                  aria-label={`Cor ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Preview da Meta */}
          <div className="p-5 rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Pré-visualização
              </p>
            </div>
            
            <div className="flex items-start gap-4">
              {/* Ícone */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0 transition-all"
                style={{ 
                  backgroundColor: `${selectedColor}20`, 
                  color: selectedColor 
                }}
              >
                {selectedIcon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1 truncate">
                  {watchedName || "Nome da Meta"}
                </h3>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    R$ {(watchedCurrentAmount || 0).toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-500">
                    de R$ {watchedTargetAmount.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: selectedColor
                    }}
                  />
                </div>
                
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {progress.toFixed(1)}% concluído
                </p>
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
              {isSubmitting ? "Salvando..." : goal ? "Atualizar" : "Criar Meta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
