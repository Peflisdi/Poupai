import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("Busca: Usuário não autorizado");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    console.log("Busca iniciada:", { userId: session.user.id, query });

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    // Tentar converter query em número para buscar por valor
    // Remove espaços, vírgulas e pontos para converter
    const cleanedQuery = query.replace(/\s/g, "").replace(",", ".");
    const queryAsNumber = parseFloat(cleanedQuery);
    const isNumericQuery = !isNaN(queryAsNumber) && queryAsNumber > 0;

    // Construir condições de busca
    const searchConditions: any[] = [
      // Buscar por descrição
      {
        description: {
          contains: query,
          mode: "insensitive",
        },
      },
      // Buscar por nome da categoria
      {
        category: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      },
      // Buscar por ícone da categoria (ex: 🛒 para compras)
      {
        category: {
          icon: {
            contains: query,
          },
        },
      },
    ];

    // Adicionar busca por valor se for numérico
    if (isNumericQuery) {
      searchConditions.push({
        amount: {
          gte: queryAsNumber * 0.9, // 10% de margem para baixo
          lte: queryAsNumber * 1.1, // 10% de margem para cima
        },
      });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        OR: searchConditions,
      },
      include: {
        category: true,
        card: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 20, // Limitar a 20 resultados
    });

    console.log("Transações encontradas:", transactions.length);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return NextResponse.json({ error: "Erro ao buscar transações" }, { status: 500 });
  }
}
