"use client";

import { useState, useEffect } from "react";
import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardModal } from "@/components/cards/CardModal";
import { CardItem } from "@/components/cards/CardItem";
import { cardService, Card, CreateCardData, UpdateCardData } from "@/services/cardService";

export default function CardsPage() {
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
    try {
      await cardService.deleteCard(id);
      await fetchCards();
    } catch (error) {
      console.error("Erro ao deletar cartão:", error);
      alert("Erro ao deletar cartão. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-secondary">Carregando cartões...</p>
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
              R$ {cards.reduce((sum, card) => sum + card.limit, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-background-secondary rounded-lg p-6 border border-border-primary">
            <p className="text-sm text-text-secondary mb-1">Fatura Total</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              R${" "}
              {cards
                .reduce((sum, card) => sum + cardService.calculateCurrentBill(card), 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="bg-background-secondary rounded-lg p-6 border border-border-primary">
            <p className="text-sm text-text-secondary mb-1">Disponível Total</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              R${" "}
              {cards
                .reduce((sum, card) => sum + cardService.calculateAvailableLimit(card), 0)
                .toFixed(2)}
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
    </div>
  );
}
