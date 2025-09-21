const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function seedAdmin() {
    try {
        console.log("🌱 Seeding admin user...");

        // Hash the password for 'admin'
        const passwordHash = await bcrypt.hash("admin", 12);

        // Create test admin user
        const admin = await prisma.admin.upsert({
            where: { email: "admin@admin.com" },
            update: {},
            create: {
                email: "admin@admin.com",
                passwordHash: passwordHash,
                firstName: "Admin",
                lastName: "User",
                role: "super_admin",
                permissions: [
                    "users.read",
                    "users.write",
                    "users.delete",
                    "brands.read",
                    "brands.write",
                    "brands.delete",
                    "subscriptions.read",
                    "subscriptions.write",
                    "analytics.read",
                    "system.read",
                    "system.write",
                    "audit.read",
                ],
                isActive: true,
                ipWhitelist: [], // Empty for testing - allow all IPs
            },
        });

        console.log("✅ Admin user created successfully!");
        console.log("📧 Email: admin@admin.com");
        console.log("🔑 Password: admin");
        console.log("👤 Role: super_admin");
        console.log("🆔 Admin ID:", admin.id);

        // Create some sample system metrics
        const systemMetrics = await prisma.systemMetrics.create({
            data: {
                totalUsers: 0,
                totalBrands: 0,
                activeSubscriptions: 0,
                totalRevenue: 0,
                totalCosts: 0,
                apiCalls: 0,
                errorCount: 0,
            },
        });

        console.log("✅ System metrics initialized!");
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
        throw error;
    }
}

async function main() {
    try {
        await seedAdmin();
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    main();
}

module.exports = { seedAdmin };












