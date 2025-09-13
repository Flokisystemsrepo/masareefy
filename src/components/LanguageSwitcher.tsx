import React from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageSwitcherProps {
  variant?: "default" | "sidebar";
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = "default",
}) => {
  const { currentLanguage, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(currentLanguage === "en" ? "ar" : "en");
  };

  const getCurrentFlag = () => {
    return currentLanguage === "en" ? "🇺🇸" : "🇪🇬";
  };

  if (variant === "sidebar") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        className="w-full justify-center text-white hover:bg-white/10 gap-2"
        title={`Switch to ${currentLanguage === "en" ? "Arabic" : "English"}`}
      >
        <Globe className="h-4 w-4" />
        <span className="text-lg">{getCurrentFlag()}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
      title={`Switch to ${currentLanguage === "en" ? "Arabic" : "English"}`}
    >
      <Globe className="h-4 w-4" />
      <span className="text-lg">{getCurrentFlag()}</span>
    </Button>
  );
};

export default LanguageSwitcher;
