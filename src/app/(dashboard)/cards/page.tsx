"use client";

import { useState, useEffect } from "react";
import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardModal } from "@/components/cards/CardModal";
import { CardItem } from "@/components/cards/CardItem";
import { cardService, Card, CreateCardData, UpdateCardData } from "@/services/cardService";
import { showToast, toastMessages } from "@/lib/toast";
import { useConfirm } from "@/hooks/useConfirm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CreditCardSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";

export default function CardsPage() {
  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirm();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const data = await cardService.getCards(true); // Incluir transações para calcular fatura
      setCards(data);
    } catch (error) {
      console.error("Erro ao carregar cartões:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCard = async (data: CreateCardData | UpdateCardData) => {
    try {
      if ("id" in data) {
        // Update
        await cardService.updateCard(data);
      } else {
        // Create
        await cardService.createCard(data);
      }
      await fetchCards();
      setEditingCard(null);
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      throw error;
    }
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleDeleteCard = async (id: string) => {
    const card = cards.find((c) => c.id === id);
    const confirmed = await confirm({
      title: "Deletar Cartão",
      message: `Tem certeza que deseja deletar o cartão "${
        card?.name || "este cartão"
      }"? Todas as transações vinculadas serão mantidas, mas sem referência ao cartão.`,
      confirmText: "Deletar",
      cancelText: "Cancelar",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      await cardService.deleteCard(id);
      showToast.success(toastMessages.cards.deleted);
      await fetchCards();
    } catch (error) {
      console.error("Erro ao deletar cartão:", error);
      showToast.error(toastMessages.cards.error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-10 w-56 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-4 w-96 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="h-10 w-44 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CreditCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Meus Cartões
          </h1>
          <p className="text-text-secondary mt-1">
            Gerencie seus cartões de crédito e acompanhe suas faturas
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCard(null);
            setIsModalOpen(true);
          }}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Cartão
        </Button>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="text-center py-16 bg-background-secondary rounded-xl border border-border-primary">
          <CreditCard className="h-16 w-16 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">Nenhum cartão cadastrado</h3>
          <p className="text-text-secondary mb-6">
            Adicione seus cartões de crédito para começar a acompanhar suas faturas
          </p>
          <Button
            onClick={() => {
              setEditingCard(null);
              setIsModalOpen(true);
            }}
            variant="primary"
            className="mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeiro Cartão
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              currentBill={cardService.calculateCurrentBill(card)}
              availableLimit={cardService.calculateAvailableLimit(card)}
              usagePercentage={cardService.calculateUsagePercentage(card)}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
            />
          ))}
        </div>
      )}

      {/* Resumo Total (se houver cartões) */}
      {cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-background-secondary rounded-lg p-6 border border-border-primary">
            <p className="text-sm text-text-secondary mb-1">Limite Total</p>
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(cards.reduce((sum, card) => sum + card.limit, 0))}
            </p>
          </div>
          <div className="bg-background-secondary rounded-lg p-6 border border-border-primary">
            <p className="text-sm text-text-secondary mb-1">Fatura Total</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(
                cards.reduce((sum, card) => sum + cardService.calculateCurrentBill(card), 0)
              )}
            </p>
          </div>
          <div className="bg-background-secondary rounded-lg p-6 border border-border-primary">
            <p className="text-sm text-text-secondary mb-1">Disponível Total</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(
                cards.reduce((sum, card) => sum + cardService.calculateAvailableLimit(card), 0)
              )}
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      <CardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        card={editingCard}
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
