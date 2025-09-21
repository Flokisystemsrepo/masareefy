import React from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";

const SubscriptionDebug: React.FC = () => {
  const {
    subscription,
    hasSectionAccess,
    forceRefresh,
    loading,
    isInitialized,
    testUpgradeToGrowth,
    testUpgradeToScale,
    testResetToFree,
  } = useSubscription();

  const testSections = ["transfers", "reports", "receivables", "tasks"];

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border rounded-lg shadow-lg z-50 max-w-md">
      <h3 className="font-bold mb-2">Subscription Debug</h3>
      <div className="space-y-2 text-sm">
        <div>Plan: {subscription?.plan?.name || "None"}</div>
        <div>Is Free Plan: {subscription?.isFreePlan ? "Yes" : "No"}</div>
        <div>
          Plan Name Check: {subscription?.plan?.name === "Free" ? "Yes" : "No"}
        </div>
        <div>Initialized: {isInitialized ? "Yes" : "No"}</div>
        <div>Loading: {loading ? "Yes" : "No"}</div>
        <div>Subscription ID: {subscription?.id || "None"}</div>
        <div className="border-t pt-2">
          <div className="font-medium">Section Access:</div>
          {testSections.map((section) => (
            <div key={section} className="ml-2">
              {section}: {hasSectionAccess(section) ? "✅" : "❌"}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={forceRefresh}
            size="sm"
            className="flex-1"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Force Refresh"}
          </Button>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              window.location.reload();
            }}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            Clear Auth
          </Button>
        </div>
        <Button
          onClick={async () => {
            try {
              const response = await fetch(
                "/api/subscription/my-subscription",
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              const data = await response.json();
              console.log("Direct API Response:", data);
              alert("Check console for API response");
            } catch (error) {
              console.error("API Error:", error);
              alert("API Error - check console");
            }
          }}
          size="sm"
          variant="outline"
          className="w-full mt-2"
        >
          Test API Direct
        </Button>
        <div className="border-t pt-2 mt-2">
          <div className="font-medium mb-2">Test Upgrades:</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={testUpgradeToGrowth}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              → Growth
            </Button>
            <Button
              onClick={testUpgradeToScale}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              → Scale
            </Button>
          </div>
          <Button
            onClick={testResetToFree}
            size="sm"
            variant="outline"
            className="w-full mt-2"
            disabled={loading}
          >
            Reset to Free
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDebug;
