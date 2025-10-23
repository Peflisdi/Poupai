"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Layers, TrendingUp, AlertTriangle } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { categoryService } from "@/services/categoryService";
import { CategoryModal } from "@/components/categories/CategoryModal";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { Category } from "@/types";
import { showToast, toastMessages } from "@/lib/toast";
import { formatCurrency } from "@/lib/utils";
import { useConfirm } from "@/hooks/useConfirm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatCardSkeleton, CategoryCardSkeleton } from "@/components/ui/Skeleton";

export default function CategoriesPage() {
  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirm();
  const { categories, isLoading, refetch } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categorySpending, setCategorySpending] = useState<Record<string, number>>({});
  const [isLoadingSpending, setIsLoadingSpending] = useState(true);

  // Buscar gastos por categoria
  useEffect(() => {
    const fetchSpending = async () => {
      try {
        setIsLoadingSpending(true);
        const response = await fetch("/api/categories/spending");
        if (response.ok) {
          const data = await response.json();
          setCategorySpending(data);
        }
      } catch (error) {
        console.error("Erro ao buscar gastos por categoria:", error);
      } finally {
        setIsLoadingSpending(false);
      }
    };

    fetchSpending();
  }, [categories]); // Re-buscar quando categorias mudarem

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (data: any) => {
    try {
      if (data.id) {
        // Update
        await categoryService.update(data.id, data);
      } else {
        // Create
        await categoryService.create(data);
      }
      await refetch();
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      throw error;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const category = categories?.find((c) => c.id === id);
    const transactionCount = (category as any)?._count?.transactions || 0;

    const confirmed = await confirm({
      title: "Deletar Categoria",
      message:
        transactionCount > 0
          ? `A categoria "${
              category?.name || "esta categoria"
            }" possui ${transactionCount} transação(ões) vinculada(s). Ao deletar, essas transações ficarão sem categoria. Deseja continuar?`
          : `Tem certeza que deseja deletar a categoria "${category?.name || "esta categoria"}"?`,
      confirmText: "Deletar",
      cancelText: "Cancelar",
      type: transactionCount > 0 ? "warning" : "danger",
    });

    if (!confirmed) return;

    try {
      await categoryService.delete(id);
      showToast.success(toastMessages.categories.deleted);
      await refetch();
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      showToast.error(toastMessages.categories.error);
    }
  };

  // Separar categorias principais e subcategorias
  const mainCategories = categories?.filter((c) => !c.parentId) || [];
  const subcategories = categories?.filter((c) => c.parentId) || [];

  // Calcular estatísticas
  const totalCategories = mainCategories.length;
  const categoriesWithBudget = mainCategories.filter((c) => c.budget).length;
  const totalBudget = mainCategories.reduce((sum, c) => sum + (c.budget || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-4 w-80 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="h-10 w-44 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Categories Grid Skeleton */}
        <div>
          <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Categorias</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Organize e controle seus gastos por categoria
          </p>
        </div>
        <button
          onClick={handleCreateCategory}
          className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <Plus className="w-5 h-5" />
          Nova Categoria
        </button>
      </div>

      {/* Statistics */}
      {mainCategories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Total de Categorias
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {totalCategories}
                </p>
              </div>
            </div>
            {subcategories.length > 0 && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                + {subcategories.length} subcategoria(s)
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Com Orçamento</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {categoriesWithBudget}
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              de {totalCategories} categorias
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Orçamento Total</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">por mês</p>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {mainCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              spent={categorySpending[category.id] || 0}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-neutral-400 dark:text-neutral-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Nenhuma categoria cadastrada
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
            Crie sua primeira categoria para começar a organizar e controlar seus gastos
          </p>
          <button
            onClick={handleCreateCategory}
            className="inline-flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            <Plus className="w-5 h-5" />
            Criar Primeira Categoria
          </button>
        </div>
      )}

      {/* Subcategories Section */}
      {subcategories.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Subcategorias
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subcategories.map((category) => {
              const parent = categories?.find((c) => c.id === category.parentId);
              return (
                <div key={category.id} className="relative">
                  {parent && (
                    <div className="absolute -top-2 left-4 bg-white dark:bg-neutral-900 px-2 py-0.5 text-xs text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded">
                      Subcategoria de: {parent.icon} {parent.name}
                    </div>
                  )}
                  <CategoryCard
                    category={category}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                    spent={categorySpending[category.id] || 0}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
        categories={categories || []}
      />

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
