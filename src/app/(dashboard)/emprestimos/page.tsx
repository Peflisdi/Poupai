"use client";

import { useState } from "react";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoanModal } from "@/components/loans/LoanModal";
import { PaymentModal } from "@/components/loans/PaymentModal";
import { useLoans } from "@/hooks/useLoans";
import { usePeople } from "@/hooks/usePeople";
import { loanService, Loan, CreateLoanData, CreatePaymentData } from "@/services/loanService";
import { showToast } from "@/lib/toast";

export default function LoansPage() {
  const [activeTab, setActiveTab] = useState<"LENT" | "BORROWED">("LENT");
  const { loans, isLoading, refetch } = useLoans(activeTab);
  const { people } = usePeople();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<Loan | null>(null);

  // Helper function to get person color
  const getPersonColor = (personName: string) => {
    const person = people.find((p) => p.name === personName);
    return person?.color || "#8B5CF6";
  };

  const handleCreateLoan = async (data: CreateLoanData) => {
    try {
      await loanService.createLoan(data);
      showToast.success("Empréstimo criado com sucesso!");
      refetch();
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Erro ao criar empréstimo");
    }
  };

  const handleAddPayment = async (data: CreatePaymentData) => {
    if (!selectedLoanForPayment) return;

    try {
      await loanService.addPayment(selectedLoanForPayment.id, data);
      showToast.success("Pagamento adicionado com sucesso!");
      refetch();
      setSelectedLoanForPayment(null);
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Erro ao adicionar pagamento");
    }
  };

  const handleDeleteLoan = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este empréstimo?")) return;

    try {
      await loanService.deleteLoan(id);
      showToast.success("Empréstimo excluído com sucesso!");
      refetch();
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Erro ao excluir empréstimo");
    }
  };

  const getStatusBadge = (loan: Loan) => {
    const statusConfig = {
      PENDING: {
        label: "Pendente",
        color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
        icon: Clock,
      },
      PARTIAL: {
        label: "Parcial",
        color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
        icon: Clock,
      },
      PAID: {
        label: "Pago",
        color: "text-green-600 bg-green-50 dark:bg-green-900/20",
        icon: CheckCircle,
      },
      OVERDUE: {
        label: "Atrasado",
        color: "text-red-600 bg-red-50 dark:bg-red-900/20",
        icon: AlertCircle,
      },
    };

    const config = statusConfig[loan.status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const calculateSummary = () => {
    const lent = loans.filter((l) => l.type === "LENT");
    const borrowed = loans.filter((l) => l.type === "BORROWED");

    return {
      lent: {
        total: lent.reduce((sum, l) => sum + l.totalAmount, 0),
        pending: lent.reduce((sum, l) => sum + (l.totalAmount - l.paidAmount), 0),
        count: lent.length,
      },
      borrowed: {
        total: borrowed.reduce((sum, l) => sum + l.totalAmount, 0),
        pending: borrowed.reduce((sum, l) => sum + (l.totalAmount - l.paidAmount), 0),
        count: borrowed.length,
      },
    };
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">💰 Empréstimos</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Gerencie empréstimos feitos e recebidos
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emprestei */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              {summary.lent.count} {summary.lent.count === 1 ? "empréstimo" : "empréstimos"}
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Emprestei</h3>
          <p className="text-3xl font-bold mb-2">
            R${" "}
            {summary.lent.total.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-sm opacity-75">
            Pendente: R${" "}
            {summary.lent.pending.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Peguei Emprestado */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
              <ArrowDownRight className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              {summary.borrowed.count} {summary.borrowed.count === 1 ? "empréstimo" : "empréstimos"}
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Peguei Emprestado</h3>
          <p className="text-3xl font-bold mb-2">
            R${" "}
            {summary.borrowed.total.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-sm opacity-75">
            Pendente: R${" "}
            {summary.borrowed.pending.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab("LENT")}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === "LENT"
                ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            💸 Emprestei ({summary.lent.count})
          </button>
          <button
            onClick={() => setActiveTab("BORROWED")}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === "BORROWED"
                ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            💰 Peguei ({summary.borrowed.count})
          </button>
        </div>

        {/* Action Button */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <Button
            onClick={() => {
              setSelectedLoan(null);
              setIsModalOpen(true);
            }}
            variant="primary"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Empréstimo
          </Button>
        </div>

        {/* Loans List */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
              Carregando...
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-700" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Nenhum empréstimo ainda
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {activeTab === "LENT"
                  ? "Registre quando emprestar dinheiro para alguém"
                  : "Registre quando pegar dinheiro emprestado"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => {
                const remainingAmount = loan.totalAmount - loan.paidAmount;
                const progressPercentage = (loan.paidAmount / loan.totalAmount) * 100;

                return (
                  <div
                    key={loan.id}
                    className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                            style={{
                              backgroundColor: getPersonColor(loan.personName),
                            }}
                          >
                            {loan.personName.charAt(0).toUpperCase()}
                          </div>
                          <h3 className="font-semibold text-neutral-900 dark:text-white">
                            {loan.personName}
                          </h3>
                          {getStatusBadge(loan)}
                        </div>
                        {loan.description && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            {loan.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                          <span>
                            Total: R${" "}
                            {loan.totalAmount.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          <span>
                            Pago: R${" "}
                            {loan.paidAmount.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          <span>
                            Restante: R${" "}
                            {remainingAmount.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            loan.status === "PAID"
                              ? "bg-green-500"
                              : loan.status === "OVERDUE"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {loan.status !== "PAID" && (
                        <Button
                          onClick={() => {
                            setSelectedLoanForPayment(loan);
                            setIsPaymentModalOpen(true);
                          }}
                          variant="primary"
                          className="flex-1 text-sm"
                        >
                          <Wallet className="h-4 w-4 mr-2" />
                          Adicionar Pagamento
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteLoan(loan.id)}
                        variant="secondary"
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Excluir
                      </Button>
                    </div>

                    {/* Payments History */}
                    {loan.payments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                          Histórico de Pagamentos
                        </h4>
                        <div className="space-y-2">
                          {loan.payments.map((payment) => (
                            <div
                              key={payment.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-neutral-600 dark:text-neutral-400">
                                {new Date(payment.date).toLocaleDateString("pt-BR")}
                              </span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                R${" "}
                                {payment.amount.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <LoanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLoan(null);
        }}
        onSave={handleCreateLoan}
        loan={selectedLoan}
      />

      {selectedLoanForPayment && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedLoanForPayment(null);
          }}
          onSave={handleAddPayment}
          loan={selectedLoanForPayment}
        />
      )}
    </div>
  );
}
