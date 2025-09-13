-- AlterTable
ALTER TABLE "wallet_transactions" ADD COLUMN     "category" TEXT,
ADD COLUMN     "countAsCost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "countAsRevenue" BOOLEAN NOT NULL DEFAULT false;
