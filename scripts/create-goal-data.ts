import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Buscar primeiro usuário
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error("❌ Usuário não encontrado");
    return;
  }

  console.log(`👤 Criando metas para ${user.name}...`);

  // Deletar metas antigas do usuário
  await prisma.goalDeposit.deleteMany({
    where: { goal: { userId: user.id } },
  });
  await prisma.goal.deleteMany({
    where: { userId: user.id },
  });

  console.log("🗑️  Metas antigas deletadas");

  // Meta 1: Casa própria (em progresso, sem prazo)
  const goal1 = await prisma.goal.create({
    data: {
      userId: user.id,
      name: "Casa Própria",
      targetAmount: 500000,
      currentAmount: 125000,
      icon: "🏠",
      color: "#3B82F6",
      deposits: {
        create: [
          {
            amount: 50000,
            note: "Economia inicial",
            createdAt: new Date("2024-01-15"),
          },
          {
            amount: 25000,
            note: "Bônus de fim de ano",
            createdAt: new Date("2024-06-20"),
          },
          {
            amount: 30000,
            note: "Venda do carro antigo",
            createdAt: new Date("2024-09-10"),
          },
          {
            amount: 20000,
            note: "Poupança mensal acumulada",
            createdAt: new Date("2024-11-25"),
          },
        ],
      },
    },
  });

  // Meta 2: Viagem Internacional (em progresso, com prazo próximo)
  const deadline2 = new Date();
  deadline2.setDate(deadline2.getDate() + 45); // 45 dias no futuro

  const goal2 = await prisma.goal.create({
    data: {
      userId: user.id,
      name: "Viagem para Europa",
      targetAmount: 25000,
      currentAmount: 18500,
      deadline: deadline2,
      icon: "✈️",
      color: "#06B6D4",
      deposits: {
        create: [
          {
            amount: 8000,
            note: "Economia do primeiro trimestre",
            createdAt: new Date("2024-10-05"),
          },
          {
            amount: 5500,
            note: "Venda de itens usados",
            createdAt: new Date("2024-11-12"),
          },
          {
            amount: 5000,
            note: "Freelance extra",
            createdAt: new Date("2024-12-18"),
          },
        ],
      },
    },
  });

  // Meta 3: Fundo de Emergência (concluída)
  const goal3 = await prisma.goal.create({
    data: {
      userId: user.id,
      name: "Fundo de Emergência",
      targetAmount: 30000,
      currentAmount: 30000,
      icon: "💰",
      color: "#22C55E",
      deposits: {
        create: [
          {
            amount: 5000,
            note: "Primeiro depósito",
            createdAt: new Date("2024-07-01"),
          },
          {
            amount: 5000,
            note: "Depósito mensal",
            createdAt: new Date("2024-08-01"),
          },
          {
            amount: 5000,
            note: "Depósito mensal",
            createdAt: new Date("2024-09-01"),
          },
          {
            amount: 5000,
            note: "Depósito mensal",
            createdAt: new Date("2024-10-01"),
          },
          {
            amount: 5000,
            note: "Depósito mensal",
            createdAt: new Date("2024-11-01"),
          },
          {
            amount: 5000,
            note: "Depósito final",
            createdAt: new Date("2024-12-01"),
          },
        ],
      },
    },
  });

  // Meta 4: Carro Novo (início recente, com prazo distante)
  const deadline4 = new Date();
  deadline4.setDate(deadline4.getDate() + 180); // 6 meses no futuro

  const goal4 = await prisma.goal.create({
    data: {
      userId: user.id,
      name: "Carro Zero",
      targetAmount: 120000,
      currentAmount: 15000,
      deadline: deadline4,
      icon: "🚗",
      color: "#EF4444",
      deposits: {
        create: [
          {
            amount: 10000,
            note: "Entrada inicial",
            createdAt: new Date("2024-12-05"),
          },
          {
            amount: 5000,
            note: "Primeira parcela da poupança",
            createdAt: new Date("2025-01-05"),
          },
        ],
      },
    },
  });

  // Meta 5: Notebook Novo (sem prazo, pouco progresso)
  const goal5 = await prisma.goal.create({
    data: {
      userId: user.id,
      name: "Notebook Pro",
      targetAmount: 8000,
      currentAmount: 1200,
      icon: "💻",
      color: "#8B5CF6",
      deposits: {
        create: [
          {
            amount: 1200,
            note: "Primeira economia",
            createdAt: new Date("2025-01-10"),
          },
        ],
      },
    },
  });

  // Meta 6: Casamento (atrasada - prazo vencido)
  const deadline6 = new Date();
  deadline6.setDate(deadline6.getDate() - 30); // 30 dias no passado

  const goal6 = await prisma.goal.create({
    data: {
      userId: user.id,
      name: "Festa de Casamento",
      targetAmount: 50000,
      currentAmount: 32000,
      deadline: deadline6,
      icon: "💍",
      color: "#EC4899",
      deposits: {
        create: [
          {
            amount: 10000,
            note: "Economia inicial",
            createdAt: new Date("2024-06-15"),
          },
          {
            amount: 12000,
            note: "Contribuição da família",
            createdAt: new Date("2024-09-20"),
          },
          {
            amount: 10000,
            note: "Bônus de trabalho",
            createdAt: new Date("2024-11-10"),
          },
        ],
      },
    },
  });

  console.log("✅ 6 metas criadas com sucesso:");
  console.log(
    `   1. ${goal1.name} - R$ ${goal1.currentAmount.toLocaleString(
      "pt-BR"
    )} / R$ ${goal1.targetAmount.toLocaleString("pt-BR")} (sem prazo)`
  );
  console.log(
    `   2. ${goal2.name} - R$ ${goal2.currentAmount.toLocaleString(
      "pt-BR"
    )} / R$ ${goal2.targetAmount.toLocaleString("pt-BR")} (prazo em 45 dias)`
  );
  console.log(
    `   3. ${goal3.name} - R$ ${goal3.currentAmount.toLocaleString(
      "pt-BR"
    )} / R$ ${goal3.targetAmount.toLocaleString("pt-BR")} (✅ CONCLUÍDA)`
  );
  console.log(
    `   4. ${goal4.name} - R$ ${goal4.currentAmount.toLocaleString(
      "pt-BR"
    )} / R$ ${goal4.targetAmount.toLocaleString("pt-BR")} (prazo em 6 meses)`
  );
  console.log(
    `   5. ${goal5.name} - R$ ${goal5.currentAmount.toLocaleString(
      "pt-BR"
    )} / R$ ${goal5.targetAmount.toLocaleString("pt-BR")} (sem prazo)`
  );
  console.log(
    `   6. ${goal6.name} - R$ ${goal6.currentAmount.toLocaleString(
      "pt-BR"
    )} / R$ ${goal6.targetAmount.toLocaleString("pt-BR")} (❌ ATRASADA)`
  );
}

main()
  .catch((e) => {
    console.error("❌ Erro ao criar metas:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
