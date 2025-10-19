import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

    // Get month from query params or use current month
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");

    const targetDate = monthParam ? new Date(monthParam) : new Date();
    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    // Get transactions for the selected month
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        category: true,
      },
    });

    // Calculate summary
    const monthIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthExpenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // For now, we'll use a simple balance calculation
    // In a real app, you'd track account balances
    const currentBalance = monthIncome - monthExpenses;

    // Calculate budget percentage (assuming a budget of monthIncome)
    const budgetPercentage = monthIncome > 0 ? (monthExpenses / monthIncome) * 100 : 0;

    // Group expenses by category
    const expensesByCategory = transactions
      .filter((t) => t.type === "EXPENSE" && t.category)
      .reduce((acc, t) => {
        const categoryId = t.categoryId!;
        const existing = acc.find((item) => item.categoryId === categoryId);

        if (existing) {
          existing.amount += Number(t.amount);
        } else {
          acc.push({
            categoryId,
            categoryName: t.category!.name,
            categoryIcon: t.category!.icon,
            categoryColor: t.category!.color,
            amount: Number(t.amount),
            percentage: 0,
          });
        }

        return acc;
      }, [] as any[]);

    // Calculate percentages
    expensesByCategory.forEach((item) => {
      item.percentage = monthExpenses > 0 ? (item.amount / monthExpenses) * 100 : 0;
    });

    // Sort by amount
    expensesByCategory.sort((a, b) => b.amount - a.amount);

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 10,
    });

    const summary = {
      currentBalance,
      monthExpenses,
      monthIncome,
      budgetPercentage,
      expensesByCategory,
      recentTransactions,
      alerts: [], // You can implement alerts logic here
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
