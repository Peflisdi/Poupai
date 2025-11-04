-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "billMonth" TEXT;

-- CreateIndex
CREATE INDEX "transactions_cardId_billMonth_idx" ON "transactions"("cardId", "billMonth");
