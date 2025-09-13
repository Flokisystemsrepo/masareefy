import React from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, AlertCircle, CheckCircle, Info } from "lucide-react";

const SubscriptionDebug: React.FC = () => {
  const {
    subscription,
    loading,
    error,
    refreshSubscription,
    manualRefresh,
    useFallback,
  } = useSubscription();

  if (process.env.NODE_ENV === "production") {
    return null; // Don't show in production
  }

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-yellow-800 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Subscription Debug (Development Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Status:</span>
          {loading ? (
            <div className="flex items-center gap-1 text-blue-600">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Loading...
            </div>
          ) : error ? (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="h-3 w-3" />
              Error
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              Loaded
            </div>
          )}
        </div>

        {/* Subscription Info */}
        {subscription && (
          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium">Plan:</span>{" "}
              {subscription.plan.name}
            </div>
            <div>
              <span className="font-medium">ID:</span> {subscription.id}
            </div>
            <div>
              <span className="font-medium">Status:</span> {subscription.status}
            </div>
            <div>
              <span className="font-medium">Free Plan:</span>{" "}
              {subscription.isFreePlan ? "Yes" : "No"}
            </div>
            {subscription.isExpired && (
              <div className="text-red-600 font-medium">⚠️ Expired</div>
            )}
            {subscription.isExpiringSoon && (
              <div className="text-yellow-600 font-medium">
                ⚠️ Expiring Soon
              </div>
            )}
            {useFallback && (
              <div className="text-blue-600 font-medium">ℹ️ Using Fallback</div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => refreshSubscription()}
            size="sm"
            variant="outline"
            disabled={loading}
            className="text-xs"
          >
            {loading ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Check Subscription
          </Button>
          <Button
            onClick={manualRefresh}
            size="sm"
            variant="outline"
            disabled={loading}
            className="text-xs"
          >
            Manual Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionDebug;
