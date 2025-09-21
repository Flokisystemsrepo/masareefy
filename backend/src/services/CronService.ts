import cron from "node-cron";
import { TrialService } from "./TrialService";
import { OTPController } from "@/controllers/OTPController";
import { ReceivablesPayablesService } from "./ReceivablesPayablesService";

export class CronService {
  private static isRunning = false;

  // Start all cron jobs
  static start(): void {
    if (this.isRunning) {
      console.log("Cron service is already running");
      return;
    }

    console.log("Starting cron service...");

    // Check trial expirations every hour
    cron.schedule("0 * * * *", async () => {
      console.log("Running trial expiration check...");
      try {
        await TrialService.checkTrialExpirations();
        console.log("Trial expiration check completed successfully");
      } catch (error) {
        console.error("Error in trial expiration check:", error);
      }
    });

    // Check trial expirations every day at 9 AM
    cron.schedule("0 9 * * *", async () => {
      console.log("Running daily trial expiration check...");
      try {
        await TrialService.checkTrialExpirations();
        console.log("Daily trial expiration check completed successfully");
      } catch (error) {
        console.error("Error in daily trial expiration check:", error);
      }
    });

    // Clean up expired OTPs every 30 minutes
    cron.schedule("*/30 * * * *", async () => {
      console.log("Running OTP cleanup...");
      try {
        await OTPController.cleanupExpiredOTPs();
        console.log("OTP cleanup completed successfully");
      } catch (error) {
        console.error("Error in OTP cleanup:", error);
      }
    });

    // Process due receivables and payables every day at midnight
    cron.schedule("0 0 * * *", async () => {
      console.log("Running due receivables/payables processing...");
      try {
        const result = await ReceivablesPayablesService.processDueItems();
        console.log(
          `Due items processing completed: ${result.data.receivablesProcessed} receivables, ${result.data.payablesProcessed} payables processed`
        );
      } catch (error) {
        console.error("Error in due items processing:", error);
      }
    });

    // Process due items every minute for instant processing
    cron.schedule("* * * * *", async () => {
      try {
        const result = await ReceivablesPayablesService.processDueItems();
        if (
          result.data.receivablesProcessed > 0 ||
          result.data.payablesProcessed > 0
        ) {
          console.log(
            `🔄 Instant processing: ${result.data.receivablesProcessed} receivables, ${result.data.payablesProcessed} payables processed`
          );
        }
      } catch (error) {
        console.error("Error in instant due items processing:", error);
      }
    });

    this.isRunning = true;
    console.log("Cron service started successfully");
  }

  // Stop all cron jobs
  static stop(): void {
    if (!this.isRunning) {
      console.log("Cron service is not running");
      return;
    }

    cron.getTasks().forEach((task) => {
      task.destroy();
    });

    this.isRunning = false;
    console.log("Cron service stopped");
  }

  // Get status of cron service
  static getStatus(): { isRunning: boolean; tasks: string[] } {
    const tasks = cron.getTasks();
    const taskNames = Array.from(tasks.keys());

    return {
      isRunning: this.isRunning,
      tasks: taskNames,
    };
  }
}
