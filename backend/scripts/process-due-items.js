#!/usr/bin/env node

/**
 * Process Due Receivables and Payables Script
 *
 * This script automatically processes receivables and payables that have reached their due date
 * and are marked for auto-conversion to revenue/cost.
 *
 * Usage:
 * - Manual: node scripts/process-due-items.js
 * - Cron: Add to crontab to run daily at midnight: 0 0 * * * /path/to/node /path/to/scripts/process-due-items.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function processDueItems() {
    try {
        console.log("🔄 Starting due items processing...");
        const now = new Date();
        const results = {
            receivablesProcessed: 0,
            payablesProcessed: 0,
            errors: [],
        };

        // Process receivables that are due and marked for auto-conversion
        const dueReceivables = await prisma.receivable.findMany({
            where: {
                dueDate: { lte: now },
                autoConvertToRevenue: true,
                status: { in: ["current", "overdue"] },
            },
            include: {
                brand: true,
                creator: true,
            },
        });

        console.log(`📊 Found ${dueReceivables.length} receivables to process`);

        for (const receivable of dueReceivables) {
            try {
                await prisma.$transaction(async(tx) => {
                    // Create revenue entry
                    await tx.revenue.create({
                        data: {
                            brandId: receivable.brandId,
                            name: `Receivable: ${receivable.entityName}`,
                            amount: receivable.amount,
                            category: "Receivables",
                            date: receivable.dueDate,
                            source: "Auto-converted Receivable",
                            createdBy: receivable.createdBy,
                        },
                    });

                    // Update receivable status to "converted"
                    await tx.receivable.update({
                        where: { id: receivable.id },
                        data: { status: "converted" },
                    });
                });

                results.receivablesProcessed++;
                console.log(
                    `✅ Processed receivable: ${receivable.entityName} (${receivable.amount})`
                );
            } catch (error) {
                const errorMsg = `Failed to process receivable ${receivable.id}: ${error.message}`;
                results.errors.push(errorMsg);
                console.error(`❌ ${errorMsg}`);
            }
        }

        // Process payables that are due and marked for auto-conversion
        const duePayables = await prisma.payable.findMany({
            where: {
                dueDate: { lte: now },
                autoConvertToCost: true,
                status: { in: ["current", "overdue"] },
            },
            include: {
                brand: true,
                creator: true,
            },
        });

        console.log(`📊 Found ${duePayables.length} payables to process`);

        for (const payable of duePayables) {
            try {
                await prisma.$transaction(async(tx) => {
                    // Create cost entry
                    await tx.cost.create({
                        data: {
                            brandId: payable.brandId,
                            name: `Payable: ${payable.entityName}`,
                            amount: payable.amount,
                            category: "Payables",
                            date: payable.dueDate,
                            vendor: payable.entityName,
                            createdBy: payable.createdBy,
                        },
                    });

                    // Update payable status to "converted"
                    await tx.payable.update({
                        where: { id: payable.id },
                        data: { status: "converted" },
                    });
                });

                results.payablesProcessed++;
                console.log(
                    `✅ Processed payable: ${payable.entityName} (${payable.amount})`
                );
            } catch (error) {
                const errorMsg = `Failed to process payable ${payable.id}: ${error.message}`;
                results.errors.push(errorMsg);
                console.error(`❌ ${errorMsg}`);
            }
        }

        // Summary
        console.log("\n📈 Processing Summary:");
        console.log(`✅ Receivables processed: ${results.receivablesProcessed}`);
        console.log(`✅ Payables processed: ${results.payablesProcessed}`);
        console.log(`❌ Errors: ${results.errors.length}`);

        if (results.errors.length > 0) {
            console.log("\n🚨 Errors encountered:");
            results.errors.forEach((error) => console.log(`  - ${error}`));
        }

        console.log("\n🎉 Due items processing completed successfully!");

        return {
            success: true,
            message: `Processed ${results.receivablesProcessed} receivables and ${results.payablesProcessed} payables`,
            data: results,
        };
    } catch (error) {
        console.error("💥 Fatal error in processDueItems:", error);
        throw new Error(`Failed to process due items: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script if called directly
if (require.main === module) {
    processDueItems()
        .then((result) => {
            console.log("✅ Script completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Script failed:", error.message);
            process.exit(1);
        });
}

module.exports = { processDueItems };