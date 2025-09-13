import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { authAPI, subscriptionAPI } from "@/services/api";

interface OnboardingData {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  phoneNumber: string;
  businessName: string;
  niche: string;
  customNiche: string;
  plan: string;
  billingCycle: "monthly" | "yearly";
}

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: any;
  maxBrands: number;
  maxUsers: number;
  trialDays: number;
  isActive: boolean;
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { t, isRTL } = useLanguage();
  const [data, setData] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    age: 0,
    email: "",
    password: "",
    phoneNumber: "",
    businessName: "",
    niche: "",
    customNiche: "",
    plan: "",
    billingCycle: "monthly",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [showSessionRestore, setShowSessionRestore] = useState(false);
  const [sessionData, setSessionData] = useState<OnboardingData | null>(null);
  const { toast } = useToast();
  const { login } = useAuth();

  const steps = [
    { id: "auth-choice", title: t("auth.onboarding.steps.authChoice") },
    { id: "name", title: t("auth.onboarding.steps.name") },
    { id: "age", title: t("auth.onboarding.steps.age") },
    { id: "credentials", title: t("auth.onboarding.steps.credentials") },
    { id: "business", title: t("auth.onboarding.steps.business") },
    { id: "plan", title: t("auth.onboarding.steps.plan") },
    { id: "review", title: t("auth.onboarding.steps.review") },
    { id: "verification", title: t("auth.onboarding.steps.verification") },
    { id: "success", title: t("auth.onboarding.steps.success") },
  ];

  // Fetch plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await subscriptionAPI.getPlans();
        setPlans(response);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        toast({
          title: "Error",
          description: t("auth.onboarding.errors.loadPlans"),
          variant: "destructive",
        });
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [toast]);

  // Load data from sessionStorage on mount
  useEffect(() => {
    const savedSession = sessionStorage.getItem("onboardingData");
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);

        // Check if session is recent (within last 24 hours)
        const isRecent =
          parsedSession.timestamp &&
          Date.now() - parsedSession.timestamp < 24 * 60 * 60 * 1000;

        if (isRecent && parsedSession.data && parsedSession.currentStep) {
          // Show session restore dialog
          setSessionData(parsedSession.data);
          setShowSessionRestore(true);
        } else {
          // Session is old, clear it
          sessionStorage.removeItem("onboardingData");
        }
      } catch (error) {
        console.error("Failed to parse saved session:", error);
        sessionStorage.removeItem("onboardingData");
      }
    }
  }, []);

  // Save data to sessionStorage on change
  useEffect(() => {
    // Only save if we have meaningful data (not just initial empty state)
    if (data.firstName || data.lastName || data.email || data.businessName) {
      const sessionData = {
        data,
        currentStep,
        timestamp: Date.now(),
      };
      const dataToSave = JSON.stringify(sessionData);
      const currentSaved = sessionStorage.getItem("onboardingData");
      // Only save if data has actually changed
      if (dataToSave !== currentSaved) {
        sessionStorage.setItem("onboardingData", dataToSave);
      }
    }
  }, [data, currentStep]);

  // Cleanup session when component unmounts or user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current progress before leaving
      if (data.firstName || data.lastName || data.email || data.businessName) {
        const sessionData = {
          data,
          currentStep,
          timestamp: Date.now(),
        };
        sessionStorage.setItem("onboardingData", JSON.stringify(sessionData));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [data, currentStep]);

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Record<string, string> = {};

      switch (step) {
        case 1: // Auth choice - no validation needed
          break;
        case 2: // Name
          if (!data.firstName.trim())
            newErrors.firstName = t(
              "auth.onboarding.validation.firstNameRequired"
            );
          if (!data.lastName.trim())
            newErrors.lastName = t(
              "auth.onboarding.validation.lastNameRequired"
            );
          if (data.firstName.length < 2)
            newErrors.firstName = t(
              "auth.onboarding.validation.firstNameMinLength"
            );
          if (data.lastName.length < 2)
            newErrors.lastName = t(
              "auth.onboarding.validation.lastNameMinLength"
            );
          break;
        case 3: // Age
          if (!data.age || data.age < 16 || data.age > 100) {
            newErrors.age = t("auth.onboarding.validation.ageRange");
          }
          break;
        case 4: // Credentials
          if (!data.email)
            newErrors.email = t("auth.onboarding.validation.emailRequired");
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = t("auth.onboarding.validation.emailInvalid");
          }
          if (!data.password)
            newErrors.password = t(
              "auth.onboarding.validation.passwordRequired"
            );
          else if (data.password.length < 8) {
            newErrors.password = t(
              "auth.onboarding.validation.passwordMinLength"
            );
          }
          if (!data.phoneNumber)
            newErrors.phoneNumber = t(
              "auth.onboarding.validation.phoneRequired"
            );
          else if (!/^10\d{8}$/.test(data.phoneNumber)) {
            newErrors.phoneNumber = t(
              "auth.onboarding.validation.phoneInvalid"
            );
          }
          break;
        case 5: // Business
          if (!data.businessName.trim())
            newErrors.businessName = t(
              "auth.onboarding.validation.businessNameRequired"
            );
          if (!data.niche)
            newErrors.niche = t("auth.onboarding.validation.nicheRequired");
          if (data.niche === "Other" && !data.customNiche.trim()) {
            newErrors.customNiche = t(
              "auth.onboarding.validation.customNicheRequired"
            );
          }
          break;
        case 6: // Plan
          if (!data.plan)
            newErrors.plan = t("auth.onboarding.validation.planRequired");
          else if (loadingPlans)
            newErrors.plan = t("auth.onboarding.validation.plansLoading");
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [data, loadingPlans]
  );

  // Memoized validation result for the current step
  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 1: // Auth choice - always valid
        return true;
      case 2: // Name
        return (
          data.firstName.trim().length >= 2 && data.lastName.trim().length >= 2
        );
      case 3: // Age
        return data.age >= 16 && data.age <= 100;
      case 4: // Credentials
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
        const passwordValid = data.password.length >= 8;
        const phoneValid = /^10\d{8}$/.test(data.phoneNumber);
        return emailValid && passwordValid && phoneValid;
      case 5: // Business
        const businessValid = data.businessName.trim().length > 0;
        const nicheValid =
          data.niche &&
          (data.niche !== "Other" || data.customNiche.trim().length > 0);
        return businessValid && nicheValid;
      case 6: // Plan
        return data.plan && !loadingPlans;
      case 7: // Review
        return true; // Review step is always valid
      default:
        return false;
    }
  }, [currentStep, data, loadingPlans]);

  // Real-time validation functions
  const validateEmail = useCallback((email: string) => {
    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: t("auth.onboarding.validation.emailRequired"),
      }));
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: t("auth.onboarding.validation.emailInvalid"),
      }));
      return false;
    }

    // For now, just validate format. Email existence will be checked on submit
    setErrors((prev) => ({ ...prev, email: "" }));
    return true;
  }, []);

  const validatePassword = useCallback((password: string) => {
    if (!password) {
      setErrors((prev) => ({
        ...prev,
        password: t("auth.onboarding.validation.passwordRequired"),
      }));
      return false;
    }

    if (password.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: t("auth.onboarding.validation.passwordMinLength"),
      }));
      return false;
    }

    if (!/[a-zA-Z]/.test(password)) {
      setErrors((prev) => ({
        ...prev,
        password: t("auth.onboarding.validation.passwordLetter"),
      }));
      return false;
    }

    if (!/\d/.test(password)) {
      setErrors((prev) => ({
        ...prev,
        password: t("auth.onboarding.validation.passwordNumber"),
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, password: "" }));
    return true;
  }, []);

  const validatePhone = useCallback((phone: string) => {
    if (!phone) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: t("auth.onboarding.validation.phoneRequired"),
      }));
      return false;
    }

    if (!/^10\d{8}$/.test(phone)) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: t("auth.onboarding.validation.phoneInvalid"),
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, phoneNumber: "" }));
    return true;
  }, []);

  const validateName = useCallback((firstName: string, lastName: string) => {
    let isValid = true;

    if (!firstName.trim()) {
      setErrors((prev) => ({ ...prev, firstName: "First name is required" }));
      isValid = false;
    } else if (firstName.trim().length < 2) {
      setErrors((prev) => ({
        ...prev,
        firstName: "First name must be at least 2 characters",
      }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, firstName: "" }));
    }

    if (!lastName.trim()) {
      setErrors((prev) => ({ ...prev, lastName: "Last name is required" }));
      isValid = false;
    } else if (lastName.trim().length < 2) {
      setErrors((prev) => ({
        ...prev,
        lastName: "Last name must be at least 2 characters",
      }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, lastName: "" }));
    }

    return isValid;
  }, []);

  const validateAge = useCallback((age: number) => {
    if (!age || age < 16 || age > 100) {
      setErrors((prev) => ({
        ...prev,
        age: t("auth.onboarding.validation.ageRange"),
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, age: "" }));
    return true;
  }, []);

  const validateBusiness = useCallback(
    (businessName: string, niche: string, customNiche: string) => {
      let isValid = true;

      if (!businessName.trim()) {
        setErrors((prev) => ({
          ...prev,
          businessName: "Business name is required",
        }));
        isValid = false;
      } else {
        setErrors((prev) => ({ ...prev, businessName: "" }));
      }

      if (!niche) {
        setErrors((prev) => ({
          ...prev,
          niche: t("auth.onboarding.validation.nicheRequired"),
        }));
        isValid = false;
      } else if (niche === "Other" && !customNiche.trim()) {
        setErrors((prev) => ({
          ...prev,
          customNiche: t("auth.onboarding.validation.customNicheRequired"),
        }));
        isValid = false;
      } else {
        setErrors((prev) => ({ ...prev, niche: "", customNiche: "" }));
      }

      return isValid;
    },
    []
  );

  // Session restoration functions
  const restoreSession = useCallback(
    (savedData: OnboardingData, savedStep: number) => {
      setData(savedData);
      setCurrentStep(savedStep);
      setShowSessionRestore(false);
      setSessionData(null);

      toast({
        title: "Session Restored",
        description: `Welcome back! Continuing from step ${savedStep}`,
      });
    },
    [toast]
  );

  const startFresh = useCallback(() => {
    // Clear session and start over
    sessionStorage.removeItem("onboardingData");
    setData({
      firstName: "",
      lastName: "",
      age: 0,
      email: "",
      password: "",
      phoneNumber: "",
      businessName: "",
      niche: "",
      customNiche: "",
      plan: "",
      billingCycle: "monthly",
    });
    setCurrentStep(1);
    setShowSessionRestore(false);
    setSessionData(null);
    setErrors({});

    toast({
      title: "Starting Fresh",
      description: "Let's begin your registration journey!",
    });
  }, []);

  const saveProgress = useCallback(() => {
    if (data.firstName || data.lastName || data.email || data.businessName) {
      const sessionData = {
        data,
        currentStep,
        timestamp: Date.now(),
      };
      sessionStorage.setItem("onboardingData", JSON.stringify(sessionData));

      toast({
        title: "Progress Saved",
        description: "Your registration progress has been saved!",
      });
    }
  }, [data, currentStep, toast]);

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 7) {
        // Review step - create account
        await handleCreateAccount();
      } else if (currentStep === 5) {
        // Business step - check if business details are filled
        if (!data.businessName.trim() || !data.niche) {
          toast({
            title: "Business Details Required",
            description: "Please fill in all business details to continue",
            variant: "destructive",
          });
        } else {
          setCurrentStep(currentStep + 1);
        }
      } else if (currentStep === 6) {
        // Plan selection step - check if plans are loaded and plan is selected
        if (loadingPlans) {
          toast({
            title: t("auth.onboarding.loading.title"),
            description: t("auth.onboarding.loading.plans"),
          });
        } else if (!data.plan) {
          toast({
            title: t("auth.onboarding.messages.planRequiredTitle"),
            description: t("auth.onboarding.messages.planRequired"),
            variant: "destructive",
          });
        } else {
          // Plan is selected, move to next step
          setCurrentStep(currentStep + 1);
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);

      // Call Google sign up API
      const response = await authAPI.googleSignUp(
        credentialResponse.credential
      );

      // Auto-fill user data from Google
      setData({
        ...data,
        firstName: response.user.firstName || "",
        lastName: response.user.lastName || "",
        email: response.user.email,
        // Keep these empty - user must fill them
        age: 0,
        businessName: "",
        niche: "",
        phoneNumber: "",
      });

      setIsGoogleUser(true);

      // Skip to business details step (Step 5)
      setCurrentStep(5);

      toast({
        title: "Google account connected!",
        description:
          "We've pre-filled your details. Please complete the remaining information.",
      });
    } catch (error: any) {
      console.error("Google sign up error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect Google account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "Google sign up failed",
      description: "Please try again or continue with email",
      variant: "destructive",
    });
  };

  const handleCreateAccount = async () => {
    console.log("handleCreateAccount called");
    setIsLoading(true);
    try {
      // Validate that a plan is selected
      if (!data.plan) {
        toast({
          title: "Error",
          description: "Please select a plan before creating your account",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log("Starting registration with data:", {
        planId: data.plan,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        brandName: data.businessName,
        password: data.password,
        paymentMethod: "mock",
      });

      // Register the user
      const response = await authAPI.registerComplete({
        planId: data.plan,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        brandName: data.businessName,
        password: data.password,
        paymentMethod: "mock",
      });

      console.log("Registration response:", response);

      // The registration was successful if we got here (no exception thrown)
      console.log("Registration successful, attempting login");

      // Clear the session data since registration is complete
      sessionStorage.removeItem("onboardingData");

      toast({
        title: "Account created successfully!",
        description: "Logging you in...",
      });

      // Automatically log the user in after successful registration
      try {
        await login(data.email, data.password);
        console.log("Login successful, navigating to success page");
        // Navigate to success page
        navigate("/success");
      } catch (loginError: any) {
        console.error("Auto-login error:", loginError);
        // If auto-login fails, still show success but redirect to login
        toast({
          title: "Account created successfully!",
          description: "Please sign in with your new account.",
        });
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    } else if (e.key === "Escape") {
      e.preventDefault();
      // Focus main input
      const mainInput = document.querySelector(
        'input[type="text"], input[type="email"], input[type="password"], input[type="number"]'
      ) as HTMLInputElement;
      if (mainInput) mainInput.focus();
    } else if (e.altKey && e.key === "ArrowLeft") {
      e.preventDefault();
      handleBack();
    } else if (e.altKey && e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  const niches = [
    "Fashion",
    "Electronics",
    "Beauty",
    "Food & Beverage",
    "Home & Furniture",
    "Services",
    "Other",
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="auth-choice"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-bold text-white">
                {t("auth.onboarding.content.authChoice.title")}
              </h1>
              <p className="text-xl text-white/80">
                {t("auth.onboarding.content.authChoice.subtitle")}
              </p>
            </div>

            <div className="space-y-6 max-w-md mx-auto">
              <Button
                onClick={() => setCurrentStep(2)}
                className="w-full h-16 text-xl bg-white/20 backdrop-blur-md text-white border-2 border-white/40 hover:bg-white/30 hover:border-white/60 font-bold"
              >
                {t("auth.onboarding.content.authChoice.continueWithEmail")}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#064FB5] text-white/60">
                    {t("auth.onboarding.content.authChoice.or")}
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-bold text-white">
                {t("auth.onboarding.content.name.title")}
              </h1>
              <p className="text-xl text-white/80">
                {t("auth.onboarding.content.name.subtitle")}
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder={t(
                    "auth.onboarding.content.name.firstNamePlaceholder"
                  )}
                  value={data.firstName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setData({ ...data, firstName: value });
                    // Real-time validation
                    if (value.trim()) {
                      validateName(value, data.lastName);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  className="h-24 text-5xl text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder:text-white/80 placeholder:font-medium text-white font-bold"
                  autoFocus
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm text-center">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder={t(
                    "auth.onboarding.content.name.lastNamePlaceholder"
                  )}
                  value={data.lastName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setData({ ...data, lastName: value });
                    // Real-time validation
                    if (value.trim()) {
                      validateName(data.firstName, value);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  className="h-24 text-5xl text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder:text-white/80 placeholder:font-medium text-white font-bold"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm text-center">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="age"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-bold text-white">
                {t("auth.onboarding.content.age.title")}
              </h1>
              <p className="text-xl text-white/80">
                {t("auth.onboarding.content.age.subtitle")}
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder={t("auth.onboarding.content.age.agePlaceholder")}
                  value={data.age || ""}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setData({ ...data, age: value });
                    // Real-time validation
                    validateAge(value);
                  }}
                  onKeyDown={handleKeyDown}
                  min="16"
                  max="100"
                  className="h-20 text-6xl text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder:text-white/80 placeholder:font-medium text-white font-semibold"
                  autoFocus
                />
                {errors.age && (
                  <p className="text-red-500 text-sm text-center">
                    {errors.age}
                  </p>
                )}
                <p className="text-[#CBD5E1] text-sm text-center">
                  Must be between 16 and 100 years old
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="credentials"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-bold text-white">
                {t("auth.onboarding.content.credentials.title")}
              </h1>
              <p className="text-xl text-white/80">
                {t("auth.onboarding.content.credentials.subtitle")}
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder={t(
                    "auth.onboarding.content.credentials.emailPlaceholder"
                  )}
                  value={data.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setData({ ...data, email: value });
                    // Real-time validation
                    validateEmail(value);
                  }}
                  onKeyDown={handleKeyDown}
                  className="h-24 text-5xl text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder:text-white/80 placeholder:font-medium text-white font-bold"
                  autoFocus
                />
                {errors.email && (
                  <p className="text-red-500 text-sm text-center">
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t(
                      "auth.onboarding.content.credentials.passwordPlaceholder"
                    )}
                    value={data.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setData({ ...data, password: value });
                      // Real-time validation
                      validatePassword(value);
                    }}
                    onKeyDown={handleKeyDown}
                    className="h-24 text-5xl text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder:text-white/80 placeholder:font-medium text-white font-bold pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm text-center">
                    {errors.password}
                  </p>
                )}
                <p className="text-[#CBD5E1] text-sm text-center">
                  At least 8 characters, 1 letter, 1 number
                </p>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-3xl font-bold text-white">
                    +20
                  </span>
                  <Input
                    type="tel"
                    placeholder={t(
                      "auth.onboarding.content.credentials.phonePlaceholder"
                    )}
                    value={data.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      setData({ ...data, phoneNumber: value });
                      // Real-time validation
                      validatePhone(value);
                    }}
                    onKeyDown={handleKeyDown}
                    className="h-24 text-5xl text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder:text-white/80 placeholder:font-medium text-white font-bold pl-16"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm text-center">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
              <div className="text-center">
                <button
                  onClick={() => (window.location.href = "/login")}
                  className="text-[#064FB5] hover:underline text-sm"
                >
                  Already have an account? Log in
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="business"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-bold text-white">
                {t("auth.onboarding.content.business.title")}
              </h1>
              <p className="text-xl text-white/80">
                {t("auth.onboarding.content.business.subtitle")}
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder={t(
                    "auth.onboarding.content.business.businessNamePlaceholder"
                  )}
                  value={data.businessName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setData({ ...data, businessName: value });
                    // Real-time validation
                    validateBusiness(value, data.niche, data.customNiche);
                  }}
                  onKeyDown={handleKeyDown}
                  className="h-24 text-5xl text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder:text-white/80 placeholder:font-medium text-white font-bold"
                  autoFocus
                />
                {errors.businessName && (
                  <p className="text-red-500 text-sm text-center">
                    {errors.businessName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Select
                  value={data.niche}
                  onValueChange={(value) => {
                    setData({ ...data, niche: value });
                    // Real-time validation
                    validateBusiness(
                      data.businessName,
                      value,
                      data.customNiche
                    );
                  }}
                >
                  <SelectTrigger className="h-24 text-5xl text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white font-bold">
                    <SelectValue
                      placeholder={t(
                        "auth.onboarding.content.business.selectNiche"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {niches.map((niche) => (
                      <SelectItem key={niche} value={niche}>
                        {niche}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.niche && (
                  <p className="text-red-500 text-sm text-center">
                    {errors.niche}
                  </p>
                )}
              </div>
              {data.niche === "Other" && (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder={t(
                      "auth.onboarding.content.business.customNichePlaceholder"
                    )}
                    value={data.customNiche}
                    onChange={(e) => {
                      const value = e.target.value;
                      setData({ ...data, customNiche: value });
                      // Real-time validation
                      validateBusiness(data.businessName, data.niche, value);
                    }}
                    onKeyDown={handleKeyDown}
                    className="h-24 text-5xl text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder:text-white/80 placeholder:font-medium text-white font-bold"
                  />
                  {errors.customNiche && (
                    <p className="text-red-500 text-sm text-center">
                      {errors.customNiche}
                    </p>
                  )}
                </div>
              )}
              <p className="text-[#CBD5E1] text-sm text-center">
                You can change this later.
              </p>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="plan"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-bold text-white">
                {t("auth.onboarding.content.plan.title")}
              </h1>
              <p className="text-xl text-white/80">
                {t("auth.onboarding.content.plan.subtitle")}
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-lg font-medium transition-all ${
                      data.billingCycle === "monthly"
                        ? "text-white"
                        : "text-white/60"
                    }`}
                  >
                    {t("auth.onboarding.content.plan.monthly")}
                  </span>
                  <button
                    onClick={() =>
                      setData({
                        ...data,
                        billingCycle:
                          data.billingCycle === "monthly"
                            ? "yearly"
                            : "monthly",
                      })
                    }
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all ${
                      data.billingCycle === "yearly"
                        ? "bg-white"
                        : "bg-white/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-[#064FB5] transition-all ${
                        data.billingCycle === "yearly"
                          ? "translate-x-9"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-lg font-medium transition-all ${
                      data.billingCycle === "yearly"
                        ? "text-white"
                        : "text-white/60"
                    }`}
                  >
                    {t("auth.onboarding.content.plan.yearly")}
                  </span>
                </div>
                {data.billingCycle === "yearly" && (
                  <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-bold border border-white/30">
                    {t("auth.onboarding.content.plan.save")} up to 20%
                  </span>
                )}
              </div>
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                  {loadingPlans ? (
                    <div className="col-span-full text-center py-10">
                      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                      <p className="text-white mt-4">Loading plans...</p>
                    </div>
                  ) : plans.length === 0 ? (
                    <div className="col-span-full text-center py-10">
                      <p className="text-white">No plans available.</p>
                    </div>
                  ) : (
                    plans.map((plan) => (
                      <Card
                        key={plan.id}
                        className={`cursor-pointer transition-all duration-300 h-80 ${
                          data.plan === plan.id
                            ? "ring-4 ring-white/60 bg-white/25 backdrop-blur-md scale-105 shadow-2xl"
                            : "bg-white/10 backdrop-blur-md hover:bg-white/20 hover:scale-105"
                        } ${
                          plan.isActive
                            ? "border-2 border-white/50"
                            : "border border-white/30"
                        }`}
                        onClick={() => setData({ ...data, plan: plan.id })}
                      >
                        <CardContent className="p-6 h-full flex flex-col justify-between">
                          <div className="text-center space-y-3 flex-1">
                            <h3 className="text-2xl font-bold text-white">
                              {plan.name}
                            </h3>
                            <div className="text-3xl font-bold text-white">
                              {data.billingCycle === "monthly"
                                ? plan.priceMonthly === 0
                                  ? "Free"
                                  : `EGP ${plan.priceMonthly.toLocaleString()}`
                                : plan.priceYearly === 0
                                ? "Free"
                                : `EGP ${plan.priceYearly.toLocaleString()}`}
                            </div>
                            {(data.billingCycle === "monthly"
                              ? plan.priceMonthly
                              : plan.priceYearly) > 0 && (
                              <div className="space-y-1">
                                <p className="text-white/70 text-sm">
                                  per{" "}
                                  {data.billingCycle === "monthly"
                                    ? "month"
                                    : "year"}
                                </p>
                                {data.billingCycle === "yearly" &&
                                  plan.priceYearly > 0 && (
                                    <p className="text-green-400 text-xs">
                                      EGP {(plan.priceYearly / 12).toFixed(0)}
                                      /month
                                    </p>
                                  )}
                              </div>
                            )}
                            {plan.name === "Free" && (
                              <div className="bg-green-500/20 border border-green-400/30 rounded-full px-3 py-1 inline-block">
                                <span className="text-green-400 text-xs font-semibold">
                                  Perfect to start
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 mt-4">
                            {Array.isArray(plan.features.features) ? (
                              plan.features.features
                                .slice(0, 5)
                                .map((feature: string, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-3"
                                  >
                                    <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                                    <span className="text-white/90 text-sm font-medium">
                                      {feature}
                                    </span>
                                  </div>
                                ))
                            ) : (
                              <div className="text-white/90 text-sm">
                                {plan.maxUsers === -1
                                  ? "Unlimited users"
                                  : `${plan.maxUsers} users`}
                                ,{" "}
                                {plan.maxBrands === -1
                                  ? "Unlimited brands"
                                  : `${plan.maxBrands} brands`}
                              </div>
                            )}
                            {Array.isArray(plan.features.features) &&
                              plan.features.features.length > 5 && (
                                <div className="text-white/60 text-xs text-center pt-2">
                                  +{plan.features.features.length - 5} more
                                  features
                                </div>
                              )}
                          </div>
                          <RadioGroup
                            value={data.plan}
                            onValueChange={(value) =>
                              setData({ ...data, plan: value })
                            }
                          >
                            <RadioGroupItem
                              value={plan.id}
                              className="sr-only"
                            />
                          </RadioGroup>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
              {errors.plan && (
                <p className="text-red-500 text-sm text-center">
                  {errors.plan}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-bold text-white">
                {t("auth.onboarding.content.review.title")}
              </h1>
              <p className="text-xl text-white/80">
                {t("auth.onboarding.content.review.subtitle")}
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <Card className="p-10 space-y-8 bg-white/10 backdrop-blur-md border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {t("auth.onboarding.content.review.personalInfo")}
                    </h3>
                    <div className="space-y-3 text-white/90">
                      <p className="text-lg">
                        <span className="text-white font-semibold">Name:</span>{" "}
                        {data.firstName} {data.lastName}
                      </p>
                      <p className="text-lg">
                        <span className="text-white font-semibold">Age:</span>{" "}
                        {data.age}
                      </p>
                      <p className="text-lg">
                        <span className="text-white font-semibold">Email:</span>{" "}
                        {data.email}
                      </p>
                      <p className="text-lg">
                        <span className="text-white font-semibold">Phone:</span>{" "}
                        +20 {data.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {t("auth.onboarding.content.review.businessInfo")}
                    </h3>
                    <div className="space-y-3 text-white/90">
                      <p className="text-lg">
                        <span className="text-white font-semibold">
                          Business:
                        </span>{" "}
                        {data.businessName}
                      </p>
                      <p className="text-lg">
                        <span className="text-white font-semibold">Niche:</span>{" "}
                        {data.niche === "Other" ? data.customNiche : data.niche}
                      </p>
                      <p className="text-lg">
                        <span className="text-white font-semibold">Plan:</span>{" "}
                        {plans.find((p) => p.id === data.plan)?.name ||
                          "Not selected"}
                      </p>
                      <p className="text-lg">
                        <span className="text-white font-semibold">
                          Billing:
                        </span>{" "}
                        {data.billingCycle}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    className="bg-white/20 backdrop-blur-md text-white border-2 border-white/40 hover:bg-white/30 hover:border-white/60 text-xl px-10 py-4 font-bold"
                  >
                    Edit Details
                  </Button>
                </div>
              </Card>
            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            key="verification"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-bold text-white">
                {t("auth.onboarding.verification.title")}
              </h1>
              <p className="text-xl text-[#CBD5E1]">
                {t("auth.onboarding.verification.subtitle")}
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  className="h-24 text-6xl text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder:text-white/80 placeholder:font-medium text-white font-bold tracking-widest"
                  autoFocus
                />
                <p className="text-[#CBD5E1] text-sm text-center">
                  For demo purposes, use code:{" "}
                  <span className="font-bold text-[#064FB5]">1234</span>
                </p>
              </div>
              <div className="text-center">
                <button className="text-[#064FB5] hover:underline text-sm">
                  Didn't receive the code? Resend in 30s
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 8:
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-6xl font-bold text-white">
                {t("auth.onboarding.success.title")}
              </h1>
              <p className="text-xl text-[#CBD5E1]">
                {t("auth.onboarding.success.subtitle")}
              </p>
            </div>
            <div className="space-y-4">
              <Button
                onClick={() => (window.location.href = "/brand/dashboard")}
                size="lg"
                className="bg-[#064FB5] hover:bg-[#064FB5]/90"
              >
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Session Restore Dialog */}
      {showSessionRestore && sessionData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {t("auth.onboarding.sessionRestore.title")}
              </h2>
              <p className="text-gray-600">
                {t("auth.onboarding.sessionRestore.subtitle")}
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-left bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  {t("auth.onboarding.sessionRestore.progress")}
                </p>
                <div className="space-y-1 text-sm">
                  {sessionData.firstName && sessionData.lastName && (
                    <p className="text-gray-800">
                      ✓ Name: {sessionData.firstName} {sessionData.lastName}
                    </p>
                  )}
                  {sessionData.email && (
                    <p className="text-gray-800">
                      ✓ Email: {sessionData.email}
                    </p>
                  )}
                  {sessionData.businessName && (
                    <p className="text-gray-800">
                      ✓ Business: {sessionData.businessName}
                    </p>
                  )}
                  {sessionData.plan && (
                    <p className="text-gray-800">✓ Plan: Selected</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => {
                  try {
                    const savedSession =
                      sessionStorage.getItem("onboardingData");
                    if (savedSession) {
                      const parsed = JSON.parse(savedSession);
                      const step = parsed.currentStep || 1;
                      restoreSession(sessionData, step);
                    } else {
                      restoreSession(sessionData, 1);
                    }
                  } catch (error) {
                    console.error("Error parsing session:", error);
                    restoreSession(sessionData, 1);
                  }
                }}
                className="bg-[#064FB5] hover:bg-[#064FB5]/90 text-white"
                size="lg"
              >
                {t("auth.onboarding.sessionRestore.continue")}
              </Button>
              <Button
                onClick={startFresh}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                size="lg"
              >
                {t("auth.onboarding.sessionRestore.startFresh")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="min-h-screen bg-[#064FB5] flex flex-col">
        {/* Progress Bar */}
        <div className="bg-[#064FB5] p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-[#064FB5]/80 rounded-lg transition-colors"
                >
                  <ChevronLeft size={24} className="text-white" />
                </button>
              )}
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= currentStep ? "bg-white" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-white/70">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        {currentStep > 0 && currentStep < steps.length && (
          <div className="bg-[#064FB5] p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              {/* Left side - Navigation buttons */}
              <div
                className={`flex items-center ${
                  isRTL ? "space-x-reverse space-x-4" : "space-x-4"
                }`}
              >
                <Link
                  to="/login"
                  className="text-white/70 hover:text-white text-base font-medium transition-colors"
                >
                  {t("auth.onboarding.navigation.switchToLogin")}
                </Link>
                <Link
                  to="/"
                  className="text-white/70 hover:text-white text-base font-medium transition-colors"
                >
                  {t("auth.onboarding.navigation.goHome")}
                </Link>
                {currentStep > 1 && (
                  <>
                    <button
                      onClick={saveProgress}
                      className="text-white/70 hover:text-white text-base font-medium transition-colors"
                    >
                      {t("auth.onboarding.navigation.saveProgress")}
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to clear your progress? This action cannot be undone."
                          )
                        ) {
                          startFresh();
                        }
                      }}
                      className="text-white/70 hover:text-white text-base font-medium transition-colors"
                    >
                      {t("auth.onboarding.navigation.clearProgress")}
                    </button>
                  </>
                )}
              </div>

              {/* Right side - Continue button */}
              <Button
                onClick={async () => await handleNext()}
                disabled={!isCurrentStepValid || isLoading}
                size="lg"
                className="bg-white text-[#064FB5] hover:bg-white/90 h-12 px-8 font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-[#064FB5] border-t-transparent rounded-full animate-spin" />
                    <span>{t("auth.onboarding.common.loading")}</span>
                  </div>
                ) : currentStep === 7 ? (
                  t("auth.register.createAccount")
                ) : (
                  t("auth.onboarding.common.continue")
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Onboarding;
