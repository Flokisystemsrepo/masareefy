/*
  Warnings:

  - A unique constraint covering the columns `[sourcePayableId]` on the table `costs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[convertedCostId]` on the table `payables` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[convertedRevenueId]` on the table `receivables` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sourceReceivableId]` on the table `revenues` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "costs" ADD COLUMN     "sourcePayableId" TEXT;

-- AlterTable
ALTER TABLE "payables" ADD COLUMN     "convertedCostId" TEXT;

-- AlterTable
ALTER TABLE "receivables" ADD COLUMN     "convertedRevenueId" TEXT;

-- AlterTable
ALTER TABLE "revenues" ADD COLUMN     "sourceReceivableId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "costs_sourcePayableId_key" ON "costs"("sourcePayableId");

-- CreateIndex
CREATE UNIQUE INDEX "payables_convertedCostId_key" ON "payables"("convertedCostId");

-- CreateIndex
CREATE UNIQUE INDEX "receivables_convertedRevenueId_key" ON "receivables"("convertedRevenueId");

-- CreateIndex
CREATE UNIQUE INDEX "revenues_sourceReceivableId_key" ON "revenues"("sourceReceivableId");
