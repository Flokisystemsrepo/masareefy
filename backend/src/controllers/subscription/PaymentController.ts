import { Request, Response } from "express";
import { prisma } from "@/config/database";
import { authenticateToken } from "@/middleware/auth";

export class PaymentController {
  // Handle payment confirmation from Kashier
  static async confirmPayment(req: Request, res: Response) {
    try {
      const { paymentId, planId, userId, amount, currency, status } = req.body;

      if (!paymentId || !planId || !userId) {
        return res.status(400).json({
          success: false,
          error: "Missing required payment information",
        });
      }

      // Find the user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Find the plan
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          error: "Plan not found",
        });
      }

      // Check if user already has a subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId: user.id },
        include: { plan: true },
      });

      let subscription;

      if (existingSubscription) {
        // Update existing subscription
        subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planId: plan.id,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            paymentMethod: "kashier",
            trialEnd: null, // End trial
          },
          include: { plan: true },
        });
      } else {
        // Create new subscription
        subscription = await prisma.subscription.create({
          data: {
            userId: user.id,
            planId: plan.id,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            paymentMethod: "kashier",
            trialEnd: null, // End trial
          },
          include: { plan: true },
        });
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: amount || (plan.name.toLowerCase() === "growth" ? 299 : 399),
          currency: currency || "EGP",
          status: status || "completed",
          paymentMethod: "kashier",
          paymentId: paymentId,
          processedAt: new Date(),
        },
      });

      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          userId: user.id,
          amount: payment.amount,
          currency: payment.currency,
          status: "paid",
          dueDate: new Date(),
          paidAt: new Date(),
          invoiceNumber: `INV-${Date.now()}`,
        },
      });

      return res.json({
        success: true,
        data: {
          subscription,
          payment,
          invoice,
        },
      });
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to confirm payment",
      });
    }
  }

  // Get user's payment history
  static async getPaymentHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      console.log(`Fetching payment history for user: ${userId}`);

      const subscription = await prisma.subscription.findFirst({
        where: { userId },
        include: {
          plan: true,
          payments: {
            orderBy: { createdAt: "desc" },
          },
          invoices: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!subscription) {
        console.log(`No subscription found for user: ${userId}`);
        return res.json({
          success: true,
          data: {
            subscription: null,
            payments: [],
            invoices: [],
          },
        });
      }

      console.log(
        `Found subscription for user: ${userId}, payments: ${subscription.payments.length}, invoices: ${subscription.invoices.length}`
      );

      return res.json({
        success: true,
        data: {
          subscription,
          payments: subscription.payments || [],
          invoices: subscription.invoices || [],
        },
      });
    } catch (error: any) {
      console.error("Get payment history error:", error);
      console.error("Error details:", error.message);
      console.error("Stack trace:", error.stack);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch payment history",
      });
    }
  }

  // Get specific invoice
  static async getInvoice(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      const invoice = await prisma.invoice.findFirst({
        where: {
          id: invoiceId,
          subscription: {
            userId: userId,
          },
        },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: "Invoice not found",
        });
      }

      return res.json({
        success: true,
        data: invoice,
      });
    } catch (error: any) {
      console.error("Get invoice error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch invoice",
      });
    }
  }
}
