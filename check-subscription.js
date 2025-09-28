import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSubscription() {
    try {
        console.log("=== CHECKING SUBSCRIPTION DATA ===");

        // Get all users with their subscriptions
        const users = await prisma.user.findMany({
            include: {
                subscriptions: {
                    include: {
                        plan: true
                    },
                    orderBy: {
                        updatedAt: 'desc'
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 3
        });

        console.log(`Found ${users.length} users:`);
        
        users.forEach((user, index) => {
            console.log(`\n${index + 1}. User: ${user.email}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Subscriptions: ${user.subscriptions.length}`);
            
            user.subscriptions.forEach((sub, subIndex) => {
                console.log(`   
   Subscription ${subIndex + 1}:
     - ID: ${sub.id}
     - Plan: ${sub.plan.name} (${sub.plan.priceMonthly} EGP)
     - Status: ${sub.status}
     - Created: ${sub.createdAt}
     - Updated: ${sub.updatedAt}
     - Period: ${sub.currentPeriodStart} to ${sub.currentPeriodEnd}
     - Trial Active: ${sub.isTrialActive}
     - Trial End: ${sub.trialEnd}`);
            });
        });

        // Check for active subscriptions specifically
        console.log("\n=== ACTIVE SUBSCRIPTIONS ===");
        const activeSubscriptions = await prisma.subscription.findMany({
            where: {
                OR: [
                    { status: 'active' },
                    { status: 'trialing' }
                ]
            },
            include: {
                plan: true,
                user: {
                    select: {
                        email: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        console.log(`Found ${activeSubscriptions.length} active subscriptions:`);
        activeSubscriptions.forEach((sub, index) => {
            console.log(`${index + 1}. ${sub.user.email}: ${sub.plan.name} (${sub.status})`);
        });

        // Check for duplicate subscriptions
        console.log("\n=== CHECKING FOR DUPLICATES ===");
        const duplicateCheck = await prisma.user.findMany({
            include: {
                _count: {
                    select: {
                        subscriptions: true
                    }
                }
            },
            where: {
                subscriptions: {
                    some: {}
                }
            }
        });

        const usersWithMultipleSubscriptions = duplicateCheck.filter(user => user._count.subscriptions > 1);
        if (usersWithMultipleSubscriptions.length > 0) {
            console.log("⚠️  Users with multiple subscriptions:");
            usersWithMultipleSubscriptions.forEach(user => {
                console.log(`   ${user.email}: ${user._count.subscriptions} subscriptions`);
            });
        } else {
            console.log("✅ No users with multiple subscriptions found");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSubscription();