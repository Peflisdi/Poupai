"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Loan, CreatePaymentData } from "@/services/loanService";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePaymentData) => Promise<void>;
  loan: Loan;
}

export function PaymentModal({ isOpen, onClose, onSave, loan }: PaymentModalProps) {
  const remainingAmount = loan.totalAmount - loan.paidAmount;

  const [formData, setFormData] = useState<CreatePaymentData>({
    amount: remainingAmount,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.amount <= 0) {
      alert("Por favor, informe um valor maior que zero");
      return;
    }

    if (formData.amount > remainingAmount) {
      alert(`O valor não pode ser maior que o valor restante (R$ ${remainingAmount.toFixed(2)})`);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Erro ao adicionar pagamento:", error);
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
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Adicionar Pagamento
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {loan.personName} • Restante: R${" "}
              {remainingAmount.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
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
            {/* Valor do Pagamento */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Valor do Pagamento *
              </label>
              <CurrencyInput
                value={formData.amount}
                onChange={(value) => setFormData({ ...formData, amount: value })}
                placeholder="0,00"
              />
              {formData.amount > 0 && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {formData.amount >= remainingAmount
                    ? "✅ Pagamento completo"
                    : `⏳ Restará: R$ ${(remainingAmount - formData.amount).toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}`}
                </p>
              )}
            </div>

            {/* Data do Pagamento */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Data do Pagamento
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                required
              />
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Observações (Opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Anotações sobre este pagamento..."
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
                {isLoading ? "Salvando..." : "Adicionar Pagamento"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
