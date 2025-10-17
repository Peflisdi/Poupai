"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Goal, CreateGoalData, goalService } from "@/services/goalService";

interface GoalModalProps {
  goal?: Goal | null;
  onClose: () => void;
  onSave: () => void;
}

const GOAL_ICONS = ["🎯", "🏠", "🚗", "✈️", "💰", "💍", "🎓", "💻", "📱", "🎮", "🏖️", "🏥"];
const GOAL_COLORS = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#84CC16",
  "#22C55E",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F43F5E",
];

export function GoalModal({ goal, onClose, onSave }: GoalModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    icon: "🎯",
    color: "#3B82F6",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        deadline: goal.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : "",
        icon: goal.icon,
        color: goal.color,
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    const targetAmount = Number(formData.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      setError("Valor alvo deve ser positivo");
      return;
    }

    try {
      setIsSubmitting(true);

      const data: CreateGoalData = {
        name: formData.name.trim(),
        targetAmount: formData.targetAmount,
        deadline: formData.deadline || undefined,
        icon: formData.icon,
        color: formData.color,
      };

      if (goal) {
        await goalService.updateGoal({ ...data, id: goal.id });
      } else {
        await goalService.createGoal(data);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar meta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 dark:bg-black/95"
      style={{ margin: 0 }}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ margin: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold">{goal ? "Editar Meta" : "Nova Meta"}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Nome da Meta
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Viagem para Europa"
                required
              />
            </div>

            {/* Valor Alvo */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Valor Alvo
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>

            {/* Prazo (opcional) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Prazo (opcional)
              </label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              />
            </div>

            {/* Ícone */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Ícone
              </label>
              <div className="grid grid-cols-6 gap-2">
                {GOAL_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`p-3 rounded-lg text-2xl transition-all ${
                      formData.icon === icon
                        ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 scale-110"
                        : "bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Cor
              </label>
              <div className="grid grid-cols-6 gap-2">
                {GOAL_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`h-10 rounded-lg transition-all ${
                      formData.color === color
                        ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: color,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : goal ? "Atualizar" : "Criar Meta"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
