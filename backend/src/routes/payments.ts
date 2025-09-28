import { Router, Request, Response } from "express";
import {
  payWithToken,
  generateHPPUrl,
  validateSignature,
  testKashierConnection,
  testKashierWithMinimalRequest,
} from "../services/KashierService";
import { extractPaymentInfo } from "../utils/kashierSign";
import { generateKashierOrderHash } from "../utils/kashierHash";
import { authenticateToken } from "../middleware/auth";
import { prisma } from "../config/database";

const router = Router();

/**
 * Pay with Token - Initiate payment using stored card token
 * POST /api/payments/pay-with-token
 */
router.post(
  "/pay-with-token",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      console.log("🔍 Pay with Token Request:", {
        body: req.body,
        user: (req as any).user?.id,
        timestamp: new Date().toISOString(),
      });

      const {
        cardToken,
        securityCode,
        amount,
        currency = "EGP",
        description,
        merchantOrderId,
        customerReference,
        enable3DS = true,
      } = req.body;

      // Validate required fields
      if (!cardToken || !amount || !merchantOrderId || !customerReference) {
        return res.status(400).json({
          error: "Missing required fields",
          required: ["cardToken", "amount", "merchantOrderId", "customerReference"],
        });
      }

      // Call Kashier API
      const result = await payWithToken({
        cardToken,
        securityCode,
        amount: String(amount),
        currency,
        description,
        merchantOrderId,
        customerReference,
        enable3DS,
      });

      console.log("✅ Payment initiated successfully:", {
        orderId: result.response?.order?.systemOrderId,
        status: result.response?.status,
        transactionId: result.response?.transactionId,
      });

      return res.json(result);
    } catch (error: any) {
      console.error("❌ Payment initiation failed:", error);
      return res.status(500).json({
        error: "Payment initiation failed",
        details: error?.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Webhook endpoint - Handle payment status updates from Kashier
 * POST /api/payments/webhook
 */
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    // Validate signature from query parameters using secret key
    const valid = validateSignature(
      req.query as Record<string, string>,
      process.env.KASHIER_SECRET_KEY!
    );
    if (!valid) {
      console.error("Invalid webhook signature");
      return res.status(401).send("Invalid signature");
    }

    // Extract payment information
    const paymentInfo = extractPaymentInfo(req.query as Record<string, string>);

    console.log("Kashier webhook received:", {
      body: req.body,
      query: req.query,
      paymentInfo,
    });

    // Handle successful payment
    if (paymentInfo.status === "paid" || paymentInfo.status === "success") {
      try {
        // Extract order ID to get plan information
        const orderId = paymentInfo.orderId;
        console.log("Processing successful payment for order:", orderId);

        // Parse order ID to extract plan information
        // Format: ORDER-{timestamp}-{planName}
        const orderParts = orderId.split("-");
        const planName = orderParts[orderParts.length - 1]?.toLowerCase();

        console.log("Extracted plan name:", planName);

        if (planName && (planName === "growth" || planName === "scale")) {
          // Find the plan by name
          const plan = await prisma.plan.findFirst({
            where: {
              name: {
                equals: planName.charAt(0).toUpperCase() + planName.slice(1),
                mode: "insensitive",
              },
            },
          });

          if (plan) {
            console.log("Found plan:", plan.name, "ID:", plan.id);

            // Find user by customer reference
            const user = await prisma.user.findUnique({
              where: { id: paymentInfo.customerReference },
              include: { subscriptions: true },
            });

            if (user) {
              console.log("Found user:", user.email);

              // Update or create subscription
              let subscription;
              if (user.subscriptions.length > 0) {
                // Update existing subscription
                subscription = await prisma.subscription.update({
                  where: { id: user.subscriptions[0].id },
                  data: {
                    planId: plan.id,
                    status: "active",
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000
                    ), // 30 days
                    paymentMethod: "kashier",
                    trialEnd: null, // End trial
                    isTrialActive: false,
                  },
                  include: { plan: true },
                });
                console.log("Updated existing subscription:", subscription.id);
              } else {
                // Create new subscription
                subscription = await prisma.subscription.create({
                  data: {
                    userId: user.id,
                    planId: plan.id,
                    status: "active",
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000
                    ), // 30 days
                    paymentMethod: "kashier",
                    trialEnd: null,
                    isTrialActive: false,
                  },
                  include: { plan: true },
                });
                console.log("Created new subscription:", subscription.id);
              }

              // Create payment record
              await prisma.payment.create({
                data: {
                  subscriptionId: subscription.id,
                  amount: plan.priceMonthly,
                  currency: "EGP",
                  status: "completed",
                  paymentMethod: "kashier",
                  paymentId: paymentInfo.transactionId || orderId,
                  processedAt: new Date(),
                },
              });

              // Create invoice
              await prisma.invoice.create({
                data: {
                  subscriptionId: subscription.id,
                  userId: user.id,
                  amount: plan.priceMonthly,
                  currency: "EGP",
                  status: "paid",
                  dueDate: new Date(),
                  paidAt: new Date(),
                  invoiceNumber: `INV-${Date.now()}`,
                },
              });

              console.log(
                "✅ Payment processed successfully for user:",
                user.email,
                "Plan:",
                plan.name,
                "Subscription ID:",
                subscription.id
              );

              // Log the updated subscription for debugging
              console.log("Updated subscription details:", {
                id: subscription.id,
                planId: subscription.planId,
                status: subscription.status,
                isTrialActive: subscription.isTrialActive,
                currentPeriodStart: subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd,
              });
            } else {
              console.error(
                "User not found for customer reference:",
                paymentInfo.customerReference
              );
            }
          } else {
            console.error("Plan not found for name:", planName);
          }
        } else {
          console.error("Invalid plan name in order ID:", planName);
        }
      } catch (error) {
        console.error("Error processing payment webhook:", error);
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).send("Internal server error");
  }
});

/**
 * Browser redirect endpoint - Handle customer return from Kashier
 * GET /api/payments/redirect
 */
router.get("/redirect", async (req: Request, res: Response) => {
  try {
    // Validate signature using secret key (not API key)
    const valid = validateSignature(
      req.query as Record<string, string>,
      process.env.KASHIER_SECRET_KEY!
    );
    if (!valid) {
      console.error("Invalid redirect signature");
      return res.status(401).send("Signature mismatch");
    }

    // Extract payment information
    const paymentInfo = extractPaymentInfo(req.query as Record<string, string>);

    console.log("Payment redirect received:", paymentInfo);

    // TODO: Update order status in database
    // TODO: Log payment completion

    // Redirect to frontend payment result page
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resultUrl = `${frontendUrl}/payments/result?${new URLSearchParams(
      req.query as Record<string, string>
    ).toString()}`;

    return res.redirect(resultUrl);
  } catch (error) {
    console.error("Redirect processing error:", error);
    return res.status(500).send("Internal server error");
  }
});

/**
 * Generate Hosted Payment Page URL
 * POST /api/payments/hpp-url
 */
router.post(
  "/hpp-url",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      console.log("🔍 HPP URL Request received:", {
        body: req.body,
        headers: req.headers,
        user: (req as any).user?.id,
        timestamp: new Date().toISOString(),
      });

      const {
        orderId,
        amount,
        currency = "EGP",
        customerReference,
        description,
        enable3DS = true,
      } = req.body;

      if (!orderId || !amount || !currency) {
        console.error("❌ Missing required fields:", {
          orderId,
          amount,
          currency,
        });
        return res.status(400).json({
          error: "Missing required fields",
          required: ["orderId", "amount", "currency"],
        });
      }

      // Log environment variables (without exposing secrets)
      console.log("🔧 Environment check:", {
        KASHIER_MERCHANT_ID: process.env.KASHIER_MERCHANT_ID
          ? "✅ Set"
          : "❌ Missing",
        KASHIER_API_KEY: process.env.KASHIER_API_KEY ? "✅ Set" : "❌ Missing",
        KASHIER_PAYMENT_API_KEY: process.env.KASHIER_PAYMENT_API_KEY
          ? "✅ Set"
          : "❌ Missing",
        KASHIER_SECRET_KEY: process.env.KASHIER_SECRET_KEY
          ? "✅ Set"
          : "❌ Missing (This is what we need!)",
        KASHIER_MERCHANT_REDIRECT: process.env.KASHIER_MERCHANT_REDIRECT
          ? "✅ Set"
          : "❌ Missing",
        KASHIER_WEBHOOK_URL: process.env.KASHIER_WEBHOOK_URL
          ? "✅ Set"
          : "❌ Missing",
        KASHIER_MODE: process.env.KASHIER_MODE || "test",
      });

      // Generate hash for HPP - Use the correct hash secret
      // We need KASHIER_HASH_SECRET from the dashboard (not the API key)
      const hashParams = {
        merchantId: process.env.KASHIER_MERCHANT_ID!,
        merchantOrderId: orderId,
        amount,
        currency,
        customerReference,
        secret: process.env.KASHIER_SECRET_KEY!, // Use secret key for hash generation (as per Kashier docs)
      };

      console.log("🔐 Hash generation params:", {
        ...hashParams,
        secret: hashParams.secret ? "✅ Set" : "❌ Missing",
      });

      // Debug: Check if secret key is actually set
      console.log("🔍 Debug - Secret key check:");
      console.log(
        "KASHIER_SECRET_KEY exists:",
        !!process.env.KASHIER_SECRET_KEY
      );
      console.log(
        "KASHIER_SECRET_KEY length:",
        process.env.KASHIER_SECRET_KEY?.length || 0
      );
      console.log(
        "KASHIER_SECRET_KEY starts with:",
        process.env.KASHIER_SECRET_KEY?.substring(0, 20) + "..."
      );

      const hash = generateKashierOrderHash(hashParams);
      console.log("🔐 Generated hash:", hash);

      // Test hash generation with known values to verify correctness
      const {
        testHashGeneration,
        testWithRealCredentials,
      } = require("../utils/kashierHash");
      console.log("🧪 Testing hash generation...");
      testHashGeneration();
      testWithRealCredentials();

      // Hash generation is working correctly with KASHIER_SECRET_KEY
      console.log("✅ Hash generation completed successfully!");

      // Generate HPP URL
      const hppParams = {
        merchantId: process.env.KASHIER_MERCHANT_ID!,
        orderId,
        amount,
        currency,
        hash,
        mode: process.env.KASHIER_MODE || "test",
        merchantRedirect: process.env.KASHIER_MERCHANT_REDIRECT!,
        serverWebhook: process.env.KASHIER_WEBHOOK_URL!,
        customer: customerReference,
        enable3DS,
        interactionSource: "ECOMMERCE",
        metaData: {
          description: description || "",
          source: "web",
        },
        // Add additional parameters that might be required
        allowedMethods: "card,wallet,bank",
        defaultMethod: "card",
        redirectMethod: "POST",
      };

      console.log("🌐 HPP URL generation params:", hppParams);

      const hppUrl = generateHPPUrl(hppParams);
      console.log("🌐 Generated HPP URL:", hppUrl);

      const response = {
        url: hppUrl,
        orderId,
        amount,
        currency,
        hash,
      };

      console.log("✅ HPP URL Response:", response);
      return res.json(response);
    } catch (error: any) {
      // Enhanced error logging for HPP URL generation
      console.error("❌ HPP URL Generation Error - Full Details:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        timestamp: new Date().toISOString(),
        requestBody: req.body,
        environment: {
          KASHIER_MERCHANT_ID: process.env.KASHIER_MERCHANT_ID
            ? "✅ Set"
            : "❌ Missing",
          KASHIER_API_KEY: process.env.KASHIER_API_KEY
            ? "✅ Set"
            : "❌ Missing",
          KASHIER_SECRET_KEY: process.env.KASHIER_SECRET_KEY
            ? "✅ Set"
            : "❌ Missing",
          KASHIER_MERCHANT_REDIRECT: process.env.KASHIER_MERCHANT_REDIRECT
            ? "✅ Set"
            : "❌ Missing",
          KASHIER_WEBHOOK_URL: process.env.KASHIER_WEBHOOK_URL
            ? "✅ Set"
            : "❌ Missing",
        },
      });

      return res.status(500).json({
        error: "Failed to generate HPP URL",
        details: error?.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Test Kashier API connection
 * GET /api/payments/test-connection
 */
router.get("/test-connection", async (req: Request, res: Response) => {
  try {
    const result = await testKashierConnection();
    return res.json(result);
  } catch (error: any) {
    console.error("Connection test error:", error);
    return res.status(500).json({
      error: "Connection test failed",
      details: error?.message,
    });
  }
});

/**
 * Test Kashier API with minimal request (exact documentation format)
 * GET /api/payments/test-minimal
 */
router.get("/test-minimal", async (req: Request, res: Response) => {
  try {
    const result = await testKashierWithMinimalRequest();
    return res.json(result);
  } catch (error: any) {
    console.error("Minimal test error:", error);
    return res.status(500).json({
      error: "Minimal test failed",
      details: error?.message,
    });
  }
});

/**
 * Verify payment status
 * GET /api/payments/verify/:transactionId
 */
router.get(
  "/verify/:transactionId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({ error: "Transaction ID is required" });
      }

      // Direct API calls are disabled - use HPP flow instead
      return res.status(410).json({
        error: "Direct API calls are disabled",
        message: "Please use the HPP flow instead",
        hppEndpoint: "/api/payments/hpp-url",
      });
    } catch (error: any) {
      console.error("Payment verification error:", error);
      return res.status(500).json({
        error: "Failed to verify payment",
        details: error?.message,
      });
    }
  }
);

export default router;
