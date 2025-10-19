"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar transações
  const searchTransactions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Resultados da busca:", data);
        setResults(data);
      } else {
        console.error("Erro na resposta:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      searchTransactions(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchTransactions]);

  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Limpar ao fechar
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 dark:bg-black/90 p-4 pt-20 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Input de busca */}
        <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
          <Search className="h-5 w-5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Buscar por descrição, categoria ou valor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-1.5 font-mono text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Resultados */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
              Buscando...
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {results.map((transaction) => (
                <button
                  key={transaction.id}
                  onClick={() => {
                    // Navegar para a página de transações com filtro pela descrição
                    const searchQuery = transaction.description || "";
                    window.location.href = `/transactions?search=${encodeURIComponent(
                      searchQuery
                    )}`;
                    onClose();
                  }}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  {/* Ícone */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      transaction.type === "INCOME"
                        ? "bg-success/10 text-success"
                        : transaction.type === "EXPENSE"
                        ? "bg-danger/10 text-danger"
                        : "bg-info/10 text-info"
                    }`}
                  >
                    {transaction.type === "INCOME" ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : transaction.type === "EXPENSE" ? (
                      <TrendingDown className="h-5 w-5" />
                    ) : (
                      <ArrowRight className="h-5 w-5" />
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-neutral-900 dark:text-white">
                        {transaction.description || "Sem descrição"}
                      </p>
                      {transaction.category && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {transaction.category.icon} {transaction.category.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {format(new Date(transaction.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </p>
                  </div>

                  {/* Valor */}
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === "INCOME"
                          ? "text-success"
                          : transaction.type === "EXPENSE"
                          ? "text-danger"
                          : "text-text-primary"
                      }`}
                    >
                      {transaction.type === "INCOME"
                        ? "+"
                        : transaction.type === "EXPENSE"
                        ? "-"
                        : ""}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {transaction.paymentMethod === "CASH" && "Dinheiro"}
                      {transaction.paymentMethod === "DEBIT" && "Débito"}
                      {transaction.paymentMethod === "CREDIT" && "Crédito"}
                      {transaction.paymentMethod === "PIX" && "PIX"}
                      {transaction.paymentMethod === "TRANSFER" && "Transferência"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="px-4 py-8 text-center">
              <p className="text-neutral-500 dark:text-neutral-400">Nenhuma transação encontrada</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Tente buscar por descrição, categoria ou valor
              </p>
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-neutral-500 dark:text-neutral-400">
                Digite para buscar transações
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Você pode buscar por descrição, categoria ou valor
              </p>
            </div>
          )}
        </div>

        {/* Footer com dica */}
        {results.length > 0 && (
          <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-2">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {results.length}{" "}
              {results.length === 1 ? "resultado encontrado" : "resultados encontrados"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
