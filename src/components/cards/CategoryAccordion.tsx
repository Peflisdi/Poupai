"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: string;
  description: string | null;
  amount: number;
  date: Date | string;
}

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget: number;
  spent: number;
  percentage: number;
  budgetPercentage: number;
  transactions: Transaction[];
}

interface CategoryAccordionProps {
  categories: CategoryData[];
}

export function CategoryAccordion({ categories }: CategoryAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  if (categories.length === 0) {
    return (
      <div className="bg-background-secondary rounded-xl p-6 border border-border-primary">
        <p className="text-text-secondary text-center py-8">Nenhum gasto neste período</p>
      </div>
    );
  }

  return (
    <div className="bg-background-secondary rounded-xl p-6 border border-border-primary">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Detalhamento por Categoria</h3>

      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-background-primary rounded-lg border border-border-primary overflow-hidden"
          >
            {/* Header do Accordion */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-background-tertiary transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{category.icon}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-text-primary">{category.name}</span>
                    <span className="font-bold text-text-primary">
                      {formatCurrency(category.spent)}
                      {category.budget > 0 && (
                        <span className="text-sm text-text-secondary font-normal ml-1">
                          / {formatCurrency(category.budget)}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Barra de progresso */}
                  {category.budget > 0 && (
                    <div className="space-y-1">
                      <div className="w-full bg-background-tertiary rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            category.budgetPercentage > 100
                              ? "bg-red-500"
                              : category.budgetPercentage > 80
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(category.budgetPercentage, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-text-tertiary">
                        {category.budgetPercentage.toFixed(1)}% do orçamento usado
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ícone de expansão */}
              <ChevronDown
                className={`h-5 w-5 text-text-secondary transition-transform ml-3 ${
                  expandedId === category.id ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Conteúdo expandido - Lista de transações */}
            {expandedId === category.id && (
              <div className="border-t border-border-primary bg-background-secondary">
                {category.transactions.length === 0 ? (
                  <p className="text-text-secondary text-center py-4 text-sm">
                    Nenhuma transação nesta categoria
                  </p>
                ) : (
                  <div className="divide-y divide-border-primary">
                    {category.transactions.map((transaction) => (
                      <div key={transaction.id} className="p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">
                            {transaction.description || "Sem descrição"}
                          </p>
                          <p className="text-xs text-text-tertiary mt-0.5">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-text-primary">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
