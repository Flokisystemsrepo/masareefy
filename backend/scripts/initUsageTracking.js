const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function initUsageTracking() {
    try {
        console.log("🔍 Initializing usage tracking for all users...");

        // Get all users with their brands and subscriptions
        const users = await prisma.user.findMany({
            include: {
                brands: true,
                subscriptions: {
                    where: {
                        status: "active",
                    },
                    include: {
                        plan: true,
                    },
                },
            },
        });

        console.log(`Found ${users.length} users`);

        for (const user of users) {
            console.log(`\n👤 Processing user: ${user.email}`);

            // Get user's active subscription
            const activeSubscription = user.subscriptions[0];

            if (!activeSubscription) {
                console.log(`❌ No active subscription for ${user.email}`);
                continue;
            }

            console.log(`✅ Active subscription: ${activeSubscription.plan.name}`);

            // Get plan features and limits
            const planFeatures = activeSubscription.plan.features;
            const limits = planFeatures.limits || {};

            console.log(`📊 Plan limits:`, limits);

            // Process each brand for this user
            for (const brand of user.brands) {
                console.log(`🏢 Processing brand: ${brand.name}`);

                // Initialize usage tracking for each resource type
                const resourceTypes = [
                    "inventory",
                    "team_members",
                    "wallets",
                    "transactions",
                ];

                for (const resourceType of resourceTypes) {
                    const limit = limits[resourceType] || -1;

                    // Check if usage tracking already exists
                    const existingUsage = await prisma.usageTracking.findUnique({
                        where: {
                            userId_brandId_resourceType: {
                                userId: user.id,
                                brandId: brand.id,
                                resourceType: resourceType,
                            },
                        },
                    });

                    if (existingUsage) {
                        console.log(
                            `  ✅ Usage tracking already exists for ${resourceType}`
                        );
                        continue;
                    }

                    // Count current usage
                    let currentCount = 0;

                    switch (resourceType) {
                        case "inventory":
                            currentCount = await prisma.inventory.count({
                                where: { brandId: brand.id },
                            });
                            break;
                        case "team_members":
                            currentCount = await prisma.brandUser.count({
                                where: { brandId: brand.id },
                            });
                            break;
                        case "wallets":
                            currentCount = await prisma.wallet.count({
                                where: { brandId: brand.id },
                            });
                            break;
                        case "transactions":
                            currentCount = await prisma.walletTransaction.count({
                                where: {
                                    OR: [
                                        { fromWallet: { brandId: brand.id } },
                                        { toWallet: { brandId: brand.id } },
                                    ],
                                },
                            });
                            break;
                    }

                    // Create usage tracking record
                    await prisma.usageTracking.create({
                        data: {
                            userId: user.id,
                            brandId: brand.id,
                            resourceType: resourceType,
                            currentCount: currentCount,
                            limit: limit,
                        },
                    });

                    console.log(
                        `  ✅ Created usage tracking for ${resourceType}: ${currentCount}/${
              limit === -1 ? "unlimited" : limit
            }`
                    );
                }
            }
        }

        console.log("\n🎉 Usage tracking initialization completed!");
    } catch (error) {
        console.error("❌ Error initializing usage tracking:", error);
    } finally {
        await prisma.$disconnect();
    }
}

initUsageTracking();