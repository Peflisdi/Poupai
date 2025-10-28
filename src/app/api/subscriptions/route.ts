import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subscriptionService } from "@/services/subscriptionService";
import { subscriptionSchema } from "@/lib/validations/subscription";
import { handlePrismaError } from "@/lib/prismaErrorHandler";

/**
 * GET /api/subscriptions
 * Listar todas as assinaturas do usuário
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get("isActive");
    const isActive = isActiveParam ? isActiveParam === "true" : undefined;

    const subscriptions = await subscriptionService.getSubscriptions(session.user.id, isActive);

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    const errorMessage = handlePrismaError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/subscriptions
 * Criar nova assinatura
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Converter strings de data para Date objects
    const dataWithDates = {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      nextBillingDate: body.nextBillingDate ? new Date(body.nextBillingDate) : undefined,
    };

    // Validar com Zod
    const validatedData = subscriptionSchema.parse(dataWithDates);

    const subscription = await subscriptionService.createSubscription(session.user.id, {
      ...validatedData,
      description: validatedData.description ?? undefined,
      customDays: validatedData.customDays ?? undefined,
      categoryId: validatedData.categoryId ?? undefined,
      cardId: validatedData.cardId ?? undefined,
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error: any) {
    console.error("Error creating subscription:", error);

    // Erro de validação Zod
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    const errorMessage = handlePrismaError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
