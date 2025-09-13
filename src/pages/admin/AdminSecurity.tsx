import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  UserX,
  Globe,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Server,
  FileText,
  Download,
  RefreshCw,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface SecurityMetrics {
  totalThreats: number;
  activeThreats: number;
  resolvedThreats: number;
  securityScore: number;
  lastScanTime: string;
  complianceScore: number;
}

interface SecurityEvent {
  id: string;
  type: "threat" | "breach" | "suspicious" | "compliance" | "access";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  source: string;
  timestamp: string;
  status: "active" | "investigating" | "resolved" | "false_positive";
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

interface ComplianceStatus {
  gdpr: { status: "compliant" | "warning" | "non_compliant"; score: number };
  pci: { status: "compliant" | "warning" | "non_compliant"; score: number };
  sox: { status: "compliant" | "warning" | "non_compliant"; score: number };
  hipaa: { status: "compliant" | "warning" | "non_compliant"; score: number };
}

interface AccessLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  timestamp: string;
  status: "success" | "failed" | "blocked";
  riskLevel: "low" | "medium" | "high";
}

const AdminSecurity: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [complianceStatus, setComplianceStatus] =
    useState<ComplianceStatus | null>(null);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [selectedSeverity, setSelectedSeverity] = useState("all");

  useEffect(() => {
    fetchSecurityData();
  }, [selectedTimeRange]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `http://localhost:3001/api/admin/security/overview?timeRange=${selectedTimeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMetrics(data.data.metrics);
          setSecurityEvents(data.data.securityEvents);
          setComplianceStatus(data.data.complianceStatus);
          setAccessLogs(data.data.accessLogs);
        } else {
          setError("Failed to load security data");
        }
      } else {
        setError("Failed to load security data");
      }
    } catch (error) {
      console.error("Security data fetch error:", error);
      setError("Failed to load security data");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "non_compliant":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredEvents = securityEvents.filter((event) => {
    if (selectedSeverity === "all") return true;
    return event.severity === selectedSeverity;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchSecurityData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Security Operations Center
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time security monitoring, threat detection, and compliance
            management
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={selectedTimeRange}
            onValueChange={setSelectedTimeRange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchSecurityData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Status Banner */}
      {metrics && (
        <Card
          className={`border-l-4 ${
            metrics.securityScore >= 90
              ? "border-l-green-500"
              : metrics.securityScore >= 70
              ? "border-l-yellow-500"
              : "border-l-red-500"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-full ${
                    metrics.securityScore >= 90
                      ? "bg-green-100"
                      : metrics.securityScore >= 70
                      ? "bg-yellow-100"
                      : "bg-red-100"
                  }`}
                >
                  <Shield
                    className={`h-6 w-6 ${
                      metrics.securityScore >= 90
                        ? "text-green-600"
                        : metrics.securityScore >= 70
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Security Status</h3>
                  <p className="text-sm text-gray-600">
                    Overall Security Score:{" "}
                    <span className="font-medium">
                      {metrics.securityScore}/100
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Last Scan</p>
                <p className="font-medium">
                  {new Date(metrics.lastScanTime).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Threats
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.activeThreats || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Threats requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Security Score
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.securityScore || 0}/100
            </div>
            <p className="text-xs text-muted-foreground">
              Overall security posture
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Score
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.complianceScore || 0}/100
            </div>
            <p className="text-xs text-muted-foreground">
              Regulatory compliance status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved Threats
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.resolvedThreats || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Threats resolved in {selectedTimeRange}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status */}
      {complianceStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Compliance Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">GDPR</p>
                  <p className="text-sm text-gray-600">Data Protection</p>
                </div>
                <Badge className={getStatusColor(complianceStatus.gdpr.status)}>
                  {complianceStatus.gdpr.score}%
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">PCI DSS</p>
                  <p className="text-sm text-gray-600">Payment Security</p>
                </div>
                <Badge className={getStatusColor(complianceStatus.pci.status)}>
                  {complianceStatus.pci.score}%
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">SOX</p>
                  <p className="text-sm text-gray-600">Financial Controls</p>
                </div>
                <Badge className={getStatusColor(complianceStatus.sox.status)}>
                  {complianceStatus.sox.score}%
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">HIPAA</p>
                  <p className="text-sm text-gray-600">Health Data</p>
                </div>
                <Badge
                  className={getStatusColor(complianceStatus.hipaa.status)}
                >
                  {complianceStatus.hipaa.score}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Security Events</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select
                value={selectedSeverity}
                onValueChange={setSelectedSeverity}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">No security events found</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${
                        event.severity === "critical"
                          ? "bg-red-100"
                          : event.severity === "high"
                          ? "bg-orange-100"
                          : event.severity === "medium"
                          ? "bg-yellow-100"
                          : "bg-green-100"
                      }`}
                    >
                      {event.type === "threat" && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      {event.type === "breach" && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      {event.type === "suspicious" && (
                        <Eye className="h-4 w-4 text-yellow-600" />
                      )}
                      {event.type === "compliance" && (
                        <FileText className="h-4 w-4 text-blue-600" />
                      )}
                      {event.type === "access" && (
                        <Lock className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {event.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                        {event.ipAddress && (
                          <span className="text-xs text-gray-500">
                            IP: {event.ipAddress}
                          </span>
                        )}
                        {event.location && (
                          <span className="text-xs text-gray-500">
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {event.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Access Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Recent Access Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accessLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
                      log.status === "success"
                        ? "bg-green-100"
                        : log.status === "failed"
                        ? "bg-red-100"
                        : "bg-yellow-100"
                    }`}
                  >
                    {log.status === "success" && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {log.status === "failed" && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    {log.status === "blocked" && (
                      <Lock className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{log.userEmail}</p>
                    <p className="text-sm text-gray-600">
                      {log.action} - {log.resource}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        IP: {log.ipAddress}
                      </span>
                      <span className="text-xs text-gray-500">
                        {log.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{log.status.toUpperCase()}</Badge>
                  <span
                    className={`text-sm font-medium ${getRiskColor(
                      log.riskLevel
                    )}`}
                  >
                    {log.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurity;
