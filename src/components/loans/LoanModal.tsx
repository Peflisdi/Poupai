"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Select } from "@/components/ui/Select";
import { Loan, CreateLoanData } from "@/services/loanService";

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateLoanData) => Promise<void>;
  loan?: Loan | null;
}

export function LoanModal({ isOpen, onClose, onSave, loan }: LoanModalProps) {
  const [formData, setFormData] = useState<CreateLoanData>({
    type: "LENT",
    personName: "",
    description: "",
    totalAmount: 0,
    installments: 1,
    dueDate: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loan) {
      setFormData({
        type: loan.type,
        personName: loan.personName,
        description: loan.description || "",
        totalAmount: loan.totalAmount,
        installments: loan.installments,
        dueDate: loan.dueDate ? loan.dueDate.split("T")[0] : "",
        notes: loan.notes || "",
      });
    } else {
      setFormData({
        type: "LENT",
        personName: "",
        description: "",
        totalAmount: 0,
        installments: 1,
        dueDate: "",
        notes: "",
      });
    }
  }, [loan, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.personName.trim()) {
      alert("Por favor, informe o nome da pessoa");
      return;
    }

    if (formData.totalAmount <= 0) {
      alert("Por favor, informe um valor maior que zero");
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar empréstimo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      style={{ margin: 0 }}
    >
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {loan ? "Editar Empréstimo" : "Novo Empréstimo"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Tipo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "LENT" })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.type === "LENT"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                  }`}
                >
                  <span className="text-sm font-semibold">💸 Emprestei</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "BORROWED" })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.type === "BORROWED"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                  }`}
                >
                  <span className="text-sm font-semibold">💰 Peguei</span>
                </button>
              </div>
            </div>

            {/* Nome da Pessoa */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Nome da Pessoa *
              </label>
              <Input
                type="text"
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                placeholder="Ex: Maria, João..."
                required
              />
            </div>

            {/* Valor Total */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Valor Total *
              </label>
              <CurrencyInput
                value={formData.totalAmount}
                onChange={(value) => setFormData({ ...formData, totalAmount: value })}
                placeholder="0,00"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Descrição (Opcional)
              </label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Ajuda com contas, Viagem..."
              />
            </div>

            {/* Parcelas */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Número de Parcelas
              </label>
              <Select
                value={String(formData.installments)}
                onChange={(e) => setFormData({ ...formData, installments: Number(e.target.value) })}
              >
                <option value="1">1x (À vista)</option>
                {Array.from({ length: 23 }, (_, i) => i + 2).map((num) => (
                  <option key={num} value={num}>
                    {num}x parcelas
                  </option>
                ))}
              </Select>
            </div>

            {/* Data de Vencimento */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Data de Vencimento (Opcional)
              </label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              />
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Notas/Observações (Opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Anotações adicionais..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={isLoading}>
                {isLoading ? "Salvando..." : loan ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
