import { Transaction, TransactionFilters, TransactionFormData, PaginatedResponse } from "@/types";

export const transactionService = {
  // GET all transactions with filters
  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append("startDate", filters.startDate.toISOString());
    if (filters?.endDate) params.append("endDate", filters.endDate.toISOString());
    if (filters?.categoryId) params.append("categoryId", filters.categoryId);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.paymentMethod) params.append("paymentMethod", filters.paymentMethod);
    if (filters?.search) params.append("search", filters.search);

    const response = await fetch(`/api/transactions?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch transactions");

    const data = await response.json();
    return data;
  },

  // GET single transaction
  async getById(id: string): Promise<Transaction> {
    const response = await fetch(`/api/transactions/${id}`);
    if (!response.ok) throw new Error("Failed to fetch transaction");

    const data = await response.json();
    return data;
  },

  // POST create transaction
  async create(data: TransactionFormData): Promise<Transaction> {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create transaction");
    }

    const result = await response.json();
    return result;
  },

  // PUT update transaction
  async update(id: string, data: Partial<TransactionFormData>): Promise<Transaction> {
    const response = await fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update transaction");
    }

    const result = await response.json();
    return result;
  },

  // DELETE transaction
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete transaction");
    }
  },

  // GET summary (for dashboard)
  async getSummary(month?: Date): Promise<{
    totalExpenses: number;
    totalIncome: number;
    balance: number;
  }> {
    const params = new URLSearchParams();
    if (month) params.append("month", month.toISOString());

    const response = await fetch(`/api/transactions/summary?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch summary");

    const data = await response.json();
    return data;
  },
};
