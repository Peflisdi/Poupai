"use client";

import { Goal, goalService } from "@/services/goalService";
import { formatCurrency } from "@/lib/utils";
import {
  Pencil,
  Trash2,
  Plus,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onDeposit: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit, onDelete, onDeposit }: GoalCardProps) {
  const progress = goalService.calculateProgress(goal.currentAmount, goal.targetAmount);
  const remaining = goalService.getRemainingAmount(goal.currentAmount, goal.targetAmount);
  const daysRemaining = goalService.getDaysRemaining(goal.deadline);
  const isCompleted = goalService.isCompleted(goal.currentAmount, goal.targetAmount);
  const isOverdue = goalService.isOverdue(goal.deadline);

  const formatDeadline = () => {
    if (!goal.deadline) return null;
    const date = new Date(goal.deadline);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="bg-background-secondary rounded-xl p-6 border border-border-primary hover:border-border-secondary transition-all">
      {/* Header com ícone e ações */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            {goal.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">{goal.name}</h3>
            {goal.deadline && (
              <div className="flex items-center gap-1 text-sm text-text-secondary mt-0.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDeadline()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onEdit(goal)}
            className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
            title="Editar"
          >
            <Pencil className="h-4 w-4 text-text-secondary" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
            title="Deletar"
          >
            <Trash2 className="h-4 w-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Valores */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-text-secondary">Economizado</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-text-primary">
              {formatCurrency(goal.currentAmount)}
            </span>
            <span className="text-sm text-text-secondary ml-2">
              de {formatCurrency(goal.targetAmount)}
            </span>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="relative w-full bg-background-tertiary rounded-full h-3 overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: goal.color,
            }}
          />
          {isCompleted && (
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-white drop-shadow-md" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="font-semibold" style={{ color: goal.color }}>
            {progress.toFixed(1)}% concluído
          </span>
          {!isCompleted && (
            <span className="text-text-tertiary">Faltam {formatCurrency(remaining)}</span>
          )}
        </div>
      </div>

      {/* Status e prazo */}
      {!isCompleted && daysRemaining !== null && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            isOverdue
              ? "bg-red-500/10 border border-red-500/20"
              : daysRemaining <= 30
              ? "bg-yellow-500/10 border border-yellow-500/20"
              : "bg-blue-500/10 border border-blue-500/20"
          }`}
        >
          <AlertCircle
            className={`h-4 w-4 ${
              isOverdue
                ? "text-red-600 dark:text-red-400"
                : daysRemaining <= 30
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-blue-600 dark:text-blue-400"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              isOverdue
                ? "text-red-600 dark:text-red-400"
                : daysRemaining <= 30
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-blue-600 dark:text-blue-400"
            }`}
          >
            {isOverdue
              ? "Prazo vencido!"
              : `${daysRemaining} ${daysRemaining === 1 ? "dia restante" : "dias restantes"}`}
          </span>
        </div>
      )}

      {/* Status de conclusão */}
      {isCompleted && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            Meta concluída! 🎉
          </span>
        </div>
      )}

      {/* Depósitos recentes */}
      {goal.deposits && goal.deposits.length > 0 && (
        <div className="mb-4 p-3 bg-background-primary rounded-lg">
          <div className="flex items-center gap-1 text-xs text-text-secondary mb-2">
            <TrendingUp className="h-3 w-3" />
            <span>Último depósito</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-primary">{goal.deposits[0].note || "Depósito"}</span>
            <span className="text-sm font-semibold" style={{ color: goal.color }}>
              +{formatCurrency(goal.deposits[0].amount)}
            </span>
          </div>
          <span className="text-xs text-text-tertiary">
            {new Date(goal.deposits[0].createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>
      )}

      {/* Botão de adicionar depósito */}
      <button
        onClick={() => onDeposit(goal)}
        disabled={isCompleted}
        className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isCompleted ? "#666" : goal.color,
          color: "white",
        }}
      >
        <Plus className="h-4 w-4" />
        {isCompleted ? "Meta Concluída" : "Adicionar Depósito"}
      </button>
    </div>
  );
}
