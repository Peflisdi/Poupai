import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Schema de validação
const personSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Cor inválida")
    .default("#8B5CF6"),
});

// GET /api/people - Listar todas as pessoas
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const people = await prisma.person.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(people);
  } catch (error) {
    console.error("Erro ao buscar pessoas:", error);
    return NextResponse.json({ error: "Erro ao buscar pessoas" }, { status: 500 });
  }
}

// POST /api/people - Criar nova pessoa
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = personSchema.parse(body);

    // Verificar se já existe uma pessoa com esse nome
    const existing = await prisma.person.findFirst({
      where: {
        userId: session.user.id,
        name: validatedData.name,
        isActive: true,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Já existe uma pessoa com esse nome" }, { status: 400 });
    }

    const person = await prisma.person.create({
      data: {
        ...validatedData,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        notes: validatedData.notes || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Erro ao criar pessoa:", error);
    return NextResponse.json({ error: "Erro ao criar pessoa" }, { status: 500 });
  }
}
