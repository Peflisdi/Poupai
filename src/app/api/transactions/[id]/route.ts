import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Get transaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const updateAll = body.updateAllInstallments === true; // Flag para atualizar todas as parcelas

    // Buscar a transação para verificar se é parcelada
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        installmentPurchase: true,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Se é parcelada E updateAll = true, atualizar todas as parcelas
    if (existingTransaction.installmentPurchaseId && updateAll) {
      // Campos que podem ser atualizados em todas as parcelas
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

      // Atualizar TODAS as transações do mesmo grupo
      await prisma.transaction.updateMany({
        where: {
          installmentPurchaseId: existingTransaction.installmentPurchaseId,
        },
        data: updatableFields,
      });

      // Atualizar também o InstallmentPurchase
      const installmentUpdateData: any = {};

      if (body.categoryId !== undefined) {
        installmentUpdateData.categoryId = body.categoryId;
      }

      if (body.description !== undefined) {
        installmentUpdateData.description = body.description;
      }

      if (Object.keys(installmentUpdateData).length > 0) {
        await prisma.installmentPurchase.update({
          where: { id: existingTransaction.installmentPurchaseId },
          data: installmentUpdateData,
        });
      }

      // Retornar a transação atualizada
      const transaction = await prisma.transaction.findUnique({
        where: { id: params.id },
        include: {
          category: true,
          card: true,
          installmentPurchase: true,
        },
      });

      return NextResponse.json({
        ...transaction,
        updatedCount: existingTransaction.installmentPurchase?.installments || 1,
      });
    }

    // Atualizar apenas esta transação (comportamento padrão)
    const transaction = await prisma.transaction.update({
      where: {
        id: params.id,
      },
      data: {
        ...body,
        amount: body.amount ? parseFloat(body.amount) : undefined,
        date: body.date ? new Date(body.date) : undefined,
        updateAllInstallments: undefined, // Remover flag antes de salvar
      },
      include: {
        category: true,
        card: true,
        installmentPurchase: true,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Update transaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    await prisma.transaction.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Atualização parcial (para marcar como reembolsado, etc)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Atualizar apenas os campos fornecidos
    const transaction = await prisma.transaction.update({
      where: {
        id: params.id,
      },
      data: body,
      include: {
        category: true,
        card: true,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Patch transaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
