import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/goals/[goalId]/deposit - Adicionar depósito em uma meta
export async function POST(request: Request, { params }: { params: { goalId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se a meta existe e pertence ao usuário
    const goal = await prisma.goal.findUnique({
      where: { id: params.goalId },
    });

    if (!goal || goal.userId !== user.id) {
      return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const { amount, note } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valor do depósito inválido" }, { status: 400 });
    }

    // Criar depósito e atualizar meta em uma transação
    const [deposit, updatedGoal] = await prisma.$transaction([
      prisma.goalDeposit.create({
        data: {
          amount: parseFloat(amount),
          note: note || null,
          goalId: params.goalId,
        },
      }),
      prisma.goal.update({
        where: { id: params.goalId },
        data: {
          currentAmount: {
            increment: parseFloat(amount),
          },
        },
        include: {
          deposits: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      }),
    ]);

    return NextResponse.json(updatedGoal, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar depósito:", error);
    return NextResponse.json({ error: "Erro ao adicionar depósito" }, { status: 500 });
  }
}
