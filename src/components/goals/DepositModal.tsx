"use client";

import { useState } from "react";
import { X, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Goal, goalService } from "@/services/goalService";
import { formatCurrency } from "@/lib/utils";
import { showToast, toastMessages } from "@/lib/toast";

interface DepositModalProps {
  goal: Goal;
  onClose: () => void;
  onDeposit: () => void;
}

export function DepositModal({ goal, onClose, onDeposit }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const remaining = goalService.getRemainingAmount(goal.currentAmount, goal.targetAmount);
  const progress = goalService.calculateProgress(goal.currentAmount, goal.targetAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const depositAmount = Number(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError("Valor do depósito deve ser positivo");
      return;
    }

    try {
      setIsSubmitting(true);
      await goalService.addDeposit(goal.id, {
        amount,
        note: note.trim() || undefined,
      });
      showToast.success(toastMessages.goals.depositAdded);
      onDeposit();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao adicionar depósito";
      setError(errorMessage);
      showToast.error(errorMessage);
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
        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full shadow-2xl"
        style={{ margin: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${goal.color}20` }}
            >
              {goal.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold">Adicionar Depósito</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{goal.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Progress Info */}
        <div className="p-6 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Progresso Atual</span>
            <span className="text-lg font-bold">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-3 overflow-hidden mb-3">
            <div
              className="h-full transition-all"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: goal.color,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">
              {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
            </span>
            <span className="font-medium" style={{ color: goal.color }}>
              Faltam {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Valor do Depósito */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Valor do Depósito
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
                autoFocus
              />
              {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Após este depósito você terá:{" "}
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(goal.currentAmount + Number(amount))}
                  </span>
                </p>
              )}
            </div>

            {/* Nota (opcional) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Nota (opcional)
              </label>
              <Input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Economia do mês, Bônus, etc."
              />
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
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isSubmitting}
                style={{ backgroundColor: goal.color }}
              >
                {isSubmitting ? "Adicionando..." : "Adicionar Depósito"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
