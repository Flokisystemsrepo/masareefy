const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function syncUsageForUser() {
    try {
        console.log("🔄 Syncing usage tracking for specific user...");

        // Get the user from command line argument or use the one from logs
        const userEmail = process.argv[2] || "ziz@gmail.com";
        const brandId = process.argv[3] || "cmfb4v2en0003zl8n346klzlu";

        console.log(`👤 Syncing usage for user: ${userEmail}, brand: ${brandId}`);

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            include: {
                subscriptions: {
                    where: { status: "active" },
                    include: { plan: true },
                },
            },
        });

        if (!user) {
            console.log(`❌ User ${userEmail} not found`);
            return;
        }

        const activeSubscription = user.subscriptions[0];
        if (!activeSubscription) {
            console.log(`❌ No active subscription for ${userEmail}`);
            return;
        }

        console.log(`✅ Active subscription: ${activeSubscription.plan.name}`);

        const planFeatures = activeSubscription.plan.features;
        const limits = planFeatures.limits || {};
        console.log(`📊 Plan limits:`, limits);

        // Sync each resource type
        const resourceTypes = [
            "inventory",
            "team_members",
            "wallets",
            "transactions",
        ];

        // Map resource types to plan limit field names
        const limitFieldMap = {
            inventory: "inventoryItems",
            team_members: "teamMembers",
            wallets: "wallets",
            transactions: "transactions",
        };

        for (const resourceType of resourceTypes) {
            const limitField = limitFieldMap[resourceType] || resourceType;
            const limit = limits[limitField] || -1;

            // Count current usage
            let currentCount = 0;

            switch (resourceType) {
                case "inventory":
                    currentCount = await prisma.inventory.count({
                        where: { brandId: brandId },
                    });
                    break;
                case "team_members":
                    currentCount = await prisma.brandUser.count({
                        where: { brandId: brandId },
                    });
                    break;
                case "wallets":
                    currentCount = await prisma.wallet.count({
                        where: { brandId: brandId },
                    });
                    break;
                case "transactions":
                    currentCount = await prisma.walletTransaction.count({
                        where: {
                            OR: [
                                { fromWallet: { brandId: brandId } },
                                { toWallet: { brandId: brandId } },
                            ],
                        },
                    });
                    break;
            }

            // Update or create usage tracking record
            await prisma.usageTracking.upsert({
                where: {
                    userId_brandId_resourceType: {
                        userId: user.id,
                        brandId: brandId,
                        resourceType: resourceType,
                    },
                },
                update: {
                    currentCount: currentCount,
                    limit: limit,
                    lastUpdated: new Date(),
                },
                create: {
                    userId: user.id,
                    brandId: brandId,
                    resourceType: resourceType,
                    currentCount: currentCount,
                    limit: limit,
                },
            });

            console.log(
                `  ✅ Synced ${resourceType}: ${currentCount}/${
          limit === -1 ? "unlimited" : limit
        }`
            );
        }

        console.log("\n🎉 Usage tracking sync completed!");
    } catch (error) {
        console.error("❌ Error syncing usage tracking:", error);
    } finally {
        await prisma.$disconnect();
    }
}

syncUsageForUser();