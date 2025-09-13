import { prisma } from "@/config/database";
import {
  Step1PlanSelectionDto,
  Step2UserDetailsDto,
  Step3BrandDetailsDto,
  Step4PaymentDto,
  MultiStepRegistrationDto,
} from "@/types";
import { hashPassword, generateInvoiceNumber } from "@/utils/helpers";

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

  // Step 4: Complete registration with payment
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

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create user
        const hashedPassword = await hashPassword(data.password);
        const user = await tx.user.create({
          data: {
            email: data.email,
            passwordHash: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
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

        // 4. Create subscription
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + plan.trialDays);

        const subscription = await tx.subscription.create({
          data: {
            userId: user.id,
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

        // 5. Create initial invoice
        const invoice = await tx.invoice.create({
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
