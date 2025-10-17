-- Migration: Add installment fields
-- Add installmentNumber to transactions table
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "installmentNumber" INTEGER;

-- Add paymentMethod to installment_purchases table
ALTER TABLE "installment_purchases" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT NOT NULL DEFAULT 'CREDIT';

-- Create index if not exists (optional, for better performance)
CREATE INDEX IF NOT EXISTS "transactions_installmentPurchaseId_idx" ON "transactions"("installmentPurchaseId");
