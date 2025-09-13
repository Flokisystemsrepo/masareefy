/*
  Warnings:

  - You are about to drop the column `address` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `bostaCreatedAt` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `bostaId` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `bostaIntegrationId` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `bostaUpdatedAt` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `customerEmail` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhone` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryFees` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `returnReason` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `returnedAt` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the column `totalFees` on the `bosta_shipments` table. All the data in the column will be lost.
  - You are about to drop the `bosta_integrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bosta_tracking_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bosta_webhook_events` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bostaImportId` to the `bosta_shipments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryState` to the `bosta_shipments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bosta_integrations" DROP CONSTRAINT "bosta_integrations_brandId_fkey";

-- DropForeignKey
ALTER TABLE "bosta_shipments" DROP CONSTRAINT "bosta_shipments_bostaIntegrationId_fkey";

-- DropForeignKey
ALTER TABLE "bosta_tracking_events" DROP CONSTRAINT "bosta_tracking_events_shipmentId_fkey";

-- DropForeignKey
ALTER TABLE "bosta_webhook_events" DROP CONSTRAINT "bosta_webhook_events_bostaIntegrationId_fkey";

-- DropIndex
DROP INDEX "bosta_shipments_bostaId_key";

-- DropIndex
DROP INDEX "bosta_shipments_trackingNumber_key";

-- AlterTable
ALTER TABLE "bosta_shipments" DROP COLUMN "address",
DROP COLUMN "bostaCreatedAt",
DROP COLUMN "bostaId",
DROP COLUMN "bostaIntegrationId",
DROP COLUMN "bostaUpdatedAt",
DROP COLUMN "customerEmail",
DROP COLUMN "customerName",
DROP COLUMN "customerPhone",
DROP COLUMN "deliveryFees",
DROP COLUMN "notes",
DROP COLUMN "returnReason",
DROP COLUMN "returnedAt",
DROP COLUMN "status",
DROP COLUMN "totalFees",
ADD COLUMN     "bostaImportId" TEXT NOT NULL,
ADD COLUMN     "consigneeName" TEXT,
ADD COLUMN     "consigneePhone" TEXT,
ADD COLUMN     "deliveryState" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "dropOffCity" TEXT,
ADD COLUMN     "dropOffFirstLine" TEXT,
ADD COLUMN     "expectedDeliveryDate" TIMESTAMP(3),
ADD COLUMN     "isDelivered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isReturned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "numberOfAttempts" INTEGER,
ADD COLUMN     "originalCreatedAt" TIMESTAMP(3),
ADD COLUMN     "originalUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "revenueCreated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "type" TEXT;

-- DropTable
DROP TABLE "bosta_integrations";

-- DropTable
DROP TABLE "bosta_tracking_events";

-- DropTable
DROP TABLE "bosta_webhook_events";

-- CreateTable
CREATE TABLE "bosta_imports" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalOrders" INTEGER NOT NULL,
    "expectedCash" DOUBLE PRECISION NOT NULL,
    "delivered" INTEGER NOT NULL,
    "returned" INTEGER NOT NULL,
    "returnRate" DOUBLE PRECISION NOT NULL,
    "deliveryRate" DOUBLE PRECISION NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bosta_imports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bosta_imports" ADD CONSTRAINT "bosta_imports_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bosta_shipments" ADD CONSTRAINT "bosta_shipments_bostaImportId_fkey" FOREIGN KEY ("bostaImportId") REFERENCES "bosta_imports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
