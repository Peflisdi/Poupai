"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, DollarSign, AlertCircle, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/lib/toast";
import { formatCurrency } from "@/lib/utils";

interface PersonReport {
  personName: string;
  total: number;
  totalPending: number;
  totalReimbursed: number;
  transactionCount: number;
  transactions: any[];
}

interface ReportSummary {
  totalPeople: number;
  totalAmount: number;
  totalPending: number;
  totalReimbursed: number;
}

interface ReportData {
  report: PersonReport[];
  summary: ReportSummary;
}

export default function ReportsByPersonPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (onlyPending) params.append("onlyPending", "true");

      const res = await fetch(`/api/reports/by-person?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao buscar relatório");

      const data = await res.json();
      setReportData(data);
    } catch (error) {
      showToast.error("Erro ao carregar relatório");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAsReimbursed = async (personName: string) => {
    if (!confirm(`Marcar todas as transações de ${personName} como reembolsadas?`)) return;

    try {
      // Aqui você pode criar uma API para marcar todas como reembolsadas de uma vez
      showToast.success("Funcionalidade em desenvolvimento!");
    } catch (error) {
      showToast.error("Erro ao marcar como reembolsado");
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const csv = [
      ["Pessoa", "Total", "Pendente", "Reembolsado", "Transações"].join(","),
      ...reportData.report.map((person) =>
        [
          person.personName,
          person.total.toFixed(2),
          person.totalPending.toFixed(2),
          person.totalReimbursed.toFixed(2),
          person.transactionCount,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-por-pessoa-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3 mb-4" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          👥 Gastos por Pessoa
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Acompanhe transações pagas por outras pessoas
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Data Início
            </label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Data Fim
            </label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <input
                type="checkbox"
                checked={onlyPending}
                onChange={(e) => setOnlyPending(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-200 dark:border-neutral-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Apenas pendentes
              </span>
            </label>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={fetchReport} variant="primary" className="flex-1">
              Filtrar
            </Button>
            <Button onClick={exportToCSV} variant="secondary">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Pessoas
            </span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {reportData.summary.totalPeople}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Total Geral
            </span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {formatCurrency(reportData.summary.totalAmount)}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Pendente
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(reportData.summary.totalPending)}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Reembolsado
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(reportData.summary.totalReimbursed)}
          </p>
        </div>
      </div>

      {/* People List */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Detalhamento por Pessoa
          </h2>
        </div>

        {reportData.report.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-700" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Nenhuma transação encontrada
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Use o campo &quot;Pago por&quot; nas transações para rastrear gastos de outras pessoas
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {reportData.report.map((person) => (
              <div key={person.personName} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                      {person.personName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                      <span>{person.transactionCount} transações</span>
                      <span>•</span>
                      <span>Total: {formatCurrency(person.total)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {person.totalPending > 0 && (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20">
                        Deve: {formatCurrency(person.totalPending)}
                      </span>
                    )}
                    {person.totalReimbursed > 0 && (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-900/20">
                        Pago: {formatCurrency(person.totalReimbursed)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${(person.totalReimbursed / person.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Transactions Toggle */}
                <button
                  onClick={() =>
                    setExpandedPerson(
                      expandedPerson === person.personName ? null : person.personName
                    )
                  }
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {expandedPerson === person.personName ? "Ocultar" : "Ver"} transações
                </button>

                {/* Transactions List */}
                {expandedPerson === person.personName && (
                  <div className="mt-4 space-y-2 pl-4 border-l-2 border-neutral-200 dark:border-neutral-800">
                    {person.transactions.map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {new Date(transaction.date).toLocaleDateString("pt-BR")}
                            {transaction.category &&
                              ` • ${transaction.category.icon} ${transaction.category.name}`}
                            {transaction.card && ` • 💳 ${transaction.card.name}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {formatCurrency(transaction.amount)}
                          </span>
                          {transaction.isReimbursed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
