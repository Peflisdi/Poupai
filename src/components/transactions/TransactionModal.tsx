"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Transaction, Category, TransactionFormData } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Select } from "@/components/ui/Select";
import { installmentService } from "@/services/installmentService";
import { useCards } from "@/hooks/useCards";
import { showToast, toastMessages } from "@/lib/toast";
import { transactionValidations, ValidationError } from "@/lib/validations";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TransactionFormData) => Promise<void>;
  transaction?: Transaction | null;
  categories: Category[];
}

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction,
  categories,
}: TransactionModalProps) {
  const { cards } = useCards();
  const [formData, setFormData] = useState<TransactionFormData>({
    type: "EXPENSE",
    description: "",
    amount: "" as string | number,
    date: new Date(),
    categoryId: "",
    paymentMethod: "PIX",
    cardId: "",
    paidBy: "",
    isReimbursed: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installments, setInstallments] = useState(2);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        description: transaction.description || "",
        amount: Number(transaction.amount),
        date: new Date(transaction.date),
        categoryId: transaction.categoryId || "",
        paymentMethod: transaction.paymentMethod,
        cardId: transaction.cardId || "",
        paidBy: transaction.paidBy || "",
        isReimbursed: transaction.isReimbursed || false,
      });
    } else {
      setFormData({
        type: "EXPENSE",
        description: "",
        amount: "",
        date: new Date(),
        categoryId: categories[0]?.id || "",
        paymentMethod: "PIX",
        cardId: "",
        paidBy: "",
        isReimbursed: false,
      });
    }
  }, [transaction, categories]);

  // Carregar método de pagamento padrão do usuário
  useEffect(() => {
    const loadDefaultPaymentMethod = async () => {
      try {
        const res = await fetch("/api/user/preferences");
        if (res.ok) {
          const data = await res.json();
          setDefaultPaymentMethod(data.defaultPaymentMethod);
        }
      } catch (error) {
        console.error("Erro ao carregar método padrão:", error);
      }
    };

    loadDefaultPaymentMethod();
  }, []);

  // Auto-selecionar método de pagamento padrão quando criar nova transação
  useEffect(() => {
    // Só aplicar se:
    // 1. Não é edição (não tem transaction)
    // 2. Tem método padrão configurado
    // 3. Modal está aberto
    if (!transaction && defaultPaymentMethod && isOpen) {
      setFormData((prev) => ({
        ...prev,
        paymentMethod: defaultPaymentMethod as TransactionFormData["paymentMethod"],
      }));
    }
  }, [transaction, defaultPaymentMethod, isOpen]);

  // Auto-selecionar cartão padrão quando método de pagamento for CREDIT
  useEffect(() => {
    // Só auto-selecionar se:
    // 1. Não é edição (não tem transaction)
    // 2. Método é CREDIT
    // 3. Não tem cartão já selecionado
    // 4. Existem cartões disponíveis
    if (
      !transaction &&
      formData.paymentMethod === "CREDIT" &&
      !formData.cardId &&
      cards.length > 0
    ) {
      const defaultCard = cards.find((card) => card.isDefault);
      if (defaultCard) {
        setFormData((prev) => ({ ...prev, cardId: defaultCard.id }));
      }
    }
  }, [formData.paymentMethod, transaction, cards, formData.cardId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar erros anteriores
    setValidationErrors([]);

    // Validar formulário
    const validation = transactionValidations.validate({
      description: formData.description || "",
      amount: Number(formData.amount),
      date: formData.date,
      categoryId: formData.categoryId,
      installments: isInstallment ? installments : undefined,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      showToast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setIsLoading(true);
    try {
      const amount = Number(formData.amount);

      // Se é parcelado e é uma despesa no crédito, criar compra parcelada
      if (isInstallment && formData.type === "EXPENSE" && formData.paymentMethod === "CREDIT") {
        await installmentService.createInstallment({
          description: formData.description || "Compra parcelada",
          totalAmount: amount,
          installments,
          startDate: formData.date.toISOString(),
          categoryId: formData.categoryId,
          cardId: formData.cardId,
          paymentMethod: formData.paymentMethod,
        });
        showToast.success(`Compra parcelada em ${installments}x criada com sucesso!`);
      } else {
        // Transação normal
        await onSave({ ...formData, amount });
        showToast.success(
          transaction ? toastMessages.transactions.updated : toastMessages.transactions.created
        );
      }
      onClose();
      // Recarregar a página para mostrar as novas transações
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar transação";

      // Se for erro de sessão inválida, mostrar mensagem específica
      if (errorMessage.includes("Sessão inválida") || errorMessage.includes("não encontrado")) {
        showToast.error("Sua sessão expirou. Por favor, faça logout e login novamente.");
      } else {
        showToast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (field: string): string | undefined => {
    const error = validationErrors.find((e) => e.field === field);
    return error?.message;
  };

  const hasError = (field: string): boolean => {
    return validationErrors.some((e) => e.field === field);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      style={{ margin: 0 }}
    >
      <div
        className="bg-white dark:bg-neutral-900 backdrop-blur-sm rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        style={{ margin: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {transaction ? "Editar Transação" : "Nova Transação"}
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
                  onClick={() => setFormData({ ...formData, type: "INCOME" })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.type === "INCOME"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
                >
                  <span className="text-sm font-semibold">Receita</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.type === "EXPENSE"
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
                >
                  <span className="text-sm font-semibold">Despesa</span>
                </button>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Descrição
              </label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Almoço, Salário, Uber..."
                required
                className={hasError("Descrição") ? "border-red-500 dark:border-red-500" : ""}
              />
              {hasError("Descrição") && (
                <p className="text-xs text-red-500 mt-1">{getErrorMessage("Descrição")}</p>
              )}
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Valor
              </label>
              <CurrencyInput
                value={formData.amount ? parseFloat(formData.amount.toString()) : 0}
                onChange={(value) => setFormData({ ...formData, amount: value.toString() })}
                placeholder="0,00"
                className={hasError("Valor") ? "border-red-500 dark:border-red-500" : ""}
              />
              {hasError("Valor") && (
                <p className="text-xs text-red-500 mt-1">{getErrorMessage("Valor")}</p>
              )}
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Data
              </label>
              <Input
                type="date"
                value={formData.date.toISOString().split("T")[0]}
                onChange={(e) => {
                  // Criar data sem conversão de timezone
                  const [year, month, day] = e.target.value.split("-");
                  const localDate = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                    12,
                    0,
                    0
                  );
                  setFormData({ ...formData, date: localDate });
                }}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                required
                className={hasError("Data") ? "border-red-500 dark:border-red-500" : ""}
              />
              {hasError("Data") && (
                <p className="text-xs text-red-500 mt-1">{getErrorMessage("Data")}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Categoria
              </label>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                className={hasError("Categoria") ? "border-red-500 dark:border-red-500" : ""}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </Select>
              {hasError("Categoria") && (
                <p className="text-xs text-red-500 mt-1">{getErrorMessage("Categoria")}</p>
              )}
            </div>

            {/* Método de Pagamento */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Método de Pagamento
              </label>
              <Select
                value={formData.paymentMethod}
                onChange={(e) => {
                  const method = e.target.value as TransactionFormData["paymentMethod"];
                  setFormData({
                    ...formData,
                    paymentMethod: method,
                    cardId: "", // Resetar cartão ao mudar método
                  });
                  // Se não for crédito, desabilitar parcelamento
                  if (method !== "CREDIT") {
                    setIsInstallment(false);
                  }
                }}
                required
              >
                <option value="PIX">PIX</option>
                <option value="CREDIT">Crédito</option>
                <option value="DEBIT">Débito</option>
                <option value="CASH">Dinheiro</option>
                <option value="TRANSFER">Transferência</option>
              </Select>
            </div>

            {/* Seleção de Cartão - Para crédito ou débito */}
            {(formData.paymentMethod === "CREDIT" || formData.paymentMethod === "DEBIT") && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Cartão (Opcional)
                </label>
                <Select
                  value={formData.cardId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cardId: e.target.value || undefined })
                  }
                >
                  <option value="">Nenhum cartão</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      💳 {card.name} {card.nickname ? `(${card.nickname})` : ""}
                    </option>
                  ))}
                </Select>
                {cards.length === 0 && (
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                    Nenhum cartão cadastrado. Vá em &quot;Cartões&quot; para adicionar.
                  </p>
                )}
              </div>
            )}

            {/* Pago por (para rastrear gastos de terceiros) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Pago por (Opcional)
              </label>
              <Input
                type="text"
                value={formData.paidBy || ""}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                placeholder="Ex: Maria, João, Mãe..."
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                💡 Registre quando outra pessoa pagar esta despesa
              </p>
            </div>

            {/* Checkbox de Reembolsado (só aparece se tiver paidBy) */}
            {formData.paidBy && formData.paidBy.trim() && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <input
                  type="checkbox"
                  id="isReimbursed"
                  checked={formData.isReimbursed || false}
                  onChange={(e) => setFormData({ ...formData, isReimbursed: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-200 dark:border-neutral-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor="isReimbursed"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer flex-1"
                >
                  ✅ Já reembolsei {formData.paidBy}
                </label>
              </div>
            )}

            {/* Parcelamento - Apenas para despesas no crédito */}
            {formData.type === "EXPENSE" && formData.paymentMethod === "CREDIT" && !transaction && (
              <div className="space-y-3">
                {/* Toggle de parcelamento */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isInstallment"
                    checked={isInstallment}
                    onChange={(e) => setIsInstallment(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-200 dark:border-neutral-800 text-accent focus:ring-2 focus:ring-accent"
                  />
                  <label
                    htmlFor="isInstallment"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    💳 Parcelar esta compra?
                  </label>
                </div>

                {/* Número de parcelas */}
                {isInstallment && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Número de Parcelas
                    </label>
                    <Select
                      value={String(installments)}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      required
                      className={hasError("Parcelas") ? "border-red-500 dark:border-red-500" : ""}
                    >
                      {Array.from({ length: 47 }, (_, i) => i + 2).map((num) => (
                        <option key={num} value={num}>
                          {num}x de R$ {((Number(formData.amount) || 0) / num).toFixed(2)}
                        </option>
                      ))}
                    </Select>
                    {hasError("Parcelas") && (
                      <p className="text-xs text-red-500 mt-1">{getErrorMessage("Parcelas")}</p>
                    )}
                    {!hasError("Parcelas") && (
                      <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                        💡 Serão criadas {installments} transações, uma para cada mês
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

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
                {isLoading ? "Salvando..." : transaction ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
