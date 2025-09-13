"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    const plans = [
        {
            name: 'Starter',
            priceMonthly: 29.99,
            priceYearly: 299.99,
            features: {
                maxBrands: 1,
                maxUsers: 3,
                features: [
                    'Basic financial tracking',
                    'Receivables & Payables',
                    'Revenue & Cost management',
                    'Basic reporting',
                    'Email support'
                ]
            },
            maxBrands: 1,
            maxUsers: 3,
            trialDays: 7,
        },
        {
            name: 'Professional',
            priceMonthly: 79.99,
            priceYearly: 799.99,
            features: {
                maxBrands: 5,
                maxUsers: 10,
                features: [
                    'Everything in Starter',
                    'Inventory management',
                    'Project targets',
                    'Team collaboration',
                    'Advanced reporting',
                    'Priority support',
                    'File uploads'
                ]
            },
            maxBrands: 5,
            maxUsers: 10,
            trialDays: 7,
        },
        {
            name: 'Enterprise',
            priceMonthly: 199.99,
            priceYearly: 1999.99,
            features: {
                maxBrands: -1,
                maxUsers: -1,
                features: [
                    'Everything in Professional',
                    'Unlimited brands & users',
                    'Custom integrations',
                    'Dedicated support',
                    'Advanced analytics',
                    'API access',
                    'White-label options'
                ]
            },
            maxBrands: -1,
            maxUsers: -1,
            trialDays: 14,
        },
    ];
    console.log('📋 Creating subscription plans...');
    await prisma.plan.deleteMany();
    for (const plan of plans) {
        await prisma.plan.create({
            data: plan,
        });
    }
    console.log('✅ Database seeding completed!');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map