import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  const { login } = useAuth();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      // Get the brand ID from localStorage after login
      const brandId = localStorage.getItem("brandId");
      if (brandId) {
        navigate(`/brand/${brandId}`);
      } else {
        // Fallback to demo brand ID if something went wrong
        navigate("/brand/demo-brand-123");
      }
    } catch (error: any) {
      // Handle specific error messages
      let errorTitle = t("auth.login.errorTitle");
      let errorDescription = error.message || t("auth.login.errorMessage");

      // Check for network errors first
      if (!navigator.onLine) {
        errorTitle = t("auth.login.noInternet");
        errorDescription = t("auth.login.noInternetMessage");
      } else if (
        error.name === "TypeError" &&
        error.message.includes("fetch")
      ) {
        errorTitle = t("auth.login.connectionError");
        errorDescription = t("auth.login.connectionErrorMessage");
      } else if (error.message?.includes("Network connection failed")) {
        errorTitle = t("auth.login.connectionError");
        errorDescription = t("auth.login.connectionErrorMessage");
      } else if (error.message?.includes("Invalid email or password")) {
        errorTitle = t("auth.login.invalidCredentials");
        errorDescription = t("auth.login.invalidCredentialsMessage");
      } else if (error.message?.includes("No password set")) {
        errorTitle = t("auth.login.accountError");
        errorDescription = t("auth.login.accountErrorMessage");
      } else if (error.message?.includes("No brand found")) {
        errorTitle = t("auth.login.noBrand");
        errorDescription = t("auth.login.noBrandMessage");
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleLogin(e as any);
    }
  };

  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: t("auth.login.showcase.slide1.title"),
      description: t("auth.login.showcase.slide1.description"),
    },
    {
      title: t("auth.login.showcase.slide2.title"),
      description: t("auth.login.showcase.slide2.description"),
    },
    {
      title: t("auth.login.showcase.slide3.title"),
      description: t("auth.login.showcase.slide3.description"),
    },
    {
      title: t("auth.login.showcase.slide4.title"),
      description: t("auth.login.showcase.slide4.description"),
    },
  ];

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className={`min-h-screen bg-[#064FB5] flex ${isRTL ? "rtl" : "ltr"}`}>
      {/* Left Side - Showcase */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 bg-white">
        <div className="max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 50 : -50 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <h2 className="text-4xl font-bold text-[#064FB5] leading-tight">
                {slides[currentSlide].title}
              </h2>
              <p className="text-xl text-[#0F172A]/80 leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Slide indicators */}
          <div
            className={`flex justify-center ${
              isRTL ? "space-x-reverse space-x-2" : "space-x-2"
            } mt-8`}
          >
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? "bg-[#064FB5]" : "bg-[#064FB5]/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto border border-white/30">
                <img
                  src="/masareefy-logo.png"
                  alt="Masareefy Logo"
                  className="w-12 h-12"
                />
              </div>
              <h1 className="text-4xl font-bold text-white">
                {t("auth.login.title")}
              </h1>
              <p className="text-lg text-white/80">
                {t("auth.login.subtitle")}
              </p>

              {/* Offline Indicator */}
              {!isOnline && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-200 text-sm font-medium">
                      {t("auth.login.noInternet")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder={t("auth.login.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-16 text-lg text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder:text-white/80 placeholder:font-medium text-white font-semibold"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.login.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-16 text-lg text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 placeholder:text-white/80 placeholder:font-medium text-white font-semibold pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${
                      isRTL ? "left-4" : "right-4"
                    } top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || !email || !password || !isOnline}
                  size="lg"
                  className="w-full h-14 text-lg bg-white/20 backdrop-blur-md text-white border-2 border-white/40 hover:bg-white/30 hover:border-white/60 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                  style={{ height: "56px" }}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t("common.loading")}</span>
                    </div>
                  ) : (
                    t("auth.login.signIn")
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <Link
                    to="/onboarding"
                    className="text-white/80 hover:text-white underline text-base font-medium block"
                  >
                    {t("auth.login.noAccount")} {t("auth.login.signUp")}
                  </Link>
                  <Link
                    to="/"
                    className="text-white/60 hover:text-white text-sm font-medium block"
                  >
                    {t("auth.login.backToHome")}
                  </Link>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
