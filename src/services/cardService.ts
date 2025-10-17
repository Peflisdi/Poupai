// Service for credit/debit cards
export interface CreateCardData {
  name: string;
  nickname?: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color?: string;
}

export interface UpdateCardData extends Partial<CreateCardData> {
  id: string;
}

export interface Card {
  id: string;
  name: string;
  nickname: string | null;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  transactions?: any[];
}

class CardService {
  async getCards(includeTransactions = false): Promise<Card[]> {
    const params = new URLSearchParams();
    if (includeTransactions) {
      params.append("includeTransactions", "true");
    }

    const response = await fetch(`/api/cards?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao buscar cartões");
    }

    return response.json();
  }

  async createCard(data: CreateCardData): Promise<Card> {
    const response = await fetch("/api/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao criar cartão");
    }

    return response.json();
  }

  async updateCard(data: UpdateCardData): Promise<Card> {
    const response = await fetch("/api/cards", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao atualizar cartão");
    }

    return response.json();
  }

  async deleteCard(id: string): Promise<void> {
    const response = await fetch(`/api/cards?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao deletar cartão");
    }
  }

  // Calcular gasto atual do cartão
  calculateCurrentBill(card: Card): number {
    if (!card.transactions || card.transactions.length === 0) {
      return 0;
    }

    return card.transactions.reduce((total, transaction) => {
      if (transaction.type === "EXPENSE") {
        return total + Number(transaction.amount);
      }
      return total;
    }, 0);
  }

  // Calcular limite disponível
  calculateAvailableLimit(card: Card): number {
    const currentBill = this.calculateCurrentBill(card);
    return card.limit - currentBill;
  }

  // Calcular percentual de uso do limite
  calculateUsagePercentage(card: Card): number {
    const currentBill = this.calculateCurrentBill(card);
    return (currentBill / card.limit) * 100;
  }
}

export const cardService = new CardService();
