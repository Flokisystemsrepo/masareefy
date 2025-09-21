const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function createSQLBackup() {
    try {
        console.log("🔄 Creating SQL database backup...");

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupDir = path.join(__dirname, "backups");

        // Create backups directory if it doesn't exist
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

        console.log("📊 Fetching all data from database...");

        let sqlContent = `-- Database Backup
-- Generated on: ${new Date().toISOString()}
-- Database: ${process.env.DATABASE_URL ? "Production" : "Development"}

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

`;

        // Get all tables and their data
        const tables = [
            "User",
            "Brand",
            "Plan",
            "Subscription",
            "Wallet",
            "InventoryItem",
            "Transaction",
            "Revenue",
            "Cost",
            "Transfer",
            "Receivable",
            "Payable",
            "Task",
            "Report",
        ];

        for (const tableName of tables) {
            try {
                console.log(`📋 Processing table: ${tableName}`);

                // Get table data
                const data = await prisma[tableName.toLowerCase()].findMany();

                if (data.length > 0) {
                    sqlContent += `\n-- Table: ${tableName}\n`;
                    sqlContent += `DELETE FROM \`${tableName}\`;\n`;

                    // Get column names from first record
                    const columns = Object.keys(data[0]);
                    const columnNames = columns.map((col) => `\`${col}\``).join(", ");

                    // Generate INSERT statements
                    for (const record of data) {
                        const values = columns
                            .map((col) => {
                                const value = record[col];
                                if (value === null) return "NULL";
                                if (typeof value === "string")
                                    return `'${value.replace(/'/g, "''")}'`;
                                if (typeof value === "boolean") return value ? "1" : "0";
                                if (value instanceof Date) return `'${value.toISOString()}'`;
                                if (typeof value === "object")
                                    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
                                return value;
                            })
                            .join(", ");

                        sqlContent += `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${values});\n`;
                    }

                    sqlContent += `\n`;
                }
            } catch (error) {
                console.log(`⚠️  Skipping table ${tableName}: ${error.message}`);
            }
        }

        sqlContent += `
-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Backup completed
`;

        console.log("💾 Writing SQL backup to file...");

        // Write SQL backup to file
        fs.writeFileSync(backupFile, sqlContent);

        // Get file size
        const stats = fs.statSync(backupFile);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log("✅ SQL database backup completed successfully!");
        console.log(`📁 Backup file: ${backupFile}`);
        console.log(`📊 File size: ${fileSizeInMB} MB`);
        console.log(`📅 Backup timestamp: ${new Date().toISOString()}`);

        console.log("\n🔒 Your database is now safely backed up as SQL!");
        console.log("📤 You can now send this .sql file to your friend.");
        console.log(
            "💡 They can restore it using: mysql -u username -p database_name < backup-file.sql"
        );
    } catch (error) {
        console.error("❌ Error creating SQL backup:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the backup
createSQLBackup()
    .then(() => {
        console.log("\n🎉 SQL backup process completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 SQL backup process failed:", error);
        process.exit(1);
    });