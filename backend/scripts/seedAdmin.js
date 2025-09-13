const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function seedAdmin() {
    try {
        console.log("🌱 Seeding admin user...");

        // Check if admin already exists
        const existingAdmin = await prisma.admin.findUnique({
            where: { email: "admin@admin.com" },
        });

        if (existingAdmin) {
            console.log("✅ Admin user already exists");
            return;
        }

        // Hash the password
        const passwordHash = await bcrypt.hash("admin", 10);

        // Create admin user
        const admin = await prisma.admin.create({
            data: {
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
                    "subscriptions.delete",
                    "analytics.read",
                    "system.read",
                    "system.write",
                    "security.read",
                    "security.write",
                    "security.delete",
                    "tickets.read",
                    "tickets.write",
                    "tickets.delete",
                ],
                isActive: true,
            },
        });

        console.log("✅ Admin user created successfully:");
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: admin`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Permissions: ${admin.permissions.length} permissions`);
    } catch (error) {
        console.error("❌ Error seeding admin user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();