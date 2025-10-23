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
      orderBy: {
        name: "asc",
      },
    });

    // Se incluir transações, buscar as transações do período da fatura atual de cada cartão
    if (includeTransactions) {
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();
      const currentDay = now.getDate();

      const cardsWithTransactions = await Promise.all(
        cards.map(async (card) => {
          // ===== CALCULAR PERÍODO DA FATURA ATUAL =====
          let startDate: Date;
          let endDate: Date;

          if (currentDay <= card.closingDay) {
            // Ainda não fechou este mês
            // Fatura vence este mês, período do mês anterior até hoje
            startDate = new Date(currentYear, currentMonth - 1, card.closingDay + 1, 0, 0, 0, 0);
            endDate = new Date(currentYear, currentMonth, card.closingDay, 23, 59, 59, 999);
          } else {
            // Já fechou este mês
            // Fatura vence próximo mês, período deste mês até mês seguinte
            startDate = new Date(currentYear, currentMonth, card.closingDay + 1, 0, 0, 0, 0);
            endDate = new Date(currentYear, currentMonth + 1, card.closingDay, 23, 59, 59, 999);
          }

          // Buscar transações do período
          const transactions = await prisma.transaction.findMany({
            where: {
              cardId: card.id,
              userId: user.id,
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
            orderBy: {
              date: "desc",
            },
          });

          return {
            ...card,
            transactions,
          };
        })
      );

      return NextResponse.json(cardsWithTransactions);
    }

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
    const { name, nickname, limit, closingDay, dueDay, color, isDefault } = body;

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

    // Se está marcando como padrão, desmarcar outros cartões
    if (isDefault) {
      await prisma.card.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const card = await prisma.card.create({
      data: {
        name,
        nickname: nickname || null,
        limit: parseFloat(limit),
        closingDay: parseInt(closingDay),
        dueDay: parseInt(dueDay),
        color: color || "#000000",
        isDefault: isDefault || false,
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
    const { id, name, nickname, limit, closingDay, dueDay, color, isDefault } = body;

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

    // Se está marcando como padrão, desmarcar outros cartões
    if (isDefault && !existingCard.isDefault) {
      await prisma.card.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
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
        isDefault: isDefault !== undefined ? isDefault : existingCard.isDefault,
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
