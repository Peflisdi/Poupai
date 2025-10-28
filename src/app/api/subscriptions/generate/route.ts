import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subscriptionService } from "@/services/subscriptionService";
import { prisma as db } from "@/lib/db";
import { calculateNextBillingDate } from "@/lib/validations/subscription";
import { handlePrismaError } from "@/lib/prismaErrorHandler";

/**
 * POST /api/subscriptions/generate
 * Gerar transações automaticamente para assinaturas vencidas
 *
 * Esta rota verifica todas as assinaturas ativas com autoGenerate=true
 * cuja nextBillingDate já passou, cria as transações correspondentes
 * e atualiza a nextBillingDate
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar assinaturas que precisam gerar transação
    const subscriptions = await subscriptionService.getSubscriptionsDueForGeneration();

    const generated = [];
    const errors = [];

    for (const subscription of subscriptions) {
      try {
        // Criar transação
        const transaction = await db.transaction.create({
          data: {
            type: "EXPENSE", // Assinaturas são sempre despesas
            amount: subscription.amount,
            description: `${subscription.name} - Assinatura`,
            date: new Date(subscription.nextBillingDate),
            paymentMethod: subscription.paymentMethod as any,
            categoryId: subscription.categoryId,
            cardId: subscription.cardId,
            userId: subscription.userId,
            isRecurring: true, // Marcar como recorrente
            recurringPeriod: subscription.frequency,
          },
        });

        // Calcular próxima data de cobrança
        const newNextBillingDate = calculateNextBillingDate(
          new Date(subscription.nextBillingDate),
          subscription.frequency as any,
          subscription.customDays
        );

        // Atualizar assinatura com nova data de cobrança
        await db.subscription.update({
          where: {
            id: subscription.id,
          },
          data: {
            nextBillingDate: newNextBillingDate,
          },
        });

        generated.push({
          subscriptionId: subscription.id,
          subscriptionName: subscription.name,
          transactionId: transaction.id,
          amount: transaction.amount,
          oldBillingDate: subscription.nextBillingDate,
          newBillingDate: newNextBillingDate.toISOString(),
        });
      } catch (error) {
        console.error(`Error generating transaction for subscription ${subscription.id}:`, error);
        errors.push({
          subscriptionId: subscription.id,
          subscriptionName: subscription.name,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${generated.length} transação(ões) gerada(s) com sucesso`,
      generated,
      errors: errors.length > 0 ? errors : undefined,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Error generating subscription transactions:", error);
    const errorMessage = handlePrismaError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * GET /api/subscriptions/generate
 * Verificar quantas assinaturas estão pendentes de geração
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const subscriptions = await subscriptionService.getSubscriptionsDueForGeneration();

    return NextResponse.json({
      pending: subscriptions.length,
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        name: sub.name,
        amount: sub.amount,
        nextBillingDate: sub.nextBillingDate,
      })),
    });
  } catch (error) {
    console.error("Error checking pending subscriptions:", error);
    const errorMessage = handlePrismaError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
