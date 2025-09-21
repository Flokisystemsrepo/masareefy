import React from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useTrial } from "../contexts/TrialContext";
import { useNavigate } from "react-router-dom";

export const TrialStatusBanner: React.FC = () => {
  const { trialStatus, setShowTrialExpirationModal } = useTrial();
  const navigate = useNavigate();

  if (!trialStatus) return null;

  const { isTrialActive, daysRemaining, plan } = trialStatus;
  const isExpired = isTrialActive && daysRemaining <= 0;
  const isExpiringSoon = isTrialActive && daysRemaining <= 1;

  const handleUpgrade = () => {
    navigate("/subscription");
  };

  const handleShowModal = () => {
    setShowTrialExpirationModal(true);
  };

  // Don't show banner for free plan users
  if (plan.name === "Free") return null;

  // Show banner for trial users
  if (isTrialActive) {
    return (
      <div
        className={`w-full py-2 px-4 ${
          isExpired
            ? "bg-red-50 border-b border-red-200"
            : isExpiringSoon
            ? "bg-orange-50 border-b border-orange-200"
            : "bg-blue-50 border-b border-blue-200"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isExpired ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <Clock className="h-4 w-4 text-orange-500" />
            )}
            <span
              className={`text-sm font-medium ${
                isExpired ? "text-red-800" : "text-orange-800"
              }`}
            >
              {isExpired
                ? `Your ${plan.name} trial has expired. You're now on the Free plan.`
                : `Your ${plan.name} trial expires in ${
                    daysRemaining === 1 ? "1 day" : `${daysRemaining} days`
                  }.`}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUpgrade}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                isExpired
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              {isExpired ? "Upgrade Now" : "Subscribe"}
            </button>
            {!isExpired && (
              <button
                onClick={handleShowModal}
                className="text-xs text-orange-600 hover:text-orange-800 underline"
              >
                Learn More
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show success banner for active paid subscriptions
  if (plan.name !== "Free" && !isTrialActive) {
    return (
      <div className="w-full py-2 px-4 bg-green-50 border-b border-green-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-800">
              You're subscribed to the {plan.name} plan. Enjoy all premium
              features!
            </span>
          </div>
          <button
            onClick={() => navigate("/subscription")}
            className="text-xs text-green-600 hover:text-green-800 underline"
          >
            Manage Subscription
          </button>
        </div>
      </div>
    );
  }

  return null;
};
