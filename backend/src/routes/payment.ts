import express from "express";
import { PaymentController } from "@/controllers/subscription/PaymentController";
import { authenticateToken } from "@/middleware/auth";

const router = express.Router();

// Initialize payment - generate hash for iframe (authenticated)
router.post(
  "/initialize",
  authenticateToken,
  PaymentController.initializePayment
);

// Payment redirect endpoint (called by payment gateway after payment)
router.get("/redirect", PaymentController.handlePaymentRedirect);

// Payment webhook endpoint (called by payment gateway server-to-server)
router.post("/webhook", PaymentController.handlePaymentWebhook);

// Payment confirmation endpoint (called by payment gateway webhook)
router.post("/confirm", PaymentController.confirmPayment);

// Get user's payment history (authenticated)
router.get("/history", authenticateToken, PaymentController.getPaymentHistory);

// Get specific invoice (authenticated)
router.get(
  "/invoice/:invoiceId",
  authenticateToken,
  PaymentController.getInvoice
);

export default router;
