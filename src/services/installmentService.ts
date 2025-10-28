// Service for installment purchases
export interface CreateInstallmentData {
  description: string;
  totalAmount: number;
  installments: number;
  startDate: string;
  categoryId?: string;
  cardId?: string;
  paymentMethod?: string;
  paidBy?: string | null; // Adicionar paidBy
  isReimbursed?: boolean; // Adicionar isReimbursed
}

export interface InstallmentPurchase {
  id: string;
  description: string;
  totalAmount: number;
  installments: number;
  installmentAmount: number;
  startDate: string;
  paymentMethod: string;
  userId: string;
  categoryId?: string;
  cardId?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  card?: {
    id: string;
    name: string;
  };
  transactions?: any[];
}

class InstallmentService {
  async createInstallment(data: CreateInstallmentData): Promise<InstallmentPurchase> {
    const response = await fetch("/api/installments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao criar compra parcelada");
    }

    return response.json();
  }

  async getInstallments(includeTransactions = false): Promise<InstallmentPurchase[]> {
    const params = new URLSearchParams();
    if (includeTransactions) {
      params.append("includeTransactions", "true");
    }

    const response = await fetch(`/api/installments?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao buscar compras parceladas");
    }

    return response.json();
  }
}

export const installmentService = new InstallmentService();
