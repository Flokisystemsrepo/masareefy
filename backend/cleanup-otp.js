const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanupOTP() {
    try {
        // Delete all phone verification records for testing
        const result = await prisma.phoneVerification.deleteMany({
            where: {
                phone: "01104484492",
            },
        });

        console.log(`Cleaned up ${result.count} OTP records for phone 01104484492`);

        // Also clean up any expired records
        const expiredResult = await prisma.phoneVerification.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        console.log(`Cleaned up ${expiredResult.count} expired OTP records`);
    } catch (error) {
        console.error("Error cleaning up OTP records:", error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupOTP();