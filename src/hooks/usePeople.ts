import { useState, useEffect } from "react";
import { showToast } from "@/lib/toast";
import type { Person } from "@/types";

export interface CreatePersonData {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  color?: string;
}

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPeople = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/people");
      if (!res.ok) throw new Error("Erro ao buscar pessoas");
      const data = await res.json();
      setPeople(data);
    } catch (error) {
      console.error("Erro ao buscar pessoas:", error);
      showToast.error("Erro ao carregar pessoas");
    } finally {
      setIsLoading(false);
    }
  };

  const createPerson = async (data: CreatePersonData) => {
    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao criar pessoa");
      }

      const newPerson = await res.json();
      setPeople((prev) => [...prev, newPerson].sort((a, b) => a.name.localeCompare(b.name)));
      showToast.success("Pessoa criada com sucesso!");
      return newPerson;
    } catch (error: any) {
      console.error("Erro ao criar pessoa:", error);
      showToast.error(error.message || "Erro ao criar pessoa");
      throw error;
    }
  };

  const updatePerson = async (id: string, data: CreatePersonData) => {
    try {
      const res = await fetch(`/api/people/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao atualizar pessoa");
      }

      const updatedPerson = await res.json();
      setPeople((prev) =>
        prev
          .map((p) => (p.id === id ? updatedPerson : p))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      showToast.success("Pessoa atualizada com sucesso!");
      return updatedPerson;
    } catch (error: any) {
      console.error("Erro ao atualizar pessoa:", error);
      showToast.error(error.message || "Erro ao atualizar pessoa");
      throw error;
    }
  };

  const deletePerson = async (id: string) => {
    try {
      const res = await fetch(`/api/people/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao arquivar pessoa");

      setPeople((prev) => prev.filter((p) => p.id !== id));
      showToast.success("Pessoa arquivada com sucesso!");
    } catch (error) {
      console.error("Erro ao arquivar pessoa:", error);
      showToast.error("Erro ao arquivar pessoa");
      throw error;
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  return {
    people,
    isLoading,
    createPerson,
    updatePerson,
    deletePerson,
    refetch: fetchPeople,
  };
}
