"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalModal } from "@/components/goals/GoalModal";
import { DepositModal } from "@/components/goals/DepositModal";
import { Goal } from "@/services/goalService";

export default function GoalsPage() {
  const { goals, isLoading, error, refetch } = useGoals();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<Goal | undefined>();

  // Calculate statistics
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const handleCreateGoal = () => {
    setEditingGoal(undefined);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleCloseGoalModal = () => {
    setIsGoalModalOpen(false);
    setEditingGoal(undefined);
  };

  const handleOpenDepositModal = (goal: Goal) => {
    setSelectedGoalForDeposit(goal);
    setIsDepositModalOpen(true);
  };

  const handleCloseDepositModal = () => {
    setIsDepositModalOpen(false);
    setSelectedGoalForDeposit(undefined);
  };

  const handleGoalSaved = () => {
    refetch();
    handleCloseGoalModal();
  };

  const handleDepositAdded = () => {
    refetch();
    handleCloseDepositModal();
  };

  const handleGoalDeleted = (id: string) => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Metas Financeiras</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Metas Financeiras</h1>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
          Erro ao carregar metas: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Metas Financeiras</h1>
        <button
          onClick={handleCreateGoal}
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Nova Meta
        </button>
      </div>

      {/* Statistics */}
      {totalGoals > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Total de Metas</div>
            <div className="text-2xl font-bold mt-1">{totalGoals}</div>
          </div>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Metas Concluídas</div>
            <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
              {completedGoals}
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Economizado</div>
            <div className="text-2xl font-bold mt-1">
              R$ {totalSaved.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Taxa de Conclusão</div>
            <div className="text-2xl font-bold mt-1">{completionRate}%</div>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {totalGoals === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-xl font-bold mb-2">Nenhuma meta cadastrada</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Comece criando sua primeira meta financeira e acompanhe seu progresso.
          </p>
          <button
            onClick={handleCreateGoal}
            className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Criar Primeira Meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleGoalDeleted}
              onDeposit={handleOpenDepositModal}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {isGoalModalOpen && (
        <GoalModal goal={editingGoal} onClose={handleCloseGoalModal} onSave={handleGoalSaved} />
      )}

      {isDepositModalOpen && selectedGoalForDeposit && (
        <DepositModal
          goal={selectedGoalForDeposit}
          onClose={handleCloseDepositModal}
          onDeposit={handleDepositAdded}
        />
      )}
    </div>
  );
}
