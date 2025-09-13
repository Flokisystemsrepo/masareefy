-- AlterTable
ALTER TABLE "transfers" ADD COLUMN     "deductFromStock" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inventoryItemId" TEXT;
