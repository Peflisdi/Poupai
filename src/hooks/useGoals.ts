import { useState, useEffect, useCallback } from "react";
import { Goal, goalService } from "@/services/goalService";

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await goalService.getGoals();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar metas");
      console.error("Erro ao buscar metas:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    isLoading,
    error,
    refetch: fetchGoals,
  };
}
