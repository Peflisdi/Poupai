"use client";

import { Category } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2, TrendingUp, AlertCircle } from "lucide-react";

interface CategoryCardProps {
  category: Category & { _count?: { transactions: number }; transactions?: { amount: number }[] };
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  spent?: number;
}

export function CategoryCard({ category, onEdit, onDelete, spent = 0 }: CategoryCardProps) {
  const budgetPercentage = category.budget ? Math.round((spent / category.budget) * 100) : 0;
  const isOverBudget = category.budget ? spent > category.budget : false;
  const remaining = category.budget ? category.budget - spent : 0;

  return (
    <>
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.icon}
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">{category.name}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {category._count?.transactions || 0} transações
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(category)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Editar"
            >
              <Pencil className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Deletar"
            >
              <Trash2 className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Budget Info */}
        {category.budget ? (
          <div className="space-y-3">
            {/* Values */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Gasto</span>
              <span
                className={`font-semibold ${
                  isOverBudget
                    ? "text-red-600 dark:text-red-400"
                    : "text-neutral-900 dark:text-white"
                }`}
              >
                {formatCurrency(spent)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Orçamento</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {formatCurrency(category.budget)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isOverBudget
                    ? "bg-red-500 dark:bg-red-600"
                    : budgetPercentage > 80
                    ? "bg-orange-500 dark:bg-orange-600"
                    : "bg-green-500 dark:bg-green-600"
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {budgetPercentage}% usado
              </span>
              {isOverBudget ? (
                <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  Acima do orçamento
                </span>
              ) : (
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(remaining)} restante
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Sem orçamento definido</p>
          </div>
        )}
      </div>
    </>
  );
}
