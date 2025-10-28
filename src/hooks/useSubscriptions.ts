import { useState, useEffect, useCallback } from "react";
import { showToast } from "@/lib/toast";
import type { Subscription, CreateSubscriptionData } from "@/services/subscriptionService";

export function useSubscriptions(initialFilter?: boolean) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar assinaturas
  const fetchSubscriptions = useCallback(async (isActive?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (isActive !== undefined) {
        params.append("isActive", String(isActive));
      }

      const response = await fetch(`/api/subscriptions?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar assinaturas");
      }

      const data = await response.json();
      setSubscriptions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      showToast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar assinatura
  const createSubscription = useCallback(async (data: CreateSubscriptionData) => {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar assinatura");
      }

      const newSubscription = await response.json();
      setSubscriptions((prev) => [...prev, newSubscription]);
      showToast.success("Assinatura criada com sucesso!");
      return newSubscription;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      showToast.error(message);
      throw err;
    }
  }, []);

  // Atualizar assinatura
  const updateSubscription = useCallback(
    async (id: string, data: Partial<CreateSubscriptionData>) => {
      try {
        const response = await fetch(`/api/subscriptions/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao atualizar assinatura");
        }

        const updatedSubscription = await response.json();
        setSubscriptions((prev) => prev.map((sub) => (sub.id === id ? updatedSubscription : sub)));
        showToast.success("Assinatura atualizada com sucesso!");
        return updatedSubscription;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        showToast.error(message);
        throw err;
      }
    },
    []
  );

  // Excluir assinatura
  const deleteSubscription = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir assinatura");
      }

      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
      showToast.success("Assinatura excluída com sucesso!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      showToast.error(message);
      throw err;
    }
  }, []);

  // Pausar/Ativar assinatura
  const toggleSubscription = useCallback(
    async (id: string, currentStatus: boolean) => {
      try {
        const newStatus = !currentStatus;
        await updateSubscription(id, { isActive: newStatus });
        showToast.success(newStatus ? "Assinatura ativada!" : "Assinatura pausada!");
      } catch (err) {
        // Erro já tratado no updateSubscription
        throw err;
      }
    },
    [updateSubscription]
  );

  // Gerar transações pendentes
  const generateTransactions = useCallback(async () => {
    try {
      const response = await fetch("/api/subscriptions/generate", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar transações");
      }

      const result = await response.json();

      if (result.generated.length > 0) {
        showToast.success(result.message);
        // Recarregar assinaturas para atualizar nextBillingDate
        await fetchSubscriptions(initialFilter);
      } else {
        showToast.info("Nenhuma assinatura pendente de geração");
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      showToast.error(message);
      throw err;
    }
  }, [fetchSubscriptions, initialFilter]);

  // Verificar assinaturas pendentes
  const checkPendingSubscriptions = useCallback(async () => {
    try {
      const response = await fetch("/api/subscriptions/generate");

      if (!response.ok) {
        throw new Error("Erro ao verificar assinaturas pendentes");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error("Error checking pending subscriptions:", err);
      return { pending: 0, subscriptions: [] };
    }
  }, []);

  // Carregar assinaturas ao montar
  useEffect(() => {
    fetchSubscriptions(initialFilter);
  }, [fetchSubscriptions, initialFilter]);

  return {
    subscriptions,
    isLoading,
    error,
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscription,
    generateTransactions,
    checkPendingSubscriptions,
  };
}
