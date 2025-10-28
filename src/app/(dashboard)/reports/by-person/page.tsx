"use client";

import { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Download,
  Receipt,
  FileText,
  Settings,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/lib/toast";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { generateAllPeopleExpensesPDF } from "@/utils/pdfGenerator";
import { usePeople } from "@/hooks/usePeople";
import PersonModal from "@/components/people/PersonModal";
import type { Person } from "@/types";

interface PersonReport {
  personName: string;
  personColor?: string;
  personEmail?: string | null;
  personPhone?: string | null;
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
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);

  // People management states
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | undefined>(undefined);
  const [showPeopleManager, setShowPeopleManager] = useState(false);
  const {
    people,
    isLoading: isPeopleLoading,
    createPerson,
    updatePerson,
    deletePerson,
  } = usePeople();

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

  // Person management handlers
  const handleOpenPersonModal = (person?: Person) => {
    setSelectedPerson(person);
    setIsPersonModalOpen(true);
  };

  const handleClosePersonModal = () => {
    setIsPersonModalOpen(false);
    setSelectedPerson(undefined);
  };

  const handleSavePerson = async (personData: {
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
    color?: string;
  }) => {
    try {
      if (selectedPerson) {
        await updatePerson(selectedPerson.id, personData);
      } else {
        await createPerson(personData);
      }
      handleClosePersonModal();
    } catch (error) {
      console.error("Error saving person:", error);
    }
  };

  const handleDeletePerson = async (personId: string) => {
    if (!confirm("Tem certeza que deseja arquivar esta pessoa?")) return;
    try {
      await deletePerson(personId);
    } catch (error) {
      console.error("Error deleting person:", error);
    }
  };

  const handleMarkAsReimbursed = async (personName: string) => {
    if (!confirm(`Marcar todas as transações de ${personName} como reembolsadas?`)) return;

    try {
      showToast.loading("Atualizando transações...");

      const res = await fetch("/api/reports/by-person/mark-reimbursed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personName }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar");

      const data = await res.json();
      showToast.success(data.message || "Transações marcadas como reembolsadas!");

      // Recarregar o relatório
      await fetchReport();
    } catch (error) {
      showToast.error("Erro ao marcar como reembolsado");
      console.error(error);
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

  const handleExportAllPDF = async () => {
    if (!reportData || reportData.report.length === 0) {
      showToast.warning("Nenhum dado para exportar");
      return;
    }

    try {
      showToast.loading("Gerando PDF...");

      // Para cada pessoa, buscar os detalhes completos com categorias
      const peopleDetails = await Promise.all(
        reportData.report.map(async (person) => {
          try {
            const res = await fetch(
              `/api/reports/by-person/detail?personName=${encodeURIComponent(person.personName)}`
            );
            if (!res.ok) throw new Error("Erro ao buscar detalhes");
            return await res.json();
          } catch (error) {
            console.error(`Erro ao buscar dados de ${person.personName}:`, error);
            return null;
          }
        })
      );

      const validDetails = peopleDetails.filter(Boolean);

      if (validDetails.length === 0) {
        showToast.error("Erro ao buscar dados para exportação");
        return;
      }

      generateAllPeopleExpensesPDF(validDetails);
      showToast.success("PDF consolidado gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      showToast.error("Erro ao gerar PDF. Tente novamente.");
    }
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
            <Button
              onClick={() => setShowPeopleManager(!showPeopleManager)}
              variant="secondary"
              title="Gerenciar Pessoas"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleExportAllPDF}
              variant="secondary"
              title="Exportar PDF Consolidado"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button onClick={exportToCSV} variant="secondary" title="Exportar CSV">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportData.report.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-700" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Nenhuma transação encontrada
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Use o campo &quot;Pago por&quot; nas transações para rastrear gastos de outras pessoas
            </p>
          </div>
        ) : (
          reportData.report.map((person) => (
            <div
              key={person.personName}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                      style={{
                        backgroundColor: person.personColor || "#8B5CF6",
                      }}
                    >
                      {person.personName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {person.personName}
                      </h3>
                      {(person.personEmail || person.personPhone) && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {person.personEmail && `📧 ${person.personEmail}`}
                          {person.personEmail && person.personPhone && " • "}
                          {person.personPhone && `📱 ${person.personPhone}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-13">
                    {person.transactionCount} transação{person.transactionCount !== 1 ? "ões" : ""}
                  </p>
                </div>
              </div>

              {/* Valores */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Total</span>
                  <span className="text-xl font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(person.total)}
                  </span>
                </div>

                {person.totalPending > 0 && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      Pendente
                    </span>
                    <span className="text-base font-semibold text-orange-600 dark:text-orange-400">
                      {formatCurrency(person.totalPending)}
                    </span>
                  </div>
                )}

                {person.totalReimbursed > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Reembolsado
                    </span>
                    <span className="text-base font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(person.totalReimbursed)}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                  <span>Progresso de Reembolso</span>
                  <span>{((person.totalReimbursed / person.total) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                    style={{
                      width: `${(person.totalReimbursed / person.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Botão Ver Detalhes */}
              <button
                onClick={() =>
                  router.push(`/reports/by-person/${encodeURIComponent(person.personName)}`)
                }
                className="w-full mt-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2"
              >
                <Receipt className="h-4 w-4" />
                <span>Ver Detalhes</span>
              </button>

              {/* Botão de Preview Rápido */}
              <button
                onClick={() =>
                  setExpandedPerson(expandedPerson === person.personName ? null : person.personName)
                }
                className="w-full mt-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white py-2 px-4 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors font-medium text-sm"
              >
                {expandedPerson === person.personName ? "Ocultar Preview" : "Ver Preview Rápido"}
              </button>

              {/* Lista de Transações Expandida - Preview */}
              {expandedPerson === person.personName && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                    Preview (últimas 3 transações):
                  </h4>
                  {person.transactions.slice(0, 3).map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-neutral-900 dark:text-white truncate">
                            {transaction.description}
                          </p>
                          {transaction.isReimbursed ? (
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {new Date(transaction.date).toLocaleDateString("pt-BR")}
                          {transaction.category &&
                            ` • ${transaction.category.icon} ${transaction.category.name}`}
                          {transaction.card && ` • 💳 ${transaction.card.name}`}
                        </p>
                      </div>
                      <span className="font-semibold text-neutral-900 dark:text-white ml-3">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  ))}
                  {person.transactions.length > 3 && (
                    <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 pt-2">
                      +{person.transactions.length - 3} transações. Clique em &quot;Ver
                      Detalhes&quot; para ver todas
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* People Manager Panel */}
      {showPeopleManager && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciar Pessoas
            </h2>
            <Button onClick={() => handleOpenPersonModal()} variant="primary" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Nova Pessoa
            </Button>
          </div>

          {isPeopleLoading ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              Carregando pessoas...
            </div>
          ) : people.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              Nenhuma pessoa cadastrada. Clique em &quot;Nova Pessoa&quot; para adicionar.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: person.color }}
                      />
                      <h3 className="font-medium text-neutral-900 dark:text-white">
                        {person.name}
                      </h3>
                    </div>
                  </div>

                  {(person.email || person.phone) && (
                    <div className="space-y-1 mb-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {person.email && <p>📧 {person.email}</p>}
                      {person.phone && <p>📱 {person.phone}</p>}
                    </div>
                  )}

                  {person.notes && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2">
                      {person.notes}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOpenPersonModal(person)}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                    >
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeletePerson(person.id)}
                      variant="danger"
                      size="sm"
                      className="flex-1"
                    >
                      Arquivar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Person Modal */}
      <PersonModal
        isOpen={isPersonModalOpen}
        onClose={handleClosePersonModal}
        onSave={handleSavePerson}
        person={selectedPerson}
      />
    </div>
  );
}
