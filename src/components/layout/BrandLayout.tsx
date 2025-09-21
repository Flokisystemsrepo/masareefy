import React, { useState } from "react";
import { Outlet, useParams, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrialStatusBanner } from "@/components/TrialStatusBanner";
import { TrialExpirationModal } from "@/components/TrialExpirationModal";
import { useTrial } from "@/contexts/TrialContext";

const BrandLayout: React.FC = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isRTL } = useLanguage();
  const { showTrialExpirationModal, setShowTrialExpirationModal } = useTrial();

  if (!brandId) {
    return <div>Brand ID not found</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        brandId={brandId}
        currentPath={location.pathname}
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col">
        <TrialStatusBanner />
        <motion.main
          className={`flex-1 overflow-y-auto transition-all duration-200 ease-out ${
            isSidebarCollapsed
              ? isRTL
                ? "mr-16"
                : "ml-16"
              : isRTL
              ? "mr-64"
              : "ml-64"
          }`}
          initial={{ opacity: 0, x: isRTL ? -5 : 5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          key={location.pathname}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: 0.05 }}
          >
            <Outlet />
          </motion.div>
        </motion.main>
      </div>

      <TrialExpirationModal
        isOpen={showTrialExpirationModal}
        onClose={() => setShowTrialExpirationModal(false)}
      />
    </div>
  );
};

export default BrandLayout;
