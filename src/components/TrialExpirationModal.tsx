import React from "react";
import { X, Clock, AlertTriangle, CreditCard } from "lucide-react";
import { useTrial } from "../contexts/TrialContext";
import { useNavigate } from "react-router-dom";

interface TrialExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrialExpirationModal: React.FC<TrialExpirationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { trialStatus } = useTrial();
  const navigate = useNavigate();

  if (!isOpen || !trialStatus) return null;

  const { isTrialActive, daysRemaining, plan } = trialStatus;
  const isExpired = isTrialActive && daysRemaining <= 0;
  const isExpiringSoon = isTrialActive && daysRemaining <= 1;

  const handleUpgrade = () => {
    onClose();
    navigate("/subscription");
  };

  const handleDismiss = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {isExpired ? (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              ) : (
                <Clock className="h-6 w-6 text-orange-500" />
              )}
              <h2 className="text-xl font-semibold text-gray-900">
                {isExpired ? "Trial Expired" : "Trial Ending Soon"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            {isExpired ? (
              <div className="space-y-3">
                <p className="text-gray-600">
                  Your <span className="font-semibold">{plan.name}</span> trial
                  has expired.
                </p>
                <p className="text-gray-600">
                  You've been automatically downgraded to the Free plan. Some
                  features are now limited.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">
                    <strong>Limited Access:</strong> You can only access basic
                    features. Upgrade to continue using premium features.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-600">
                  Your <span className="font-semibold">{plan.name}</span> trial
                  expires in{" "}
                  <span className="font-semibold text-orange-600">
                    {daysRemaining === 1 ? "1 day" : `${daysRemaining} days`}
                  </span>
                  .
                </p>
                <p className="text-gray-600">
                  Subscribe now to continue enjoying premium features without
                  interruption.
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-orange-800 text-sm">
                    <strong>Don't lose access:</strong> Upgrade before your
                    trial ends to maintain full access to all features.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>{isExpired ? "Upgrade Now" : "Subscribe Now"}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isExpired ? "Continue with Free" : "Remind Me Later"}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {isExpired
                ? "You can upgrade anytime to regain access to premium features."
                : "No charges until your trial ends. Cancel anytime."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
