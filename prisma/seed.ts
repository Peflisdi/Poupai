import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Limpar dados existentes (cuidado em produção!)
  console.log("🧹 Limpando dados antigos...");
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuário de teste
  console.log("👤 Criando usuário de teste...");
  const hashedPassword = await bcrypt.hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      name: "Usuário Demo",
      email: "demo@finacassss.app",
      password: hashedPassword,
    },
  });

  console.log(`✅ Usuário criado: ${user.email}`);

  // Criar cartões
  console.log("💳 Criando cartões...");
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

  console.log(`✅ ${cards.length} cartões criados`);

  // Criar categorias
  console.log("📁 Criando categorias...");
  const categories = await Promise.all([
    // Despesas
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Alimentação",
        icon: "🍔",
        color: "#EF4444",
        budget: 1000,
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Transporte",
        icon: "🚗",
        color: "#3B82F6",
        budget: 500,
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Moradia",
        icon: "🏠",
        color: "#10B981",
        budget: 2000,
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Lazer",
        icon: "🎮",
        color: "#8B5CF6",
        budget: 300,
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Saúde",
        icon: "💊",
        color: "#EC4899",
        budget: 400,
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Educação",
        icon: "📚",
        color: "#F59E0B",
        budget: 600,
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Compras",
        icon: "🛒",
        color: "#6366F1",
        budget: 800,
      },
    }),
    // Receitas
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Salário",
        icon: "💰",
        color: "#10B981",
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Freelance",
        icon: "💼",
        color: "#3B82F6",
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Investimentos",
        icon: "📈",
        color: "#10B981",
      },
    }),
  ]);

  console.log(`✅ ${categories.length} categorias criadas`);

  // Criar transações do mês atual
  console.log("💸 Criando transações...");
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const transactions = [
    // Receitas
    {
      userId: user.id,
      type: "INCOME",
      description: "Salário",
      amount: 5000,
      date: new Date(currentYear, currentMonth, 5),
      categoryId: categories[7].id,
      paymentMethod: "PIX",
    },
    {
      userId: user.id,
      type: "INCOME",
      description: "Projeto Freelance",
      amount: 1500,
      date: new Date(currentYear, currentMonth, 10),
      categoryId: categories[8].id,
      paymentMethod: "PIX",
    },
    // Despesas - Moradia
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Aluguel",
      amount: 1200,
      date: new Date(currentYear, currentMonth, 5),
      categoryId: categories[2].id,
      paymentMethod: "DEBIT",
    },
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Conta de Luz",
      amount: 150,
      date: new Date(currentYear, currentMonth, 8),
      categoryId: categories[2].id,
      paymentMethod: "DEBIT",
    },
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Conta de Água",
      amount: 80,
      date: new Date(currentYear, currentMonth, 10),
      categoryId: categories[2].id,
      paymentMethod: "DEBIT",
    },
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Internet",
      amount: 100,
      date: new Date(currentYear, currentMonth, 12),
      categoryId: categories[2].id,
      paymentMethod: "CREDIT",
    },
    // Despesas - Alimentação
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Supermercado",
      amount: 450,
      date: new Date(currentYear, currentMonth, 6),
      categoryId: categories[0].id,
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Restaurante",
      amount: 85,
      date: new Date(currentYear, currentMonth, 8),
      categoryId: categories[0].id,
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Lanche",
      amount: 25,
      date: new Date(currentYear, currentMonth, 9),
      categoryId: categories[0].id,
      paymentMethod: "CASH",
    },
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Delivery",
      amount: 60,
      date: new Date(currentYear, currentMonth, 11),
      categoryId: categories[0].id,
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Padaria",
      amount: 40,
      date: new Date(currentYear, currentMonth, 13),
      categoryId: categories[0].id,
      paymentMethod: "CASH",
    },
    // Despesas - Transporte
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Uber",
      amount: 45,
      date: new Date(currentYear, currentMonth, 7),
      categoryId: categories[1].id,
      paymentMethod: "PIX",
    },
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Gasolina",
      amount: 200,
      date: new Date(currentYear, currentMonth, 9),
      categoryId: categories[1].id,
      paymentMethod: "DEBIT",
    },
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Estacionamento",
      amount: 15,
      date: new Date(currentYear, currentMonth, 12),
      categoryId: categories[1].id,
      paymentMethod: "CASH",
    },
    // Despesas - Lazer
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Cinema",
      amount: 80,
      date: new Date(currentYear, currentMonth, 8),
      categoryId: categories[3].id,
      paymentMethod: "DEBIT",
    },
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Netflix",
      amount: 45,
      date: new Date(currentYear, currentMonth, 1),
      categoryId: categories[3].id,
      paymentMethod: "CREDIT",
      isRecurring: true,
      recurringPeriod: "MONTHLY",
    },
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Spotify",
      amount: 20,
      date: new Date(currentYear, currentMonth, 1),
      categoryId: categories[3].id,
      paymentMethod: "CREDIT",
      isRecurring: true,
      recurringPeriod: "MONTHLY",
    },
    // Despesas - Saúde
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Farmácia",
      amount: 65,
      date: new Date(currentYear, currentMonth, 10),
      categoryId: categories[4].id,
      paymentMethod: "DEBIT",
    },
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Plano de Saúde",
      amount: 350,
      date: new Date(currentYear, currentMonth, 5),
      categoryId: categories[4].id,
      paymentMethod: "DEBIT",
      isRecurring: true,
      recurringPeriod: "MONTHLY",
    },
    // Despesas - Educação
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Curso Online",
      amount: 150,
      date: new Date(currentYear, currentMonth, 3),
      categoryId: categories[5].id,
      paymentMethod: "CREDIT",
    },
    // Despesas - Compras
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Roupa",
      amount: 180,
      date: new Date(currentYear, currentMonth, 9),
      categoryId: categories[6].id,
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      type: "EXPENSE",
      description: "Eletrônicos",
      amount: 450,
      date: new Date(currentYear, currentMonth, 11),
      categoryId: categories[6].id,
      paymentMethod: "CREDIT",
    },
  ];

  await Promise.all(
    transactions.map((t) =>
      prisma.transaction.create({
        data: t,
      })
    )
  );

  console.log(`✅ ${transactions.length} transações criadas`);

  // ==========================================
  // TRANSAÇÕES DE SETEMBRO/2025
  // ==========================================
  console.log("\n📅 Criando transações de setembro...");

  await prisma.transaction.createMany({
    data: [
      // Receitas de Setembro
      {
        userId: user.id,
        type: "INCOME",
        description: "Salário Setembro",
        amount: 5000,
        date: new Date(2025, 8, 5), // Setembro = mês 8
        categoryId: categories[7].id,
        paymentMethod: "TRANSFER",
      },
      {
        userId: user.id,
        type: "INCOME",
        description: "Freelance Design",
        amount: 800,
        date: new Date(2025, 8, 15),
        categoryId: categories[8].id,
        paymentMethod: "PIX",
      },
      // Despesas de Setembro
      {
        userId: user.id,
        type: "EXPENSE",
        description: "Aluguel",
        amount: 1200,
        date: new Date(2025, 8, 10),
        categoryId: categories[2].id,
        paymentMethod: "TRANSFER",
      },
      {
        userId: user.id,
        type: "EXPENSE",
        description: "Supermercado",
        amount: 450,
        date: new Date(2025, 8, 12),
        categoryId: categories[0].id,
        paymentMethod: "DEBIT",
      },
      {
        userId: user.id,
        type: "EXPENSE",
        description: "Netflix",
        amount: 55,
        date: new Date(2025, 8, 20),
        categoryId: categories[5].id,
        paymentMethod: "CREDIT",
      },
      {
        userId: user.id,
        type: "EXPENSE",
        description: "Academia",
        amount: 89,
        date: new Date(2025, 8, 25),
        categoryId: categories[4].id,
        paymentMethod: "DEBIT",
      },
    ],
  });

  console.log(`✅ Transações de setembro criadas`);

  // ==========================================
  // TRANSAÇÕES DE NOVEMBRO/2025
  // ==========================================
  console.log("📅 Criando transações de novembro...");

  await prisma.transaction.createMany({
    data: [
      // Receitas de Novembro
      {
        userId: user.id,
        type: "INCOME",
        description: "Salário Novembro",
        amount: 5000,
        date: new Date(2025, 10, 5), // Novembro = mês 10
        categoryId: categories[7].id,
        paymentMethod: "TRANSFER",
      },
      {
        userId: user.id,
        type: "INCOME",
        description: "Bônus Projeto",
        amount: 2000,
        date: new Date(2025, 10, 20),
        categoryId: categories[8].id,
        paymentMethod: "TRANSFER",
      },
      // Despesas de Novembro
      {
        userId: user.id,
        type: "EXPENSE",
        description: "Aluguel",
        amount: 1200,
        date: new Date(2025, 10, 10),
        categoryId: categories[2].id,
        paymentMethod: "TRANSFER",
      },
      {
        userId: user.id,
        type: "EXPENSE",
        description: "Black Friday - TV",
        amount: 1899,
        date: new Date(2025, 10, 29),
        categoryId: categories[6].id,
        paymentMethod: "CREDIT",
      },
      {
        userId: user.id,
        type: "EXPENSE",
        description: "Black Friday - Roupas",
        amount: 350,
        date: new Date(2025, 10, 29),
        categoryId: categories[6].id,
        paymentMethod: "CREDIT",
      },
      {
        userId: user.id,
        type: "EXPENSE",
        description: "Restaurante Aniversário",
        amount: 280,
        date: new Date(2025, 10, 15),
        categoryId: categories[0].id,
        paymentMethod: "CREDIT",
      },
    ],
  });

  console.log(`✅ Transações de novembro criadas`);

  // ==========================================
  // TRANSAÇÕES DE DEZEMBRO/2025
  // ==========================================
  console.log("📅 Criando transações de dezembro...");

  await prisma.transaction.createMany({
    data: [
      // Receitas de Dezembro
      {
        userId: user.id,
        type: "INCOME",
        description: "Salário Dezembro",
        amount: 5000,
        date: new Date(2025, 11, 5), // Dezembro = mês 11
        categoryId: categories[7].id,
        paymentMethod: "TRANSFER",
      },
      {
        userId: user.id,
        type: "INCOME",
        description: "13º Salário",
        amount: 5000,
        date: new Date(2025, 11, 20),
        categoryId: categories[7].id,
        paymentMethod: "TRANSFER",
      },
      // Despesas de Dezembro
      {
        userId: user.id,
        type: "EXPENSE",
        description: "Aluguel",
        amount: 1200,
        date: new Date(2025, 11, 10),
        categoryId: categories[2].id,
        paymentMethod: "TRANSFER",
      },
      {
        userId: user.id,
        type: "EXPENSE",
        description: "Presentes de Natal",
        amount: 800,
        date: new Date(2025, 11, 18),
        categoryId: categories[6].id,
        paymentMethod: "CREDIT",
      },
      {
        userId: user.id,
        type: "EXPENSE",
        description: "Ceia de Natal",
        amount: 450,
        date: new Date(2025, 11, 24),
        categoryId: categories[0].id,
        paymentMethod: "DEBIT",
      },
      {
        userId: user.id,
        type: "EXPENSE",
        description: "Viagem Ano Novo",
        amount: 1500,
        date: new Date(2025, 11, 28),
        categoryId: categories[5].id,
        paymentMethod: "CREDIT",
      },
    ],
  });

  console.log(`✅ Transações de dezembro criadas`);

  // ==========================================
  // RESUMO FINAL
  // ==========================================
  console.log("\n📊 Buscando todas as transações para resumo...");
  const allTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
  });

  const totalIncome = allTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = allTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  console.log("\n📊 RESUMO GERAL:");
  console.log(`📅 Total de Transações: ${allTransactions.length}`);
  console.log(`💰 Total de Receitas: R$ ${totalIncome.toFixed(2)}`);
  console.log(`💸 Total de Despesas: R$ ${totalExpenses.toFixed(2)}`);
  console.log(`💵 Saldo Final: R$ ${(totalIncome - totalExpenses).toFixed(2)}`);

  console.log("\n✨ Seed completed successfully!");
  console.log("\n🔐 CREDENCIAIS DE TESTE:");
  console.log("📧 Email: demo@finacassss.app");
  console.log("🔑 Senha: 123456");
  console.log("\n🚀 Faça login e veja o dashboard populado com dados!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
