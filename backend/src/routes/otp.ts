import { Router } from "express";
import { OTPController } from "@/controllers/OTPController";
import { RegistrationController } from "@/controllers/RegistrationController";

const router = Router();

// General OTP routes
router.post("/send", OTPController.sendOTP);
router.post("/verify", OTPController.verifyOTP);
router.post("/resend", OTPController.resendOTP);
router.get("/status/:phone", OTPController.checkVerificationStatus);

// Registration-specific OTP routes
router.post(
  "/registration/send",
  RegistrationController.sendPhoneVerificationOTP
);
router.post("/registration/verify", RegistrationController.verifyPhoneNumber);
router.get(
  "/registration/status/:phone",
  RegistrationController.checkPhoneVerificationStatus
);

export default router;
