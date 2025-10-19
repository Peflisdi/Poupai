import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log(" Iniciando seed do banco de dados...");

  // Limpar dados existentes (cuidado em produção!)
  console.log(" Limpando dados antigos...");
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuário de teste
  console.log(" Criando usuário de teste...");
  const hashedPassword = await bcrypt.hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      name: "Usuário Demo",
      email: "demo@finacassss.app",
      password: hashedPassword,
    },
  });

  console.log(` Usuário criado: ${user.email}`);

  // Criar cartões
  console.log(" Criando cartões...");
  const cards = await Promise.all([
    prisma.card.create({
      data: {
        userId: user.id,
        name: "Nubank",
        nickname: "Roxinho",
        limit: 5000,
        closingDay: 15,
        dueDay: 25,
        color: "#8B10AE",
      },
    }),
    prisma.card.create({
      data: {
        userId: user.id,
        name: "Inter",
        nickname: "Laranjinha",
        limit: 3000,
        closingDay: 10,
        dueDay: 20,
        color: "#FF7A00",
      },
    }),
    prisma.card.create({
      data: {
        userId: user.id,
        name: "C6 Bank",
        nickname: "Preto",
        limit: 8000,
        closingDay: 5,
        dueDay: 15,
        color: "#1E1E1E",
      },
    }),
  ]);

  console.log(` ${cards.length} cartões criados`);

  // ==========================================
  // RESUMO FINAL
  // ==========================================
  console.log("\n RESUMO GERAL:");
  console.log(` Total de Cartões: ${cards.length}`);

  console.log("\n Seed completed successfully!");
  console.log("\n CREDENCIAIS DE TESTE:");
  console.log(" Email: demo@finacassss.app");
  console.log(" Senha: 123456");
  console.log("\n Faça login e comece a criar suas categorias e transações!");
}

main()
  .catch((e) => {
    console.error(" Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
