const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function backupDatabase() {
    try {
        console.log("🔄 Starting database backup...");

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupDir = path.join(__dirname, "backups");

        // Create backups directory if it doesn't exist
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

        console.log("📊 Fetching all data from database...");

        // Fetch all data from all tables
        const backupData = {
            timestamp: new Date().toISOString(),
            version: "1.0",
            tables: {
                // Users
                users: await prisma.user.findMany({
                    include: {
                        brands: true,
                        subscriptions: {
                            include: {
                                plan: true,
                            },
                        },
                    },
                }),

                // Brands
                brands: await prisma.brand.findMany({
                    include: {
                        user: true,
                        wallets: true,
                        inventoryItems: true,
                        transactions: true,
                        revenues: true,
                        costs: true,
                        transfers: true,
                        receivables: true,
                        payables: true,
                        tasks: true,
                        reports: true,
                    },
                }),

                // Plans
                plans: await prisma.plan.findMany(),

                // Subscriptions
                subscriptions: await prisma.subscription.findMany({
                    include: {
                        plan: true,
                        user: true,
                    },
                }),

                // Wallets
                wallets: await prisma.wallet.findMany({
                    include: {
                        brand: true,
                        transactions: true,
                    },
                }),

                // Inventory Items
                inventoryItems: await prisma.inventoryItem.findMany({
                    include: {
                        brand: true,
                    },
                }),

                // Transactions
                transactions: await prisma.transaction.findMany({
                    include: {
                        wallet: true,
                        brand: true,
                    },
                }),

                // Revenues
                revenues: await prisma.revenue.findMany({
                    include: {
                        brand: true,
                    },
                }),

                // Costs
                costs: await prisma.cost.findMany({
                    include: {
                        brand: true,
                    },
                }),

                // Transfers
                transfers: await prisma.transfer.findMany({
                    include: {
                        brand: true,
                        fromWallet: true,
                        toWallet: true,
                    },
                }),

                // Receivables
                receivables: await prisma.receivable.findMany({
                    include: {
                        brand: true,
                    },
                }),

                // Payables
                payables: await prisma.payable.findMany({
                    include: {
                        brand: true,
                    },
                }),

                // Tasks
                tasks: await prisma.task.findMany({
                    include: {
                        brand: true,
                    },
                }),

                // Reports
                reports: await prisma.report.findMany({
                    include: {
                        brand: true,
                    },
                }),
            },
        };

        console.log("💾 Writing backup to file...");

        // Write backup to file
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

        // Get file size
        const stats = fs.statSync(backupFile);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log("✅ Database backup completed successfully!");
        console.log(`📁 Backup file: ${backupFile}`);
        console.log(`📊 File size: ${fileSizeInMB} MB`);
        console.log(`📅 Backup timestamp: ${backupData.timestamp}`);

        // Show summary of backed up data
        console.log("\n📋 Backup Summary:");
        Object.entries(backupData.tables).forEach(([tableName, data]) => {
            console.log(`   ${tableName}: ${data.length} records`);
        });

        console.log("\n🔒 Your database is now safely backed up!");
        console.log(
            "💡 You can restore from this backup if needed using the restore script."
        );
    } catch (error) {
        console.error("❌ Error creating database backup:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the backup
backupDatabase()
    .then(() => {
        console.log("\n🎉 Backup process completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Backup process failed:", error);
        process.exit(1);
    });