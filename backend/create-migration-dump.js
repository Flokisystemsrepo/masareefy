const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function createMigrationDump() {
    try {
        console.log("🔄 Creating comprehensive database migration dump...");

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupDir = path.join(__dirname, "backups");

        // Create backups directory if it doesn't exist
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const backupFile = path.join(backupDir, `migration-dump-${timestamp}.sql`);

        console.log("📊 Fetching all data from database...");

        let sqlContent = `-- Pulse Finance Database Migration Dump
-- Generated on: ${new Date().toISOString()}
-- Database: PostgreSQL
-- 
-- This dump contains all data from your Pulse Finance database
-- Your friend can use this to migrate the database to their system
--
-- IMPORTANT: Make sure to update the DATABASE_URL in your .env file
-- before running the migration commands below.
--
-- Migration Instructions:
-- 1. Copy this file to your friend's system
-- 2. Create a new PostgreSQL database
-- 3. Run: psql -h localhost -U username -d database_name < migration-dump-${timestamp}.sql
-- 4. Update your .env file with the new DATABASE_URL
-- 5. Run: npx prisma generate
-- 6. Run: npx prisma db push (if needed)
--

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

`;

        // Define all tables in the correct order (respecting foreign key dependencies)
        const tables = [
            "plans",
            "users",
            "user_sessions",
            "subscriptions",
            "invoices",
            "brands",
            "brand_users",
            "categories",
            "wallets",
            "wallet_transactions",
            "inventory",
            "revenues",
            "costs",
            "transfers",
            "receivables",
            "payables",
            "project_targets",
            "tasks",
            "team_members",
            "financial_reports",
            "admins",
            "admin_sessions",
            "system_metrics",
            "audit_logs",
            "bosta_imports",
            "bosta_shipments",
            "tickets",
            "ticket_responses",
            "usage_tracking",
        ];

        for (const tableName of tables) {
            try {
                console.log(`📋 Processing table: ${tableName}`);

                // Get table data using Prisma's raw query
                const data = await prisma.$queryRawUnsafe(
                    `SELECT * FROM "${tableName}"`
                );

                if (data.length > 0) {
                    sqlContent += `\n-- Table: ${tableName}\n`;
                    sqlContent += `DELETE FROM "${tableName}";\n`;

                    // Get column names from first record
                    const columns = Object.keys(data[0]);
                    const columnNames = columns.map((col) => `"${col}"`).join(", ");

                    // Generate INSERT statements
                    for (const record of data) {
                        const values = columns
                            .map((col) => {
                                const value = record[col];
                                if (value === null) return "NULL";
                                if (typeof value === "string") {
                                    // Escape single quotes and handle special characters
                                    return `'${value.replace(/'/g, "''")}'`;
                                }
                                if (typeof value === "boolean") return value ? "true" : "false";
                                if (value instanceof Date) return `'${value.toISOString()}'`;
                                if (typeof value === "object") {
                                    // Handle JSON fields
                                    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
                                }
                                if (Array.isArray(value)) {
                                    // Handle array fields (like colors, sizes in inventory)
                                    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
                                }
                                return value;
                            })
                            .join(", ");

                        sqlContent += `INSERT INTO "${tableName}" (${columnNames}) VALUES (${values});\n`;
                    }

                    sqlContent += `\n`;
                } else {
                    console.log(`📋 Table ${tableName} is empty, skipping...`);
                }
            } catch (error) {
                console.log(`⚠️  Skipping table ${tableName}: ${error.message}`);
            }
        }

        sqlContent += `
-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Migration dump completed successfully!
-- 
-- Next steps for your friend:
-- 1. Create a new PostgreSQL database
-- 2. Update DATABASE_URL in .env file
-- 3. Run: npx prisma generate
-- 4. Import this dump: psql -h localhost -U username -d database_name < migration-dump-${timestamp}.sql
-- 5. Verify the migration with: npx prisma studio
`;

        console.log("💾 Writing migration dump to file...");

        // Write SQL backup to file
        fs.writeFileSync(backupFile, sqlContent);

        // Get file size
        const stats = fs.statSync(backupFile);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log("✅ Migration dump completed successfully!");
        console.log(`📁 Dump file: ${backupFile}`);
        console.log(`📊 File size: ${fileSizeInMB} MB`);
        console.log(`📅 Dump timestamp: ${new Date().toISOString()}`);

        console.log("\n🎉 Your database migration dump is ready!");
        console.log("📤 You can now send this file to your friend.");
        console.log("\n📋 Migration Instructions for your friend:");
        console.log("1. Create a new PostgreSQL database");
        console.log("2. Update DATABASE_URL in .env file");
        console.log("3. Run: npx prisma generate");
        console.log(
            `4. Import: psql -h localhost -U username -d database_name < migration-dump-${timestamp}.sql`
        );
        console.log("5. Verify with: npx prisma studio");

        return backupFile;
    } catch (error) {
        console.error("❌ Error creating migration dump:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration dump
createMigrationDump()
    .then((backupFile) => {
        console.log(`\n🎉 Migration dump process completed!`);
        console.log(`📁 File location: ${backupFile}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Migration dump process failed:", error);
        process.exit(1);
    });

