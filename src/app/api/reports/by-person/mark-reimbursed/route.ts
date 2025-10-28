import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/reports/by-person/mark-reimbursed - Marcar todas as transações de uma pessoa como reembolsadas
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const { personName } = await request.json();

    if (!personName) {
      return NextResponse.json({ error: "Nome da pessoa é obrigatório" }, { status: 400 });
    }

    // Atualizar todas as transações pendentes dessa pessoa
    const result = await prisma.transaction.updateMany({
      where: {
        userId: user.id,
        paidBy: personName,
        isReimbursed: false,
      },
      data: {
        isReimbursed: true,
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      message: `${result.count} transação(ões) marcada(s) como reembolsada(s)`,
    });
  } catch (error) {
    console.error("Erro ao marcar transações como reembolsadas:", error);
    return NextResponse.json({ error: "Erro ao atualizar transações" }, { status: 500 });
  }
}
