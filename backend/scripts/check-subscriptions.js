const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkAndDowngradeSubscriptions() {
    try {
        console.log("🔍 Checking for expired subscriptions...");

        const now = new Date();

        // Find all active subscriptions that have expired
        const expiredSubscriptions = await prisma.subscription.findMany({
            where: {
                status: { in: ["active", "trialing"] },
                OR: [{
                        currentPeriodEnd: {
                            lt: now,
                        },
                    },
                    {
                        trialEnd: {
                            lt: now,
                        },
                        status: "trialing",
                    },
                ],
            },
            include: {
                plan: true,
                user: true,
            },
        });

        console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);

        if (expiredSubscriptions.length === 0) {
            console.log("✅ No expired subscriptions found");
            return;
        }

        // Get the free plan
        const freePlan = await prisma.plan.findFirst({
            where: { name: "Free" },
        });

        if (!freePlan) {
            console.error("❌ Free plan not found");
            return;
        }

        // Downgrade expired subscriptions to free plan
        for (const subscription of expiredSubscriptions) {
            try {
                console.log(
                    `🔄 Downgrading subscription ${subscription.id} for user ${subscription.user.email}`
                );

                // Update subscription to free plan
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        planId: freePlan.id,
                        status: "active",
                        currentPeriodStart: now,
                        currentPeriodEnd: new Date(
                            now.getTime() + 365 * 24 * 60 * 60 * 1000
                        ), // 1 year
                        paymentMethod: "free",
                        cancelAtPeriodEnd: false,
                        cancelledAt: null,
                    },
                });

                console.log(
                    `✅ Successfully downgraded subscription ${subscription.id}`
                );

                // Create a record of the downgrade (optional)
                await prisma.auditLog.create({
                    data: {
                        userId: subscription.user.id,
                        brandId: subscription.user.brandId,
                        action: "subscription_downgraded",
                        details: {
                            reason: "automatic_expiration",
                            fromPlan: subscription.plan.name,
                            toPlan: "Free",
                            expiredAt: now,
                        },
                        ipAddress: "system",
                        userAgent: "subscription-checker",
                    },
                });
            } catch (error) {
                console.error(
                    `❌ Failed to downgrade subscription ${subscription.id}:`,
                    error
                );
            }
        }

        console.log("🎉 Subscription check completed");
    } catch (error) {
        console.error("❌ Error checking subscriptions:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the check
checkAndDowngradeSubscriptions();

// Export for use in other scripts
module.exports = { checkAndDowngradeSubscriptions };