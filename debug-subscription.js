import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugSubscription() {
    try {
        console.log("=== DEBUGGING SUBSCRIPTION ===");

        // Get all subscriptions
        const subscriptions = await prisma.subscription.findMany({
            include: {
                plan: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
        });

        console.log("Recent subscriptions:");
        subscriptions.forEach((sub, index) => {
            console.log(`${index + 1}. User: ${sub.user.email}`);
            console.log(`   Plan: ${sub.plan.name} (${sub.plan.priceMonthly} EGP)`);
            console.log(`   Status: ${sub.status}`);
            console.log(
                `   Period: ${sub.currentPeriodStart} to ${sub.currentPeriodEnd}`
            );
            console.log(`   isFreePlan: ${sub.plan.name === "Free"}`);
            console.log("---");
        });

        // Get all plans
        const plans = await prisma.plan.findMany({
            orderBy: {
                priceMonthly: "asc",
            },
        });

        console.log("\nAvailable plans:");
        plans.forEach((plan) => {
            console.log(`- ${plan.name}: ${plan.priceMonthly} EGP`);
        });
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

debugSubscription();