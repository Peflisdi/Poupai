import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Criando dados de teste...");

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email: "demo@finacassss.app" },
  });

  if (!user) {
    console.error("❌ Usuário não encontrado. Execute o seed primeiro.");
    return;
  }

  console.log(`✅ Usuário encontrado: ${user.email}`);

  // Buscar categorias
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
  });

  if (categories.length === 0) {
    console.error("❌ Nenhuma categoria encontrada. Execute o seed primeiro.");
    return;
  }

  console.log(`✅ ${categories.length} categorias encontradas`);

  // Criar cartão de teste
  console.log("💳 Criando cartão de teste...");
  const card = await prisma.card.create({
    data: {
      userId: user.id,
      name: "Nubank",
      nickname: "Roxinho",
      limit: 5000,
      closingDay: 10,
      dueDay: 17,
      color: "#8A05BE",
    },
  });

  console.log(`✅ Cartão criado: ${card.name}`);

  // Criar outro cartão
  const card2 = await prisma.card.create({
    data: {
      userId: user.id,
      name: "Inter",
      nickname: "Laranjinha",
      limit: 3000,
      closingDay: 15,
      dueDay: 22,
      color: "#FF7A00",
    },
  });

  console.log(`✅ Cartão criado: ${card2.name}`);

  // Criar transações para o primeiro cartão (Nubank)
  console.log("💸 Criando transações para Nubank...");

  const alimentacao = categories.find((c) => c.name === "Alimentação");
  const transporte = categories.find((c) => c.name === "Transporte");
  const lazer = categories.find((c) => c.name === "Lazer");
  const compras = categories.find((c) => c.name === "Compras");
  const saude = categories.find((c) => c.name === "Saúde");

  const transactions = [
    // Outubro 2025 - Nubank
    {
      userId: user.id,
      cardId: card.id,
      categoryId: alimentacao?.id,
      type: "EXPENSE",
      amount: 150.5,
      description: "Supermercado Extra",
      date: new Date("2024-10-05"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: card.id,
      categoryId: alimentacao?.id,
      type: "EXPENSE",
      amount: 89.9,
      description: "iFood - Jantar",
      date: new Date("2024-10-08"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: card.id,
      categoryId: transporte?.id,
      type: "EXPENSE",
      amount: 120.0,
      description: "Uber - Semana",
      date: new Date("2024-10-09"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: card.id,
      categoryId: lazer?.id,
      type: "EXPENSE",
      amount: 79.9,
      description: "Cinema - Ingresso",
      date: new Date("2024-10-12"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: card.id,
      categoryId: compras?.id,
      type: "EXPENSE",
      amount: 250.0,
      description: "Zara - Roupa",
      date: new Date("2024-10-14"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: card.id,
      categoryId: alimentacao?.id,
      type: "EXPENSE",
      amount: 65.4,
      description: "Restaurante",
      date: new Date("2024-10-15"),
      paymentMethod: "CREDIT",
    },

    // Novembro 2025 - Nubank
    {
      userId: user.id,
      cardId: card.id,
      categoryId: alimentacao?.id,
      type: "EXPENSE",
      amount: 320.0,
      description: "Supermercado Carrefour",
      date: new Date("2024-11-02"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: card.id,
      categoryId: saude?.id,
      type: "EXPENSE",
      amount: 180.0,
      description: "Farmácia - Remédios",
      date: new Date("2024-11-05"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: card.id,
      categoryId: lazer?.id,
      type: "EXPENSE",
      amount: 150.0,
      description: "Show - Ingresso",
      date: new Date("2024-11-08"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: card.id,
      categoryId: compras?.id,
      type: "EXPENSE",
      amount: 499.9,
      description: "Amazon - Eletrônicos",
      date: new Date("2024-11-10"),
      paymentMethod: "CREDIT",
    },

    // Inter - Outubro
    {
      userId: user.id,
      cardId: card2.id,
      categoryId: transporte?.id,
      type: "EXPENSE",
      amount: 200.0,
      description: "Combustível",
      date: new Date("2024-10-06"),
      paymentMethod: "CREDIT",
    },
    {
      userId: user.id,
      cardId: card2.id,
      categoryId: alimentacao?.id,
      type: "EXPENSE",
      amount: 180.0,
      description: "Padaria - Compras do mês",
      date: new Date("2024-10-11"),
      paymentMethod: "CREDIT",
    },
  ];

  await prisma.transaction.createMany({
    data: transactions,
  });

  console.log(`✅ ${transactions.length} transações criadas`);

  // Estatísticas
  const totalNubank = transactions
    .filter((t) => t.cardId === card.id)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInter = transactions
    .filter((t) => t.cardId === card2.id)
    .reduce((sum, t) => sum + t.amount, 0);

  console.log("\n📊 Resumo:");
  console.log(`💳 Nubank: R$ ${totalNubank.toFixed(2)} de R$ ${card.limit.toFixed(2)}`);
  console.log(`💳 Inter: R$ ${totalInter.toFixed(2)} de R$ ${card2.limit.toFixed(2)}`);

  console.log("\n✨ Dados de teste criados com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
