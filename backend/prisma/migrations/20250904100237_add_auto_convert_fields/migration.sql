-- AlterTable
ALTER TABLE "payables" ADD COLUMN     "autoConvertToCost" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "receivables" ADD COLUMN     "autoConvertToRevenue" BOOLEAN NOT NULL DEFAULT false;
