import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * DELETE /api/installments/[id]
 * Deleta TODAS as transações de uma compra parcelada + o registro InstallmentPurchase
 */
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

    const transactionCount = installmentPurchase.transactions.length;

    // Deletar TODAS as transações do grupo
    await prisma.transaction.deleteMany({
      where: {
        installmentPurchaseId: params.id,
      },
    });

    // Deletar o registro da compra parcelada
    await prisma.installmentPurchase.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      message: "All installments and purchase deleted successfully",
      deletedCount: transactionCount,
    });
  } catch (error) {
    console.error("Delete all installments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
