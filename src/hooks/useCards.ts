import { useState, useEffect, useCallback } from "react";
import { cardService, Card } from "@/services/cardService";

export function useCards(includeTransactions = false) {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await cardService.getCards(includeTransactions);
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cartões");
      console.error("Erro ao buscar cartões:", err);
    } finally {
      setIsLoading(false);
    }
  }, [includeTransactions]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return {
    cards,
    isLoading,
    error,
    refetch: fetchCards,
  };
}
