import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/loans - Listar todos os empréstimos do usuário
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
    const type = searchParams.get("type"); // LENT ou BORROWED
    const status = searchParams.get("status"); // PENDING, PARTIAL, PAID, OVERDUE

    const loans = await prisma.loan.findMany({
      where: {
        userId: user.id,
        ...(type && { type }),
        ...(status && { status }),
      },
      include: {
        payments: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error("Erro ao buscar empréstimos:", error);
    return NextResponse.json({ error: "Erro ao buscar empréstimos" }, { status: 500 });
  }
}

// POST /api/loans - Criar novo empréstimo
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { type, personName, description, totalAmount, installments, dueDate, notes } = body;

    // Validações
    if (!type || !personName || !totalAmount) {
      return NextResponse.json(
        { error: "Campos obrigatórios: type, personName, totalAmount" },
        { status: 400 }
      );
    }

    if (!["LENT", "BORROWED"].includes(type)) {
      return NextResponse.json({ error: "Tipo inválido (LENT ou BORROWED)" }, { status: 400 });
    }

    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Valor deve ser maior que zero" }, { status: 400 });
    }

    const loan = await prisma.loan.create({
      data: {
        userId: user.id,
        type,
        personName,
        description: description || null,
        totalAmount,
        installments: installments || 1,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
        status: "PENDING",
        paidAmount: 0,
      },
      include: {
        payments: true,
      },
    });

    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar empréstimo:", error);
    return NextResponse.json({ error: "Erro ao criar empréstimo" }, { status: 500 });
  }
}

// PUT /api/loans - Atualizar empréstimo
export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { id, personName, description, totalAmount, installments, dueDate, notes, status } =
      body;

    if (!id) {
      return NextResponse.json({ error: "ID do empréstimo é obrigatório" }, { status: 400 });
    }

    // Verificar se o empréstimo pertence ao usuário
    const existingLoan = await prisma.loan.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingLoan) {
      return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 });
    }

    const loan = await prisma.loan.update({
      where: { id },
      data: {
        ...(personName && { personName }),
        ...(description !== undefined && { description }),
        ...(totalAmount && { totalAmount }),
        ...(installments && { installments }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
      include: {
        payments: {
          orderBy: { date: "desc" },
        },
      },
    });

    return NextResponse.json(loan);
  } catch (error) {
    console.error("Erro ao atualizar empréstimo:", error);
    return NextResponse.json({ error: "Erro ao atualizar empréstimo" }, { status: 500 });
  }
}

// DELETE /api/loans - Deletar empréstimo
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do empréstimo é obrigatório" }, { status: 400 });
    }

    // Verificar se o empréstimo pertence ao usuário
    const loan = await prisma.loan.findFirst({
      where: { id, userId: user.id },
    });

    if (!loan) {
      return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 });
    }

    await prisma.loan.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Empréstimo deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar empréstimo:", error);
    return NextResponse.json({ error: "Erro ao deletar empréstimo" }, { status: 500 });
  }
}
