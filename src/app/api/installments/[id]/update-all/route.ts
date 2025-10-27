import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * PUT /api/installments/[id]/update-all
 * Atualiza TODAS as transações de uma compra parcelada (grupo de parcelas)
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    // Verificar se a compra parcelada existe e pertence ao usuário
    const installmentPurchase = await prisma.installmentPurchase.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        transactions: true,
      },
    });

    if (!installmentPurchase) {
      return NextResponse.json({ error: "Installment purchase not found" }, { status: 404 });
    }

    // Campos que podem ser atualizados em TODAS as parcelas
    const updatableFields: any = {};

    if (body.paidBy !== undefined) {
      updatableFields.paidBy = body.paidBy;
    }

    if (body.isReimbursed !== undefined) {
      updatableFields.isReimbursed = body.isReimbursed;
    }

    if (body.categoryId !== undefined) {
      updatableFields.categoryId = body.categoryId;
    }

    if (body.description !== undefined) {
      updatableFields.description = body.description;
    }

    // Atualizar TODAS as transações do grupo
    await prisma.transaction.updateMany({
      where: {
        installmentPurchaseId: params.id,
      },
      data: updatableFields,
    });

    // Atualizar também a InstallmentPurchase principal
    const installmentUpdateData: any = {};

    if (body.categoryId !== undefined) {
      installmentUpdateData.categoryId = body.categoryId;
    }

    if (body.description !== undefined) {
      installmentUpdateData.description = body.description;
    }

    if (Object.keys(installmentUpdateData).length > 0) {
      await prisma.installmentPurchase.update({
        where: { id: params.id },
        data: installmentUpdateData,
      });
    }

    // Retornar as transações atualizadas
    const updatedTransactions = await prisma.transaction.findMany({
      where: {
        installmentPurchaseId: params.id,
      },
      include: {
        category: true,
        card: true,
      },
      orderBy: {
        installmentNumber: "asc",
      },
    });

    return NextResponse.json({
      message: "All installments updated successfully",
      transactions: updatedTransactions,
      totalUpdated: updatedTransactions.length,
    });
  } catch (error) {
    console.error("Update all installments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
