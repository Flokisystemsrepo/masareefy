-- AlterTable
ALTER TABLE "revenues" ADD COLUMN     "bostaImportId" TEXT,
ADD COLUMN     "bostaShipmentId" TEXT;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_bostaImportId_fkey" FOREIGN KEY ("bostaImportId") REFERENCES "bosta_imports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_bostaShipmentId_fkey" FOREIGN KEY ("bostaShipmentId") REFERENCES "bosta_shipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
