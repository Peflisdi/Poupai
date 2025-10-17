import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  const transactions = await prisma.transaction.findMany({
    include: {
      card: true,
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  console.log(`\n📊 Total de transações: ${transactions.length}\n`);

  const withCard = transactions.filter((t) => t.cardId);
  const withoutCard = transactions.filter((t) => !t.cardId);

  console.log(`💳 Com cartão: ${withCard.length}`);
  console.log(`💵 Sem cartão: ${withoutCard.length}\n`);

  if (withCard.length > 0) {
    console.log("Transações com cartão:");
    withCard.forEach((t) => {
      console.log(
        `  - ${t.date.toLocaleDateString("pt-BR")}: ${t.description} | ${t.card?.name} | R$ ${
          t.amount
        }`
      );
    });
  }

  await prisma.$disconnect();
}

check();
