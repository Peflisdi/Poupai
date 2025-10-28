import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Função helper para determinar o mês da fatura de uma transação de cartão
function getBillMonth(transactionDate: Date, closingDay: number): Date {
  const transDay = transactionDate.getDate();
  let billMonth = transactionDate.getMonth();
  let billYear = transactionDate.getFullYear();

  // Se a compra foi após o dia de fechamento, vai para a próxima fatura
  if (transDay >= closingDay) {
    billMonth += 1;
    if (billMonth > 11) {
      billMonth = 0;
      billYear += 1;
    }
  }

  return new Date(billYear, billMonth, 1);
}

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

    // Buscar TODAS as transações da pessoa (vamos filtrar depois considerando faturas)
    const allTransactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        paidBy: personName,
      },
      include: {
        category: true,
        card: {
          select: {
            name: true,
            color: true,
            closingDay: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Buscar empréstimos relacionados à pessoa
    const loans = await prisma.loan.findMany({
      where: {
        userId: session.user.id,
        personName: personName,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        payments: {
          orderBy: {
            date: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filtrar transações considerando o ciclo de faturamento
    const transactions = allTransactions.filter((transaction) => {
      if (transaction.cardId && transaction.card) {
        // Para transações de cartão, calcular qual fatura vai aparecer
        const billMonth = getBillMonth(new Date(transaction.date), transaction.card.closingDay);

        // Verificar se a fatura está no período selecionado
        return billMonth >= startDate && billMonth <= endDate;
      } else {
        // Para transações normais (PIX, transferência), usar a data real
        const transDate = new Date(transaction.date);
        return transDate >= startDate && transDate <= endDate;
      }
    });

    // Calcular totais
    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalPending = transactions
      .filter((t) => !t.isReimbursed)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalReimbursed = transactions
      .filter((t) => t.isReimbursed)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Separar transações por tipo (cartão vs. gastos diretos)
    const cardTransactions = transactions.filter((t) => t.cardId);
    const directTransactions = transactions.filter((t) => !t.cardId);

    // Agrupar transações de cartão por cartão + mês de fatura
    const cardBillsMap = new Map<
      string, // key: `${cardId}-${billMonth}`
      {
        cardName: string;
        cardColor: string;
        closingDay: number;
        billMonth: string; // "2025-11"
        transactions: any[];
        total: number;
      }
    >();

    cardTransactions.forEach((transaction) => {
      const billMonth = getBillMonth(new Date(transaction.date), transaction.card!.closingDay);
      const billMonthStr = `${billMonth.getFullYear()}-${String(billMonth.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const key = `${transaction.cardId}-${billMonthStr}`;

      if (!cardBillsMap.has(key)) {
        cardBillsMap.set(key, {
          cardName: transaction.card!.name,
          cardColor: transaction.card!.color,
          closingDay: transaction.card!.closingDay,
          billMonth: billMonthStr,
          transactions: [],
          total: 0,
        });
      }

      const bill = cardBillsMap.get(key)!;
      bill.total += Number(transaction.amount);
      bill.transactions.push({
        id: transaction.id,
        description: transaction.description,
        amount: Number(transaction.amount),
        date: transaction.date,
        isReimbursed: transaction.isReimbursed,
        category: transaction.category,
      });
    });

    // Converter faturas de cartão para array
    const cardBills = Array.from(cardBillsMap.values()).sort((a, b) =>
      b.billMonth.localeCompare(a.billMonth)
    );

    // Agrupar por categoria (comportamento original para compatibilidade)
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
      // Novos dados para visualização híbrida
      cardBills, // Faturas de cartão agrupadas por cartão + mês
      directTransactions: directTransactions.map((t) => ({
        id: t.id,
        description: t.description,
        amount: Number(t.amount),
        date: t.date,
        isReimbursed: t.isReimbursed,
        category: t.category,
      })),
      totalCard: cardTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
      totalDirect: directTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
      // Empréstimos
      loans: loans.map((loan) => ({
        id: loan.id,
        type: loan.type,
        description: loan.description,
        totalAmount: Number(loan.totalAmount),
        paidAmount: Number(loan.paidAmount),
        remainingAmount: Number(loan.totalAmount) - Number(loan.paidAmount),
        installments: loan.installments,
        dueDate: loan.dueDate,
        status: loan.status,
        createdAt: loan.createdAt,
        payments: loan.payments.map((p) => ({
          id: p.id,
          amount: Number(p.amount),
          date: p.date,
          notes: p.notes,
        })),
      })),
      totalLoans: loans.reduce((sum, l) => sum + Number(l.totalAmount), 0),
      totalLoansPaid: loans.reduce((sum, l) => sum + Number(l.paidAmount), 0),
      totalLoansRemaining: loans.reduce(
        (sum, l) => sum + (Number(l.totalAmount) - Number(l.paidAmount)),
        0
      ),
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes da pessoa:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
