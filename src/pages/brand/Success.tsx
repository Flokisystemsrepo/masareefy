import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Success: React.FC = () => {
  useEffect(() => {
    // Auto-redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = "/brand/dashboard";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFC] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8 max-w-md"
      >
        <div className="space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-[#0F172A]">
            Welcome to Masareefy!
          </h1>
          <p className="text-lg text-[#CBD5E1]">
            Your account has been created successfully. You'll be redirected to
            your dashboard in a few seconds.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => (window.location.href = "/brand/dashboard")}
            size="lg"
            className="bg-[#064FB5] hover:bg-[#064FB5]/90 w-full"
          >
            Go to Dashboard Now
          </Button>
          <p className="text-sm text-[#CBD5E1]">Redirecting automatically...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Success;
