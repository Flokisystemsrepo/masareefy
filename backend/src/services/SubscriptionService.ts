import { prisma } from "@/config/database";
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionWithPlan,
} from "@/types";
import { generateInvoiceNumber } from "@/utils/helpers";

export class SubscriptionService {
  // Get all available plans
  static async getPlans() {
    try {
      const plans = await prisma.plan.findMany({
        orderBy: { priceMonthly: "asc" },
      });
      return plans;
    } catch (error) {
      throw new Error("Failed to fetch plans");
    }
  }

  // Get plan by ID
  static async getPlanById(planId: string) {
    try {
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
      });
      if (!plan) {
        throw new Error("Plan not found");
      }
      return plan;
    } catch (error) {
      throw new Error("Failed to fetch plan");
    }
  }

  // Create subscription
  static async createSubscription(userId: string, data: CreateSubscriptionDto) {
    try {
      // Get the plan
      const plan = await this.getPlanById(data.planId);

      // Check if user already has an active subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: { in: ["active", "trialing"] },
        },
      });

      if (existingSubscription) {
        throw new Error("User already has an active subscription");
      }

      // Calculate trial end date
      const trialDays = data.trialDays || plan.trialDays;
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + trialDays);

      // Create subscription
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          planId: data.planId,
          status: "trialing",
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEnd,
          trialStart: new Date(),
          trialEnd,
          cancelAtPeriodEnd: false,
          paymentMethod: data.paymentMethod || "mock",
        },
        include: {
          plan: true,
        },
      });

      // Create initial invoice
      await prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          userId,
          amount: plan.priceMonthly,
          currency: "EGP",
          status: "pending",
          invoiceNumber: generateInvoiceNumber(),
          dueDate: trialEnd,
          description: `Initial subscription to ${plan.name} plan`,
        },
      });

      return subscription;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to create subscription"
      );
    }
  }

  // Get user's current subscription
  static async getUserSubscription(
    userId: string
  ): Promise<SubscriptionWithPlan | null> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: { in: ["active", "trialing", "past_due"] },
        },
        include: {
          plan: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return subscription;
    } catch (error) {
      throw new Error("Failed to fetch user subscription");
    }
  }

  // Update subscription
  static async updateSubscription(
    subscriptionId: string,
    data: UpdateSubscriptionDto
  ) {
    try {
      const subscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          ...(data.planId && { planId: data.planId }),
          ...(data.status && { status: data.status }),
          ...(data.cancelAtPeriodEnd !== undefined && {
            cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          }),
        },
        include: {
          plan: true,
        },
      });
      return subscription;
    } catch (error) {
      throw new Error("Failed to update subscription");
    }
  }

  // Cancel subscription
  static async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ) {
    try {
      const subscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: cancelAtPeriodEnd ? "active" : "cancelled",
          cancelAtPeriodEnd,
          cancelledAt: cancelAtPeriodEnd ? null : new Date(),
        },
        include: {
          plan: true,
        },
      });
      return subscription;
    } catch (error) {
      throw new Error("Failed to cancel subscription");
    }
  }

  // Process mock payment
  static async processMockPayment(subscriptionId: string) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true },
      });

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      // Update subscription status to active
      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        include: { plan: true },
      });

      // Update invoice status
      await prisma.invoice.updateMany({
        where: { subscriptionId },
        data: { status: "paid" },
      });

      return updatedSubscription;
    } catch (error) {
      throw new Error("Failed to process payment");
    }
  }

  // Get subscription invoices
  static async getSubscriptionInvoices(subscriptionId: string) {
    try {
      const invoices = await prisma.invoice.findMany({
        where: { subscriptionId },
        orderBy: { createdAt: "desc" },
      });
      return invoices;
    } catch (error) {
      throw new Error("Failed to fetch invoices");
    }
  }

  // Check trial status
  static async checkTrialStatus(userId: string) {
    try {
      const subscription = await this.getUserSubscription(userId);

      if (!subscription) {
        return { hasTrial: false, isExpired: false };
      }

      const now = new Date();
      const isExpired = subscription.trialEnd && subscription.trialEnd < now;

      return {
        hasTrial: subscription.status === "trialing",
        isExpired,
        trialEnd: subscription.trialEnd,
      };
    } catch (error) {
      throw new Error("Failed to check trial status");
    }
  }
}
