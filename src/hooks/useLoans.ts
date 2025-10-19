import { useState, useEffect, useCallback } from "react";
import { loanService, Loan } from "@/services/loanService";

export function useLoans(type?: "LENT" | "BORROWED", status?: string) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await loanService.getLoans(type, status);
      setLoans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar empréstimos");
      console.error("Erro ao buscar empréstimos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [type, status]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  return {
    loans,
    isLoading,
    error,
    refetch: fetchLoans,
  };
}
