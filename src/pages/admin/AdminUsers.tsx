import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Mail,
  Calendar,
  Shield,
  Building2,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  Settings,
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
    status: string;
    plan: {
      name: string;
      priceMonthly: number;
    };
  }>;
  brands: Array<{
    id: string;
    name: string;
    settings?: any;
  }>;
}

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxBrands: number;
  maxUsers: number;
  trialDays: number;
}

interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);

  // Subscription management state
  const [subscriptionData, setSubscriptionData] = useState({
    planId: "",
    subscription_status: "",
    billing_start: "",
    billing_end: "",
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
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(
        `http://localhost:3001/api/admin/users?${params}`,
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

      const data: UsersResponse = await response.json();

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

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:3001/api/admin/plans", {
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

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `http://localhost:3001/api/admin/users/${selectedUser.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Refresh the users list
      await fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete user"
      );
      toast.error("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  // Subscription Management Functions
  const handleManageSubscription = (user: User) => {
    setSelectedUser(user);

    // Get the first brand's subscription data (users can have multiple brands)
    const firstBrand = user.brands[0];
    if (firstBrand) {
      // Initialize with current subscription data from brand settings
      let initialPlanId = "";
      let initialStatus = "active";

      if (firstBrand.settings) {
        const settings = firstBrand.settings as any;
        const subscriptionBundle = settings.subscription_bundle;
        const subscriptionStatus = settings.subscription_status;

        if (subscriptionBundle) {
          // Find the plan by name
          const matchingPlan = plans.find(
            (plan) => plan.name === subscriptionBundle
          );
          initialPlanId = matchingPlan?.id || plans[0]?.id || "";
        } else {
          initialPlanId = plans[0]?.id || "";
        }

        initialStatus = subscriptionStatus || "active";
      } else {
        // Fallback to user subscriptions if no brand settings
        const currentSubscription = user.subscriptions[0];
        if (currentSubscription?.plan?.name) {
          const matchingPlan = plans.find(
            (plan) => plan.name === currentSubscription.plan.name
          );
          initialPlanId = matchingPlan?.id || plans[0]?.id || "";
        } else {
          initialPlanId = plans[0]?.id || "";
        }
        initialStatus = currentSubscription?.status || "active";
      }

      setSubscriptionData({
        planId: initialPlanId,
        subscription_status: initialStatus,
        billing_start: "",
        billing_end: "",
      });
    }

    setShowSubscriptionModal(true);
  };

  const handleUpdateSubscription = async () => {
    if (!selectedUser || !selectedUser.brands[0]) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("adminToken");
      const brandId = selectedUser.brands[0].id;

      // Find the selected plan to get its name
      const selectedPlan = plans.find(
        (plan) => plan.id === subscriptionData.planId
      );
      const subscriptionBundle = selectedPlan?.name || "";

      const requestData = {
        subscription_bundle: subscriptionBundle,
        subscription_status: subscriptionData.subscription_status,
        billing_start: subscriptionData.billing_start,
        billing_end: subscriptionData.billing_end,
      };

      console.log("Sending subscription update:", requestData);
      console.log("Selected plan:", selectedPlan);
      console.log("Available plans:", plans);

      const response = await fetch(
        `http://localhost:3001/api/admin/brands/${brandId}/subscription`,
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
        await fetchUsers();
        setShowSubscriptionModal(false);
        setSelectedUser(null);
        toast.success("Subscription updated successfully");
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

  const handleEditSubmit = async (userData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("adminToken");

      console.log("Updating user with data:", userData);

      const response = await fetch(
        `http://localhost:3001/api/admin/users/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update user error:", errorData);
        throw new Error(errorData.error || "Failed to update user");
      }

      const responseData = await response.json();
      console.log("User update response:", responseData);

      // Refresh the users list
      await fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
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
              Manage all users across your platform
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleAddUser}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
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
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
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
                        <TableHead>Email</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Brands</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
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
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {user.emailVerified ? (
                                    <span className="text-green-600">
                                      Verified
                                    </span>
                                  ) : (
                                    <span className="text-orange-600">
                                      Unverified
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{user.email}</div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              // Get subscription data from brand settings
                              const firstBrand = user.brands[0];
                              if (firstBrand?.settings) {
                                const settings = firstBrand.settings as any;
                                const subscriptionBundle =
                                  settings.subscription_bundle;
                                const subscriptionStatus =
                                  settings.subscription_status;

                                if (subscriptionBundle) {
                                  // Find the plan by name to get the price
                                  const plan = plans.find(
                                    (p) => p.name === subscriptionBundle
                                  );
                                  return (
                                    <div>
                                      <div className="font-medium">
                                        {subscriptionBundle}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {plan?.priceMonthly === 0
                                          ? "Free"
                                          : `${plan?.priceMonthly || 0} EGP`}
                                        /month
                                      </div>
                                    </div>
                                  );
                                }
                              }

                              // Fallback to user subscriptions if no brand settings
                              if (user.subscriptions.length > 0) {
                                return (
                                  <div>
                                    <div className="font-medium">
                                      {user.subscriptions[0].plan.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      ${user.subscriptions[0].plan.priceMonthly}
                                      /month
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <span className="text-gray-400">
                                  No subscription
                                </span>
                              );
                            })()}
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
                            {(() => {
                              // Get subscription status from brand settings
                              const firstBrand = user.brands[0];
                              if (firstBrand?.settings) {
                                const settings = firstBrand.settings as any;
                                const subscriptionStatus =
                                  settings.subscription_status;

                                if (subscriptionStatus) {
                                  return (
                                    <Badge
                                      variant={getStatusBadgeVariant(
                                        subscriptionStatus
                                      )}
                                    >
                                      {subscriptionStatus}
                                    </Badge>
                                  );
                                }
                              }

                              // Fallback to user subscriptions if no brand settings
                              if (user.subscriptions.length > 0) {
                                return (
                                  <Badge
                                    variant={getStatusBadgeVariant(
                                      user.subscriptions[0].status
                                    )}
                                  >
                                    {user.subscriptions[0].status}
                                  </Badge>
                                );
                              }

                              return (
                                <Badge variant="outline">No subscription</Badge>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                {user.brands.length > 0 && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleManageSubscription(user)
                                    }
                                  >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Edit Subscription
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteUser(user)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
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

        {/* Edit User Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information for {selectedUser?.firstName}{" "}
                {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue={selectedUser?.firstName}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue={selectedUser?.lastName}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={selectedUser?.email}
                  placeholder="Enter email"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const firstName = (
                    document.getElementById("firstName") as HTMLInputElement
                  )?.value;
                  const lastName = (
                    document.getElementById("lastName") as HTMLInputElement
                  )?.value;
                  const email = (
                    document.getElementById("email") as HTMLInputElement
                  )?.value;
                  handleEditSubmit({ firstName, lastName, email });
                }}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.firstName}{" "}
                {selectedUser?.lastName}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteUser}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add User Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account for the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newFirstName">First Name</Label>
                <Input id="newFirstName" placeholder="Enter first name" />
              </div>
              <div>
                <Label htmlFor="newLastName">Last Name</Label>
                <Input id="newLastName" placeholder="Enter last name" />
              </div>
              <div>
                <Label htmlFor="newEmail">Email</Label>
                <Input id="newEmail" type="email" placeholder="Enter email" />
              </div>
              <div>
                <Label htmlFor="newPassword">Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const firstName = (
                    document.getElementById("newFirstName") as HTMLInputElement
                  )?.value;
                  const lastName = (
                    document.getElementById("newLastName") as HTMLInputElement
                  )?.value;
                  const email = (
                    document.getElementById("newEmail") as HTMLInputElement
                  )?.value;
                  const password = (
                    document.getElementById("newPassword") as HTMLInputElement
                  )?.value;

                  if (firstName && lastName && email && password) {
                    // TODO: Implement add user API call
                    console.log("Add user:", {
                      firstName,
                      lastName,
                      email,
                      password,
                    });
                    setShowAddModal(false);
                  }
                }}
                disabled={actionLoading}
              >
                {actionLoading ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Subscription Management Modal */}
        <Dialog
          open={showSubscriptionModal}
          onOpenChange={setShowSubscriptionModal}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Subscription</DialogTitle>
              <DialogDescription>
                Update subscription settings for {selectedUser?.firstName}{" "}
                {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="planId">Subscription Plan</Label>
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
                            ${plan.priceMonthly}/month
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subscription_status">Status</Label>
                <Select
                  value={subscriptionData.subscription_status}
                  onValueChange={(value) =>
                    setSubscriptionData((prev) => ({
                      ...prev,
                      subscription_status: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="billing_start">Billing Start Date</Label>
                <Input
                  id="billing_start"
                  type="date"
                  value={subscriptionData.billing_start}
                  onChange={(e) =>
                    setSubscriptionData((prev) => ({
                      ...prev,
                      billing_start: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="billing_end">Billing End Date</Label>
                <Input
                  id="billing_end"
                  type="date"
                  value={subscriptionData.billing_end}
                  onChange={(e) =>
                    setSubscriptionData((prev) => ({
                      ...prev,
                      billing_end: e.target.value,
                    }))
                  }
                />
              </div>
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
