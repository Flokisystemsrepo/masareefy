/*
  Warnings:

  - You are about to drop the column `cost` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `stockQuantity` on the `inventory` table. All the data in the column will be lost.
  - Added the required column `baseSku` to the `inventory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "inventory" DROP COLUMN "cost",
DROP COLUMN "price",
DROP COLUMN "sku",
DROP COLUMN "stockQuantity",
ADD COLUMN     "baseSku" TEXT NOT NULL,
ADD COLUMN     "colors" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "currentStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "reorderLevel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sizes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "supplier" TEXT,
ADD COLUMN     "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'in-stock';
