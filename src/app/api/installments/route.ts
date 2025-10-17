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

    const body = await request.json();
    const { description, totalAmount, installments, startDate, categoryId, cardId, paymentMethod } =
      body;

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

    // Criar a compra parcelada
    const installmentPurchase = await prisma.installmentPurchase.create({
      data: {
        description,
        totalAmount,
        installments,
        installmentAmount,
        startDate: new Date(startDate),
        paymentMethod: paymentMethod || "CREDIT",
        userId: session.user.id,
        categoryId: categoryId || null,
        cardId: cardId || null,
      },
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
