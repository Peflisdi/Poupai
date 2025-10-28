"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { transactionService } from "@/services/transactionService";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionModal } from "@/components/transactions/TransactionModal"; // Modal antigo para criar
import { TransactionModal as TransactionModalEdit } from "@/components/transactions/TransactionModalNew"; // Modal novo para editar
import { Transaction, TransactionFormData } from "@/types";
import { showToast, toastMessages } from "@/lib/toast";
import { useConfirm } from "@/hooks/useConfirm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSearchParams } from "next/navigation";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";

function TransactionsContent() {
  const searchParams = useSearchParams();
  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirm();
  const { transactions, isLoading, refetch } = useTransactions();
  const { categories } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");

  // Aplicar filtro da URL quando a página carregar
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearchTerm(searchQuery);
      // Limpar o parâmetro da URL após aplicar o filtro
      window.history.replaceState({}, "", "/transactions");
    }
  }, [searchParams]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all"); // "all", "recent", ou "YYYY-MM"

  // Mês atual como valor padrão (formato YYYY-MM)
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const [monthInput, setMonthInput] = useState(currentMonth);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Gerar lista de meses disponíveis
  const availableMonths = useMemo(() => {
    if (!transactions) return [];

    const monthsSet = new Set<string>();
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthsSet.add(monthKey);
    });

    return Array.from(monthsSet).sort().reverse(); // Mais recentes primeiro
  }, [transactions]);

  // Função para aplicar filtro de mês customizado
  const handleCustomMonthFilter = () => {
    if (monthInput) {
      setSelectedMonth(monthInput);
      setCurrentPage(1);
    }
  };

  // Função para resetar filtro de mês
  const handleResetMonthFilter = () => {
    setSelectedMonth("all");
    setMonthInput("");
    setCurrentPage(1);
  };

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    return (
      transactions?.filter((transaction) => {
        const matchesSearch = transaction.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesType = !selectedType || transaction.type === selectedType;
        const matchesCategory = !selectedCategory || transaction.categoryId === selectedCategory;

        // Filtro de mês
        let matchesMonth = true;
        if (selectedMonth !== "all") {
          const transactionDate = new Date(transaction.date);

          if (selectedMonth === "recent") {
            // Últimos 30 dias
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            matchesMonth = transactionDate >= thirtyDaysAgo;
          } else {
            // Mês específico (formato: YYYY-MM)
            const [year, month] = selectedMonth.split("-").map(Number);
            matchesMonth =
              transactionDate.getFullYear() === year && transactionDate.getMonth() + 1 === month;
          }
        }

        return matchesSearch && matchesType && matchesCategory && matchesMonth;
      }) || []
    );
  }, [transactions, searchTerm, selectedType, selectedCategory, selectedMonth]);

  // Paginar transações
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (data: TransactionFormData) => {
    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, data);
      } else {
        await transactionService.create(data);
      }
      refetch();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert("Erro ao salvar transação. Tente novamente.");
    }
  };

  const handleSaveAfterEdit = async () => {
    // Callback do modal de edição (novo)
    await refetch();
  };

  const handleDeleteTransaction = async (id: string) => {
    const transaction = transactions.find((t) => t.id === id);

    // Verificar se é uma compra parcelada
    const isInstallment = transaction?.installmentPurchaseId != null;
    const installmentCount = transaction?.installmentPurchase?.installments || 1;

    let confirmMessage = `Tem certeza que deseja deletar a transação "${
      transaction?.description || "sem descrição"
    }"? Esta ação não pode ser desfeita.`;

    // Se é parcela, avisar que TODAS serão deletadas
    if (isInstallment) {
      confirmMessage = `⚠️ Esta é uma compra parcelada!\n\nVocê está prestes a deletar TODAS as ${installmentCount} parcelas de "${
        transaction?.description || "sem descrição"
      }".\n\nEsta ação não pode ser desfeita. Deseja continuar?`;
    }

    const confirmed = await confirm({
      title: isInstallment ? "Deletar Todas as Parcelas" : "Deletar Transação",
      message: confirmMessage,
      confirmText: "Deletar",
      cancelText: "Cancelar",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      if (isInstallment && transaction?.installmentPurchaseId) {
        // Deletar TODAS as transações do grupo de parcelas
        const response = await fetch(`/api/installments/${transaction.installmentPurchaseId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erro ao deletar parcelas");
        }

        showToast.success(`${installmentCount} parcelas deletadas com sucesso!`);
      } else {
        // Deletar apenas esta transação
        await transactionService.delete(id);
        showToast.success(toastMessages.transactions.deleted);
      }

      refetch();
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
      showToast.error(toastMessages.transactions.error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                {[1, 2, 3, 4, 5].map((i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Transações</h1>
          <p className="mt-1 text-text-secondary">Gerencie todas as suas transações financeiras</p>
        </div>
        <Button variant="primary" onClick={handleOpenModal} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nova Transação
        </Button>
      </div>

      {/* Filtros */}
      <div className="space-y-4">
        <TransactionFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories || []}
        />

        {/* Filtro de Mês */}
        <div className="bg-background-secondary rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-text-secondary" />
            <span className="text-sm font-medium text-text-secondary">Filtrar por Período</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opções rápidas */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-text-secondary">Opções rápidas:</span>
              <button
                onClick={() => {
                  setSelectedMonth("all");
                  setCurrentPage(1);
                }}
                className={`w-full p-2 text-sm rounded-lg transition-colors ${
                  selectedMonth === "all"
                    ? "bg-primary text-primary border border-primary"
                    : "bg-background-primary text-secondary hover:bg-hover"
                }`}
              >
                📅 Todas as transações
              </button>
              <button
                onClick={() => {
                  setSelectedMonth("recent");
                  setCurrentPage(1);
                }}
                className={`w-full p-2 text-sm rounded-lg transition-colors ${
                  selectedMonth === "recent"
                    ? "bg-primary text-primary border border-primary"
                    : "bg-background-primary text-secondary hover:bg-hover"
                }`}
              >
                🕐 Últimos 30 dias
              </button>
            </div>

            {/* Input personalizado */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-text-secondary">Mês específico:</span>
              <div className="space-y-2">
                <input
                  type="month"
                  value={monthInput}
                  onChange={(e) => setMonthInput(e.target.value)}
                  onClick={(e) => {
                    // Abre o calendário ao clicar
                    e.currentTarget.showPicker?.();
                  }}
                  className="w-full px-3 py-2 bg-primary border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] text-primary text-sm cursor-pointer"
                />
                <div className="flex gap-1">
                  <Button
                    onClick={handleCustomMonthFilter}
                    disabled={!monthInput}
                    className="flex-1 text-xs py-1.5"
                    variant="primary"
                  >
                    Aplicar
                  </Button>
                  <Button
                    onClick={handleResetMonthFilter}
                    className="flex-1 text-xs py-1.5"
                    variant="secondary"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background-secondary rounded-lg p-4">
          <p className="text-sm text-text-tertiary">Total de Transações</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{filteredTransactions.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Receitas</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
            {filteredTransactions.filter((t) => t.type === "INCOME").length}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">Despesas</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
            {filteredTransactions.filter((t) => t.type === "EXPENSE").length}
          </p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-background-primary rounded-lg border border-border-primary overflow-hidden">
        <TransactionTable
          transactions={paginatedTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-text-tertiary">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
            {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de{" "}
            {filteredTransactions.length} transações
          </p>

          {/* Seletor de itens por página */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-tertiary whitespace-nowrap">Itens por página:</span>
            <Select
              value={String(itemsPerPage)}
              onChange={(e) => {
                const newItemsPerPage = Number(e.target.value);
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1); // Reset para primeira página
              }}
              className="min-w-[80px]"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm text-text-secondary">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modais */}
      {/* Modal para CRIAR (antigo - com parcelamento) */}
      {!editingTransaction && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTransaction}
          transaction={null}
          categories={categories || []}
        />
      )}

      {/* Modal para EDITAR (novo - com checkbox de parcelas) */}
      {editingTransaction && (
        <TransactionModalEdit
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAfterEdit}
          transaction={editingTransaction}
          categories={categories || []}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isOpen}
        onClose={onCancel}
        onConfirm={onConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        type={options.type}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <StatCardSkeleton />
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}
