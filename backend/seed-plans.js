const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedPlans() {
  try {
    console.log("🌱 Seeding subscription plans...");

    // Create subscription plans
    const plans = [
      {
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
            "1 Wallet",
            "20 Inventory items",
          ],
          limits: {
            brands: 1,
            users: 1,
            transactions: -1, // unlimited
            inventoryItems: 20,
            teamMembers: 1,
            wallets: 1,
          },
          lockedFeatures: [
            "Team management",
            "Project targets",
            "Transfers",
            "Receivables & Payables",
            "Tasks management",
            "Reports",
            "Shopify integration",
            "Bosta integration",
            "Shipblu integration",
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
        name: "Growth",
        priceMonthly: 299,
        priceYearly: 2990, // 299 * 10 (20% discount)
        features: {
          features: [
            "Everything in Free",
            "Receivables & Payables",
            "Transfers",
            "Team collaboration",
            "Advanced reporting",
            "Tasks & support tickets",
            "5 Wallets",
            "300 Inventory items",
            "Shopify integration",
            "Bosta integration",
            "Shipblu integration",
            "Standard support",
          ],
          limits: {
            brands: 1,
            users: -1, // unlimited
            transactions: -1, // unlimited
            inventoryItems: 300,
            teamMembers: -1, // unlimited
            wallets: 5,
          },
          lockedFeatures: [
            "Smart insights",
            "Advanced analytics",
            "Priority support",
          ],
          integrations: ["shopify", "bosta", "shipblu"],
        },
        maxBrands: 1,
        maxUsers: -1, // unlimited
        trialDays: 7,
        isActive: true,
      },
      {
        name: "Scale",
        priceMonthly: 399,
        priceYearly: 3990, // 399 * 10 (20% discount)
        features: {
          features: [
            "Everything in Growth",
            "Unlimited wallets",
            "Unlimited inventory items",
            "Smart Insights",
            "Priority support",
            "Onboarding assistance",
          ],
          limits: {
            brands: 1,
            users: -1, // unlimited
            transactions: -1, // unlimited
            inventoryItems: -1, // unlimited
            teamMembers: -1, // unlimited
            wallets: -1, // unlimited
          },
          integrations: ["shopify", "bosta", "shipblu"],
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
