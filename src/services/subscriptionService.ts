import { prisma as db } from "@/lib/db";
import {
  calculateNextBillingDate,
  SubscriptionFrequencyType,
} from "@/lib/validations/subscription";

export interface Subscription {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  frequency: string;
  customDays: number | null;
  startDate: string;
  nextBillingDate: string;
  categoryId: string | null;
  cardId: string | null;
  paymentMethod: string;
  isActive: boolean;
  autoGenerate: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
  card?: {
    id: string;
    name: string;
    nickname: string | null;
  } | null;
}

export interface CreateSubscriptionData {
  name: string;
  description?: string;
  amount: number;
  frequency: SubscriptionFrequencyType;
  customDays?: number;
  startDate: Date;
  nextBillingDate?: Date;
  categoryId?: string;
  cardId?: string;
  paymentMethod?: string;
  isActive?: boolean;
  autoGenerate?: boolean;
}

export interface UpdateSubscriptionData extends Partial<CreateSubscriptionData> {
  id: string;
}

export const subscriptionService = {
  /**
   * Listar assinaturas do usuário
   */
  async getSubscriptions(userId: string, isActive?: boolean): Promise<Subscription[]> {
    const subscriptions = await db.subscription.findMany({
      where: {
        userId,
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        card: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        nextBillingDate: "asc",
      },
    });

    return subscriptions.map((sub) => ({
      ...sub,
      startDate: sub.startDate.toISOString(),
      nextBillingDate: sub.nextBillingDate.toISOString(),
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
    }));
  },

  /**
   * Buscar assinatura por ID
   */
  async getSubscriptionById(id: string, userId: string): Promise<Subscription | null> {
    const subscription = await db.subscription.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        card: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
    });

    if (!subscription) return null;

    return {
      ...subscription,
      startDate: subscription.startDate.toISOString(),
      nextBillingDate: subscription.nextBillingDate.toISOString(),
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  },

  /**
   * Criar nova assinatura
   */
  async createSubscription(userId: string, data: CreateSubscriptionData): Promise<Subscription> {
    // Se nextBillingDate não foi fornecida, calcular automaticamente
    const nextBillingDate =
      data.nextBillingDate ||
      calculateNextBillingDate(data.startDate, data.frequency, data.customDays);

    const subscription = await db.subscription.create({
      data: {
        name: data.name,
        description: data.description || null,
        amount: data.amount,
        frequency: data.frequency,
        customDays: data.customDays || null,
        startDate: data.startDate,
        nextBillingDate,
        categoryId: data.categoryId || null,
        cardId: data.cardId || null,
        paymentMethod: data.paymentMethod || "PIX",
        isActive: data.isActive ?? true,
        autoGenerate: data.autoGenerate ?? true,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        card: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
    });

    return {
      ...subscription,
      startDate: subscription.startDate.toISOString(),
      nextBillingDate: subscription.nextBillingDate.toISOString(),
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  },

  /**
   * Atualizar assinatura
   */
  async updateSubscription(data: UpdateSubscriptionData, userId: string): Promise<Subscription> {
    const { id, ...updateData } = data;

    const subscription = await db.subscription.update({
      where: {
        id,
        userId,
      },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.amount && { amount: updateData.amount }),
        ...(updateData.frequency && { frequency: updateData.frequency }),
        ...(updateData.customDays !== undefined && { customDays: updateData.customDays }),
        ...(updateData.startDate && { startDate: updateData.startDate }),
        ...(updateData.nextBillingDate && { nextBillingDate: updateData.nextBillingDate }),
        ...(updateData.categoryId !== undefined && { categoryId: updateData.categoryId }),
        ...(updateData.cardId !== undefined && { cardId: updateData.cardId }),
        ...(updateData.paymentMethod && { paymentMethod: updateData.paymentMethod }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
        ...(updateData.autoGenerate !== undefined && { autoGenerate: updateData.autoGenerate }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        card: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
    });

    return {
      ...subscription,
      startDate: subscription.startDate.toISOString(),
      nextBillingDate: subscription.nextBillingDate.toISOString(),
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  },

  /**
   * Excluir assinatura
   */
  async deleteSubscription(id: string, userId: string): Promise<void> {
    await db.subscription.delete({
      where: {
        id,
        userId,
      },
    });
  },

  /**
   * Pausar/Ativar assinatura
   */
  async toggleSubscription(id: string, userId: string): Promise<Subscription> {
    const subscription = await db.subscription.findFirst({
      where: { id, userId },
    });

    if (!subscription) {
      throw new Error("Assinatura não encontrada");
    }

    return this.updateSubscription(
      {
        id,
        isActive: !subscription.isActive,
      },
      userId
    );
  },

  /**
   * Buscar assinaturas que precisam gerar transação
   */
  async getSubscriptionsDueForGeneration(): Promise<Subscription[]> {
    const now = new Date();

    const subscriptions = await db.subscription.findMany({
      where: {
        isActive: true,
        autoGenerate: true,
        nextBillingDate: {
          lte: now,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        card: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
    });

    return subscriptions.map((sub) => ({
      ...sub,
      startDate: sub.startDate.toISOString(),
      nextBillingDate: sub.nextBillingDate.toISOString(),
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
    }));
  },
};
