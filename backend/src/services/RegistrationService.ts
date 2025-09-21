import { prisma } from "@/config/database";
import {
  Step1PlanSelectionDto,
  Step2UserDetailsDto,
  Step3BrandDetailsDto,
  Step4PaymentDto,
  MultiStepRegistrationDto,
} from "@/types";
import { hashPassword, generateInvoiceNumber } from "@/utils/helpers";
import SMSService from "./SMSService";

export class RegistrationService {
  // Step 1: Validate plan selection
  static async validatePlanSelection(data: Step1PlanSelectionDto) {
    try {
      const plan = await prisma.plan.findUnique({
        where: { id: data.planId },
      });

      if (!plan) {
        throw new Error("Plan not found");
      }

      if (!plan.isActive) {
        throw new Error("Plan is not available");
      }

      return {
        success: true,
        plan,
        message: "Plan selected successfully",
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to validate plan"
      );
    }
  }

  // Step 2: Validate user details
  static async validateUserDetails(data: Step2UserDetailsDto) {
    try {
      // Validate plan first
      const plan = await prisma.plan.findUnique({
        where: { id: data.planId },
      });

      if (!plan) {
        throw new Error("Plan not found");
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error("Email already registered");
      }

      return {
        success: true,
        plan,
        message: "User details validated successfully",
      };
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to validate user details"
      );
    }
  }

  // Step 3: Validate brand details
  static async validateBrandDetails(data: Step3BrandDetailsDto) {
    try {
      // Validate plan
      const plan = await prisma.plan.findUnique({
        where: { id: data.planId },
      });

      if (!plan) {
        throw new Error("Plan not found");
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Check if brand name already exists
      const existingBrand = await prisma.brand.findFirst({
        where: { name: data.brandName },
      });

      if (existingBrand) {
        throw new Error("Brand name already exists");
      }

      return {
        success: true,
        plan,
        message: "Brand details validated successfully",
      };
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to validate brand details"
      );
    }
  }

  // Step 4: Send OTP for phone verification
  static async sendPhoneVerificationOTP(phone: string) {
    try {
      // Validate phone number format
      if (!/^(010|011|012|015)\d{8}$/.test(phone)) {
        throw new Error("Invalid Egyptian mobile number format");
      }

      // Check if phone is already verified
      const existingVerification = await prisma.phoneVerification.findFirst({
        where: {
          phone,
          verified: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      if (existingVerification) {
        return {
          success: true,
          message: "Phone number already verified",
          data: { phone, alreadyVerified: true },
        };
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

      console.log("💾 Created OTP record:", {
        id: phoneVerification.id,
        phone: phoneVerification.phone,
        otpCode: phoneVerification.otpCode,
        expiresAt: phoneVerification.expiresAt,
      });

      // Send SMS
      const smsResult = await SMSService.sendOTP({
        phone,
        otpCode,
        appName: "Pulse Robot",
      });

      console.log("📤 SMS Result:", smsResult);

      if (!smsResult.status) {
        // Even if SMS API reports failure, keep the OTP record since SMS might still be sent
        // This handles cases where Floki SMS API returns errors but SMS is actually delivered
        console.log(
          "⚠️ SMS API reported failure but keeping OTP record for verification:",
          {
            phone,
            otpCode,
            smsError: smsResult.message,
          }
        );

        // Don't delete the OTP record - let user try to verify
        // If SMS was actually sent, verification will work
        // If SMS wasn't sent, verification will fail and user can request resend
      }

      return {
        success: true,
        message: smsResult.status
          ? "OTP sent successfully"
          : "OTP created - please check your phone for the verification code",
        data: {
          phone,
          expiresAt,
          smsStatus: smsResult.status,
          smsMessage: smsResult.message,
        },
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to send OTP"
      );
    }
  }

  // Step 5: Verify phone number with OTP
  static async verifyPhoneNumber(phone: string, otpCode: string) {
    try {
      console.log("🔍 Verifying OTP:", { phone, otpCode });

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

      console.log("📱 Found OTP record:", phoneVerification);

      if (!phoneVerification) {
        // Let's also check what OTP records exist for this phone
        const allRecords = await prisma.phoneVerification.findMany({
          where: { phone },
          orderBy: { createdAt: "desc" },
        });
        console.log("📋 All OTP records for phone:", allRecords);
        throw new Error("Invalid OTP code or phone number");
      }

      // Check if OTP is expired
      if (new Date() > phoneVerification.expiresAt) {
        throw new Error("OTP code has expired. Please request a new one.");
      }

      // Check attempt limit
      if (phoneVerification.attempts >= 3) {
        throw new Error(
          "Maximum verification attempts exceeded. Please request a new OTP."
        );
      }

      // Mark as verified
      await prisma.phoneVerification.update({
        where: { id: phoneVerification.id },
        data: {
          verified: true,
          attempts: phoneVerification.attempts + 1,
        },
      });

      return {
        success: true,
        message: "Phone number verified successfully",
        data: {
          phone,
          verified: true,
        },
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to verify phone number"
      );
    }
  }

  // Step 6: Complete registration with payment (now requires phone verification)
  static async completeRegistration(data: Step4PaymentDto) {
    try {
      // Validate all data
      const plan = await prisma.plan.findUnique({
        where: { id: data.planId },
      });

      if (!plan) {
        throw new Error("Plan not found");
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Check if brand name already exists
      const existingBrand = await prisma.brand.findFirst({
        where: { name: data.brandName },
      });

      if (existingBrand) {
        throw new Error("Brand name already exists");
      }

      // Check if phone number is verified
      const phoneVerification = await prisma.phoneVerification.findFirst({
        where: {
          phone: data.phoneNumber,
          verified: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      if (!phoneVerification) {
        throw new Error(
          "Phone number must be verified before completing registration"
        );
      }

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create user
        const hashedPassword = data.isGoogleUser
          ? null
          : await hashPassword(data.password);
        const user = await tx.user.create({
          data: {
            email: data.email,
            passwordHash: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            emailVerified: false,
          },
        });

        // 2. Create brand
        const brand = await tx.brand.create({
          data: {
            name: data.brandName,
            userId: user.id,
            settings: {},
          },
        });

        // 3. Create brand user relationship (owner)
        await tx.brandUser.create({
          data: {
            brandId: brand.id,
            userId: user.id,
            role: "owner",
            permissions: [],
            acceptedAt: new Date(),
          },
        });

        // 4. Create subscription with proper trial logic
        const now = new Date();
        const isPaidPlan = plan.priceMonthly > 0; // Growth and Scale plans
        const trialDays = isPaidPlan ? plan.trialDays : 0;
        const trialEnd =
          trialDays > 0
            ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
            : null;

        const subscription = await tx.subscription.create({
          data: {
            userId: user.id,
            planId: data.planId,
            status: isPaidPlan ? "trialing" : "active", // Free plan is immediately active
            currentPeriodStart: now,
            currentPeriodEnd: isPaidPlan ? trialEnd : null,
            trialStart: isPaidPlan ? now : null,
            trialEnd: trialEnd,
            cancelAtPeriodEnd: false,
            paymentMethod: data.paymentMethod || "mock",
          },
          include: {
            plan: true,
          },
        });

        // 5. Create initial invoice (only for paid plans)
        let invoice = null;
        if (isPaidPlan) {
          invoice = await tx.invoice.create({
            data: {
              subscriptionId: subscription.id,
              userId: user.id,
              amount: plan.priceMonthly,
              currency: "EGP",
              status: "pending",
              invoiceNumber: generateInvoiceNumber(),
              dueDate: trialEnd,
              description: `Initial subscription to ${plan.name} plan`,
            },
          });
        }

        return {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          brand,
          subscription,
          invoice,
        };
      });

      return {
        success: true,
        data: result,
        message: "Registration completed successfully",
      };
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to complete registration"
      );
    }
  }

  // Process payment after registration
  static async processPayment(subscriptionId: string) {
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

      return {
        success: true,
        data: updatedSubscription,
        message: "Payment processed successfully",
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to process payment"
      );
    }
  }

  // Google OAuth Sign Up
  static async googleSignUp(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    googleId: string;
    picture?: string;
  }) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (existingUser) {
        // User exists, return their data for the onboarding flow
        return {
          user: {
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            email: existingUser.email,
          },
          message: "User already exists",
        };
      }

      // Create new user with Google data
      const newUser = await prisma.user.create({
        data: {
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          emailVerified: true, // Google accounts are pre-verified
          googleId: googleUser.googleId,
          picture: googleUser.picture,
          // Note: No password hash for Google users
        },
      });

      return {
        user: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
        },
        message: "Google user created successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}
