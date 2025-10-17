import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Atualizando transações dos cartões para 2025...");

  // Buscar os cartões
  const cards = await prisma.card.findMany();

  if (cards.length === 0) {
    console.log("❌ Nenhum cartão encontrado. Execute create-test-data primeiro.");
    return;
  }

  console.log(`✅ ${cards.length} cartões encontrados`);

  // Deletar transações antigas dos cartões
  const deleted = await prisma.transaction.deleteMany({
    where: {
      cardId: {
        in: cards.map((c) => c.id),
      },
    },
  });

  console.log(`🗑️  ${deleted.count} transações antigas deletadas`);

  // Buscar categorias
  const user = await prisma.user.findFirst();
  const categories = await prisma.category.findMany({
    where: { userId: user?.id },
  });

  const alimentacao = categories.find((c) => c.name === "Alimentação");
  const transporte = categories.find((c) => c.name === "Transporte");
  const lazer = categories.find((c) => c.name === "Lazer");
  const compras = categories.find((c) => c.name === "Compras");
  const saude = categories.find((c) => c.name === "Saúde");

  const nubank = cards.find((c) => c.name === "Nubank");
  const inter = cards.find((c) => c.name === "Inter");

  if (!nubank || !inter || !user) {
    console.log("❌ Cartões ou usuário não encontrados");
    return;
  }

  // Criar novas transações em 2025
  const transactions = [
    // Outubro 2025 - Nubank (11 de set a 10 de out)
    {
      userId: user.id,
      cardId: nubank.id,
      categoryId: alimentacao?.id,
      type: "EXPENSE",
      amount: 150.5,
      description: "Supermercado Extra",
      date: new Date("2025-09-15"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: nubank.id,
      categoryId: alimentacao?.id,
      type: "EXPENSE",
      amount: 89.9,
      description: "iFood - Jantar",
      date: new Date("2025-09-20"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: nubank.id,
      categoryId: transporte?.id,
      type: "EXPENSE",
      amount: 120.0,
      description: "Uber - Semana",
      date: new Date("2025-09-25"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: nubank.id,
      categoryId: lazer?.id,
      type: "EXPENSE",
      amount: 79.9,
      description: "Cinema - Ingresso",
      date: new Date("2025-09-28"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: nubank.id,
      categoryId: compras?.id,
      type: "EXPENSE",
      amount: 250.0,
      description: "Zara - Roupa",
      date: new Date("2025-10-03"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: nubank.id,
      categoryId: alimentacao?.id,
      type: "EXPENSE",
      amount: 65.4,
      description: "Restaurante",
      date: new Date("2025-10-08"),
      paymentMethod: "CREDIT",
    },

    // Novembro 2025 - Nubank (11 de out a 10 de nov)
    {
      userId: user.id,
      cardId: nubank.id,
      categoryId: alimentacao?.id,
      type: "EXPENSE",
      amount: 320.0,
      description: "Supermercado Carrefour",
      date: new Date("2025-10-12"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: nubank.id,
      categoryId: saude?.id,
      type: "EXPENSE",
      amount: 180.0,
      description: "Farmácia - Remédios",
      date: new Date("2025-10-15"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: nubank.id,
      categoryId: lazer?.id,
      type: "EXPENSE",
      amount: 150.0,
      description: "Show - Ingresso",
      date: new Date("2025-10-20"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: nubank.id,
      categoryId: compras?.id,
      type: "EXPENSE",
      amount: 499.9,
      description: "Amazon - Eletrônicos",
      date: new Date("2025-10-25"),
      paymentMethod: "CREDIT",
    },

    // Inter - Outubro 2025 (16 de set a 15 de out)
    {
      userId: user.id,
      cardId: inter.id,
      categoryId: transporte?.id,
      type: "EXPENSE",
      amount: 200.0,
      description: "Combustível",
      date: new Date("2025-09-20"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: inter.id,
      categoryId: alimentacao?.id,
      type: "EXPENSE",
      amount: 180.0,
      description: "Padaria - Compras do mês",
      date: new Date("2025-10-05"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: inter.id,
      categoryId: lazer?.id,
      type: "EXPENSE",
      amount: 95.0,
      description: "Netflix",
      date: new Date("2025-10-10"),
      paymentMethod: "CREDIT",
    },

    // Inter - Novembro 2025 (16 de out a 15 de nov)
    {
      userId: user.id,
      cardId: inter.id,
      categoryId: transporte?.id,
      type: "EXPENSE",
      amount: 180.0,
      description: "Uber - Corridas",
      date: new Date("2025-10-18"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: inter.id,
      categoryId: alimentacao?.id,
      type: "EXPENSE",
      amount: 150.0,
      description: "Restaurante Japonês",
      date: new Date("2025-10-22"),
      paymentMethod: "CREDIT",
    },
  ];

  await prisma.transaction.createMany({
    data: transactions,
  });

  console.log(`✅ ${transactions.length} novas transações criadas em 2025`);

  // Calcular totais por cartão
  const nubankTransactions = transactions.filter((t) => t.cardId === nubank.id);
  const interTransactions = transactions.filter((t) => t.cardId === inter.id);

  const totalNubank = nubankTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalInter = interTransactions.reduce((sum, t) => sum + t.amount, 0);

  console.log("\n📊 Resumo:");
  console.log(
    `💳 Nubank (${nubankTransactions.length} transações): R$ ${totalNubank.toFixed(
      2
    )} de R$ ${nubank.limit.toFixed(2)}`
  );
  console.log(
    `💳 Inter (${interTransactions.length} transações): R$ ${totalInter.toFixed(
      2
    )} de R$ ${inter.limit.toFixed(2)}`
  );

  console.log("\n✨ Transações atualizadas com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
