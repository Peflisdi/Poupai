"use client";

import { useState, useEffect } from "react";
import { Transaction, TransactionFilters } from "@/types";
import { transactionService } from "@/services/transactionService";

export function useTransactions(filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await transactionService.getAll(filters);
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch transactions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [filters?.startDate, filters?.endDate, filters?.type, filters?.categoryId, filters?.search]);

  const createTransaction = async (data: any) => {
    try {
      const newTransaction = await transactionService.create(data);
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      throw err;
    }
  };

  const updateTransaction = async (id: string, data: any) => {
    try {
      const updated = await transactionService.update(id, data);
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionService.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionService.getAll(filters);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transactions,
    isLoading,
    error,
    refetch,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
