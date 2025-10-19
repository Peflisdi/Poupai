import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Buscar preferências do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        defaultPaymentMethod: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      defaultPaymentMethod: user.defaultPaymentMethod,
    });
  } catch (error) {
    console.error("Erro ao buscar preferências:", error);
    return NextResponse.json({ error: "Erro ao buscar preferências" }, { status: 500 });
  }
}

// PATCH - Atualizar preferências do usuário
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { defaultPaymentMethod } = body;

    // Validar método de pagamento
    const validMethods = ["PIX", "CREDIT", "DEBIT", "CASH", "TRANSFER"];
    if (defaultPaymentMethod && !validMethods.includes(defaultPaymentMethod)) {
      return NextResponse.json({ error: "Método de pagamento inválido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        defaultPaymentMethod: defaultPaymentMethod || null,
      },
      select: {
        defaultPaymentMethod: true,
      },
    });

    return NextResponse.json({
      defaultPaymentMethod: updatedUser.defaultPaymentMethod,
    });
  } catch (error) {
    console.error("Erro ao atualizar preferências:", error);
    return NextResponse.json({ error: "Erro ao atualizar preferências" }, { status: 500 });
  }
}
