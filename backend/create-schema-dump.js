const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function createSchemaDump() {
    try {
        console.log("🔄 Creating database schema dump...");

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupDir = path.join(__dirname, "backups");

        // Create backups directory if it doesn't exist
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const schemaFile = path.join(backupDir, `schema-dump-${timestamp}.sql`);

        console.log("📊 Fetching database schema...");

        let schemaContent = `-- Pulse Finance Database Schema Dump
-- Generated on: ${new Date().toISOString()}
-- Database: PostgreSQL
-- 
-- This dump contains only the database schema (table structures, indexes, constraints)
-- No data is included - this is for creating the database structure only
--
-- Schema Migration Instructions:
-- 1. Create a new PostgreSQL database
-- 2. Run: psql -h localhost -U username -d database_name < schema-dump-${timestamp}.sql
-- 3. Update your .env file with the new DATABASE_URL
-- 4. Run: npx prisma generate
-- 5. Run: npx prisma db push (if needed)
--

`;

        // Get all table schemas
        const tables = await prisma.$queryRaw `
            SELECT 
                table_name,
                column_name,
                data_type,
                is_nullable,
                column_default,
                character_maximum_length,
                numeric_precision,
                numeric_scale
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            ORDER BY table_name, ordinal_position;
        `;

        // Get primary keys
        const primaryKeys = await prisma.$queryRaw `
            SELECT 
                tc.table_name,
                kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'PRIMARY KEY' 
                AND tc.table_schema = 'public'
            ORDER BY tc.table_name;
        `;

        // Get foreign keys
        const foreignKeys = await prisma.$queryRaw `
            SELECT 
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                tc.constraint_name
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_schema = 'public'
            ORDER BY tc.table_name;
        `;

        // Get unique constraints
        const uniqueConstraints = await prisma.$queryRaw `
            SELECT 
                tc.table_name,
                kcu.column_name,
                tc.constraint_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'UNIQUE' 
                AND tc.table_schema = 'public'
            ORDER BY tc.table_name;
        `;

        // Get indexes
        const indexes = await prisma.$queryRaw `
            SELECT 
                schemaname,
                tablename,
                indexname,
                indexdef
            FROM pg_indexes 
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname;
        `;

        // Group columns by table
        const tableColumns = {};
        tables.forEach((row) => {
            if (!tableColumns[row.table_name]) {
                tableColumns[row.table_name] = [];
            }
            tableColumns[row.table_name].push(row);
        });

        // Group primary keys by table
        const tablePrimaryKeys = {};
        primaryKeys.forEach((row) => {
            if (!tablePrimaryKeys[row.table_name]) {
                tablePrimaryKeys[row.table_name] = [];
            }
            tablePrimaryKeys[row.table_name].push(row.column_name);
        });

        // Group foreign keys by table
        const tableForeignKeys = {};
        foreignKeys.forEach((row) => {
            if (!tableForeignKeys[row.table_name]) {
                tableForeignKeys[row.table_name] = [];
            }
            tableForeignKeys[row.table_name].push(row);
        });

        // Group unique constraints by table
        const tableUniqueConstraints = {};
        uniqueConstraints.forEach((row) => {
            if (!tableUniqueConstraints[row.table_name]) {
                tableUniqueConstraints[row.table_name] = [];
            }
            tableUniqueConstraints[row.table_name].push(row);
        });

        // Create table schemas
        Object.keys(tableColumns)
            .sort()
            .forEach((tableName) => {
                console.log(`📋 Processing table schema: ${tableName}`);

                schemaContent += `-- Table: ${tableName}\n`;
                schemaContent += `CREATE TABLE "${tableName}" (\n`;

                const columns = tableColumns[tableName];
                const columnDefinitions = columns.map((col) => {
                    let definition = `    "${col.column_name}" `;

                    // Data type
                    if (col.data_type === "character varying") {
                        definition += `VARCHAR(${col.character_maximum_length})`;
                    } else if (col.data_type === "character") {
                        definition += `CHAR(${col.character_maximum_length})`;
                    } else if (col.data_type === "numeric") {
                        if (col.numeric_precision && col.numeric_scale) {
                            definition += `NUMERIC(${col.numeric_precision},${col.numeric_scale})`;
                        } else if (col.numeric_precision) {
                            definition += `NUMERIC(${col.numeric_precision})`;
                        } else {
                            definition += "NUMERIC";
                        }
                    } else if (col.data_type === "timestamp with time zone") {
                        definition += "TIMESTAMPTZ";
                    } else if (col.data_type === "timestamp without time zone") {
                        definition += "TIMESTAMP";
                    } else if (col.data_type === "jsonb") {
                        definition += "JSONB";
                    } else if (col.data_type === "text") {
                        definition += "TEXT";
                    } else if (col.data_type === "boolean") {
                        definition += "BOOLEAN";
                    } else if (col.data_type === "integer") {
                        definition += "INTEGER";
                    } else if (col.data_type === "bigint") {
                        definition += "BIGINT";
                    } else if (col.data_type === "real") {
                        definition += "REAL";
                    } else if (col.data_type === "double precision") {
                        definition += "DOUBLE PRECISION";
                    } else if (col.data_type === "ARRAY") {
                        definition += "TEXT[]";
                    } else {
                        definition += col.data_type.toUpperCase();
                    }

                    // Nullable
                    if (col.is_nullable === "NO") {
                        definition += " NOT NULL";
                    }

                    // Default value
                    if (col.column_default) {
                        if (col.column_default.includes("nextval")) {
                            definition += ` DEFAULT ${col.column_default}`;
                        } else if (col.column_default.includes("now()")) {
                            definition += ` DEFAULT ${col.column_default}`;
                        } else if (col.column_default.includes("cuid()")) {
                            definition += ` DEFAULT ${col.column_default}`;
                        } else {
                            definition += ` DEFAULT ${col.column_default}`;
                        }
                    }

                    return definition;
                });

                schemaContent += columnDefinitions.join(",\n");

                // Add primary key
                if (
                    tablePrimaryKeys[tableName] &&
                    tablePrimaryKeys[tableName].length > 0
                ) {
                    schemaContent += `,\n    PRIMARY KEY ("${tablePrimaryKeys[
            tableName
          ].join('", "')}")`;
                }

                schemaContent += "\n);\n\n";

                // Add unique constraints
                if (tableUniqueConstraints[tableName]) {
                    tableUniqueConstraints[tableName].forEach((unique) => {
                        schemaContent += `ALTER TABLE "${tableName}" ADD CONSTRAINT "${unique.constraint_name}" UNIQUE ("${unique.column_name}");\n`;
                    });
                    schemaContent += "\n";
                }

                // Add foreign key constraints
                if (tableForeignKeys[tableName]) {
                    tableForeignKeys[tableName].forEach((fk) => {
                        schemaContent += `ALTER TABLE "${tableName}" ADD CONSTRAINT "${fk.constraint_name}" FOREIGN KEY ("${fk.column_name}") REFERENCES "${fk.foreign_table_name}" ("${fk.foreign_column_name}") ON DELETE CASCADE;\n`;
                    });
                    schemaContent += "\n";
                }
            });

        // Add indexes
        schemaContent += "-- Indexes\n";
        indexes.forEach((index) => {
            if (!index.indexname.includes("_pkey")) {
                // Skip primary key indexes
                schemaContent += `${index.indexdef};\n`;
            }
        });

        schemaContent += `
-- Schema dump completed successfully!
-- 
-- Next steps:
-- 1. Create a new PostgreSQL database
-- 2. Update DATABASE_URL in .env file
-- 3. Run: npx prisma generate
-- 4. Import this schema: psql -h localhost -U username -d database_name < schema-dump-${timestamp}.sql
-- 5. Run: npx prisma db push (if needed)
-- 6. Verify with: npx prisma studio
`;

        console.log("💾 Writing schema dump to file...");

        // Write schema to file
        fs.writeFileSync(schemaFile, schemaContent);

        // Get file size
        const stats = fs.statSync(schemaFile);
        const fileSizeInKB = (stats.size / 1024).toFixed(2);

        console.log("✅ Schema dump completed successfully!");
        console.log(`📁 Schema file: ${schemaFile}`);
        console.log(`📊 File size: ${fileSizeInKB} KB`);
        console.log(`📅 Dump timestamp: ${new Date().toISOString()}`);

        console.log("\n🎉 Your database schema dump is ready!");
        console.log("📤 You can now send this file to your friend.");
        console.log("\n📋 Schema Migration Instructions for your friend:");
        console.log("1. Create a new PostgreSQL database");
        console.log("2. Update DATABASE_URL in .env file");
        console.log("3. Run: npx prisma generate");
        console.log(
            `4. Import schema: psql -h localhost -U username -d database_name < schema-dump-${timestamp}.sql`
        );
        console.log("5. Run: npx prisma db push (if needed)");
        console.log("6. Verify with: npx prisma studio");

        return schemaFile;
    } catch (error) {
        console.error("❌ Error creating schema dump:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the schema dump
createSchemaDump()
    .then((schemaFile) => {
        console.log(`\n🎉 Schema dump process completed!`);
        console.log(`📁 File location: ${schemaFile}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Schema dump process failed:", error);
        process.exit(1);
    });

