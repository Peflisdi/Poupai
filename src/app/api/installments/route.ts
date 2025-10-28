import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/installments - Criar uma compra parcelada
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    console.log("Criando compra parcelada para userId:", session.user.id);

    const body = await request.json();
    const {
      description,
      totalAmount,
      installments,
      startDate,
      categoryId,
      cardId,
      paymentMethod,
      paidBy, // Adicionar paidBy
      isReimbursed, // Adicionar isReimbursed
    } = body;

    // Validações
    if (!description || !totalAmount || !installments || !startDate) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    if (installments < 2 || installments > 48) {
      return NextResponse.json(
        { error: "Número de parcelas deve estar entre 2 e 48" },
        { status: 400 }
      );
    }

    // Calcular valor de cada parcela
    const installmentAmount = totalAmount / installments;

    // Verificar se o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      console.error("Usuário não encontrado:", session.user.id);
      return NextResponse.json(
        {
          error: "Sessão inválida. Por favor, faça logout e login novamente.",
        },
        { status: 401 }
      );
    }

    console.log("Dados da compra parcelada:", {
      description,
      totalAmount,
      installments,
      installmentAmount,
      startDate,
      userId: session.user.id,
      categoryId,
      cardId,
    });

    // Criar a compra parcelada usando uma transação do Prisma para garantir atomicidade
    const installmentPurchase = await prisma.$transaction(async (tx) => {
      // Criar a compra parcelada
      const purchase = await tx.installmentPurchase.create({
        data: {
          description,
          totalAmount,
          installments,
          installmentAmount,
          startDate: new Date(startDate),
          paymentMethod: paymentMethod || "CREDIT",
          user: {
            connect: { id: session.user.id },
          },
          ...(categoryId && {
            category: {
              connect: { id: categoryId },
            },
          }),
          ...(cardId && {
            card: {
              connect: { id: cardId },
            },
          }),
        },
      });

      return purchase;
    });

    // Criar as transações para cada parcela
    const transactionsData = [];
    const start = new Date(startDate);

    for (let i = 0; i < installments; i++) {
      const installmentDate = new Date(start);
      installmentDate.setMonth(installmentDate.getMonth() + i);

      transactionsData.push({
        type: "EXPENSE",
        amount: installmentAmount,
        description: `${description} (${i + 1}/${installments})`,
        date: installmentDate,
        paymentMethod: paymentMethod || "CREDIT",
        userId: session.user.id,
        categoryId: categoryId || null,
        cardId: cardId || null,
        installmentPurchaseId: installmentPurchase.id,
        installmentNumber: i + 1,
        paidBy: paidBy || null, // Adicionar paidBy
        isReimbursed: isReimbursed || false, // Adicionar isReimbursed
      });
    }

    // Criar todas as transações de uma vez
    await prisma.transaction.createMany({
      data: transactionsData,
    });

    // Buscar a compra parcelada com as transações
    const result = await prisma.installmentPurchase.findUnique({
      where: { id: installmentPurchase.id },
      include: {
        transactions: {
          orderBy: { date: "asc" },
        },
        category: true,
        card: true,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar compra parcelada:", error);
    return NextResponse.json({ error: "Erro ao criar compra parcelada" }, { status: 500 });
  }
}

// GET /api/installments - Listar compras parceladas
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeTransactions = searchParams.get("includeTransactions") === "true";

    const installments = await prisma.installmentPurchase.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        category: true,
        card: true,
        transactions: includeTransactions
          ? {
              orderBy: { date: "asc" },
            }
          : false,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json(installments);
  } catch (error) {
    console.error("Erro ao buscar compras parceladas:", error);
    return NextResponse.json({ error: "Erro ao buscar compras parceladas" }, { status: 500 });
  }
}
