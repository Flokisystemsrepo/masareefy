const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function syncAllUsage() {
    try {
        console.log("🔍 Syncing all usage data...");

        // Get the user
        const user = await prisma.user.findFirst({
            where: { email: "ziz@gmail.com" },
            include: { brands: true },
        });

        if (!user) {
            console.log("❌ User not found");
            return;
        }

        const brand = user.brands && user.brands.length > 0 ? user.brands[0] : null;
        if (!brand) {
            console.log("❌ User has no brand");
            return;
        }

        console.log("✅ User:", user.email);
        console.log("🏢 Brand:", brand.name);

        // Sync inventory usage
        const inventoryCount = await prisma.inventory.count({
            where: { brandId: brand.id },
        });

        await prisma.usageTracking.upsert({
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

        console.log("✅ Synced inventory usage:", inventoryCount);

        // Sync team members usage
        const teamCount = await prisma.brandUser.count({
            where: { brandId: brand.id },
        });

        await prisma.usageTracking.upsert({
            where: {
                userId_brandId_resourceType: {
                    userId: user.id,
                    brandId: brand.id,
                    resourceType: "team_members",
                },
            },
            update: {
                currentCount: teamCount,
                lastUpdated: new Date(),
            },
            create: {
                userId: user.id,
                brandId: brand.id,
                resourceType: "team_members",
                currentCount: teamCount,
                lastUpdated: new Date(),
            },
        });

        console.log("✅ Synced team members usage:", teamCount);

        // Sync wallets usage
        const walletCount = await prisma.wallet.count({
            where: { brandId: brand.id },
        });

        await prisma.usageTracking.upsert({
            where: {
                userId_brandId_resourceType: {
                    userId: user.id,
                    brandId: brand.id,
                    resourceType: "wallets",
                },
            },
            update: {
                currentCount: walletCount,
                lastUpdated: new Date(),
            },
            create: {
                userId: user.id,
                brandId: brand.id,
                resourceType: "wallets",
                currentCount: walletCount,
                lastUpdated: new Date(),
            },
        });

        console.log("✅ Synced wallets usage:", walletCount);

        console.log("🎉 All usage data synced successfully!");
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

syncAllUsage();