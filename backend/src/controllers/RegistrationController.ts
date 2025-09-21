import { Request, Response } from "express";
import { RegistrationService } from "@/services/RegistrationService";
import Joi from "joi";

// Validation schemas
const sendPhoneOTPSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^(010|011|012|015)\d{8}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be a valid Egyptian mobile number starting with 010, 011, 012, or 015 followed by 8 digits",
    }),
});

const verifyPhoneOTPSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^(010|011|012|015)\d{8}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be a valid Egyptian mobile number starting with 010, 011, 012, or 015 followed by 8 digits",
    }),
  otpCode: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.length": "OTP code must be exactly 6 digits",
      "string.pattern.base": "OTP code must contain only numbers",
    }),
});

export class RegistrationController {
  /**
   * Send OTP for phone verification during registration
   */
  static async sendPhoneVerificationOTP(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      // Validate request body
      const { error, value } = sendPhoneOTPSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const { phone } = value;

      const result = await RegistrationService.sendPhoneVerificationOTP(phone);

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Send Phone Verification OTP Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to send OTP",
      });
    }
  }

  /**
   * Verify phone number with OTP during registration
   */
  static async verifyPhoneNumber(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = verifyPhoneOTPSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const { phone, otpCode } = value;

      const result = await RegistrationService.verifyPhoneNumber(
        phone,
        otpCode
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Verify Phone Number Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to verify phone number",
      });
    }
  }

  /**
   * Check if phone number is verified (for registration flow)
   */
  static async checkPhoneVerificationStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { phone } = req.params;

      if (!phone || !/^(010|011|012|015)\d{8}$/.test(phone)) {
        res.status(400).json({
          success: false,
          error: "Invalid phone number format",
        });
        return;
      }

      // Check if phone is verified
      const { prisma } = await import("@/config/database");
      const phoneVerification = await prisma.phoneVerification.findFirst({
        where: {
          phone,
          verified: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      res.status(200).json({
        success: true,
        data: {
          phone,
          verified: !!phoneVerification,
          verifiedAt: phoneVerification?.updatedAt || null,
        },
      });
    } catch (error: any) {
      console.error("Check Phone Verification Status Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}
