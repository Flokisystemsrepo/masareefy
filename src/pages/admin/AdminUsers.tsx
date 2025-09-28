import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Search,
  Building2,
  Calendar,
  MoreVertical,
  Edit,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: string;
  subscriptions: Array<{
    id: string;
    status: string;
    isTrialActive: boolean;
    trialDays: number;
    trialEnd: string | null;
    plan: {
      id: string;
      name: string;
      priceMonthly: number;
    };
  }>;
  brands: Array<{
    id: string;
    name: string;
  }>;
}

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);

  // Subscription management state
  const [subscriptionData, setSubscriptionData] = useState({
    planId: "",
    status: "",
    isTrialActive: false,
    trialDays: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(
        `http://localhost:8080/api/admin/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } else {
        throw new Error("Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:8080/api/admin/plans", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPlans(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, [currentPage, searchTerm]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "trialing":
        return "secondary";
      case "past_due":
        return "destructive";
      case "canceled":
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleManageSubscription = (user: User) => {
    setSelectedUser(user);

    // Get current subscription data
    const currentSubscription = user.subscriptions[0];
    if (currentSubscription) {
      setSubscriptionData({
        planId: currentSubscription.plan.id,
        status: currentSubscription.status,
        isTrialActive: currentSubscription.isTrialActive,
        trialDays: currentSubscription.trialDays,
      });
    } else {
      // Default to Free plan
      const freePlan = plans.find((p) => p.name === "Free");
      setSubscriptionData({
        planId: freePlan?.id || "",
        status: "active",
        isTrialActive: false,
        trialDays: 0,
      });
    }

    setShowSubscriptionModal(true);
  };

  const handleUpdateSubscription = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("adminToken");

      // Ensure proper values for trial fields
      const isTrialActive =
        subscriptionData.status === "trialing" &&
        subscriptionData.isTrialActive;
      const trialDays = isTrialActive ? subscriptionData.trialDays || 7 : 0;

      const requestData = {
        planId: subscriptionData.planId,
        status: subscriptionData.status,
        isTrialActive: isTrialActive,
        trialDays: trialDays,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: isTrialActive
          ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
          : null,
        trialStart: isTrialActive ? new Date().toISOString() : null,
        trialEnd: isTrialActive
          ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
          : null,
      };

      console.log("Sending subscription update:", requestData);

      const response = await fetch(
        `http://localhost:8080/api/admin/subscriptions/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (response.ok) {
        // Refresh the users list to show updated data
        await fetchUsers();
        setShowSubscriptionModal(false);
        setSelectedUser(null);
        toast.success("Subscription updated successfully");

        // Force a small delay to ensure backend has processed the update
        setTimeout(async () => {
          await fetchUsers();
        }, 1000);
      } else {
        const errorData = await response.json();
        console.error("Subscription update error:", errorData);
        setError(errorData.error || "Failed to update subscription");
        toast.error(errorData.error || "Failed to update subscription");
      }
    } catch (error) {
      console.error("Update subscription error:", error);
      setError("Failed to update subscription");
      toast.error("Failed to update subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const getCurrentPlan = (user: User) => {
    const subscription = user.subscriptions[0];
    if (!subscription) return { name: "No Plan", price: 0, status: "none" };

    return {
      name: subscription.plan.name,
      price: subscription.plan.priceMonthly,
      status: subscription.status,
      isTrial: subscription.isTrialActive,
      trialDays: subscription.trialDays,
      trialEnd: subscription.trialEnd,
    };
  };

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage user subscriptions
            </p>
          </div>
          <Button
            onClick={fetchUsers}
            disabled={loading}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <Button variant="outline" onClick={fetchUsers}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>All Users</span>
              </div>
              <div className="text-sm text-gray-500">
                {pagination.total} total users
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">{error}</div>
                <Button onClick={fetchUsers} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "No users have registered yet."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Current Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Brands</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const planInfo = getCurrentPlan(user);
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {user.firstName.charAt(0)}
                                    {user.lastName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {planInfo.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {planInfo.price === 0
                                    ? "Free"
                                    : `${planInfo.price} EGP/month`}
                                </div>
                                {planInfo.isTrial && planInfo.trialEnd && (
                                  <div className="text-xs text-orange-600 mt-1">
                                    Trial ends: {formatDate(planInfo.trialEnd)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge
                                  variant={getStatusBadgeVariant(
                                    planInfo.status
                                  )}
                                >
                                  {planInfo.status}
                                </Badge>
                                {planInfo.isTrial && (
                                  <div className="text-xs text-orange-600">
                                    Trial Active
                                  </div>
                                )}
                                {planInfo.status === "active" &&
                                  planInfo.name === "Free" && (
                                    <div className="text-xs text-gray-500">
                                      Free Plan
                                    </div>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  {user.brands.length} brand
                                  {user.brands.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              {user.brands.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {user.brands
                                    .map((brand) => brand.name)
                                    .join(", ")}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(user.createdAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleManageSubscription(user)
                                    }
                                  >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Edit Subscription
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{" "}
                      of {pagination.total} users
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Subscription Management Modal */}
        <Dialog
          open={showSubscriptionModal}
          onOpenChange={setShowSubscriptionModal}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
              <DialogDescription>
                Update subscription for {selectedUser?.firstName}{" "}
                {selectedUser?.lastName}
                {selectedUser && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">Current Plan:</div>
                    <div className="text-gray-600">
                      {getCurrentPlan(selectedUser).name} -{" "}
                      {getCurrentPlan(selectedUser).status}
                      {getCurrentPlan(selectedUser).isTrial && (
                        <span className="text-orange-600"> (Trial)</span>
                      )}
                    </div>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="planId">Plan</Label>
                <Select
                  value={subscriptionData.planId}
                  onValueChange={(value) =>
                    setSubscriptionData((prev) => ({
                      ...prev,
                      planId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{plan.name}</span>
                          <span className="text-sm text-gray-500">
                            {plan.priceMonthly === 0
                              ? "Free"
                              : `${plan.priceMonthly} EGP/month`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedUser && (
                  <div className="text-xs text-gray-500 mt-1">
                    Current: {getCurrentPlan(selectedUser).name}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={subscriptionData.status}
                  onValueChange={(value) =>
                    setSubscriptionData((prev) => ({
                      ...prev,
                      status: value,
                      isTrialActive: value === "trialing",
                      trialDays: value === "trialing" ? prev.trialDays || 7 : 0,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                {selectedUser && (
                  <div className="text-xs text-gray-500 mt-1">
                    Current: {getCurrentPlan(selectedUser).status}
                  </div>
                )}
              </div>

              {subscriptionData.status === "trialing" && (
                <div>
                  <Label htmlFor="trialDays">Trial Days</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    min="1"
                    max="30"
                    value={subscriptionData.trialDays || 7}
                    onChange={(e) =>
                      setSubscriptionData((prev) => ({
                        ...prev,
                        trialDays: parseInt(e.target.value) || 7,
                        isTrialActive: true,
                      }))
                    }
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSubscriptionModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSubscription}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "Update Subscription"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminUsers;
