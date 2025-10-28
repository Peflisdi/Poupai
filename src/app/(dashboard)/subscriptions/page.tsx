"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Calendar,
  DollarSign,
  Zap,
  Pause,
  Play,
  Trash2,
  Edit,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { SubscriptionModal } from "@/components/subscriptions/SubscriptionModal";
import { useConfirm } from "@/hooks/useConfirm";
import { formatFrequency } from "@/lib/validations/subscription";
import { formatCurrency } from "@/lib/currency";
import type { Subscription } from "@/services/subscriptionService";

export default function SubscriptionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | undefined>();
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");

  const {
    subscriptions,
    isLoading,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscription,
    generateTransactions,
    checkPendingSubscriptions,
  } = useSubscriptions();

  const {
    confirm,
    isOpen: isConfirmOpen,
    options: confirmOptions,
    onConfirm,
    onCancel,
  } = useConfirm();

  // Filtrar assinaturas
  const filteredSubscriptions = useMemo(() => {
    if (filter === "active") return subscriptions.filter((s) => s.isActive);
    if (filter === "paused") return subscriptions.filter((s) => !s.isActive);
    return subscriptions;
  }, [subscriptions, filter]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => s.isActive);
    const totalMonthly = active.reduce((sum, sub) => {
      if (sub.frequency === "MONTHLY") return sum + sub.amount;
      if (sub.frequency === "YEARLY") return sum + sub.amount / 12;
      if (sub.frequency === "WEEKLY") return sum + sub.amount * 4;
      if (sub.frequency === "CUSTOM" && sub.customDays) {
        return sum + (sub.amount * 30) / sub.customDays;
      }
      return sum;
    }, 0);

    const totalYearly = totalMonthly * 12;

    return {
      total: subscriptions.length,
      active: active.length,
      paused: subscriptions.filter((s) => !s.isActive).length,
      totalMonthly,
      totalYearly,
    };
  }, [subscriptions]);

  const handleCreateOrUpdate = async (data: any) => {
    if (selectedSubscription) {
      await updateSubscription(selectedSubscription.id, data);
    } else {
      await createSubscription(data);
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleDelete = async (subscription: Subscription) => {
    const confirmed = await confirm({
      title: "Excluir Assinatura",
      message: `Tem certeza que deseja excluir "${subscription.name}"?`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
    });

    if (confirmed) {
      await deleteSubscription(subscription.id);
    }
  };

  const handleToggle = async (subscription: Subscription) => {
    await toggleSubscription(subscription.id, subscription.isActive);
  };

  const handleGenerate = async () => {
    const confirmed = await confirm({
      title: "Gerar Transações",
      message: "Deseja gerar transações para todas as assinaturas vencidas?",
      confirmText: "Gerar",
      cancelText: "Cancelar",
    });

    if (confirmed) {
      await generateTransactions();
    }
  };

  // Calcular dias até próxima cobrança
  const getDaysUntilNext = (nextBillingDate: string) => {
    const next = new Date(nextBillingDate);
    const now = new Date();
    const diff = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Cor do badge de dias
  const getDaysBadgeColor = (days: number) => {
    if (days < 0) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (days === 0)
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    if (days <= 7)
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Assinaturas</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Gerencie suas assinaturas e gastos recorrentes
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleGenerate} className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Gerar Transações
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setSelectedSubscription(undefined);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nova Assinatura
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Ativas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.active}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Play className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Mensal</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(stats.totalMonthly)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Anual</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(stats.totalYearly)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Todas ({subscriptions.length})
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Ativas ({stats.active})
        </button>
        <button
          onClick={() => setFilter("paused")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "paused"
              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Pausadas ({stats.paused})
        </button>
      </div>

      {/* Subscriptions List */}
      {filteredSubscriptions.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-12 text-center border border-neutral-200 dark:border-neutral-700">
          <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            Nenhuma assinatura encontrada
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            {filter === "all"
              ? "Comece criando sua primeira assinatura"
              : `Nenhuma assinatura ${filter === "active" ? "ativa" : "pausada"}`}
          </p>
          {filter === "all" && (
            <Button
              variant="primary"
              onClick={() => {
                setSelectedSubscription(undefined);
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Assinatura
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map((subscription) => {
            const daysUntilNext = getDaysUntilNext(subscription.nextBillingDate);
            const nextDate = new Date(subscription.nextBillingDate);

            return (
              <div
                key={subscription.id}
                className={`bg-white dark:bg-neutral-800 rounded-xl p-6 border-2 transition-all hover:shadow-lg ${
                  subscription.isActive
                    ? "border-neutral-200 dark:border-neutral-700"
                    : "border-neutral-300 dark:border-neutral-600 opacity-60"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
                      {subscription.name}
                    </h3>
                    {subscription.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {subscription.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(subscription)}
                      className="p-2 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(subscription)}
                      className={`p-2 hover:bg-opacity-20 rounded-lg transition-colors ${
                        subscription.isActive
                          ? "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                      }`}
                      title={subscription.isActive ? "Pausar" : "Ativar"}
                    >
                      {subscription.isActive ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(subscription)}
                      className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(subscription.amount)}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatFrequency(subscription.frequency as any, subscription.customDays)}
                  </p>
                </div>

                {/* Next Billing */}
                <div className={`p-3 rounded-lg ${getDaysBadgeColor(daysUntilNext)} mb-4`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {daysUntilNext < 0
                        ? `Vencida há ${Math.abs(daysUntilNext)} dia(s)`
                        : daysUntilNext === 0
                        ? "Vence hoje"
                        : `Vence em ${daysUntilNext} dia(s)`}
                    </span>
                  </div>
                  <p className="text-xs mt-1">
                    {nextDate.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Category and Card */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {subscription.category && (
                    <span
                      className="px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${subscription.category.color}20`,
                        color: subscription.category.color,
                      }}
                    >
                      {subscription.category.icon} {subscription.category.name}
                    </span>
                  )}
                  {subscription.card && (
                    <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full">
                      💳 {subscription.card.name}
                    </span>
                  )}
                  {!subscription.autoGenerate && (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Manual
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSubscription(undefined);
        }}
        onSave={handleCreateOrUpdate}
        subscription={selectedSubscription}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={onCancel}
        onConfirm={onConfirm}
        title={confirmOptions.title}
        message={confirmOptions.message}
        confirmText={confirmOptions.confirmText}
        cancelText={confirmOptions.cancelText}
        type={confirmOptions.type}
      />
    </div>
  );
}
