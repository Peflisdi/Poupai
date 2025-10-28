import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/reports/by-person - Relatório de gastos por pessoa
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const onlyPending = searchParams.get("onlyPending") === "true"; // Filtrar apenas não reembolsados

    // Buscar todas as transações com paidBy preenchido
    const where: any = {
      userId: user.id,
      paidBy: { not: null },
    };

    if (onlyPending) {
      where.isReimbursed = false;
    }

    // Buscar todas as transações (vamos filtrar por período DEPOIS de calcular a fatura)
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        card: true,
      },
      orderBy: { date: "desc" },
    });

    // Filtrar por período considerando o ciclo de faturamento do cartão
    let filteredTransactions = transactions;

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      filteredTransactions = transactions.filter((transaction) => {
        // Para transações de cartão, calcular em qual fatura vai aparecer
        if (transaction.cardId && transaction.card) {
          const transDate = new Date(transaction.date);
          const closingDay = transaction.card.closingDay;

          // Determinar o mês/ano da fatura (não da compra)
          // Se a compra é antes do fechamento do mês atual, vai para a fatura deste mês
          // Se é depois do fechamento, vai para a fatura do próximo mês

          let billYear = transDate.getFullYear();
          let billMonth = transDate.getMonth() + 1; // 1-12

          // Se a compra foi após o dia de fechamento deste mês, vai para a próxima fatura
          if (transDate.getDate() >= closingDay) {
            billMonth += 1;
            if (billMonth > 12) {
              billMonth = 1;
              billYear += 1;
            }
          }

          // Criar uma data representando o mês da fatura (dia 1 do mês)
          const billMonthDate = new Date(billYear, billMonth - 1, 1);

          if (start && billMonthDate < start) return false;
          if (end && billMonthDate > end) return false;

          return true;
        } else {
          // Para transações normais, usar a data da transação
          if (start && transaction.date < start) return false;
          if (end && transaction.date > end) return false;

          return true;
        }
      });
    }

    // Agrupar por pessoa
    const groupedByPerson: Record<
      string,
      {
        personName: string;
        total: number;
        totalPending: number;
        totalReimbursed: number;
        transactionCount: number;
        transactions: any[];
      }
    > = {};

    transactions.forEach((transaction) => {
      const personName = transaction.paidBy!;

      if (!groupedByPerson[personName]) {
        groupedByPerson[personName] = {
          personName,
          total: 0,
          totalPending: 0,
          totalReimbursed: 0,
          transactionCount: 0,
          transactions: [],
        };
      }

      groupedByPerson[personName].total += transaction.amount;
      groupedByPerson[personName].transactionCount += 1;
      groupedByPerson[personName].transactions.push(transaction);

      if (transaction.isReimbursed) {
        groupedByPerson[personName].totalReimbursed += transaction.amount;
      } else {
        groupedByPerson[personName].totalPending += transaction.amount;
      }
    });

    // Converter para array e ordenar por total pendente
    const report = Object.values(groupedByPerson).sort((a, b) => b.totalPending - a.totalPending);

    return NextResponse.json({
      report,
      summary: {
        totalPeople: report.length,
        totalAmount: report.reduce((sum, p) => sum + p.total, 0),
        totalPending: report.reduce((sum, p) => sum + p.totalPending, 0),
        totalReimbursed: report.reduce((sum, p) => sum + p.totalReimbursed, 0),
      },
    });
  } catch (error) {
    console.error("Erro ao gerar relatório por pessoa:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
