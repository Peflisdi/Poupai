import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurrentBillPeriod, getBillPeriodByMonth } from "@/lib/cardUtils";

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
    // Agora considera finais de semana!
    //
    // Conceitos:
    // - closingDay (dia de fechamento): DIA configurado no cartão
    // - Fechamento efetivo: Ajustado para próxima segunda se cair em fim de semana
    // - dueDay (dia de vencimento): Dia de pagamento da fatura
    //
    // Exemplo 1: Cartão fecha dia 4 (quinta-feira), vence dia 10
    //   Fatura com VENCIMENTO em OUTUBRO (10/out):
    //     → Período: 04/set (quinta) até 03/out (quarta) 23:59:59
    //     → Compras até 03/out aparecem nesta fatura
    //
    // Exemplo 2: Cartão fecha dia 1 (domingo), vence dia 7
    //   - Fechamento EFETIVO é dia 2 (segunda-feira, primeiro dia útil)
    //   Fatura com VENCIMENTO em OUTUBRO (07/out):
    //     → Período: 02/set (segunda) até 01/out (domingo) 23:59:59
    //     → Compras feitas no domingo (01/out) ainda vão para esta fatura
    //     → Compras processadas na segunda (02/out) vão para PRÓXIMA fatura
    //
    let startDate: Date;
    let endDate: Date;

    if (month) {
      // Usuário selecionou um mês específico (ex: "2025-10" = outubro)
      const [year, monthNum] = month.split("-").map(Number);

      // Usar função que considera finais de semana E o dia de vencimento
      const period = getBillPeriodByMonth(card.closingDay, card.dueDay, year, monthNum);
      startDate = period.startDate;
      endDate = period.endDate;
    } else {
      // Buscar fatura ATUAL (não foi especificado mês)
      // Usar função que considera finais de semana E o dia de vencimento
      const period = getCurrentBillPeriod(card.closingDay, card.dueDay);
      startDate = period.startDate;
      endDate = period.endDate;
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
