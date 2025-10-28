// ===== USER & AUTH =====
export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  currency: string;
  firstDayOfMonth: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== PEOPLE =====
export interface Person {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  color: string;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== CATEGORIES =====
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget: number | null;
  isDefault: boolean;
  userId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  subcategories?: Category[];
  parent?: Category;
}

// ===== TRANSACTIONS =====
export type TransactionType = "EXPENSE" | "INCOME" | "TRANSFER";
export type PaymentMethod = "CASH" | "DEBIT" | "CREDIT" | "PIX" | "TRANSFER";
export type RecurringPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  date: Date;
  paymentMethod: PaymentMethod;
  isRecurring: boolean;
  recurringPeriod: RecurringPeriod | null;
  receiptUrl: string | null;
  tags: string[];
  paidBy: string | null; // Nome da pessoa que pagou
  isReimbursed: boolean; // Se já foi reembolsado
  userId: string;
  categoryId: string | null;
  cardId: string | null;
  installmentPurchaseId: string | null;
  installmentNumber: number | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  card?: Card;
  installmentPurchase?: InstallmentPurchase;
}

// ===== CARDS =====
export interface Card {
  id: string;
  name: string;
  nickname: string | null;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  // Campos opcionais calculados pelo backend
  transactions?: Transaction[];
  currentBill?: number; // Fatura do período atual (sem parcelas)
  totalCommitted?: number; // Total comprometido (incluindo parcelas futuras)
  availableLimit?: number; // Limite disponível real
  usagePercentage?: number; // Percentual de uso do limite
}

// ===== GOALS =====
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
  icon: string;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deposits?: GoalDeposit[];
}

export interface GoalDeposit {
  id: string;
  amount: number;
  note: string | null;
  goalId: string;
  createdAt: Date;
}

// ===== INSTALLMENT PURCHASES =====
export interface InstallmentPurchase {
  id: string;
  description: string;
  totalAmount: number;
  installments: number;
  installmentAmount: number;
  startDate: Date;
  paymentMethod: string;
  userId: string;
  cardId: string | null;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  card?: Card;
  category?: Category;
  transactions?: Transaction[];
}

// ===== DASHBOARD SUMMARY =====
export interface DashboardSummary {
  currentBalance: number;
  monthExpenses: number;
  monthIncome: number;
  budgetPercentage: number;
  expensesByCategory: {
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    amount: number;
    percentage: number;
  }[];
  recentTransactions: Transaction[];
  alerts: {
    type: "card" | "category" | "goal";
    severity: "low" | "medium" | "high";
    message: string;
    icon: string;
  }[];
}

// ===== FILTERS =====
export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  search?: string;
}

// ===== FORM DATA =====
export interface TransactionFormData {
  type: TransactionType;
  amount: number | string;
  description?: string;
  date: Date;
  paymentMethod: PaymentMethod;
  categoryId?: string;
  cardId?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringPeriod?: RecurringPeriod;
  paidBy?: string; // Nome da pessoa que pagou
  isReimbursed?: boolean; // Se já foi reembolsado
}

export interface CategoryFormData {
  name: string;
  icon: string;
  color?: string;
  budget?: number;
  parentId?: string;
}

export interface CardFormData {
  name: string;
  nickname?: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color?: string;
}

export interface GoalFormData {
  name: string;
  targetAmount: number;
  deadline?: Date;
  icon: string;
  color?: string;
}

// ===== API RESPONSES =====
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
