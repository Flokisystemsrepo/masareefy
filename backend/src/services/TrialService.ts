import { prisma } from "@/config/database";

export class TrialService {
  // Check and handle trial expirations
  static async checkTrialExpirations(): Promise<void> {
    try {
      const now = new Date();

      // Find all active trials that are expiring today or have expired
      const expiringTrials = await prisma.subscription.findMany({
        where: {
          isTrialActive: true,
          trialEnd: {
            lte: now,
          },
        },
        include: {
          user: true,
          plan: true,
        },
      });

      for (const subscription of expiringTrials) {
        await this.handleTrialExpiration(subscription.id);
      }

      // Find trials expiring in 1 day and send notifications
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const trialsExpiringTomorrow = await prisma.subscription.findMany({
        where: {
          isTrialActive: true,
          trialNotificationSent: false,
          trialEnd: {
            gte: now,
            lte: tomorrow,
          },
        },
        include: {
          user: true,
          plan: true,
        },
      });

      for (const subscription of trialsExpiringTomorrow) {
        await this.sendTrialExpirationNotification(subscription.id);
      }
    } catch (error) {
      console.error("Error checking trial expirations:", error);
      throw error;
    }
  }

  // Handle trial expiration - downgrade to free plan
  static async handleTrialExpiration(subscriptionId: string): Promise<void> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true, user: true },
      });

      if (!subscription || !subscription.isTrialActive) {
        return;
      }

      // Find the free plan
      const freePlan = await prisma.plan.findFirst({
        where: { name: "Free" },
      });

      if (!freePlan) {
        throw new Error("Free plan not found");
      }

      await prisma.$transaction(async (tx) => {
        // Update subscription to free plan
        await tx.subscription.update({
          where: { id: subscriptionId },
          data: {
            planId: freePlan.id,
            status: "active",
            isTrialActive: false,
            trialEnd: null,
            trialStart: null,
            trialDays: 0,
            currentPeriodStart: new Date(),
            currentPeriodEnd: null,
            downgradedAt: new Date(),
          },
        });

        // Create trial expiration notification
        await tx.trialNotification.create({
          data: {
            userId: subscription.userId,
            subscriptionId: subscriptionId,
            type: "trial_expired",
            message: `Your ${subscription.plan.name} trial has expired. You've been downgraded to the Free plan. Upgrade anytime to regain access to premium features.`,
          },
        });
      });
    } catch (error) {
      console.error("Error handling trial expiration:", error);
      throw error;
    }
  }

  // Send trial expiration notification (1 day before)
  static async sendTrialExpirationNotification(
    subscriptionId: string
  ): Promise<void> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true, user: true },
      });

      if (
        !subscription ||
        !subscription.isTrialActive ||
        subscription.trialNotificationSent
      ) {
        return;
      }

      await prisma.$transaction(async (tx) => {
        // Mark notification as sent
        await tx.subscription.update({
          where: { id: subscriptionId },
          data: { trialNotificationSent: true },
        });

        // Create notification
        await tx.trialNotification.create({
          data: {
            userId: subscription.userId,
            subscriptionId: subscriptionId,
            type: "trial_ending",
            message: `Your ${subscription.plan.name} trial expires tomorrow. Subscribe now to continue enjoying premium features without interruption.`,
          },
        });
      });
    } catch (error) {
      console.error("Error sending trial expiration notification:", error);
      throw error;
    }
  }

  // Get user's trial status
  static async getUserTrialStatus(userId: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      });

      if (!subscription) {
        return null;
      }

      const now = new Date();
      const isTrialActive =
        subscription.isTrialActive &&
        subscription.trialEnd &&
        subscription.trialEnd > now;
      const daysRemaining = subscription.trialEnd
        ? Math.ceil(
            (subscription.trialEnd.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      return {
        subscription,
        isTrialActive,
        daysRemaining: Math.max(0, daysRemaining),
        trialEnd: subscription.trialEnd,
        plan: subscription.plan,
      };
    } catch (error) {
      console.error("Error getting user trial status:", error);
      throw error;
    }
  }

  // Get user's trial notifications
  static async getUserTrialNotifications(userId: string) {
    try {
      const notifications = await prisma.trialNotification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      return notifications;
    } catch (error) {
      console.error("Error getting user trial notifications:", error);
      throw error;
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(
    notificationId: string,
    userId: string
  ): Promise<void> {
    try {
      await prisma.trialNotification.updateMany({
        where: {
          id: notificationId,
          userId: userId,
        },
        data: { isRead: true },
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Manually extend trial (admin function)
  static async extendTrial(
    subscriptionId: string,
    additionalDays: number
  ): Promise<void> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true },
      });

      if (!subscription || !subscription.isTrialActive) {
        throw new Error("Subscription not found or not in trial");
      }

      const newTrialEnd = new Date();
      newTrialEnd.setDate(newTrialEnd.getDate() + additionalDays);

      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          trialEnd: newTrialEnd,
          trialDays: subscription.trialDays + additionalDays,
          trialNotificationSent: false, // Reset notification flag
        },
      });
    } catch (error) {
      console.error("Error extending trial:", error);
      throw error;
    }
  }
}
