import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/goals - Listar todas as metas do usuário
export async function GET(request: Request) {
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

    const goals = await prisma.goal.findMany({
      where: {
        userId: user.id,
      },
      include: {
        deposits: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
    return NextResponse.json({ error: "Erro ao buscar metas" }, { status: 500 });
  }
}

// POST /api/goals - Criar uma nova meta
export async function POST(request: Request) {
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

    const body = await request.json();
    const { name, targetAmount, deadline, icon, color } = body;

    // Validações
    if (!name || !targetAmount) {
      return NextResponse.json({ error: "Nome e valor alvo são obrigatórios" }, { status: 400 });
    }

    if (targetAmount <= 0) {
      return NextResponse.json({ error: "Valor alvo deve ser positivo" }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        name,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline ? new Date(deadline) : null,
        icon: icon || "🎯",
        color: color || "#3B82F6",
        currentAmount: 0,
        userId: user.id,
      },
      include: {
        deposits: true,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar meta:", error);
    return NextResponse.json({ error: "Erro ao criar meta" }, { status: 500 });
  }
}

// PUT /api/goals - Atualizar uma meta
export async function PUT(request: Request) {
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

    const body = await request.json();
    const { id, name, targetAmount, deadline, icon, color } = body;

    if (!id) {
      return NextResponse.json({ error: "ID da meta obrigatório" }, { status: 400 });
    }

    // Verificar se a meta pertence ao usuário
    const existingGoal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!existingGoal || existingGoal.userId !== user.id) {
      return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        name: name || existingGoal.name,
        targetAmount: targetAmount ? parseFloat(targetAmount) : existingGoal.targetAmount,
        deadline:
          deadline !== undefined ? (deadline ? new Date(deadline) : null) : existingGoal.deadline,
        icon: icon || existingGoal.icon,
        color: color || existingGoal.color,
      },
      include: {
        deposits: true,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    return NextResponse.json({ error: "Erro ao atualizar meta" }, { status: 500 });
  }
}

// DELETE /api/goals - Deletar uma meta
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID da meta obrigatório" }, { status: 400 });
    }

    // Verificar se a meta pertence ao usuário
    const existingGoal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!existingGoal || existingGoal.userId !== user.id) {
      return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
    }

    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Meta deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar meta:", error);
    return NextResponse.json({ error: "Erro ao deletar meta" }, { status: 500 });
  }
}
