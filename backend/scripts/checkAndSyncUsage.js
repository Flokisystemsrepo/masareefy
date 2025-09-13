const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkAndSyncUsage() {
    try {
        console.log("🔍 Checking usage data...");

        // Get the user
        const user = await prisma.user.findFirst({
            where: { email: "ziz@gmail.com" },
            include: { brands: true },
        });

        if (!user) {
            console.log("❌ User not found");
            return;
        }

        console.log("✅ User found:", user.email);
        console.log("📧 User ID:", user.id);

        // Get the user's brand
        const brand = user.brands && user.brands.length > 0 ? user.brands[0] : null;
        if (!brand) {
            console.log("❌ User has no brand");
            return;
        }

        console.log("🏢 Brand ID:", brand.id);
        console.log("🏢 Brand Name:", brand.name);

        // Count actual inventory items
        const inventoryCount = await prisma.inventory.count({
            where: { brandId: brand.id },
        });
        console.log("📦 Actual inventory count:", inventoryCount);

        // Get current usage tracking
        const usage = await prisma.usageTracking.findUnique({
            where: {
                userId_brandId_resourceType: {
                    userId: user.id,
                    brandId: brand.id,
                    resourceType: "inventory",
                },
            },
        });

        console.log("📊 Current usage tracking:", usage);

        if (!usage || usage.currentCount !== inventoryCount) {
            console.log("🔄 Syncing usage data...");

            // Sync the usage
            const syncedUsage = await prisma.usageTracking.upsert({
                where: {
                    userId_brandId_resourceType: {
                        userId: user.id,
                        brandId: brand.id,
                        resourceType: "inventory",
                    },
                },
                update: {
                    currentCount: inventoryCount,
                    lastUpdated: new Date(),
                },
                create: {
                    userId: user.id,
                    brandId: brand.id,
                    resourceType: "inventory",
                    currentCount: inventoryCount,
                    lastUpdated: new Date(),
                },
            });

            console.log("✅ Synced usage:", syncedUsage);
        } else {
            console.log("✅ Usage data is already in sync");
        }

        // Also check team members and wallets
        const teamCount = await prisma.brandUser.count({
            where: { brandId: brand.id },
        });
        console.log("👥 Team members count:", teamCount);

        const walletCount = await prisma.wallet.count({
            where: { brandId: brand.id },
        });
        console.log("💰 Wallets count:", walletCount);
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndSyncUsage();