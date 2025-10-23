import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Pegar o mês atual (pode ser parametrizado depois)
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Buscar todas as transações de despesa do mês agrupadas por categoria
    const transactions = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
        categoryId: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Transformar em um objeto mais fácil de usar
    const spending: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.categoryId && t._sum.amount) {
        spending[t.categoryId] = t._sum.amount;
      }
    });

    return NextResponse.json(spending);
  } catch (error) {
    console.error("Category spending API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
