import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsageData } from "@/services/usageAPI";

interface UsageDisplayProps {
  title: string;
  usage: UsageData | undefined;
  icon?: React.ReactNode;
  className?: string;
}

export const UsageDisplay: React.FC<UsageDisplayProps> = ({
  title,
  usage,
  icon,
  className = "",
}) => {
  // Handle undefined usage data
  if (!usage) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Loading usage data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { current, limit, isUnlimited } = usage;

  const percentage = isUnlimited ? 0 : Math.min(100, (current / limit) * 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && current >= limit;

  const getStatusColor = () => {
    if (isUnlimited) return "bg-green-500";
    if (isAtLimit) return "bg-red-500";
    if (isNearLimit) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getStatusText = () => {
    if (isUnlimited) return "Unlimited";
    if (isAtLimit) return "Limit Reached";
    if (isNearLimit) return "Near Limit";
    return "Available";
  };

  const getStatusVariant = () => {
    if (isUnlimited) return "default";
    if (isAtLimit) return "destructive";
    if (isNearLimit) return "secondary";
    return "default";
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            {isUnlimited ? "∞" : current}
          </span>
          <Badge variant={getStatusVariant() as any} className="text-xs">
            {getStatusText()}
          </Badge>
        </div>

        {!isUnlimited && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Used: {current}</span>
                <span>Limit: {limit}</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>

            <div className="text-xs text-gray-500">
              {limit - current > 0 ? (
                <span className="text-green-600">
                  {limit - current} remaining
                </span>
              ) : (
                <span className="text-red-600">Limit exceeded</span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
