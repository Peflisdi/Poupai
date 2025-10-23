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

    // ===== LÓGICA DE PERÍODO DA FATURA =====
    //
    // Conceitos:
    // - closingDay (dia de fechamento): Último dia para compras entrarem na fatura
    // - dueDay (dia de vencimento): Dia de pagamento da fatura
    //
    // Exemplo: Cartão fecha dia 4, vence dia 10
    //
    // Fatura com VENCIMENTO em OUTUBRO (10/out):
    //   → Período de compras: 05/set até 04/out
    //   → Compras feitas até 04/out aparecem nesta fatura
    //
    // Fatura com VENCIMENTO em NOVEMBRO (10/nov):
    //   → Período de compras: 05/out até 04/nov
    //   → Compras feitas a partir de 05/out aparecem nesta fatura
    //
    let startDate: Date;
    let endDate: Date;

    if (month) {
      // Usuário selecionou um mês específico (ex: "2025-10" = outubro)
      const [year, monthNum] = month.split("-").map(Number);

      // Fatura que vence em outubro:
      // Período: 05/setembro até 04/outubro
      startDate = new Date(year, monthNum - 2, card.closingDay + 1, 0, 0, 0, 0);
      endDate = new Date(year, monthNum - 1, card.closingDay, 23, 59, 59, 999);
    } else {
      // Buscar fatura ATUAL (não foi especificado mês)
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11 (0=Jan, 9=Out)
      const currentYear = now.getFullYear();
      const currentDay = now.getDate();

      // Determinar qual fatura estamos
      if (currentDay <= card.closingDay) {
        // Ainda não fechou a fatura deste mês
        // Ex: Hoje é 02/out, fecha dia 4 → Fatura vence em outubro
        // Período: 05/set até 04/out
        startDate = new Date(currentYear, currentMonth - 1, card.closingDay + 1, 0, 0, 0, 0);
        endDate = new Date(currentYear, currentMonth, card.closingDay, 23, 59, 59, 999);
      } else {
        // Já fechou a fatura deste mês
        // Ex: Hoje é 23/out, fecha dia 4 → Fatura vence em novembro
        // Período: 05/out até 04/nov
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
