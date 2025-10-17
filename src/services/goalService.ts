// ===== GOALS (Metas/Objetivos) =====
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
  icon: string;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deposits?: GoalDeposit[];
}

export interface GoalDeposit {
  id: string;
  amount: number;
  note: string | null;
  goalId: string;
  createdAt: Date;
}

export interface CreateGoalData {
  name: string;
  targetAmount: number | string;
  deadline?: string;
  icon?: string;
  color?: string;
}

export interface UpdateGoalData extends CreateGoalData {
  id: string;
}

export interface AddDepositData {
  amount: number | string;
  note?: string;
}

// Service functions
export const goalService = {
  async getGoals(): Promise<Goal[]> {
    const response = await fetch("/api/goals");
    if (!response.ok) throw new Error("Erro ao buscar metas");
    return response.json();
  },

  async createGoal(data: CreateGoalData): Promise<Goal> {
    const response = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar meta");
    return response.json();
  },

  async updateGoal(data: UpdateGoalData): Promise<Goal> {
    const response = await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar meta");
    return response.json();
  },

  async deleteGoal(id: string): Promise<void> {
    const response = await fetch(`/api/goals?id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao deletar meta");
  },

  async addDeposit(goalId: string, data: AddDepositData): Promise<Goal> {
    const response = await fetch(`/api/goals/${goalId}/deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao adicionar depósito");
    return response.json();
  },

  // Utility functions
  calculateProgress(currentAmount: number, targetAmount: number): number {
    if (targetAmount <= 0) return 0;
    return Math.min((currentAmount / targetAmount) * 100, 100);
  },

  getRemainingAmount(currentAmount: number, targetAmount: number): number {
    return Math.max(targetAmount - currentAmount, 0);
  },

  getDaysRemaining(deadline: Date | null): number | null {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  isOverdue(deadline: Date | null): boolean {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  },

  isCompleted(currentAmount: number, targetAmount: number): boolean {
    return currentAmount >= targetAmount;
  },
};
