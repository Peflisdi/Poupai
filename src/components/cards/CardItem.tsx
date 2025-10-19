"use client";

import { Card } from "@/services/cardService";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Pencil, Trash2, Calendar, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";

interface CardItemProps {
  card: Card;
  currentBill: number;
  availableLimit: number;
  usagePercentage: number;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}

export function CardItem({
  card,
  currentBill,
  availableLimit,
  usagePercentage,
  onEdit,
  onDelete,
}: CardItemProps) {
  const router = useRouter();

  return (
    <div className="bg-background-secondary rounded-xl p-6 border border-border-primary hover:border-border-secondary transition-all">
      {/* Card Header com cor */}
      <div
        className="rounded-lg p-4 mb-4"
        style={{
          backgroundColor: card.color,
          background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-white" />
              <h3 className="text-lg font-bold text-white">{card.name}</h3>
            </div>
            {card.nickname && <p className="text-sm text-white/80">{card.nickname}</p>}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(card)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Editar"
            >
              <Pencil className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={() => onDelete(card.id)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Deletar"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Limite do cartão */}
        <div className="mt-4">
          <p className="text-xs text-white/60 mb-1">Limite Total</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(card.limit)}</p>
        </div>
      </div>

      {/* Informações da fatura */}
      <div className="space-y-4">
        {/* Fatura Atual */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Fatura Atual</span>
            <span
              className={`text-lg font-bold ${
                usagePercentage > 80
                  ? "text-red-600 dark:text-red-400"
                  : usagePercentage > 50
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {formatCurrency(currentBill)}
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="w-full bg-background-tertiary rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                usagePercentage > 80
                  ? "bg-red-500"
                  : usagePercentage > 50
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>

          <p className="text-xs text-text-tertiary mt-1">
            {usagePercentage.toFixed(1)}% do limite usado
          </p>
        </div>

        {/* Limite Disponível */}
        <div className="flex items-center justify-between bg-background-primary rounded-lg">
          <span className="text-sm text-text-secondary">Limite Disponível</span>
          <span className="text-base font-semibold text-text-primary">
            {formatCurrency(availableLimit)}
          </span>
        </div>

        {/* Datas importantes */}
        <div className="flex items-center gap-4 text-xs text-text-tertiary">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Fecha dia {card.closingDay}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Vence dia {card.dueDay}</span>
          </div>
        </div>

        {/* Botão Ver Fatura */}
        <button
          onClick={() => router.push(`/cards/${card.id}/bill`)}
          className="w-full mt-4 bg-black dark:bg-white py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium"
          style={{ color: "white" }}
        >
          <Receipt className="h-4 w-4 !text-white dark:!text-black" style={{ color: "inherit" }} />
          <span className="!text-white dark:!text-black" style={{ color: "inherit" }}>
            Ver Fatura Detalhada
          </span>
        </button>
      </div>
    </div>
  );
}
