import express from "express";
import { PaymentController } from "@/controllers/subscription/PaymentController";
import { authenticateToken } from "@/middleware/auth";

const router = express.Router();

// Payment confirmation endpoint (called by Kashier webhook)
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
