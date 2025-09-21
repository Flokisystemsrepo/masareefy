-- AlterTable
ALTER TABLE "plans" ALTER COLUMN "trialDays" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "downgradedAt" TIMESTAMP(3),
ADD COLUMN     "isTrialActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trialNotificationSent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "trial_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trial_notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trial_notifications" ADD CONSTRAINT "trial_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
