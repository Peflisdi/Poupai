import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/cards - Listar todos os cartões do usuário
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

    const { searchParams } = new URL(request.url);
    const includeTransactions = searchParams.get("includeTransactions") === "true";

    const cards = await prisma.card.findMany({
      where: {
        userId: user.id,
      },
      include: {
        transactions: includeTransactions
          ? {
              where: {
                date: {
                  // Últimos 30 dias por padrão
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
              orderBy: {
                date: "desc",
              },
            }
          : false,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Erro ao buscar cartões:", error);
    return NextResponse.json({ error: "Erro ao buscar cartões" }, { status: 500 });
  }
}

// POST /api/cards - Criar um novo cartão
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
    const { name, nickname, limit, closingDay, dueDay, color } = body;

    // Validações
    if (!name || !limit || !closingDay || !dueDay) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    if (closingDay < 1 || closingDay > 31) {
      return NextResponse.json(
        { error: "Dia de fechamento deve estar entre 1 e 31" },
        { status: 400 }
      );
    }

    if (dueDay < 1 || dueDay > 31) {
      return NextResponse.json(
        { error: "Dia de vencimento deve estar entre 1 e 31" },
        { status: 400 }
      );
    }

    const card = await prisma.card.create({
      data: {
        name,
        nickname: nickname || null,
        limit: parseFloat(limit),
        closingDay: parseInt(closingDay),
        dueDay: parseInt(dueDay),
        color: color || "#000000",
        userId: user.id,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cartão:", error);
    return NextResponse.json({ error: "Erro ao criar cartão" }, { status: 500 });
  }
}

// PUT /api/cards - Atualizar um cartão
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
    const { id, name, nickname, limit, closingDay, dueDay, color } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do cartão obrigatório" }, { status: 400 });
    }

    // Verificar se o cartão pertence ao usuário
    const existingCard = await prisma.card.findUnique({
      where: { id },
    });

    if (!existingCard || existingCard.userId !== user.id) {
      return NextResponse.json({ error: "Cartão não encontrado" }, { status: 404 });
    }

    const card = await prisma.card.update({
      where: { id },
      data: {
        name: name || existingCard.name,
        nickname: nickname !== undefined ? nickname : existingCard.nickname,
        limit: limit ? parseFloat(limit) : existingCard.limit,
        closingDay: closingDay ? parseInt(closingDay) : existingCard.closingDay,
        dueDay: dueDay ? parseInt(dueDay) : existingCard.dueDay,
        color: color || existingCard.color,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error("Erro ao atualizar cartão:", error);
    return NextResponse.json({ error: "Erro ao atualizar cartão" }, { status: 500 });
  }
}

// DELETE /api/cards - Deletar um cartão
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
      return NextResponse.json({ error: "ID do cartão obrigatório" }, { status: 400 });
    }

    // Verificar se o cartão pertence ao usuário
    const existingCard = await prisma.card.findUnique({
      where: { id },
    });

    if (!existingCard || existingCard.userId !== user.id) {
      return NextResponse.json({ error: "Cartão não encontrado" }, { status: 404 });
    }

    await prisma.card.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Cartão deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar cartão:", error);
    return NextResponse.json({ error: "Erro ao deletar cartão" }, { status: 500 });
  }
}
