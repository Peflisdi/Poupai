import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// DELETE /api/categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const categoryId = params.id;

    // Verificar se a categoria existe e pertence ao usuário
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (existingCategory.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verificar se a categoria tem transações
    const transactionsCount = await prisma.transaction.count({
      where: { categoryId: categoryId },
    });

    if (transactionsCount > 0) {
      return NextResponse.json(
        { error: "Não é possível deletar categoria com transações associadas" },
        { status: 400 }
      );
    }

    // Verificar se há subcategorias
    const subcategoriesCount = await prisma.category.count({
      where: { parentId: categoryId },
    });

    if (subcategoriesCount > 0) {
      return NextResponse.json(
        { error: "Não é possível deletar categoria com subcategorias" },
        { status: 400 }
      );
    }

    // Deletar a categoria
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, icon, color, budget, parentId } = body;
    const categoryId = params.id;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Verificar se a categoria pertence ao usuário
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory || existingCategory.userId !== user.id) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        icon: icon || existingCategory.icon,
        color: color || existingCategory.color,
        budget:
          budget !== undefined ? (budget ? parseFloat(budget) : null) : existingCategory.budget,
        parentId: parentId !== undefined ? parentId : existingCategory.parentId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
