import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subscriptionService } from "@/services/subscriptionService";
import { updateSubscriptionSchema } from "@/lib/validations/subscription";
import { handlePrismaError } from "@/lib/prismaErrorHandler";

/**
 * GET /api/subscriptions/[id]
 * Buscar assinatura por ID
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const subscription = await subscriptionService.getSubscriptionById(params.id, session.user.id);

    if (!subscription) {
      return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    const errorMessage = handlePrismaError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * PUT /api/subscriptions/[id]
 * Atualizar assinatura
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Converter strings de data para Date objects (se fornecidas)
    const dataWithDates = {
      id: params.id,
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      nextBillingDate: body.nextBillingDate ? new Date(body.nextBillingDate) : undefined,
    };

    // Validar com Zod
    const validatedData = updateSubscriptionSchema.parse(dataWithDates);

    const subscription = await subscriptionService.updateSubscription(
      {
        ...validatedData,
        description: validatedData.description ?? undefined,
        customDays: validatedData.customDays ?? undefined,
        categoryId: validatedData.categoryId ?? undefined,
        cardId: validatedData.cardId ?? undefined,
      },
      session.user.id
    );

    return NextResponse.json(subscription);
  } catch (error: any) {
    console.error("Error updating subscription:", error);

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

/**
 * DELETE /api/subscriptions/[id]
 * Excluir assinatura
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await subscriptionService.deleteSubscription(params.id, session.user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    const errorMessage = handlePrismaError(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
