import { Request, Response } from "express";
import { prisma } from "@/config/database";
import { authenticateToken } from "@/middleware/auth";
// Payment gateway utilities (to be implemented)

export class PaymentController {
  // Handle payment confirmation from payment gateway
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
            paymentMethod: "payment_gateway",
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
            paymentMethod: "payment_gateway",
            trialEnd: null, // End trial
          },
          include: { plan: true },
        });
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          userId: userId,
          amount: amount || (plan.name.toLowerCase() === "growth" ? 299 : 399),
          currency: currency || "EGP",
          status: status || "completed",
          paymentMethod: "payment_gateway",
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

  // Initialize payment - generate hash for iframe
  static async initializePayment(req: Request, res: Response) {
    try {
      const { planId, amount, currency = "EGP" } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      if (!planId || !amount) {
        return res.status(400).json({
          success: false,
          error: "Missing required payment information",
        });
      }

      // Generate unique order ID
      const orderId = `ORD-${userId}-${Date.now()}`;

      // Generate order hash
      const orderData = {
        amount: parseFloat(amount),
        currency,
        orderId,
        customerReference: userId,
      };

      // TODO: Implement payment gateway hash generation
      const hash = "placeholder_hash";
      const config = {
        merchantId: "placeholder",
        baseUrl: "placeholder",
        mode: "test",
        merchantRedirect: "placeholder",
        webhookUrl: "placeholder",
      };

      // Store pending payment in database
      const pendingPayment = await prisma.payment.create({
        data: {
          amount: parseFloat(amount),
          currency,
          status: "pending",
          paymentMethod: "payment_gateway",
          paymentId: orderId,
          userId: userId,
          planId: planId,
        },
      });

      return res.json({
        success: true,
        data: {
          orderId,
          hash,
          amount: parseFloat(amount),
          currency,
          merchantId: config.merchantId,
          merchantRedirect: config.merchantRedirect,
          serverWebhook: config.webhookUrl,
          mode: config.mode,
          customerReference: userId,
          paymentId: pendingPayment.id,
        },
      });
    } catch (error: any) {
      console.error("Initialize payment error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to initialize payment",
      });
    }
  }

  // Handle payment redirect from payment gateway
  static async handlePaymentRedirect(req: Request, res: Response) {
    try {
      const query = req.query;

      // TODO: Implement payment gateway signature validation
      const isValidSignature = true; // Placeholder

      if (!isValidSignature) {
        console.error("Invalid payment signature");
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/failed?reason=invalid_signature`
        );
      }

      const { orderId, status, transactionId } = query;

      // Find the payment record
      const payment = await prisma.payment.findFirst({
        where: { paymentId: orderId as string },
      });

      if (!payment) {
        console.error("Payment record not found");
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/failed?reason=payment_not_found`
        );
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: status === "SUCCESS" ? "completed" : "failed",
          transactionId: transactionId as string,
          processedAt: new Date(),
        },
      });

      if (status === "SUCCESS") {
        // Create or update subscription
        await this.createOrUpdateSubscription(payment);
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`
        );
      } else {
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment/failed?orderId=${orderId}`
        );
      }
    } catch (error: any) {
      console.error("Payment redirect error:", error);
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/failed?reason=server_error`
      );
    }
  }

  // Handle payment webhook from payment gateway
  static async handlePaymentWebhook(req: Request, res: Response) {
    try {
      const payload = JSON.stringify(req.body);
      const signature = req.headers["payment-gateway-signature"] as string;

      // TODO: Implement payment gateway webhook signature validation
      const isValidSignature = true; // Placeholder

      if (!isValidSignature) {
        console.error("Invalid webhook signature");
        return res.status(401).json({ error: "Invalid signature" });
      }

      const { orderId, status, transactionId, amount, currency } = req.body;

      // Find the payment record
      const payment = await prisma.payment.findFirst({
        where: { paymentId: orderId },
      });

      if (!payment) {
        console.error("Payment record not found for webhook");
        return res.status(404).json({ error: "Payment not found" });
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: status === "SUCCESS" ? "completed" : "failed",
          transactionId: transactionId,
          processedAt: new Date(),
        },
      });

      if (status === "SUCCESS") {
        // Create or update subscription
        await this.createOrUpdateSubscription(payment);
      }

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Payment webhook error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Helper method to create or update subscription
  private static async createOrUpdateSubscription(payment: any) {
    const user = payment.user;
    const planId = payment.planId;

    // Find the plan
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error("Plan not found");
    }

    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: user.id },
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
          paymentMethod: "payment_gateway",
          trialEnd: null,
        },
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
          paymentMethod: "payment_gateway",
          trialEnd: null,
        },
      });
    }

    // Update payment with subscription ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: { subscriptionId: subscription.id },
    });

    // Create invoice
    await prisma.invoice.create({
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

    return subscription;
  }
}
