import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCardSchema, validateCardDates } from "@/lib/validations/card";

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
          // LÓGICA: Se já passou do dia de VENCIMENTO, mostramos a PRÓXIMA fatura
          // Exemplo: Se vence dia 10 e hoje é dia 28, já pagamos a fatura de outubro, mostrar novembro
          let startDate: Date;
          let endDate: Date;

          // Verificar se já passou do vencimento deste mês
          const alreadyPaid = currentDay > card.dueDay;

          if (alreadyPaid) {
            // Já passou do vencimento → mostrar PRÓXIMA fatura
            // Fatura vence no próximo mês
            startDate = new Date(currentYear, currentMonth, card.closingDay, 0, 0, 0, 0);
            endDate = new Date(currentYear, currentMonth + 1, card.closingDay - 1, 23, 59, 59, 999);
          } else if (currentDay < card.closingDay) {
            // Ainda não chegou no dia de fechamento
            // Fatura vence este mês, período: dia X do mês passado até dia (X-1) deste mês
            startDate = new Date(currentYear, currentMonth - 1, card.closingDay, 0, 0, 0, 0);
            endDate = new Date(currentYear, currentMonth, card.closingDay - 1, 23, 59, 59, 999);
          } else {
            // Já chegou no dia de fechamento mas ainda não venceu
            // Fatura vence este mês, período: dia X do mês passado até dia (X-1) deste mês
            startDate = new Date(currentYear, currentMonth - 1, card.closingDay, 0, 0, 0, 0);
            endDate = new Date(currentYear, currentMonth, card.closingDay - 1, 23, 59, 59, 999);
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

          // ===== CALCULAR LIMITE DISPONÍVEL CORRETAMENTE =====
          // Precisamos considerar TODAS as parcelas futuras, não só o mês atual
          // Exemplo: Compra de R$1200 em 12x = R$100/mês deve reservar R$1200 do limite

          // 1. Buscar todas as compras parceladas ATIVAS deste cartão
          const installmentPurchases = await prisma.installmentPurchase.findMany({
            where: {
              userId: user.id,
              transactions: {
                some: {
                  cardId: card.id,
                },
              },
            },
            include: {
              transactions: {
                where: {
                  cardId: card.id,
                },
              },
            },
          });

          // 2. Calcular total comprometido com parcelas futuras
          let totalCommitted = 0;

          for (const purchase of installmentPurchases) {
            // Somar TODAS as parcelas (presente + futuras)
            const totalInstallments = purchase.transactions.reduce((sum, t) => {
              return sum + Number(t.amount);
            }, 0);
            totalCommitted += totalInstallments;
          }

          // 3. Buscar transações avulsas futuras (não parceladas) no cartão
          const futureTransactions = await prisma.transaction.findMany({
            where: {
              cardId: card.id,
              userId: user.id,
              installmentPurchaseId: null, // Apenas não parceladas
              date: {
                gt: now, // Futuras
              },
            },
          });

          totalCommitted += futureTransactions.reduce((sum, t) => {
            return sum + Number(t.amount);
          }, 0);

          // 4. Calcular fatura atual (sem contar parcelas, pois já estão em totalCommitted)
          const currentBillAmount = transactions.reduce((sum, t) => {
            // Não somar parcelas aqui (já contabilizadas em totalCommitted)
            if (t.installmentPurchaseId) return sum;
            return sum + Number(t.amount);
          }, 0);

          const availableLimit = card.limit - totalCommitted;
          const usagePercentage = (totalCommitted / card.limit) * 100;

          return {
            ...card,
            transactions,
            // Novos campos calculados
            currentBill: currentBillAmount,
            totalCommitted, // Total incluindo parcelas futuras
            availableLimit,
            usagePercentage,
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

    // Validar com Zod
    const validationResult = createCardSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Validação adicional de datas
    const dateValidation = validateCardDates(data);
    if (!dateValidation.success) {
      return NextResponse.json({ error: dateValidation.error }, { status: 400 });
    }

    // Se está marcando como padrão, desmarcar outros cartões
    const isDefault = body.isDefault || false;
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
        name: data.name,
        nickname: data.nickname || null,
        limit: data.limit,
        closingDay: data.closingDay,
        dueDay: data.dueDay,
        color: data.color,
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
