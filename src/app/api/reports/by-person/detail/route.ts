import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const personName = searchParams.get("person");
    const monthParam = searchParams.get("month"); // formato: "2025-10"

    if (!personName) {
      return NextResponse.json({ error: "Nome da pessoa é obrigatório" }, { status: 400 });
    }

    // Calcular período do mês
    let startDate: Date;
    let endDate: Date;

    if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999); // Último dia do mês
    } else {
      // Mês atual se não especificado
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Buscar transações da pessoa no período
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        paidBy: personName,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
        card: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calcular totais
    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalPending = transactions
      .filter((t) => !t.isReimbursed)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalReimbursed = transactions
      .filter((t) => t.isReimbursed)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Agrupar por categoria
    const categoryMap = new Map<
      string,
      {
        id: string;
        name: string;
        icon: string;
        color: string;
        spent: number;
        transactions: any[];
      }
    >();

    transactions.forEach((transaction) => {
      const categoryId = transaction.categoryId || "sem-categoria";
      const categoryName = transaction.category?.name || "Sem Categoria";
      const categoryIcon = transaction.category?.icon || "📦";
      const categoryColor = transaction.category?.color || "#6B7280";

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          icon: categoryIcon,
          color: categoryColor,
          spent: 0,
          transactions: [],
        });
      }

      const category = categoryMap.get(categoryId)!;
      category.spent += Number(transaction.amount);
      category.transactions.push({
        id: transaction.id,
        description: transaction.description,
        amount: Number(transaction.amount),
        date: transaction.date,
        isReimbursed: transaction.isReimbursed,
        card: transaction.card,
      });
    });

    // Converter para array e calcular percentuais
    const categories = Array.from(categoryMap.values())
      .map((category) => ({
        ...category,
        percentage: total > 0 ? (category.spent / total) * 100 : 0,
      }))
      .sort((a, b) => b.spent - a.spent);

    return NextResponse.json({
      personName,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      total,
      totalPending,
      totalReimbursed,
      transactionCount: transactions.length,
      categories,
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes da pessoa:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
