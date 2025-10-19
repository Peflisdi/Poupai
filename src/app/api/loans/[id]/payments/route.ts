import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/loans/[id]/payments - Adicionar pagamento a um empréstimo
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

    const loanId = params.id;
    const body = await req.json();
    const { amount, date, notes } = body;

    // Validações
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valor do pagamento deve ser maior que zero" },
        { status: 400 }
      );
    }

    // Verificar se o empréstimo pertence ao usuário
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId: user.id },
      include: { payments: true },
    });

    if (!loan) {
      return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 });
    }

    // Criar pagamento
    const payment = await prisma.loanPayment.create({
      data: {
        loanId,
        amount,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      },
    });

    // Atualizar valor pago e status do empréstimo
    const newPaidAmount = loan.paidAmount + amount;
    const remainingAmount = loan.totalAmount - newPaidAmount;

    let newStatus = loan.status;
    if (remainingAmount <= 0) {
      newStatus = "PAID";
    } else if (newPaidAmount > 0) {
      newStatus = "PARTIAL";
    }

    // Verificar se está atrasado
    if (loan.dueDate && new Date() > loan.dueDate && remainingAmount > 0) {
      newStatus = "OVERDUE";
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
      include: {
        payments: {
          orderBy: { date: "desc" },
        },
      },
    });

    return NextResponse.json(
      {
        payment,
        loan: updatedLoan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao adicionar pagamento:", error);
    return NextResponse.json({ error: "Erro ao adicionar pagamento" }, { status: 500 });
  }
}
