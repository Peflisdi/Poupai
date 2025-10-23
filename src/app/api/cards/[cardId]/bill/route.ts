import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/cards/[cardId]/bill - Buscar detalhes da fatura do cartão
export async function GET(request: Request, { params }: { params: { cardId: string } }) {
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
    const month = searchParams.get("month"); // Format: YYYY-MM

    // Verificar se o cartão pertence ao usuário
    const card = await prisma.card.findUnique({
      where: { id: params.cardId },
    });

    if (!card || card.userId !== user.id) {
      return NextResponse.json({ error: "Cartão não encontrado" }, { status: 404 });
    }

    // Calcular período da fatura baseado no dia de fechamento
    // Lógica: Compras feitas APÓS o dia de fechamento vão para a PRÓXIMA fatura
    // Exemplo: Se fecha dia 4
    // - Compra dia 4 às 23:59 = fatura atual
    // - Compra dia 5 às 00:00 = próxima fatura
    let startDate: Date;
    let endDate: Date;

    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      // Período de fechamento: do dia (X+1) do mês anterior até o dia X do mês solicitado
      // Fatura de outubro (mês 10): de 05/set até 04/out 23:59:59
      startDate = new Date(year, monthNum - 2, card.closingDay + 1, 0, 0, 0, 0);
      endDate = new Date(year, monthNum - 1, card.closingDay, 23, 59, 59, 999);
    } else {
      // Fatura atual: determinar qual mês de vencimento baseado na data atual
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();
      const currentDay = now.getDate();

      // Se hoje é DIA 4 ou ANTES do dia 4, a fatura atual vence este mês
      // Se hoje é DEPOIS do dia 4, a fatura atual vence no próximo mês
      if (currentDay <= card.closingDay) {
        // Ainda estamos na fatura que vence este mês
        // Período: dia (X+1) do mês passado até dia X deste mês
        startDate = new Date(currentYear, currentMonth - 1, card.closingDay + 1, 0, 0, 0, 0);
        endDate = new Date(currentYear, currentMonth, card.closingDay, 23, 59, 59, 999);
      } else {
        // Já passamos do fechamento, estamos na fatura do próximo mês
        // Período: dia (X+1) deste mês até dia X do próximo mês
        startDate = new Date(currentYear, currentMonth, card.closingDay + 1, 0, 0, 0, 0);
        endDate = new Date(currentYear, currentMonth + 1, card.closingDay, 23, 59, 59, 999);
      }
    }

    // Buscar transações do período
    const transactions = await prisma.transaction.findMany({
      where: {
        cardId: params.cardId,
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calcular total da fatura
    const totalBill = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Agrupar por categoria com orçamentos
    const categoryGroups = transactions.reduce((acc, transaction) => {
      const categoryId = transaction.categoryId || "no-category";
      const categoryName = transaction.category?.name || "Sem categoria";
      const categoryIcon = transaction.category?.icon || "❓";
      const categoryColor = transaction.category?.color || "#666666";
      const categoryBudget = transaction.category?.budget || 0;

      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          name: categoryName,
          icon: categoryIcon,
          color: categoryColor,
          budget: categoryBudget,
          spent: 0,
          percentage: 0,
          transactions: [],
        };
      }

      acc[categoryId].spent += transaction.amount;
      acc[categoryId].transactions.push(transaction);

      return acc;
    }, {} as Record<string, any>);

    // Calcular percentuais
    const categoryData = Object.values(categoryGroups).map((cat: any) => ({
      ...cat,
      percentage: totalBill > 0 ? (cat.spent / totalBill) * 100 : 0,
      budgetPercentage: cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0,
    }));

    // Ordenar por valor gasto (maior primeiro)
    categoryData.sort((a, b) => b.spent - a.spent);

    // Calcular totais de orçamento
    const totalBudget = categoryData.reduce((sum, cat) => sum + cat.budget, 0);
    const budgetUsagePercentage = totalBudget > 0 ? (totalBill / totalBudget) * 100 : 0;

    return NextResponse.json({
      card,
      period: {
        start: startDate,
        end: endDate,
      },
      totalBill,
      totalBudget,
      budgetUsagePercentage,
      availableLimit: card.limit - totalBill,
      usagePercentage: (totalBill / card.limit) * 100,
      categories: categoryData,
      transactions,
    });
  } catch (error) {
    console.error("Erro ao buscar fatura:", error);
    return NextResponse.json({ error: "Erro ao buscar fatura" }, { status: 500 });
  }
}
