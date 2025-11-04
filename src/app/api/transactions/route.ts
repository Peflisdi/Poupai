import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createTransactionSchema } from "@/lib/validations/transaction";

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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (type && ["INCOME", "EXPENSE", "TRANSFER"].includes(type)) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate) {
      where.date = {
        ...where.date,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      where.date = {
        ...where.date,
        lte: new Date(endDate),
      };
    }

    if (search) {
      where.description = {
        contains: search,
        mode: "insensitive",
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        installmentPurchase: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Transactions API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validar com Zod
    const validationResult = createTransactionSchema.safeParse({
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: data.type,
        description: data.description,
        amount: data.amount,
        date: data.date,
        categoryId: data.categoryId || null,
        paymentMethod: "CASH", // Default, pode ser adicionado ao schema depois
        cardId: data.cardId || null,
        billMonth: data.billMonth || null,
        isRecurring: false, // Default, pode ser adicionado ao schema depois
        recurringPeriod: null,
        paidBy: data.paidBy || null,
        isReimbursed: data.isReimbursed,
      },
      include: {
        category: true,
        card: true,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
