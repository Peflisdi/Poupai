import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const personSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida"),
});

// GET /api/people/[id] - Buscar pessoa por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const person = await prisma.person.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!person) {
      return NextResponse.json({ error: "Pessoa não encontrada" }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (error) {
    console.error("Erro ao buscar pessoa:", error);
    return NextResponse.json({ error: "Erro ao buscar pessoa" }, { status: 500 });
  }
}

// PUT /api/people/[id] - Atualizar pessoa
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = personSchema.parse(body);

    // Verificar se a pessoa existe e pertence ao usuário
    const existing = await prisma.person.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Pessoa não encontrada" }, { status: 404 });
    }

    // Verificar se já existe outra pessoa com esse nome
    const duplicate = await prisma.person.findFirst({
      where: {
        userId: session.user.id,
        name: validatedData.name,
        isActive: true,
        id: { not: params.id },
      },
    });

    if (duplicate) {
      return NextResponse.json({ error: "Já existe outra pessoa com esse nome" }, { status: 400 });
    }

    const person = await prisma.person.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        notes: validatedData.notes || null,
      },
    });

    return NextResponse.json(person);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Erro ao atualizar pessoa:", error);
    return NextResponse.json({ error: "Erro ao atualizar pessoa" }, { status: 500 });
  }
}

// DELETE /api/people/[id] - Arquivar pessoa (soft delete)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar se a pessoa existe e pertence ao usuário
    const existing = await prisma.person.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Pessoa não encontrada" }, { status: 404 });
    }

    // Soft delete - apenas marca como inativa
    await prisma.person.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Pessoa arquivada com sucesso" });
  } catch (error) {
    console.error("Erro ao arquivar pessoa:", error);
    return NextResponse.json({ error: "Erro ao arquivar pessoa" }, { status: 500 });
  }
}
