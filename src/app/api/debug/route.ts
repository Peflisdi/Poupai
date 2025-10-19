import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Contar transações
    const transactionCount = await prisma.transaction.count({
      where: { userId: session.user.id },
    });

    // Pegar algumas transações de exemplo
    const sampleTransactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      take: 5,
      orderBy: { date: "desc" },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      session: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      user,
      transactionCount,
      sampleTransactions,
      userExists: !!user,
      sessionMatchesDb: user?.id === session.user.id,
    });
  } catch (error) {
    console.error("Erro no debug:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
