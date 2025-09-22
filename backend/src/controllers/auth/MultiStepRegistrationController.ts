import { Request, Response } from "express";
import { RegistrationService } from "@/services/RegistrationService";
import Joi from "joi";

// Validation schemas for each step
const step1PlanSelectionSchema = Joi.object({
  planId: Joi.string().required(),
});

const step2UserDetailsSchema = Joi.object({
  planId: Joi.string().required(),
  email: Joi.string().email().required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
});

const step3BrandDetailsSchema = Joi.object({
  planId: Joi.string().required(),
  email: Joi.string().email().required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  brandName: Joi.string().min(2).max(100).required(),
  password: Joi.string().min(8).required(),
});

const step4PaymentSchema = Joi.object({
  planId: Joi.string().required(),
  email: Joi.string().email().required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  brandName: Joi.string().min(2).max(100).required(),
  password: Joi.string().min(8).optional().allow(""),
  phoneNumber: Joi.string()
    .pattern(/^(010|011|012|015)\d{8}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be a valid Egyptian mobile number starting with 010, 011, 012, or 015 followed by 8 digits",
    }),
  paymentMethod: Joi.string().valid("mock", "stripe").default("mock"),
});

export class MultiStepRegistrationController {
  // Step 1: Plan Selection
  static async validatePlanSelection(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { error, value } = step1PlanSelectionSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const result = await RegistrationService.validatePlanSelection(value);

      res.status(200).json({
        success: true,
        data: result.plan,
        message: "Plan selection validated successfully",
        step: 1,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to validate plan selection",
      });
    }
  }

  // Step 2: User Details
  static async validateUserDetails(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = step2UserDetailsSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const result = await RegistrationService.validateUserDetails(value);

      res.status(200).json({
        success: true,
        data: {
          plan: result.plan,
          userDetails: {
            email: value.email,
            firstName: value.firstName,
            lastName: value.lastName,
          },
        },
        message: "User details validated successfully",
        step: 2,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to validate user details",
      });
    }
  }

  // Step 3: Brand Details
  static async validateBrandDetails(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { error, value } = step3BrandDetailsSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const result = await RegistrationService.validateBrandDetails(value);

      res.status(200).json({
        success: true,
        data: {
          plan: result.plan,
          userDetails: {
            email: value.email,
            firstName: value.firstName,
            lastName: value.lastName,
          },
          brandDetails: {
            brandName: value.brandName,
          },
        },
        message: "Brand details validated successfully",
        step: 3,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to validate brand details",
      });
    }
  }

  // Step 4: Complete Registration with Payment
  static async completeRegistration(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { error, value } = step4PaymentSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const result = await RegistrationService.completeRegistration(value);

      res.status(201).json({
        success: true,
        data: {
          user: result.data.user,
          brand: result.data.brand,
          subscription: result.data.subscription,
          invoice: result.data.invoice,
        },
        message: "Registration completed successfully",
        step: 4,
        nextStep: "payment",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to complete registration",
      });
    }
  }

  // Process Payment (Final Step)
  static async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;

      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          error: "Subscription ID is required",
        });
        return;
      }

      const result = await RegistrationService.processPayment(subscriptionId);

      res.status(200).json({
        success: true,
        data: result.data,
        message: "Payment processed successfully",
        step: 5,
        completed: true,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process payment",
      });
    }
  }
}
