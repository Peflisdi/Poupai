export interface LoanPayment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  loanId: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  type: "LENT" | "BORROWED";
  personName: string;
  description?: string;
  totalAmount: number;
  paidAmount: number;
  installments: number;
  dueDate?: string;
  status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  payments: LoanPayment[];
}

export interface CreateLoanData {
  type: "LENT" | "BORROWED";
  personName: string;
  description?: string;
  totalAmount: number;
  installments?: number;
  dueDate?: string;
  notes?: string;
}

export interface UpdateLoanData extends Partial<CreateLoanData> {
  id: string;
  status?: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
}

export interface CreatePaymentData {
  amount: number;
  date?: string;
  notes?: string;
}

export const loanService = {
  // Listar empréstimos
  async getLoans(type?: "LENT" | "BORROWED", status?: string): Promise<Loan[]> {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (status) params.append("status", status);

    const queryString = params.toString();
    const url = `/api/loans${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erro ao buscar empréstimos");
    }

    return res.json();
  },

  // Criar empréstimo
  async createLoan(data: CreateLoanData): Promise<Loan> {
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erro ao criar empréstimo");
    }

    return res.json();
  },

  // Atualizar empréstimo
  async updateLoan(data: UpdateLoanData): Promise<Loan> {
    const res = await fetch("/api/loans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erro ao atualizar empréstimo");
    }

    return res.json();
  },

  // Deletar empréstimo
  async deleteLoan(id: string): Promise<void> {
    const res = await fetch(`/api/loans?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erro ao deletar empréstimo");
    }
  },

  // Adicionar pagamento
  async addPayment(loanId: string, data: CreatePaymentData): Promise<{ payment: LoanPayment; loan: Loan }> {
    const res = await fetch(`/api/loans/${loanId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erro ao adicionar pagamento");
    }

    return res.json();
  },
};
