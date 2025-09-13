import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  createdAt: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    revenues: number;
    costs: number;
    inventory: number;
  };
}

interface BrandsResponse {
  success: boolean;
  data: {
    brands: Brand[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const AdminBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
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
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBrands = async () => {
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
        `http://localhost:3001/api/admin/brands?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }

      const data: BrandsResponse = await response.json();

      if (data.success) {
        setBrands(data.data.brands);
        setPagination(data.data.pagination);
      } else {
        throw new Error("Failed to load brands");
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load brands"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [currentPage, searchTerm]);

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

  const handleEditBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setShowEditModal(true);
  };

  const handleDeleteBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setShowDeleteModal(true);
  };

  const handleAddBrand = () => {
    setShowAddModal(true);
  };

  const confirmDeleteBrand = async () => {
    if (!selectedBrand) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `http://localhost:3001/api/admin/brands/${selectedBrand.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete brand");
      }

      // Refresh the brands list
      await fetchBrands();
      setShowDeleteModal(false);
      setSelectedBrand(null);
    } catch (error) {
      console.error("Error deleting brand:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete brand"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (brandData: Partial<Brand>) => {
    if (!selectedBrand) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `http://localhost:3001/api/admin/brands/${selectedBrand.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(brandData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update brand");
      }

      // Refresh the brands list
      await fetchBrands();
      setShowEditModal(false);
      setSelectedBrand(null);
    } catch (error) {
      console.error("Error updating brand:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update brand"
      );
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
              Brand Management
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage all business brands
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleAddBrand}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Brand
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
                    placeholder="Search brands by name..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <Button variant="outline" onClick={fetchBrands}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Brands Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>All Brands</span>
              </div>
              <div className="text-sm text-gray-500">
                {pagination.total} total brands
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
                <Button onClick={fetchBrands} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : brands.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No brands found
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "No brands have been created yet."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Brand</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Metrics</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brands.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                {brand.logoUrl ? (
                                  <img
                                    src={brand.logoUrl}
                                    alt={brand.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <Building2 className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{brand.name}</div>
                                <div className="text-sm text-gray-500">
                                  ID: {brand.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">
                                  {brand.user.firstName} {brand.user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {brand.user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span>{brand._count.revenues} revenues</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm">
                                <DollarSign className="h-3 w-3 text-red-500" />
                                <span>{brand._count.costs} costs</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm">
                                <Building2 className="h-3 w-3 text-blue-500" />
                                <span>{brand._count.inventory} items</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(brand.createdAt)}</span>
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
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditBrand(brand)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Brand
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteBrand(brand)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Brand
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
                      of {pagination.total} brands
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

        {/* Edit Brand Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Brand</DialogTitle>
              <DialogDescription>
                Update brand information for {selectedBrand?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  defaultValue={selectedBrand?.name}
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  defaultValue={selectedBrand?.logoUrl || ""}
                  placeholder="Enter logo URL"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const name = (
                    document.getElementById("brandName") as HTMLInputElement
                  )?.value;
                  const logoUrl = (
                    document.getElementById("logoUrl") as HTMLInputElement
                  )?.value;
                  handleEditSubmit({ name, logoUrl });
                }}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "Update Brand"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Brand Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Brand</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedBrand?.name}? This
                action cannot be undone.
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
                onClick={confirmDeleteBrand}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete Brand"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Brand Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Brand</DialogTitle>
              <DialogDescription>
                Create a new brand for the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newBrandName">Brand Name</Label>
                <Input id="newBrandName" placeholder="Enter brand name" />
              </div>
              <div>
                <Label htmlFor="newLogoUrl">Logo URL</Label>
                <Input
                  id="newLogoUrl"
                  placeholder="Enter logo URL (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const name = (
                    document.getElementById("newBrandName") as HTMLInputElement
                  )?.value;
                  const logoUrl = (
                    document.getElementById("newLogoUrl") as HTMLInputElement
                  )?.value;

                  if (name) {
                    // TODO: Implement add brand API call
                    console.log("Add brand:", { name, logoUrl });
                    setShowAddModal(false);
                  }
                }}
                disabled={actionLoading}
              >
                {actionLoading ? "Creating..." : "Create Brand"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminBrands;
