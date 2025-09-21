const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

async function createPostgreSQLBackup() {
    try {
        console.log("🔄 Creating PostgreSQL database backup...");

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupDir = path.join(__dirname, "backups");

        // Create backups directory if it doesn't exist
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const backupFile = path.join(backupDir, `postgres-backup-${timestamp}.sql`);

        // Get database URL from environment
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error("DATABASE_URL environment variable not found");
        }

        console.log("📊 Extracting database connection details...");

        // Parse the DATABASE_URL to extract connection details
        const url = new URL(databaseUrl);
        const host = url.hostname;
        const port = url.port || "5432";
        const database = url.pathname.substring(1); // Remove leading slash
        const username = url.username;
        const password = url.password;

        console.log(`🗄️  Database: ${database}`);
        console.log(`🏠 Host: ${host}:${port}`);
        console.log(`👤 User: ${username}`);

        // Create pg_dump command
        const pgDumpCommand = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --no-password --verbose --clean --if-exists --create`;

        console.log("💾 Creating database dump...");

        // Execute pg_dump command
        exec(pgDumpCommand, (error, stdout, stderr) => {
            if (error) {
                console.error("❌ Error creating PostgreSQL backup:", error);
                console.error("stderr:", stderr);
                return;
            }

            // Write the dump to file
            fs.writeFileSync(backupFile, stdout);

            // Get file size
            const stats = fs.statSync(backupFile);
            const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

            console.log("✅ PostgreSQL database backup completed successfully!");
            console.log(`📁 Backup file: ${backupFile}`);
            console.log(`📊 File size: ${fileSizeInMB} MB`);
            console.log(`📅 Backup timestamp: ${new Date().toISOString()}`);

            console.log("\n🔒 Your PostgreSQL database is now safely backed up!");
            console.log("📤 You can now send this .sql file to your friend.");
            console.log("💡 They can restore it using:");
            console.log(
                `   psql -h ${host} -p ${port} -U ${username} -d ${database} < ${path.basename(
          backupFile
        )}`
            );
            console.log("   or");
            console.log(
                `   createdb new_database_name && psql new_database_name < ${path.basename(
          backupFile
        )}`
            );
        });
    } catch (error) {
        console.error("❌ Error creating PostgreSQL backup:", error);
        throw error;
    }
}

// Run the backup
createPostgreSQLBackup()
    .then(() => {
        console.log("\n🎉 PostgreSQL backup process initiated!");
    })
    .catch((error) => {
        console.error("\n💥 PostgreSQL backup process failed:", error);
        process.exit(1);
    });