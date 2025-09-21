import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import SMSService from "@/services/SMSService";
import Joi from "joi";

const prisma = new PrismaClient();

// Validation schemas
const sendOTPSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^(010|011|012|015)\d{8}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be a valid Egyptian mobile number starting with 010, 011, 012, or 015 followed by 8 digits",
    }),
});

const verifyOTPSchema = Joi.object({
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

const resendOTPSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^(010|011|012|015)\d{8}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be a valid Egyptian mobile number starting with 010, 011, 012, or 015 followed by 8 digits",
    }),
});

export class OTPController {
  /**
   * Send OTP to phone number
   */
  static async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = sendOTPSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const { phone } = value;

      // Check rate limiting (max 3 OTPs per hour per phone)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentOTPs = await prisma.phoneVerification.count({
        where: {
          phone,
          createdAt: {
            gte: oneHourAgo,
          },
        },
      });

      if (recentOTPs >= 3) {
        res.status(429).json({
          success: false,
          error:
            "Rate limit exceeded. Please wait 1 hour before requesting another OTP.",
        });
        return;
      }

      // Generate OTP code
      const otpCode = SMSService.generateOTPCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      // Delete any existing unverified OTPs for this phone
      await prisma.phoneVerification.deleteMany({
        where: {
          phone,
          verified: false,
        },
      });

      // Create new OTP record
      const phoneVerification = await prisma.phoneVerification.create({
        data: {
          phone,
          otpCode,
          expiresAt,
        },
      });

      // Send SMS
      const smsResult = await SMSService.sendOTP({
        phone,
        otpCode,
        appName: "Pulse Robot",
      });

      if (!smsResult.status) {
        // If SMS fails, delete the OTP record
        await prisma.phoneVerification.delete({
          where: { id: phoneVerification.id },
        });

        res.status(500).json({
          success: false,
          error: smsResult.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        data: {
          phone: phone,
          expiresAt: expiresAt,
          // Don't send the actual OTP code in response for security
        },
      });
    } catch (error: any) {
      console.error("Send OTP Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Verify OTP code
   */
  static async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = verifyOTPSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const { phone, otpCode } = value;

      // Find the OTP record
      const phoneVerification = await prisma.phoneVerification.findFirst({
        where: {
          phone,
          otpCode,
          verified: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!phoneVerification) {
        res.status(400).json({
          success: false,
          error: "Invalid OTP code or phone number",
        });
        return;
      }

      // Check if OTP is expired
      if (new Date() > phoneVerification.expiresAt) {
        res.status(400).json({
          success: false,
          error: "OTP code has expired. Please request a new one.",
        });
        return;
      }

      // Check attempt limit
      if (phoneVerification.attempts >= 3) {
        res.status(400).json({
          success: false,
          error:
            "Maximum verification attempts exceeded. Please request a new OTP.",
        });
        return;
      }

      // Mark as verified
      await prisma.phoneVerification.update({
        where: { id: phoneVerification.id },
        data: {
          verified: true,
          attempts: phoneVerification.attempts + 1,
        },
      });

      res.status(200).json({
        success: true,
        message: "Phone number verified successfully",
        data: {
          phone: phone,
          verified: true,
        },
      });
    } catch (error: any) {
      console.error("Verify OTP Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Resend OTP (with rate limiting)
   */
  static async resendOTP(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = resendOTPSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const { phone } = value;

      // Check rate limiting (max 3 OTPs per hour per phone)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentOTPs = await prisma.phoneVerification.count({
        where: {
          phone,
          createdAt: {
            gte: oneHourAgo,
          },
        },
      });

      if (recentOTPs >= 3) {
        res.status(429).json({
          success: false,
          error:
            "Rate limit exceeded. Please wait 1 hour before requesting another OTP.",
        });
        return;
      }

      // Check if there's a recent unverified OTP (within 1 minute)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentUnverifiedOTP = await prisma.phoneVerification.findFirst({
        where: {
          phone,
          verified: false,
          createdAt: {
            gte: oneMinuteAgo,
          },
        },
      });

      if (recentUnverifiedOTP) {
        res.status(429).json({
          success: false,
          error: "Please wait 1 minute before requesting another OTP.",
        });
        return;
      }

      // Generate new OTP code
      const otpCode = SMSService.generateOTPCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      // Delete any existing unverified OTPs for this phone
      await prisma.phoneVerification.deleteMany({
        where: {
          phone,
          verified: false,
        },
      });

      // Create new OTP record
      const phoneVerification = await prisma.phoneVerification.create({
        data: {
          phone,
          otpCode,
          expiresAt,
        },
      });

      // Send SMS
      const smsResult = await SMSService.sendOTP({
        phone,
        otpCode,
        appName: "Pulse Robot",
      });

      if (!smsResult.status) {
        // If SMS fails, delete the OTP record
        await prisma.phoneVerification.delete({
          where: { id: phoneVerification.id },
        });

        res.status(500).json({
          success: false,
          error: smsResult.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "OTP resent successfully",
        data: {
          phone: phone,
          expiresAt: expiresAt,
        },
      });
    } catch (error: any) {
      console.error("Resend OTP Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Check if phone number is verified
   */
  static async checkVerificationStatus(
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
      console.error("Check Verification Status Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Cleanup expired OTPs (cron job)
   */
  static async cleanupExpiredOTPs(): Promise<void> {
    try {
      const result = await prisma.phoneVerification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      console.log(`Cleaned up ${result.count} expired OTPs`);
    } catch (error: any) {
      console.error("Cleanup Expired OTPs Error:", error);
    }
  }
}
