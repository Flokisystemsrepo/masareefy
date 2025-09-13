-- CreateTable
CREATE TABLE "bosta_integrations" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "webhookSecret" TEXT,
    "webhookUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "syncFrequency" INTEGER NOT NULL DEFAULT 30,
    "autoCreateRevenue" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bosta_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bosta_shipments" (
    "id" TEXT NOT NULL,
    "bostaIntegrationId" TEXT NOT NULL,
    "bostaId" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "codAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deliveryFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "businessReference" TEXT,
    "notes" TEXT,
    "address" JSONB NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "returnReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bostaCreatedAt" TIMESTAMP(3) NOT NULL,
    "bostaUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bosta_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bosta_tracking_events" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bosta_tracking_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bosta_webhook_events" (
    "id" TEXT NOT NULL,
    "bostaIntegrationId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bosta_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bosta_integrations_brandId_key" ON "bosta_integrations"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "bosta_shipments_bostaId_key" ON "bosta_shipments"("bostaId");

-- CreateIndex
CREATE UNIQUE INDEX "bosta_shipments_trackingNumber_key" ON "bosta_shipments"("trackingNumber");

-- AddForeignKey
ALTER TABLE "bosta_integrations" ADD CONSTRAINT "bosta_integrations_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bosta_shipments" ADD CONSTRAINT "bosta_shipments_bostaIntegrationId_fkey" FOREIGN KEY ("bostaIntegrationId") REFERENCES "bosta_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bosta_tracking_events" ADD CONSTRAINT "bosta_tracking_events_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "bosta_shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bosta_webhook_events" ADD CONSTRAINT "bosta_webhook_events_bostaIntegrationId_fkey" FOREIGN KEY ("bostaIntegrationId") REFERENCES "bosta_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
