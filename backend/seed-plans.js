const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedPlans() {
    try {
        console.log("🌱 Seeding subscription plans...");

        // Create subscription plans
        const plans = [{
                name: "Free",
                priceMonthly: 0,
                priceYearly: 0,
                features: {
                    features: [
                        "Dashboard stat cards only",
                        "Revenue & Cost tracking",
                        "Basic financial reports",
                        "Settings access",
                        "Email support",
                    ],
                    limits: {
                        brands: 1,
                        users: 1,
                        transactions: 100,
                        inventoryItems: 0,
                        teamMembers: 0,
                        wallets: 0,
                    },
                    lockedFeatures: [
                        "Team management",
                        "Inventory management",
                        "Project targets",
                        "Wallet management",
                        "Transfers",
                        "Receivables & Payables",
                        "Tasks management",
                        "Reports",
                        "Shopify integration",
                        "Bosta integration",
                        "Business insights",
                        "Advanced analytics",
                    ],
                },
                maxBrands: 1,
                maxUsers: 1,
                trialDays: 0,
                isActive: true,
            },
            {
                name: "Starter",
                priceMonthly: 299,
                priceYearly: 2990, // 299 * 10 (20% discount)
                features: {
                    features: [
                        "Revenue & Cost tracking",
                        "Inventory management (100 items)",
                        "Team management (2 members)",
                        "Wallet management (2 wallets)",
                        "Basic reports & branding",
                        "Email support",
                    ],
                    limits: {
                        brands: 1,
                        users: 2,
                        transactions: -1, // unlimited
                        inventoryItems: 100,
                        teamMembers: 2,
                        wallets: 2,
                    },
                    lockedFeatures: [
                        "Shopify integration",
                        "Bosta integration",
                        "Business insights",
                        "Advanced analytics",
                    ],
                },
                maxBrands: 1,
                maxUsers: 2,
                trialDays: 7,
                isActive: true,
            },
            {
                name: "Professional",
                priceMonthly: 499,
                priceYearly: 4990, // 499 * 10 (20% discount)
                features: {
                    features: [
                        "Everything in Starter",
                        "Unlimited inventory items",
                        "Unlimited team members",
                        "Unlimited wallets",
                        "Shopify integration",
                        "Bosta integration",
                        "Business insights & analytics",
                        "Priority support",
                    ],
                    limits: {
                        brands: 1,
                        users: -1, // unlimited
                        transactions: -1, // unlimited
                        inventoryItems: -1, // unlimited
                        teamMembers: -1, // unlimited
                        wallets: -1, // unlimited
                    },
                    integrations: ["shopify", "bosta"],
                },
                maxBrands: 1,
                maxUsers: -1, // unlimited
                trialDays: 14,
                isActive: true,
            },
        ];

        // Get or create the Free plan first
        let freePlan = await prisma.plan.findFirst({
            where: { name: "Free" },
        });

        if (!freePlan) {
            freePlan = await prisma.plan.create({
                data: plans[0], // Free plan
            });
            console.log("✅ Created Free plan");
        }

        // Get all existing plans
        const existingPlans = await prisma.plan.findMany();

        // Update all subscriptions to use Free plan
        await prisma.subscription.updateMany({
            data: {
                planId: freePlan.id,
            },
        });

        console.log("✅ Updated all subscriptions to use Free plan");

        // Delete old plans (except Free)
        await prisma.plan.deleteMany({
            where: {
                id: { not: freePlan.id },
            },
        });

        // Create new plans (skip Free if it already exists)
        for (const plan of plans) {
            if (plan.name === "Free" && freePlan) {
                console.log(`✅ Free plan already exists`);
                continue;
            }

            const createdPlan = await prisma.plan.create({
                data: plan,
            });
            console.log(
                `✅ Created plan: ${createdPlan.name} ($${createdPlan.priceMonthly}/month)`
            );
        }

        console.log("🎉 All plans seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding plans:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedPlans();