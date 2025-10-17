"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Category } from "@/types";

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
}

export function TransactionFilters({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: TransactionFiltersProps) {
  return (
    <div className="bg-background-secondary rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-text-secondary">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filtros</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input
            type="text"
            placeholder="Buscar transação..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tipo */}
        <Select value={selectedType} onChange={(e) => onTypeChange(e.target.value)}>
          <option value="">Todos os tipos</option>
          <option value="INCOME">💰 Receitas</option>
          <option value="EXPENSE">💸 Despesas</option>
          <option value="TRANSFER">🔄 Transferências</option>
        </Select>

        {/* Categoria */}
        <Select value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
