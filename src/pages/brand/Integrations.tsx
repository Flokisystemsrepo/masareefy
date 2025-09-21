import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  FileSpreadsheet,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  AlertTriangle,
  CheckCircle,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  MoreHorizontal,
  RefreshCw,
  Plus,
  Lock,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { inventoryAPI, revenuesAPI, bostaImportAPI } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

// Get brand ID from localStorage
const getBrandId = () => {
  const brandId = localStorage.getItem("brandId");
  if (!brandId) {
    throw new Error("Brand ID not found. Please login again.");
  }
  return brandId;
};

interface BostaRow {
  trackingNumber: string;
  deliveryState: string;
  codAmount: number;
  sku?: string;
  businessReference?: string;
  description?: string;
  consigneeName?: string;
  consigneePhone?: string;
  dropOffFirstLine?: string;
  dropOffCity?: string;
  type?: string;
  numberOfAttempts?: number;
  deliveredAt?: string;
  updatedAt?: string;
  createdAt?: string;
  expectedDeliveryDate?: string;
}

interface BostaStats {
  totalOrders: number;
  expectedCash: number;
  delivered: number;
  returned: number;
  returnRate: number;
  deliveryRate: number;
  unknownSkus: string[];
}

interface BostaImportData {
  rows: BostaRow[];
  stats: BostaStats;
}

// Shopify Import Interfaces
interface ShopifyRow {
  handle: string;
  title: string;
  bodyHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string;
  published?: string;
  option1Name?: string;
  option1Value?: string;
  option2Name?: string;
  option2Value?: string;
  option3Name?: string;
  option3Value?: string;
  variantSku: string;
  variantGrams?: number;
  variantInventoryTracker?: string;
  variantInventoryQuantity?: number;
  variantInventoryPolicy?: string;
  variantFulfillmentService?: string;
  variantPrice?: number;
  variantCompareAtPrice?: number;
  variantRequiresShipping?: string;
  variantTaxable?: string;
  variantBarcode?: string;
  imageSrc?: string;
  imagePosition?: number;
  imageAltText?: string;
  giftCard?: string;
  seoTitle?: string;
  seoDescription?: string;
  googleProductCategory?: string;
  googleGender?: string;
  googleAgeGroup?: string;
  googleMpn?: string;
  googleCondition?: string;
  googleCustomProduct?: string;
  googleCustomLabel0?: string;
  googleCustomLabel1?: string;
  googleCustomLabel2?: string;
  googleCustomLabel3?: string;
  googleCustomLabel4?: string;
  variantImage?: string;
  variantWeightUnit?: string;
  variantTaxCode?: string;
  costPerItem?: number;
  status?: string;
}

interface ShopifyStats {
  totalProducts: number;
  totalVariants: number;
  totalValue: number;
  inStock: number;
  outOfStock: number;
  lowStock: number;
  unknownSkus: string[];
  duplicateSkus: string[];
}

interface ShopifyImportData {
  rows: ShopifyRow[];
  stats: ShopifyStats;
}

// Shopify Orders Interfaces
interface ShopifyOrderRow {
  name: string; // Order name (e.g., #1001)
  email: string;
  financialStatus: string; // paid, pending, etc.
  fulfillmentStatus: string; // fulfilled, unfulfilled, etc.
  currency: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discountCode: string;
  discountAmount: number;
  shippingMethod: string;
  createdAt: string;
  updatedAt: string;
  processedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
  tags: string;
  note: string;
  test: boolean;
  browserIp: string;
  landingSite: string;
  landingSiteRef: string;
  referringSite: string;
  orderNumber: number;
  orderStatusUrl: string;
  presentmentCurrency: string;
  totalLineItemsPrice: number;
  totalLineItemsQuantity: number;
  totalOutstanding: number;
  totalPrice: number;
  totalPriceUsd: number;
  totalTax: number;
  totalWeight: number;
  userId: string;
  orderAdjustments: string;
  billingAddress: string;
  shippingAddress: string;
  customer: string;
  discountApplications: string;
  fulfillments: string;
  lineItems: string;
  paymentGatewayNames: string;
  refunds: string;
  shippingLines: string;
  taxLines: string;
}

interface ShopifyOrderStats {
  totalOrders: number;
  totalRevenue: number;
  totalTax: number;
  totalShipping: number;
  totalDiscount: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  fulfilledOrders: number;
  unfulfilledOrders: number;
  averageOrderValue: number;
  uniqueCustomers: number;
}

interface ShopifyOrderImportData {
  rows: ShopifyOrderRow[];
  stats: ShopifyOrderStats;
}

// Shipblu Import Interfaces
interface ShipbluRow {
  trackingNumber: string;
  pickupDate: string;
  customerName: string;
  customerPhone: string;
  customerZone: string;
  customerCity: string;
  codEstimatedDate: string;
  status: string;
}

interface ShipbluStats {
  totalOrders: number;
  validOrders: number;
  invalidOrders: number;
  selectedForImport: number;
}

interface ShipbluImportData {
  rows: ShipbluRow[];
  stats: ShipbluStats;
  validation: {
    validRows: number[];
    invalidRows: number;
    duplicateTrackingNumbers: string[];
  };
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface ManualOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: ManualOrderItem[];
  totalAmount: number;
  shippingCost: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  notes?: string;
  isRevenue: boolean;
}

interface ManualOrderItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isFromInventory: boolean;
  inventoryItemId?: string;
}

const ManualOrdersTab: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ManualOrder | null>(null);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    orderNumber: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
    shippingCost: 0,
    isRevenue: true,
  });

  const [orderItems, setOrderItems] = useState<ManualOrderItem[]>([]);
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");

  useEffect(() => {
    loadInventoryItems();
    loadManualOrders();
  }, []);

  const loadInventoryItems = async () => {
    try {
      // Fetch all inventory items with a high limit to ensure we get everything
      const response = await inventoryAPI.getAll({
        limit: 10000, // Set a very high limit to get all products
        page: 1,
      });
      console.log("Inventory API response:", response);

      // Handle different response formats
      let inventoryData = [];
      if (Array.isArray(response)) {
        inventoryData = response;
      } else if (response && Array.isArray(response.data)) {
        inventoryData = response.data;
      } else if (response && Array.isArray(response.inventory)) {
        inventoryData = response.inventory;
      } else if (response && response.items && Array.isArray(response.items)) {
        inventoryData = response.items;
      } else {
        console.warn("Unexpected inventory response format:", response);
        inventoryData = [];
      }

      console.log("Processed inventory data:", inventoryData);
      console.log("Total inventory items loaded:", inventoryData.length);
      setInventoryItems(inventoryData);

      if (inventoryData.length === 0) {
        toast({
          title: "No Products Found",
          description:
            "No inventory products found. Please add some products to your inventory first.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Inventory Loaded",
          description: `Loaded ${inventoryData.length} products from inventory`,
        });
      }
    } catch (error) {
      console.error("Failed to load inventory items:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory items. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadManualOrders = async () => {
    // For now, we'll use localStorage to persist manual orders
    // In a real app, this would be an API call
    try {
      const savedOrders = localStorage.getItem("manualOrders");
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (error) {
      console.error("Failed to load manual orders:", error);
    }
  };

  const saveManualOrders = (newOrders: ManualOrder[]) => {
    localStorage.setItem("manualOrders", JSON.stringify(newOrders));
    setOrders(newOrders);
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `MO-${timestamp}`;
  };

  const handleAddOrder = () => {
    setFormData({
      orderNumber: generateOrderNumber(),
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      notes: "",
      shippingCost: 0,
      isRevenue: true,
    });
    setOrderItems([]);
    setSelectedOrder(null);
    setShowAddOrderModal(true);
  };

  const handleEditOrder = (order: ManualOrder) => {
    setFormData({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      notes: order.notes || "",
      shippingCost: order.shippingCost || 0,
      isRevenue: order.isRevenue,
    });
    setOrderItems([...order.items]);
    setSelectedOrder(order);
    setShowEditOrderModal(true);
  };

  const addOrderItem = () => {
    const newItem: ManualOrderItem = {
      id: Date.now().toString(),
      productName: "",
      sku: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      isFromInventory: false,
    };
    setOrderItems([...orderItems, newItem]);
  };

  const updateOrderItem = (
    index: number,
    field: keyof ManualOrderItem,
    value: any
  ) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalculate total price
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].totalPrice =
        updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    setOrderItems(updatedItems);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleInventoryItemSelect = (index: number, inventoryItem: any) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      productName: inventoryItem.productName,
      sku: inventoryItem.baseSku,
      unitPrice: inventoryItem.sellingPrice || 0,
      totalPrice:
        updatedItems[index].quantity * (inventoryItem.sellingPrice || 0),
      isFromInventory: true,
      inventoryItemId: inventoryItem.id,
    };
    setOrderItems(updatedItems);
  };

  const calculateTotalAmount = () => {
    const itemsTotal = orderItems.reduce(
      (total, item) => total + item.totalPrice,
      0
    );
    return itemsTotal + (formData.shippingCost || 0);
  };

  const calculateItemsTotal = () => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  // Validate stock availability for inventory items
  const validateStockAvailability = (item: ManualOrderItem): boolean => {
    if (!item.isFromInventory || !item.inventoryItemId) {
      return true; // Custom items don't need stock validation
    }

    const inventoryItem = inventoryItems.find(
      (i) => i.id === item.inventoryItemId
    );
    if (!inventoryItem) {
      return false;
    }

    const availableStock = inventoryItem.currentStock || 0;
    return item.quantity <= availableStock;
  };

  // Get stock validation message
  const getStockValidationMessage = (item: ManualOrderItem): string | null => {
    if (!item.isFromInventory || !item.inventoryItemId) {
      return null;
    }

    const inventoryItem = inventoryItems.find(
      (i) => i.id === item.inventoryItemId
    );
    if (!inventoryItem) {
      return "Product not found in inventory";
    }

    const availableStock = inventoryItem.currentStock || 0;
    if (item.quantity > availableStock) {
      return `Only ${availableStock} units available in stock`;
    }

    return null;
  };

  // Filter inventory items based on search term
  const filteredInventoryItems = inventoryItems.filter((item) => {
    if (!inventorySearchTerm) return true;
    const searchLower = inventorySearchTerm.toLowerCase();
    return (
      item.productName?.toLowerCase().includes(searchLower) ||
      item.baseSku?.toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower)
    );
  });

  const handleSaveOrder = async () => {
    if (!formData.customerName || orderItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in customer name and add at least one item",
        variant: "destructive",
      });
      return;
    }

    // Validate stock availability for all inventory items
    const stockValidationErrors: string[] = [];
    orderItems.forEach((item, index) => {
      if (!validateStockAvailability(item)) {
        const message = getStockValidationMessage(item);
        if (message) {
          stockValidationErrors.push(`Item ${index + 1}: ${message}`);
        }
      }
    });

    if (stockValidationErrors.length > 0) {
      toast({
        title: "Stock Validation Error",
        description: stockValidationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const totalAmount = calculateTotalAmount();

      const newOrder: ManualOrder = {
        id: selectedOrder?.id || Date.now().toString(),
        orderNumber: formData.orderNumber,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        items: orderItems,
        totalAmount,
        shippingCost: formData.shippingCost || 0,
        status: "pending",
        orderDate: new Date().toISOString(),
        notes: formData.notes,
        isRevenue: formData.isRevenue,
      };

      let updatedOrders;
      if (selectedOrder) {
        // Update existing order
        updatedOrders = orders.map((order) =>
          order.id === selectedOrder.id ? newOrder : order
        );
      } else {
        // Add new order
        updatedOrders = [...orders, newOrder];
      }

      saveManualOrders(updatedOrders);

      // Create revenue entry if marked as revenue
      if (formData.isRevenue && user?.brandId) {
        try {
          await revenuesAPI.create({
            name: `Order ${formData.orderNumber} - ${formData.customerName}`,
            amount: totalAmount,
            source: "Manual Order",
            date: new Date().toISOString(),
            category: "Sales",
          });
        } catch (error) {
          console.error("Failed to create revenue entry:", error);
          toast({
            title: "Warning",
            description: "Order saved but revenue entry failed",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: selectedOrder
          ? "Order updated successfully"
          : "Order created successfully",
      });

      setShowAddOrderModal(false);
      setShowEditOrderModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to save order:", error);
      toast({
        title: "Error",
        description: "Failed to save order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    const updatedOrders = orders.filter((order) => order.id !== orderId);
    saveManualOrders(updatedOrders);
    toast({
      title: "Success",
      description: "Order deleted successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manual Orders</h2>
          <p className="text-gray-600">Create and manage manual orders</p>
        </div>
        <Button
          onClick={handleAddOrder}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Package className="h-4 w-4 mr-2" />
          Add Order
        </Button>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                <Badge
                  variant={order.status === "pending" ? "secondary" : "default"}
                >
                  {order.status}
                </Badge>
              </div>
              <CardDescription>
                {order.customerName} •{" "}
                {new Date(order.orderDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Items:</span>
                  <span className="text-sm font-medium">
                    {order.items.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Items Total:</span>
                  <span className="text-sm font-medium">
                    EGP{" "}
                    {(order.totalAmount - (order.shippingCost || 0)).toFixed(2)}
                  </span>
                </div>
                {order.shippingCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Shipping:</span>
                    <span className="text-sm font-medium">
                      EGP {order.shippingCost.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1">
                  <span className="text-sm font-medium text-gray-900">
                    Total:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    EGP {order.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="text-sm font-medium">
                    {order.isRevenue ? (
                      <CheckCircle className="h-4 w-4 text-green-500 inline" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400 inline" />
                    )}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditOrder(order)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteOrder(order.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Manual Orders
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first manual order to get started
            </p>
            <Button
              onClick={handleAddOrder}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Package className="h-4 w-4 mr-2" />
              Add Order
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Order Modal */}
      <Dialog
        open={showAddOrderModal || showEditOrderModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddOrderModal(false);
            setShowEditOrderModal(false);
            setSelectedOrder(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder ? "Edit Order" : "Add New Order"}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder
                ? "Update order details"
                : "Create a new manual order"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {/* Order Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Details
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label
                    htmlFor="orderNumber"
                    className="text-sm font-medium text-gray-700"
                  >
                    Order Number
                  </Label>
                  <Input
                    id="orderNumber"
                    value={formData.orderNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, orderNumber: e.target.value })
                    }
                    placeholder="Order number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="customerName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Customer Name *
                  </Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="Customer name"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="customerEmail"
                    className="text-sm font-medium text-gray-700"
                  >
                    Customer Email
                  </Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerEmail: e.target.value,
                      })
                    }
                    placeholder="customer@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="customerPhone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Customer Phone
                  </Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerPhone: e.target.value,
                      })
                    }
                    placeholder="Phone number"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Order Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order Items
                  </h3>
                  <Badge variant="secondary" className="ml-2">
                    {inventoryItems.length} products available
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={loadInventoryItems}
                    variant="outline"
                    size="sm"
                    title="Refresh inventory"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={addOrderItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <Card key={item.id} className="p-6 border border-gray-200">
                    <div className="space-y-4">
                      {/* Product Source Selection */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Label className="text-sm font-medium text-gray-700">
                            Product Source
                          </Label>
                          <Select
                            value={
                              item.isFromInventory ? "inventory" : "custom"
                            }
                            onValueChange={(value) => {
                              const isFromInventory = value === "inventory";
                              updateOrderItem(
                                index,
                                "isFromInventory",
                                isFromInventory
                              );
                              if (!isFromInventory) {
                                updateOrderItem(index, "productName", "");
                                updateOrderItem(index, "sku", "");
                                updateOrderItem(index, "unitPrice", 0);
                              }
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inventory">
                                From Inventory
                              </SelectItem>
                              <SelectItem value="custom">
                                Custom Input
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOrderItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Product Details */}
                      {item.isFromInventory ? (
                        <div className="space-y-4">
                          {/* Search Input */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Search Products
                            </Label>
                            <Input
                              placeholder="Search by name, SKU, or category..."
                              value={inventorySearchTerm}
                              onChange={(e) =>
                                setInventorySearchTerm(e.target.value)
                              }
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Select Product
                            </Label>
                            <Select
                              onValueChange={(value) => {
                                const inventoryItem = inventoryItems.find(
                                  (item) => item.id === value
                                );
                                if (inventoryItem) {
                                  handleInventoryItemSelect(
                                    index,
                                    inventoryItem
                                  );
                                }
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue
                                  placeholder={`Select from ${filteredInventoryItems.length} products`}
                                />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {filteredInventoryItems.length === 0 ? (
                                  <SelectItem value="no-items" disabled>
                                    <div className="flex flex-col items-center py-4">
                                      <Search className="h-8 w-8 text-gray-400 mb-2" />
                                      <span>
                                        {inventorySearchTerm
                                          ? `No products found for "${inventorySearchTerm}"`
                                          : "No inventory items found"}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {inventorySearchTerm
                                          ? "Try a different search term"
                                          : "Add products to your inventory first"}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ) : (
                                  filteredInventoryItems.map(
                                    (inventoryItem) => (
                                      <SelectItem
                                        key={inventoryItem.id}
                                        value={inventoryItem.id}
                                        className="py-3"
                                      >
                                        <div className="flex flex-col w-full">
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm">
                                              {inventoryItem.productName}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              EGP{" "}
                                              {inventoryItem.sellingPrice || 0}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-gray-500">
                                              SKU: {inventoryItem.baseSku}
                                            </span>
                                            <span
                                              className={`text-xs px-2 py-1 rounded ${
                                                (inventoryItem.currentStock ||
                                                  0) > 0
                                                  ? "bg-green-100 text-green-700"
                                                  : "bg-red-100 text-red-700"
                                              }`}
                                            >
                                              Stock:{" "}
                                              {inventoryItem.currentStock || 0}
                                            </span>
                                          </div>
                                          {inventoryItem.category && (
                                            <span className="text-xs text-gray-400 mt-1">
                                              Category: {inventoryItem.category}
                                            </span>
                                          )}
                                        </div>
                                      </SelectItem>
                                    )
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Product Name
                            </Label>
                            <Input
                              value={item.productName}
                              onChange={(e) =>
                                updateOrderItem(
                                  index,
                                  "productName",
                                  e.target.value
                                )
                              }
                              placeholder="Enter product name"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              SKU
                            </Label>
                            <Input
                              value={item.sku}
                              onChange={(e) =>
                                updateOrderItem(index, "sku", e.target.value)
                              }
                              placeholder="Enter SKU"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}

                      {/* Stock Display for Inventory Items */}
                      {item.isFromInventory && item.inventoryItemId && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Available Stock
                          </Label>
                          <Input
                            value={
                              inventoryItems.find(
                                (i) => i.id === item.inventoryItemId
                              )?.currentStock || 0
                            }
                            disabled
                            className="mt-1 bg-gray-50"
                          />
                        </div>
                      )}

                      {/* Quantity and Price */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Quantity
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className={`mt-1 ${
                              !validateStockAvailability(item)
                                ? "border-red-500 focus:border-red-500"
                                : ""
                            }`}
                          />
                          {!validateStockAvailability(item) && (
                            <p className="text-xs text-red-600 mt-1">
                              {getStockValidationMessage(item)}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Unit Price (EGP)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "unitPrice",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            disabled={item.isFromInventory}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Total Price
                          </Label>
                          <div className="mt-1 p-2 bg-gray-50 rounded-md text-center">
                            <span className="text-lg font-semibold text-gray-900">
                              EGP {item.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {orderItems.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Items Total:
                      </span>
                      <span className="text-sm font-medium">
                        EGP {calculateItemsTotal().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Shipping Cost:
                      </span>
                      <span className="text-sm font-medium">
                        EGP {(formData.shippingCost || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          Order Total:
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          EGP {calculateTotalAmount().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Options Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Additional Options
                </h3>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <Label
                    htmlFor="shippingCost"
                    className="text-sm font-medium text-gray-700"
                  >
                    Shipping Cost (EGP)
                  </Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.shippingCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter shipping cost (optional)"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="notes"
                    className="text-sm font-medium text-gray-700"
                  >
                    Order Notes
                  </Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Add any additional notes for this order"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white rounded-md border">
                  <Checkbox
                    id="isRevenue"
                    checked={formData.isRevenue}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isRevenue: checked === true })
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="isRevenue"
                      className="text-sm font-medium text-gray-700"
                    >
                      Count as Revenue
                    </Label>
                    <p className="text-xs text-gray-500">
                      When enabled, this order will be automatically added to
                      your revenue tracking
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddOrderModal(false);
                  setShowEditOrderModal(false);
                  setSelectedOrder(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveOrder}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : selectedOrder ? (
                  "Update Order"
                ) : (
                  "Create Order"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function OrdersPage() {
  const { t, isRTL } = useLanguage();
  const {
    hasIntegrationAccess,
    getLockedFeatureMessage,
    hasSectionAccess,
    getSectionLockMessage,
    subscription,
    testUpgradeToGrowth,
    testUpgradeToScale,
  } = useSubscription();

  // State for upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Helper functions for upgrade modal
  const getUpgradePlan = () => {
    if (!subscription) return "Growth";
    if (subscription.isFreePlan) return "Growth";
    if (subscription.plan.name.toLowerCase() === "growth") return "Scale";
    return "Growth";
  };

  const getUpgradePrice = () => {
    if (!subscription) return "299 EGP/month";
    if (subscription.isFreePlan) return "299 EGP/month";
    if (subscription.plan.name.toLowerCase() === "growth")
      return "399 EGP/month";
    return "299 EGP/month";
  };

  const handleActionClick = () => {
    if (subscription?.isFreePlan && !hasSectionAccess("orders")) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };
  const [activeTab, setActiveTab] = useState("manual");
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [importData, setImportData] = useState<BostaImportData | null>(null);
  const [createRevenue, setCreateRevenue] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedOrders, setImportedOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [selectedRevenueGroup, setSelectedRevenueGroup] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedImport, setSelectedImport] = useState<any>(null);
  const [upgradeFeature, setUpgradeFeature] = useState<string>("");

  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Bulk operations state
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionType, setBulkActionType] = useState("");
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<any>({});

  // Duplicate detection state
  const [duplicateData, setDuplicateData] = useState<any>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Shopify import state
  const [shopifyImportData, setShopifyImportData] =
    useState<ShopifyImportData | null>(null);
  const [showShopifyConfirmation, setShowShopifyConfirmation] = useState(false);
  const [isUploadingShopify, setIsUploadingShopify] = useState(false);
  const [isProcessingShopify, setIsProcessingShopify] = useState(false);
  const [addMissingShopifySkus, setAddMissingShopifySkus] = useState(false);
  const [importedShopifyProducts, setImportedShopifyProducts] = useState<any[]>(
    []
  );
  const [isLoadingShopifyProducts, setIsLoadingShopifyProducts] =
    useState(false);
  const [showShopifyDetailsModal, setShowShopifyDetailsModal] = useState(false);
  const [selectedShopifyImport, setSelectedShopifyImport] = useState<any>(null);

  // Shopify Orders State
  const [shopifyOrderImportData, setShopifyOrderImportData] =
    useState<ShopifyOrderImportData | null>(null);
  const [showShopifyOrderConfirmation, setShowShopifyOrderConfirmation] =
    useState(false);
  const [isUploadingShopifyOrders, setIsUploadingShopifyOrders] =
    useState(false);
  const [isProcessingShopifyOrders, setIsProcessingShopifyOrders] =
    useState(false);
  const [importedShopifyOrders, setImportedShopifyOrders] = useState<any[]>([]);
  const [isLoadingShopifyOrders, setIsLoadingShopifyOrders] = useState(false);
  const [showShopifyOrderDetailsModal, setShowShopifyOrderDetailsModal] =
    useState(false);
  const [selectedShopifyOrderImport, setSelectedShopifyOrderImport] =
    useState<any>(null);

  // Shipblu import state
  const [shipbluImportData, setShipbluImportData] =
    useState<ShipbluImportData | null>(null);
  const [showShipbluConfirmation, setShowShipbluConfirmation] = useState(false);
  const [isUploadingShipblu, setIsUploadingShipblu] = useState(false);
  const [isProcessingShipblu, setIsProcessingShipblu] = useState(false);
  const [selectedShipbluRows, setSelectedShipbluRows] = useState<Set<number>>(
    new Set()
  );
  const [shipbluCurrentPage, setShipbluCurrentPage] = useState(1);
  const [shipbluItemsPerPage] = useState(10);

  // Load imported orders on component mount and when tab changes
  useEffect(() => {
    if (activeTab === "bosta") {
      loadImportedOrders();
    }
  }, [activeTab]);

  // Load imported orders on component mount
  useEffect(() => {
    loadImportedOrders();
  }, []);

  // Load imported orders with filtering and pagination
  const loadImportedOrders = async (page = currentPage) => {
    setIsLoadingOrders(true);
    try {
      const brandId = getBrandId();
      console.log("Loading imported orders for brandId:", brandId);

      if (!brandId) {
        throw new Error("Brand ID not found");
      }

      const filterOptions = {
        page,
        limit: pageSize,
        search: searchTerm || undefined,
        status:
          statusFilter && statusFilter !== "all" ? statusFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
        city: cityFilter || undefined,
        customer: customerFilter || undefined,
        sortBy,
        sortOrder,
      };

      const response = await bostaImportAPI.getImports(brandId, filterOptions);
      console.log("Imported orders response:", response);

      if (response && response.imports) {
        setImportedOrders(response.imports);
        setTotalPages(response.pagination.pages);
        setTotalItems(response.pagination.total);
        setCurrentPage(page);
        console.log("Set imported orders:", response.imports);
      } else {
        console.log("No imports found in response");
        setImportedOrders([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (error: any) {
      console.error("Error loading imported orders:", error);
      toast.error(`Failed to load imported orders: ${error.message}`);
      setImportedOrders([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Load grouped revenue
  const loadGroupedRevenue = async () => {
    try {
      const brandId = getBrandId();
      const response = await bostaImportAPI.getGroupedBostaRevenue(brandId);
      return response;
    } catch (error: any) {
      console.error("Error loading grouped revenue:", error);
      return [];
    }
  };

  // Load detailed import information
  const loadImportDetails = async (importId: string) => {
    try {
      const response = await bostaImportAPI.getImportById(importId);
      setSelectedImport(response);
      setShowDetailsModal(true);
    } catch (error: any) {
      console.error("Error loading import details:", error);
      toast.error("Failed to load import details");
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedShipments.length === 0) {
      toast.error("Please select shipments to delete");
      return;
    }

    try {
      await bostaImportAPI.bulkDeleteShipments(selectedShipments);
      toast.success(
        `${selectedShipments.length} shipments deleted successfully`
      );
      setSelectedShipments([]);
      setShowBulkActions(false);
      await loadImportedOrders();
    } catch (error: any) {
      console.error("Error bulk deleting shipments:", error);
      toast.error("Failed to delete shipments");
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedShipments.length === 0) {
      toast.error("Please select shipments to update");
      return;
    }

    try {
      await bostaImportAPI.bulkUpdateShipmentStatus(
        selectedShipments,
        newStatus
      );
      toast.success(
        `${selectedShipments.length} shipments updated to ${newStatus}`
      );
      setSelectedShipments([]);
      setShowBulkActions(false);
      await loadImportedOrders();
    } catch (error: any) {
      console.error("Error bulk updating status:", error);
      toast.error("Failed to update shipment status");
    }
  };

  const handleBulkEdit = async () => {
    if (selectedShipments.length === 0) {
      toast.error("Please select shipments to edit");
      return;
    }

    try {
      await bostaImportAPI.bulkEditShipments(selectedShipments, bulkEditData);
      toast.success(
        `${selectedShipments.length} shipments updated successfully`
      );
      setSelectedShipments([]);
      setShowBulkActions(false);
      setShowBulkEditModal(false);
      setBulkEditData({});
      await loadImportedOrders();
    } catch (error: any) {
      console.error("Error bulk editing shipments:", error);
      toast.error("Failed to edit shipments");
    }
  };

  // Handle shipment selection
  const handleShipmentSelect = (shipmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedShipments([...selectedShipments, shipmentId]);
    } else {
      setSelectedShipments(selectedShipments.filter((id) => id !== shipmentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allShipmentIds = importedOrders.flatMap(
        (importRecord) =>
          importRecord.shipments?.map((shipment: any) => shipment.id) || []
      );
      setSelectedShipments(allShipmentIds);
    } else {
      setSelectedShipments([]);
    }
  };

  // Filter and search handlers
  const handleSearch = () => {
    setCurrentPage(1);
    loadImportedOrders(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setMinAmount("");
    setMaxAmount("");
    setCityFilter("");
    setCustomerFilter("");
    setCurrentPage(1);
    loadImportedOrders(1);
  };

  // Delete individual revenue entry
  const deleteRevenueEntry = async (revenueId: string) => {
    try {
      await bostaImportAPI.deleteRevenueFromShipment(revenueId);
      toast.success("Revenue entry deleted successfully");
      // Reload the revenue group
      const updatedGroup = await loadGroupedRevenue();
      setSelectedRevenueGroup(
        updatedGroup.find(
          (group: any) => group.import.id === selectedRevenueGroup.import.id
        )
      );
    } catch (error: any) {
      console.error("Error deleting revenue entry:", error);
      toast.error("Failed to delete revenue entry");
    }
  };

  const normalizeDeliveryState = (state: string): string => {
    const normalized = state.toLowerCase().trim();

    // Map various delivery states to standard ones
    if (normalized.includes("delivered") || normalized === "fulfilled") {
      return "delivered";
    }
    if (normalized.includes("returned") || normalized.includes("return")) {
      return "returned";
    }
    if (
      normalized.includes("in progress") ||
      normalized.includes("heading to customer") ||
      normalized.includes("out for delivery") ||
      normalized.includes("in transit") ||
      normalized.includes("picked up")
    ) {
      return "in_progress";
    }

    return normalized;
  };

  const parseBostaFile = async (file: File): Promise<BostaImportData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          console.log("File reader loaded, starting XLSX parsing...");
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          console.log("Sheet name:", sheetName);
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          console.log("Parsed JSON data:", jsonData.length, "rows");

          if (jsonData.length < 2) {
            throw new Error("File appears to be empty or has no data rows");
          }

          const headers = (jsonData[0] as string[]).map((h) => h.trim());
          console.log("Headers found:", headers);
          const rows: BostaRow[] = [];

          // Find required column indices
          const trackingNumberCol = headers.findIndex((h) =>
            h.toLowerCase().includes("tracking number")
          );
          const deliveryStateCol = headers.findIndex((h) =>
            h.toLowerCase().includes("delivery state")
          );
          const codAmountCol = headers.findIndex((h) =>
            h.toLowerCase().includes("cod amount")
          );

          console.log("Column indices:", {
            trackingNumber: trackingNumberCol,
            deliveryState: deliveryStateCol,
            codAmount: codAmountCol,
          });

          if (
            trackingNumberCol === -1 ||
            deliveryStateCol === -1 ||
            codAmountCol === -1
          ) {
            throw new Error(
              "Required columns not found: Tracking Number, Delivery State, COD Amount"
            );
          }

          // Find optional column indices
          const skuCol = headers.findIndex((h) =>
            h.toLowerCase().includes("sku")
          );
          const businessRefCol = headers.findIndex((h) =>
            h.toLowerCase().includes("business reference number")
          );
          const descriptionCol = headers.findIndex((h) =>
            h.toLowerCase().includes("description")
          );
          const consigneeNameCol = headers.findIndex((h) =>
            h.toLowerCase().includes("consignee name")
          );
          const consigneePhoneCol = headers.findIndex((h) =>
            h.toLowerCase().includes("consignee phone")
          );
          const dropOffFirstLineCol = headers.findIndex((h) =>
            h.toLowerCase().includes("dropoff first line")
          );
          const dropOffCityCol = headers.findIndex((h) =>
            h.toLowerCase().includes("dropoff city")
          );
          const deliveredAtCol = headers.findIndex((h) =>
            h.toLowerCase().includes("delivered at")
          );
          const updatedAtCol = headers.findIndex((h) =>
            h.toLowerCase().includes("updated at")
          );

          // Process data rows
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];

            if (!row[trackingNumberCol] || !row[deliveryStateCol]) {
              continue; // Skip empty rows
            }

            const codAmountStr = String(row[codAmountCol] || "0").replace(
              /,/g,
              ""
            );
            const codAmount = parseFloat(codAmountStr) || 0;

            const bostaRow: BostaRow = {
              trackingNumber: String(row[trackingNumberCol]).trim(),
              deliveryState: normalizeDeliveryState(
                String(row[deliveryStateCol])
              ),
              codAmount,
              sku: skuCol !== -1 ? String(row[skuCol] || "").trim() : undefined,
              businessReference:
                businessRefCol !== -1
                  ? String(row[businessRefCol] || "").trim()
                  : undefined,
              description:
                descriptionCol !== -1
                  ? String(row[descriptionCol] || "").trim()
                  : undefined,
              consigneeName:
                consigneeNameCol !== -1
                  ? String(row[consigneeNameCol] || "").trim()
                  : undefined,
              consigneePhone:
                consigneePhoneCol !== -1
                  ? String(row[consigneePhoneCol] || "").trim()
                  : undefined,
              dropOffFirstLine:
                dropOffFirstLineCol !== -1
                  ? String(row[dropOffFirstLineCol] || "").trim()
                  : undefined,
              dropOffCity:
                dropOffCityCol !== -1
                  ? String(row[dropOffCityCol] || "").trim()
                  : undefined,
              deliveredAt:
                deliveredAtCol !== -1
                  ? String(row[deliveredAtCol] || "").trim()
                  : undefined,
              updatedAt:
                updatedAtCol !== -1
                  ? String(row[updatedAtCol] || "").trim()
                  : undefined,
            };

            rows.push(bostaRow);
          }

          // Calculate statistics
          const totalOrders = rows.length;
          const delivered = rows.filter(
            (r) => r.deliveryState === "delivered"
          ).length;
          const returned = rows.filter(
            (r) => r.deliveryState === "returned"
          ).length;
          const inProgress = rows.filter(
            (r) => r.deliveryState === "in_progress"
          ).length;

          const eligibleBase = delivered + returned; // For rate calculations
          const returnRate =
            eligibleBase > 0 ? (returned / eligibleBase) * 100 : 0;
          const deliveryRate =
            eligibleBase > 0 ? (delivered / eligibleBase) * 100 : 0;

          // Calculate expected cash (COD amount for fulfilled, in-progress, delivered orders)
          const expectedCash = rows
            .filter(
              (r) =>
                r.deliveryState === "delivered" ||
                r.deliveryState === "in_progress" ||
                r.deliveryState === "fulfilled"
            )
            .reduce((sum, r) => sum + r.codAmount, 0);

          // Check for unknown SKUs
          const brandId = getBrandId();
          console.log("Checking inventory for brandId:", brandId);
          const inventoryResponse = await inventoryAPI.getAll();
          console.log("Inventory response:", inventoryResponse);
          const inventory = inventoryResponse.inventory || [];
          console.log("Inventory items:", inventory);
          const existingSkus = new Set(
            inventory.map((item) => item.baseSku.toLowerCase())
          );
          console.log("Existing SKUs:", existingSkus);

          const unknownSkus = Array.from(
            new Set(
              rows
                .map((r) => {
                  const sku = r.sku || r.businessReference || r.description;
                  return sku ? sku.toLowerCase().trim() : "";
                })
                .filter((sku) => sku && !existingSkus.has(sku))
            )
          );

          const stats: BostaStats = {
            totalOrders,
            expectedCash,
            delivered,
            returned,
            returnRate,
            deliveryRate,
            unknownSkus,
          };

          console.log("Final stats:", stats);
          console.log("Processed rows:", rows.length);
          resolve({ rows, stats });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsBinaryString(file);
    });
  };

  const parseShipbluFile = async (file: File): Promise<ShipbluImportData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          console.log("Shipblu file reader loaded, starting XLSX parsing...");
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          console.log("Shipblu sheet name:", sheetName);
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          console.log("Parsed Shipblu JSON data:", jsonData.length, "rows");

          if (jsonData.length < 2) {
            throw new Error("File appears to be empty or has no data rows");
          }

          const headers = (jsonData[0] as string[]).map((h) => h.trim());
          console.log("Shipblu headers found:", headers);

          // Map headers to column indices
          const trackingNumberCol = headers.findIndex((h) =>
            h.toLowerCase().includes("tracking")
          );
          const pickupDateCol = headers.findIndex((h) =>
            h.toLowerCase().includes("pickup")
          );
          const customerNameCol = headers.findIndex(
            (h) =>
              h.toLowerCase().includes("customer") &&
              h.toLowerCase().includes("name")
          );
          const customerPhoneCol = headers.findIndex(
            (h) =>
              h.toLowerCase().includes("customer") &&
              h.toLowerCase().includes("phone")
          );
          const customerZoneCol = headers.findIndex(
            (h) =>
              h.toLowerCase().includes("customer") &&
              h.toLowerCase().includes("zone")
          );
          const customerCityCol = headers.findIndex(
            (h) =>
              h.toLowerCase().includes("customer") &&
              h.toLowerCase().includes("city")
          );
          const codEstimatedDateCol = headers.findIndex(
            (h) =>
              h.toLowerCase().includes("cod") &&
              h.toLowerCase().includes("estimated")
          );

          // If not found as combined, look for separate CoD and Estimated Date columns
          const codCol = headers.findIndex(
            (h) =>
              h.toLowerCase().includes("cod") &&
              !h.toLowerCase().includes("estimated")
          );
          const estimatedDateCol = headers.findIndex(
            (h) =>
              h.toLowerCase().includes("estimated") &&
              h.toLowerCase().includes("date")
          );
          const statusCol = headers.findIndex((h) =>
            h.toLowerCase().includes("status")
          );

          // Validate required columns
          const requiredColumns = [
            { name: "Tracking Number", index: trackingNumberCol },
            { name: "Pickup Date", index: pickupDateCol },
            { name: "Customer Name", index: customerNameCol },
            { name: "Customer Phone", index: customerPhoneCol },
            { name: "Customer Zone", index: customerZoneCol },
            { name: "Customer City", index: customerCityCol },
            { name: "Status", index: statusCol },
          ];

          // Check for CoD Estimated Date (either combined or separate)
          const hasCodEstimatedDate =
            codEstimatedDateCol !== -1 ||
            (codCol !== -1 && estimatedDateCol !== -1);
          if (!hasCodEstimatedDate) {
            requiredColumns.push({
              name: "CoD Estimated Date (or separate CoD and Estimated Date)",
              index: -1,
            });
          }

          const missingColumns = requiredColumns.filter(
            (col) => col.index === -1
          );
          if (missingColumns.length > 0) {
            throw new Error(
              `Required columns not found: ${missingColumns
                .map((col) => col.name)
                .join(", ")}`
            );
          }

          const rows: ShipbluRow[] = [];
          const validRows: number[] = [];
          const duplicateTrackingNumbers: string[] = [];
          const seenTrackingNumbers = new Set<string>();

          // Process data rows
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (!row || row.length === 0) continue;

            const trackingNumber = String(row[trackingNumberCol] || "").trim();
            const pickupDate = String(row[pickupDateCol] || "").trim();
            const customerName = String(row[customerNameCol] || "").trim();
            const customerPhone = String(row[customerPhoneCol] || "").trim();
            const customerZone = String(row[customerZoneCol] || "").trim();
            const customerCity = String(row[customerCityCol] || "").trim();
            // Handle both combined and separate CoD Estimated Date columns
            let codEstimatedDate = "";
            if (codEstimatedDateCol !== -1) {
              codEstimatedDate = String(row[codEstimatedDateCol] || "").trim();
            } else if (codCol !== -1 && estimatedDateCol !== -1) {
              const codValue = String(row[codCol] || "").trim();
              const estimatedDateValue = String(
                row[estimatedDateCol] || ""
              ).trim();
              codEstimatedDate = `${codValue} - ${estimatedDateValue}`;
            }
            const status = String(row[statusCol] || "").trim();

            // Check for duplicates
            if (trackingNumber && seenTrackingNumbers.has(trackingNumber)) {
              duplicateTrackingNumbers.push(trackingNumber);
              continue;
            }

            // Validate required fields
            if (!trackingNumber || !customerName || !customerPhone) {
              continue; // Skip invalid rows
            }

            seenTrackingNumbers.add(trackingNumber);

            const shipbluRow: ShipbluRow = {
              trackingNumber,
              pickupDate,
              customerName,
              customerPhone,
              customerZone,
              customerCity,
              codEstimatedDate,
              status,
            };

            rows.push(shipbluRow);
            validRows.push(rows.length - 1);
          }

          // Calculate statistics
          const totalOrders = rows.length;
          const validOrders = validRows.length;
          const invalidRows = jsonData.length - 1 - validOrders;

          const stats: ShipbluStats = {
            totalOrders,
            validOrders,
            invalidOrders: invalidRows,
            selectedForImport: 0,
          };

          const validation = {
            validRows,
            invalidRows,
            duplicateTrackingNumbers,
          };

          console.log("Final Shipblu stats:", stats);
          console.log("Processed Shipblu rows:", rows.length);
          resolve({ rows, stats, validation });
        } catch (error) {
          reject(error);
        }
      };

      reader.readAsBinaryString(file);
    });
  };

  // Helper function to parse CSV properly (handles quoted fields with commas)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    // Add the last field
    result.push(current.trim());
    return result;
  };

  const parseShopifyFile = async (file: File): Promise<ShopifyImportData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          console.log("Shopify file reader loaded, starting CSV parsing...");
          const data = e.target?.result as string;
          // Handle different line endings (Windows \r\n, Unix \n, Mac \r)
          const lines = data.split(/\r?\n|\r/).filter((line) => line.trim()); // Remove empty lines
          console.log("Parsed CSV data:", lines.length, "lines");

          if (lines.length < 2) {
            throw new Error("File appears to be empty or has no data rows");
          }

          // Parse headers properly
          const headers = parseCSVLine(lines[0]).map((h) =>
            h.trim().replace(/"/g, "")
          );
          console.log("Shopify headers found:", headers);
          console.log("Header count:", headers.length);

          // Debug: Show first few headers to verify parsing
          console.log("First 10 headers:", headers.slice(0, 10));
          console.log(
            "Headers containing 'sku':",
            headers.filter((h) => h.toLowerCase().includes("sku"))
          );
          console.log(
            "Headers containing 'title':",
            headers.filter((h) => h.toLowerCase().includes("title"))
          );
          console.log(
            "Headers containing 'handle':",
            headers.filter((h) => h.toLowerCase().includes("handle"))
          );

          const rows: ShopifyRow[] = [];

          // Find required column indices
          const handleCol = headers.findIndex(
            (h) => h.toLowerCase() === "handle"
          );
          const titleCol = headers.findIndex(
            (h) => h.toLowerCase() === "title"
          );
          const variantSkuCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant sku"
          );

          console.log("Required column indices:", {
            handle: handleCol,
            title: titleCol,
            variantSku: variantSkuCol,
          });

          if (handleCol === -1 || titleCol === -1 || variantSkuCol === -1) {
            const missingColumns = [];
            if (handleCol === -1) missingColumns.push("Handle");
            if (titleCol === -1) missingColumns.push("Title");
            if (variantSkuCol === -1) missingColumns.push("Variant SKU");

            console.error("Missing required columns:", missingColumns);
            console.error("Available headers:", headers);
            throw new Error(
              `Required columns not found: ${missingColumns.join(
                ", "
              )}. Available columns: ${headers.slice(0, 10).join(", ")}...`
            );
          }

          // Find optional column indices
          const bodyHtmlCol = headers.findIndex(
            (h) => h.toLowerCase() === "body (html)"
          );
          const vendorCol = headers.findIndex(
            (h) => h.toLowerCase() === "vendor"
          );
          const productTypeCol = headers.findIndex(
            (h) => h.toLowerCase() === "product type"
          );
          const tagsCol = headers.findIndex((h) => h.toLowerCase() === "tags");
          const publishedCol = headers.findIndex(
            (h) => h.toLowerCase() === "published"
          );
          const option1NameCol = headers.findIndex(
            (h) => h.toLowerCase() === "option1 name"
          );
          const option1ValueCol = headers.findIndex(
            (h) => h.toLowerCase() === "option1 value"
          );
          const option2NameCol = headers.findIndex(
            (h) => h.toLowerCase() === "option2 name"
          );
          const option2ValueCol = headers.findIndex(
            (h) => h.toLowerCase() === "option2 value"
          );
          const option3NameCol = headers.findIndex(
            (h) => h.toLowerCase() === "option3 name"
          );
          const option3ValueCol = headers.findIndex(
            (h) => h.toLowerCase() === "option3 value"
          );
          const variantGramsCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant grams"
          );
          const variantInventoryTrackerCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant inventory tracker"
          );
          const variantInventoryQuantityCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant inventory quantity"
          );
          const variantInventoryPolicyCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant inventory policy"
          );
          const variantFulfillmentServiceCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant fulfillment service"
          );
          const variantPriceCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant price"
          );
          const variantCompareAtPriceCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant compare at price"
          );
          const variantRequiresShippingCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant requires shipping"
          );
          const variantTaxableCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant taxable"
          );
          const variantBarcodeCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant barcode"
          );
          const imageSrcCol = headers.findIndex(
            (h) => h.toLowerCase() === "image src"
          );
          const imagePositionCol = headers.findIndex(
            (h) => h.toLowerCase() === "image position"
          );
          const imageAltTextCol = headers.findIndex(
            (h) => h.toLowerCase() === "image alt text"
          );
          const giftCardCol = headers.findIndex(
            (h) => h.toLowerCase() === "gift card"
          );
          const seoTitleCol = headers.findIndex(
            (h) => h.toLowerCase() === "seo title"
          );
          const seoDescriptionCol = headers.findIndex(
            (h) => h.toLowerCase() === "seo description"
          );
          const googleProductCategoryCol = headers.findIndex(
            (h) =>
              h.toLowerCase() === "google shopping / google product category"
          );
          const googleGenderCol = headers.findIndex(
            (h) => h.toLowerCase() === "google shopping / gender"
          );
          const googleAgeGroupCol = headers.findIndex(
            (h) => h.toLowerCase() === "google shopping / age group"
          );
          const googleMpnCol = headers.findIndex(
            (h) => h.toLowerCase() === "google shopping / mpn"
          );
          const googleConditionCol = headers.findIndex(
            (h) => h.toLowerCase() === "google shopping / condition"
          );
          const googleCustomProductCol = headers.findIndex(
            (h) => h.toLowerCase() === "google shopping / custom product"
          );
          const googleCustomLabel0Col = headers.findIndex(
            (h) => h.toLowerCase() === "google shopping / custom label 0"
          );
          const googleCustomLabel1Col = headers.findIndex(
            (h) => h.toLowerCase() === "google shopping / custom label 1"
          );
          const googleCustomLabel2Col = headers.findIndex(
            (h) => h.toLowerCase() === "google shopping / custom label 2"
          );
          const googleCustomLabel3Col = headers.findIndex(
            (h) => h.toLowerCase() === "google shopping / custom label 3"
          );
          const googleCustomLabel4Col = headers.findIndex(
            (h) => h.toLowerCase() === "google shopping / custom label 4"
          );
          const variantImageCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant image"
          );
          const variantWeightUnitCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant weight unit"
          );
          const variantTaxCodeCol = headers.findIndex(
            (h) => h.toLowerCase() === "variant tax code"
          );
          const costPerItemCol = headers.findIndex(
            (h) => h.toLowerCase() === "cost per item"
          );
          const statusCol = headers.findIndex(
            (h) => h.toLowerCase() === "status"
          );

          // Process data rows
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Parse the CSV row properly
            const row = parseCSVLine(line);
            console.log(`Processing row ${i}:`, row.slice(0, 5)); // Log first 5 fields for debugging

            // Check if we have the required fields
            const handle = row[handleCol]?.trim();
            const title = row[titleCol]?.trim();
            const variantSku = row[variantSkuCol]?.trim();

            if (!handle || !title || !variantSku) {
              console.log(`Skipping row ${i}: missing required fields`, {
                handle,
                title,
                variantSku,
              });
              continue; // Skip empty rows
            }

            const variantPrice = parseFloat(row[variantPriceCol] || "0") || 0;
            const variantCompareAtPrice =
              parseFloat(row[variantCompareAtPriceCol] || "0") || 0;
            const variantInventoryQuantity =
              parseInt(row[variantInventoryQuantityCol] || "0") || 0;
            const variantGrams = parseInt(row[variantGramsCol] || "0") || 0;
            const costPerItem = parseFloat(row[costPerItemCol] || "0") || 0;
            const imagePosition = parseInt(row[imagePositionCol] || "0") || 0;

            const shopifyRow: ShopifyRow = {
              handle: handle,
              title: title,
              bodyHtml:
                bodyHtmlCol !== -1 ? row[bodyHtmlCol]?.trim() : undefined,
              vendor: vendorCol !== -1 ? row[vendorCol]?.trim() : undefined,
              productType:
                productTypeCol !== -1 ? row[productTypeCol]?.trim() : undefined,
              tags: tagsCol !== -1 ? row[tagsCol]?.trim() : undefined,
              published:
                publishedCol !== -1 ? row[publishedCol]?.trim() : undefined,
              option1Name:
                option1NameCol !== -1 ? row[option1NameCol]?.trim() : undefined,
              option1Value:
                option1ValueCol !== -1
                  ? row[option1ValueCol]?.trim()
                  : undefined,
              option2Name:
                option2NameCol !== -1 ? row[option2NameCol]?.trim() : undefined,
              option2Value:
                option2ValueCol !== -1
                  ? row[option2ValueCol]?.trim()
                  : undefined,
              option3Name:
                option3NameCol !== -1 ? row[option3NameCol]?.trim() : undefined,
              option3Value:
                option3ValueCol !== -1
                  ? row[option3ValueCol]?.trim()
                  : undefined,
              variantSku: variantSku,
              variantGrams: variantGrams || undefined,
              variantInventoryTracker:
                variantInventoryTrackerCol !== -1
                  ? row[variantInventoryTrackerCol]?.trim()
                  : undefined,
              variantInventoryQuantity: variantInventoryQuantity || undefined,
              variantInventoryPolicy:
                variantInventoryPolicyCol !== -1
                  ? row[variantInventoryPolicyCol]?.trim()
                  : undefined,
              variantFulfillmentService:
                variantFulfillmentServiceCol !== -1
                  ? row[variantFulfillmentServiceCol]?.trim()
                  : undefined,
              variantPrice: variantPrice || undefined,
              variantCompareAtPrice: variantCompareAtPrice || undefined,
              variantRequiresShipping:
                variantRequiresShippingCol !== -1
                  ? row[variantRequiresShippingCol]?.trim()
                  : undefined,
              variantTaxable:
                variantTaxableCol !== -1
                  ? row[variantTaxableCol]?.trim()
                  : undefined,
              variantBarcode:
                variantBarcodeCol !== -1
                  ? row[variantBarcodeCol]?.trim()
                  : undefined,
              imageSrc:
                imageSrcCol !== -1 ? row[imageSrcCol]?.trim() : undefined,
              imagePosition: imagePosition || undefined,
              imageAltText:
                imageAltTextCol !== -1
                  ? row[imageAltTextCol]?.trim()
                  : undefined,
              giftCard:
                giftCardCol !== -1 ? row[giftCardCol]?.trim() : undefined,
              seoTitle:
                seoTitleCol !== -1 ? row[seoTitleCol]?.trim() : undefined,
              seoDescription:
                seoDescriptionCol !== -1
                  ? row[seoDescriptionCol]?.trim()
                  : undefined,
              googleProductCategory:
                googleProductCategoryCol !== -1
                  ? row[googleProductCategoryCol]?.trim()
                  : undefined,
              googleGender:
                googleGenderCol !== -1
                  ? row[googleGenderCol]?.trim()
                  : undefined,
              googleAgeGroup:
                googleAgeGroupCol !== -1
                  ? row[googleAgeGroupCol]?.trim()
                  : undefined,
              googleMpn:
                googleMpnCol !== -1 ? row[googleMpnCol]?.trim() : undefined,
              googleCondition:
                googleConditionCol !== -1
                  ? row[googleConditionCol]?.trim()
                  : undefined,
              googleCustomProduct:
                googleCustomProductCol !== -1
                  ? row[googleCustomProductCol]?.trim()
                  : undefined,
              googleCustomLabel0:
                googleCustomLabel0Col !== -1
                  ? row[googleCustomLabel0Col]?.trim()
                  : undefined,
              googleCustomLabel1:
                googleCustomLabel1Col !== -1
                  ? row[googleCustomLabel1Col]?.trim()
                  : undefined,
              googleCustomLabel2:
                googleCustomLabel2Col !== -1
                  ? row[googleCustomLabel2Col]?.trim()
                  : undefined,
              googleCustomLabel3:
                googleCustomLabel3Col !== -1
                  ? row[googleCustomLabel3Col]?.trim()
                  : undefined,
              googleCustomLabel4:
                googleCustomLabel4Col !== -1
                  ? row[googleCustomLabel4Col]?.trim()
                  : undefined,
              variantImage:
                variantImageCol !== -1
                  ? row[variantImageCol]?.trim()
                  : undefined,
              variantWeightUnit:
                variantWeightUnitCol !== -1
                  ? row[variantWeightUnitCol]?.trim()
                  : undefined,
              variantTaxCode:
                variantTaxCodeCol !== -1
                  ? row[variantTaxCodeCol]?.trim()
                  : undefined,
              costPerItem: costPerItem || undefined,
              status: statusCol !== -1 ? row[statusCol]?.trim() : undefined,
            };

            rows.push(shopifyRow);
          }

          // Calculate statistics
          const totalProducts = new Set(rows.map((r) => r.handle)).size;
          const totalVariants = rows.length;
          const totalValue = rows.reduce((sum, r) => {
            const quantity = r.variantInventoryQuantity || 0;
            const price = r.variantPrice || 0;
            return sum + quantity * price;
          }, 0);

          const inStock = rows.filter(
            (r) => (r.variantInventoryQuantity || 0) > 0
          ).length;
          const outOfStock = rows.filter(
            (r) => (r.variantInventoryQuantity || 0) === 0
          ).length;
          const lowStock = rows.filter((r) => {
            const quantity = r.variantInventoryQuantity || 0;
            return quantity > 0 && quantity <= 10; // Consider low stock if 10 or fewer
          }).length;

          // Check for unknown SKUs
          const brandId = getBrandId();
          console.log("Checking inventory for brandId:", brandId);
          const inventoryResponse = await inventoryAPI.getAll();
          console.log("Inventory response:", inventoryResponse);
          const inventory = inventoryResponse.inventory || [];
          console.log("Inventory items:", inventory);
          const existingSkus = new Set(
            inventory.map((item) => item.baseSku.toLowerCase())
          );
          console.log("Existing SKUs:", existingSkus);

          const unknownSkus = Array.from(
            new Set(
              rows
                .map((r) => r.variantSku.toLowerCase().trim())
                .filter((sku) => sku && !existingSkus.has(sku))
            )
          );

          // Check for duplicate SKUs within the import
          const skuCounts = new Map<string, number>();
          rows.forEach((r) => {
            const sku = r.variantSku.toLowerCase().trim();
            skuCounts.set(sku, (skuCounts.get(sku) || 0) + 1);
          });
          const duplicateSkus = Array.from(skuCounts.entries())
            .filter(([_, count]) => count > 1)
            .map(([sku, _]) => sku);

          const stats: ShopifyStats = {
            totalProducts,
            totalVariants,
            totalValue,
            inStock,
            outOfStock,
            lowStock,
            unknownSkus,
            duplicateSkus,
          };

          console.log("Final Shopify stats:", stats);
          console.log("Processed Shopify rows:", rows.length);
          console.log("Sample row:", rows[0]);
          resolve({ rows, stats });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  // Parse Shopify Orders CSV file
  const parseShopifyOrdersFile = async (
    file: File
  ): Promise<ShopifyOrderImportData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          console.log(
            "Shopify orders file reader loaded, starting CSV parsing..."
          );
          const data = e.target?.result as string;
          // Handle different line endings (Windows \r\n, Unix \n, Mac \r)
          const lines = data.split(/\r?\n|\r/).filter((line) => line.trim());
          console.log("Parsed CSV data:", lines.length, "lines");

          if (lines.length < 2) {
            throw new Error("File appears to be empty or has no data rows");
          }

          // Parse headers properly
          const headers = parseCSVLine(lines[0]).map((h) =>
            h.trim().replace(/"/g, "")
          );
          console.log("Shopify orders headers found:", headers);

          const rows: ShopifyOrderRow[] = [];

          // Find required column indices for orders
          const nameCol = headers.findIndex((h) => h.toLowerCase() === "name");
          const emailCol = headers.findIndex(
            (h) => h.toLowerCase() === "email"
          );
          const financialStatusCol = headers.findIndex(
            (h) => h.toLowerCase() === "financial status"
          );
          const fulfillmentStatusCol = headers.findIndex(
            (h) => h.toLowerCase() === "fulfillment status"
          );
          const currencyCol = headers.findIndex(
            (h) => h.toLowerCase() === "currency"
          );
          const totalCol = headers.findIndex(
            (h) => h.toLowerCase() === "total"
          );
          const createdAtCol = headers.findIndex(
            (h) => h.toLowerCase() === "created at"
          );

          console.log("Required column indices:", {
            name: nameCol,
            email: emailCol,
            financialStatus: financialStatusCol,
            fulfillmentStatus: fulfillmentStatusCol,
            currency: currencyCol,
            total: totalCol,
            createdAt: createdAtCol,
          });

          if (nameCol === -1 || emailCol === -1 || totalCol === -1) {
            const missingColumns = [];
            if (nameCol === -1) missingColumns.push("Name");
            if (emailCol === -1) missingColumns.push("Email");
            if (totalCol === -1) missingColumns.push("Total");

            throw new Error(
              `Required columns not found: ${missingColumns.join(
                ", "
              )}. Available columns: ${headers.slice(0, 10).join(", ")}...`
            );
          }

          // Find optional column indices
          const subtotalCol = headers.findIndex(
            (h) => h.toLowerCase() === "subtotal"
          );
          const shippingCol = headers.findIndex(
            (h) => h.toLowerCase() === "shipping"
          );
          const taxCol = headers.findIndex((h) => h.toLowerCase() === "tax");
          const discountCodeCol = headers.findIndex(
            (h) => h.toLowerCase() === "discount code"
          );
          const discountAmountCol = headers.findIndex(
            (h) => h.toLowerCase() === "discount amount"
          );
          const shippingMethodCol = headers.findIndex(
            (h) => h.toLowerCase() === "shipping method"
          );
          const updatedAtCol = headers.findIndex(
            (h) => h.toLowerCase() === "updated at"
          );
          const processedAtCol = headers.findIndex(
            (h) => h.toLowerCase() === "processed at"
          );
          const cancelledAtCol = headers.findIndex(
            (h) => h.toLowerCase() === "cancelled at"
          );
          const cancelReasonCol = headers.findIndex(
            (h) => h.toLowerCase() === "cancel reason"
          );
          const tagsCol = headers.findIndex((h) => h.toLowerCase() === "tags");
          const noteCol = headers.findIndex((h) => h.toLowerCase() === "note");
          const testCol = headers.findIndex((h) => h.toLowerCase() === "test");
          const orderNumberCol = headers.findIndex(
            (h) => h.toLowerCase() === "order number"
          );
          const totalLineItemsPriceCol = headers.findIndex(
            (h) => h.toLowerCase() === "total line items price"
          );
          const totalLineItemsQuantityCol = headers.findIndex(
            (h) => h.toLowerCase() === "total line items quantity"
          );
          const totalPriceUsdCol = headers.findIndex(
            (h) => h.toLowerCase() === "total price usd"
          );
          const totalTaxCol = headers.findIndex(
            (h) => h.toLowerCase() === "total tax"
          );
          const totalWeightCol = headers.findIndex(
            (h) => h.toLowerCase() === "total weight"
          );
          const userIdCol = headers.findIndex(
            (h) => h.toLowerCase() === "user id"
          );

          // Process data rows
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Parse the CSV row properly
            const row = parseCSVLine(line);
            console.log(`Processing order row ${i}:`, row.slice(0, 5));

            // Check if we have the required fields
            const name = row[nameCol]?.trim();
            const email = row[emailCol]?.trim() || "no email";
            const total = parseFloat(row[totalCol] || "0") || 0;

            if (!name || total === 0) {
              console.log(`Skipping order row ${i}: missing required fields`, {
                name,
                email,
                total,
              });
              continue;
            }

            const shopifyOrderRow: ShopifyOrderRow = {
              name: name,
              email: email,
              financialStatus:
                financialStatusCol !== -1
                  ? row[financialStatusCol]?.trim() || "unknown"
                  : "unknown",
              fulfillmentStatus:
                fulfillmentStatusCol !== -1
                  ? row[fulfillmentStatusCol]?.trim() || "unfulfilled"
                  : "unfulfilled",
              currency:
                currencyCol !== -1 ? row[currencyCol]?.trim() || "USD" : "USD",
              subtotal:
                subtotalCol !== -1
                  ? parseFloat(row[subtotalCol] || "0") || 0
                  : 0,
              shipping:
                shippingCol !== -1
                  ? parseFloat(row[shippingCol] || "0") || 0
                  : 0,
              tax: taxCol !== -1 ? parseFloat(row[taxCol] || "0") || 0 : 0,
              total: total,
              discountCode:
                discountCodeCol !== -1
                  ? row[discountCodeCol]?.trim() || ""
                  : "",
              discountAmount:
                discountAmountCol !== -1
                  ? parseFloat(row[discountAmountCol] || "0") || 0
                  : 0,
              shippingMethod:
                shippingMethodCol !== -1
                  ? row[shippingMethodCol]?.trim() || ""
                  : "",
              createdAt:
                createdAtCol !== -1 ? row[createdAtCol]?.trim() || "" : "",
              updatedAt:
                updatedAtCol !== -1 ? row[updatedAtCol]?.trim() || "" : "",
              processedAt:
                processedAtCol !== -1 ? row[processedAtCol]?.trim() || "" : "",
              cancelledAt:
                cancelledAtCol !== -1 ? row[cancelledAtCol]?.trim() : undefined,
              cancelReason:
                cancelReasonCol !== -1
                  ? row[cancelReasonCol]?.trim()
                  : undefined,
              tags: tagsCol !== -1 ? row[tagsCol]?.trim() || "" : "",
              note: noteCol !== -1 ? row[noteCol]?.trim() || "" : "",
              test:
                testCol !== -1
                  ? row[testCol]?.trim().toLowerCase() === "true"
                  : false,
              browserIp: "",
              landingSite: "",
              landingSiteRef: "",
              referringSite: "",
              orderNumber:
                orderNumberCol !== -1
                  ? parseInt(row[orderNumberCol] || "0") || 0
                  : 0,
              orderStatusUrl: "",
              presentmentCurrency:
                currencyCol !== -1 ? row[currencyCol]?.trim() || "USD" : "USD",
              totalLineItemsPrice:
                totalLineItemsPriceCol !== -1
                  ? parseFloat(row[totalLineItemsPriceCol] || "0") || 0
                  : 0,
              totalLineItemsQuantity:
                totalLineItemsQuantityCol !== -1
                  ? parseInt(row[totalLineItemsQuantityCol] || "0") || 0
                  : 0,
              totalOutstanding: 0,
              totalPrice: total,
              totalPriceUsd:
                totalPriceUsdCol !== -1
                  ? parseFloat(row[totalPriceUsdCol] || "0") || 0
                  : total,
              totalTax:
                totalTaxCol !== -1
                  ? parseFloat(row[totalTaxCol] || "0") || 0
                  : 0,
              totalWeight:
                totalWeightCol !== -1
                  ? parseFloat(row[totalWeightCol] || "0") || 0
                  : 0,
              userId: userIdCol !== -1 ? row[userIdCol]?.trim() || "" : "",
              orderAdjustments: "",
              billingAddress: "",
              shippingAddress: "",
              customer: "",
              discountApplications: "",
              fulfillments: "",
              lineItems: "",
              paymentGatewayNames: "",
              refunds: "",
              shippingLines: "",
              taxLines: "",
            };

            rows.push(shopifyOrderRow);
          }

          // Calculate stats
          const stats: ShopifyOrderStats = {
            totalOrders: rows.length,
            totalRevenue: rows.reduce((sum, row) => sum + row.total, 0),
            totalTax: rows.reduce((sum, row) => sum + row.tax, 0),
            totalShipping: rows.reduce((sum, row) => sum + row.shipping, 0),
            totalDiscount: rows.reduce(
              (sum, row) => sum + row.discountAmount,
              0
            ),
            paidOrders: rows.filter((row) => row.financialStatus === "paid")
              .length,
            pendingOrders: rows.filter(
              (row) => row.financialStatus === "pending"
            ).length,
            cancelledOrders: rows.filter(
              (row) => row.financialStatus === "cancelled"
            ).length,
            fulfilledOrders: rows.filter(
              (row) => row.fulfillmentStatus === "fulfilled"
            ).length,
            unfulfilledOrders: rows.filter(
              (row) => row.fulfillmentStatus === "unfulfilled"
            ).length,
            averageOrderValue:
              rows.length > 0
                ? rows.reduce((sum, row) => sum + row.total, 0) / rows.length
                : 0,
            uniqueCustomers: new Set(rows.map((row) => row.email)).size,
          };

          console.log("Final Shopify orders stats:", stats);
          console.log("Processed Shopify order rows:", rows.length);
          resolve({ rows, stats });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleShipbluDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    console.log("File upload started:", file.name, file.size);

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setIsUploading(true);
    try {
      console.log("Starting to parse file...");
      const data = await parseBostaFile(file);
      console.log("File parsed successfully:", data);
      setImportData(data);
      setShowConfirmation(true);
      toast.success("File parsed successfully!");
    } catch (error: any) {
      console.error("File parsing error:", error);
      toast.error(error.message || "Failed to parse file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Shipblu file upload handler
  const handleShipbluFileUpload = async (file: File) => {
    console.log("Shipblu file upload started:", file.name, file.size);

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setIsUploadingShipblu(true);
    try {
      console.log("Starting to parse Shipblu file...");
      const data = await parseShipbluFile(file);
      console.log("Shipblu file parsed successfully:", data);
      setShipbluImportData(data);
      setShowShipbluConfirmation(true);
      toast.success("Shipblu file parsed successfully!");
    } catch (error: any) {
      console.error("Shipblu file parsing error:", error);
      toast.error(error.message || "Failed to parse Shipblu file");
    } finally {
      setIsUploadingShipblu(false);
    }
  };

  const handleShipbluFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleShipbluFileUpload(files[0]);
    }
  };

  const handleShipbluDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleShipbluFileUpload(files[0]);
    }
  }, []);

  // Shopify file upload handlers
  const handleShopifyDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleShopifyDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleShopifyFileUpload(files[0]);
    }
  }, []);

  const handleShopifyFileUpload = async (file: File) => {
    console.log("Shopify file upload started:", file.name, file.size);

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file (.csv)");
      return;
    }

    setIsUploadingShopify(true);
    try {
      console.log("Starting to parse Shopify file...");
      const data = await parseShopifyFile(file);
      console.log("Shopify file parsed successfully:", data);
      setShopifyImportData(data);
      setShowShopifyConfirmation(true);
      toast.success("Shopify file parsed successfully!");
    } catch (error: any) {
      console.error("Shopify file parsing error:", error);
      toast.error(error.message || "Failed to parse Shopify file");
    } finally {
      setIsUploadingShopify(false);
    }
  };

  const handleShopifyFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleShopifyFileUpload(files[0]);
    }
  };

  // Shopify Orders File Upload Handlers
  const handleShopifyOrdersDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleShopifyOrdersDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleShopifyOrdersFileUpload(files[0]);
    }
  }, []);

  const handleShopifyOrdersFileUpload = async (file: File) => {
    console.log("Shopify orders file upload started:", file.name, file.size);

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file (.csv)");
      return;
    }

    setIsUploadingShopifyOrders(true);
    try {
      console.log("Starting to parse Shopify orders file...");
      const data = await parseShopifyOrdersFile(file);
      console.log("Shopify orders file parsed successfully:", data);
      setShopifyOrderImportData(data);
      setShowShopifyOrderConfirmation(true);
    } catch (error: any) {
      console.error("Error parsing Shopify orders file:", error);
      toast.error(`${t("orders.messages.errorParsingFile")}: ${error.message}`);
    } finally {
      setIsUploadingShopifyOrders(false);
    }
  };

  const handleShopifyOrdersFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleShopifyOrdersFileUpload(files[0]);
    }
  };

  const processImport = async () => {
    if (!importData) return;

    setIsProcessing(true);
    try {
      const brandId = getBrandId();

      // Check for duplicates first
      const duplicateCheck = await bostaImportAPI.checkDuplicates(
        brandId,
        importData.rows
      );

      if (duplicateCheck.duplicateCount > 0) {
        setDuplicateData(duplicateCheck);
        setShowDuplicateModal(true);
        setIsProcessing(false);
        return;
      }

      // Create the import record in the database
      const importRecord = await bostaImportAPI.createImport(brandId, {
        fileName: "Bosta Import",
        totalOrders: importData.stats.totalOrders,
        expectedCash: importData.stats.expectedCash,
        delivered: importData.stats.delivered,
        returned: importData.stats.returned,
        returnRate: importData.stats.returnRate,
        deliveryRate: importData.stats.deliveryRate,
        shipments: importData.rows,
      });

      // Create revenue entries for delivered orders if selected
      if (createRevenue) {
        const deliveredShipments = importData.rows.filter(
          (r) => r.deliveryState === "delivered" && r.codAmount > 0
        );

        if (deliveredShipments.length > 0) {
          // Get the shipment IDs from the created import
          const shipmentIds = importRecord.shipments
            .filter((shipment: any) =>
              deliveredShipments.some(
                (order) => order.trackingNumber === shipment.trackingNumber
              )
            )
            .map((shipment: any) => shipment.id);

          await bostaImportAPI.createRevenueFromShipments(
            brandId,
            importRecord.import.id,
            shipmentIds
          );
          toast.success(`Created ${deliveredShipments.length} revenue entries`);
        }
      }

      toast.success("Import completed successfully!");
      setShowConfirmation(false);
      setImportData(null);

      // Reload imported orders
      await loadImportedOrders();
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to process import");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle duplicate import (skip duplicates)
  const handleDuplicateImport = async () => {
    if (!importData || !duplicateData) return;

    setIsProcessing(true);
    try {
      const brandId = getBrandId();

      // Filter out duplicate shipments
      const uniqueShipments = importData.rows.filter(
        (shipment) =>
          !duplicateData.duplicates.some(
            (duplicate: any) =>
              duplicate.trackingNumber === shipment.trackingNumber
          )
      );

      // Update import data with unique shipments only
      const updatedImportData = {
        ...importData,
        rows: uniqueShipments,
        stats: {
          ...importData.stats,
          totalOrders: uniqueShipments.length,
          delivered: uniqueShipments.filter(
            (r) => r.deliveryState === "delivered"
          ).length,
          returned: uniqueShipments.filter(
            (r) => r.deliveryState === "returned"
          ).length,
          expectedCash: uniqueShipments.reduce(
            (sum, r) => sum + r.codAmount,
            0
          ),
        },
      };

      // Continue with import using unique shipments
      const importRecord = await bostaImportAPI.createImport(brandId, {
        fileName: "Bosta Import (Duplicates Skipped)",
        totalOrders: updatedImportData.stats.totalOrders,
        expectedCash: updatedImportData.stats.expectedCash,
        delivered: updatedImportData.stats.delivered,
        returned: updatedImportData.stats.returned,
        returnRate: updatedImportData.stats.returnRate,
        deliveryRate: updatedImportData.stats.deliveryRate,
        shipments: updatedImportData.rows,
      });

      toast.success(
        `Import completed! ${duplicateData.duplicateCount} duplicates skipped, ${uniqueShipments.length} new orders imported.`
      );
      setShowDuplicateModal(false);
      setShowConfirmation(false);
      setImportData(null);
      setDuplicateData(null);

      // Reload imported orders
      await loadImportedOrders();
    } catch (error: any) {
      console.error("Duplicate import error:", error);
      toast.error(error.message || "Failed to process import");
    } finally {
      setIsProcessing(false);
    }
  };

  // Shopify import processing
  const processShopifyImport = async () => {
    if (!shopifyImportData) return;

    setIsProcessingShopify(true);
    try {
      const brandId = getBrandId();

      // Add missing SKUs if selected
      if (
        addMissingShopifySkus &&
        shopifyImportData.stats.unknownSkus.length > 0
      ) {
        for (const sku of shopifyImportData.stats.unknownSkus) {
          await inventoryAPI.create({
            productName: `Imported from Shopify - ${sku}`,
            baseSku: sku,
            category: "Imported",
            supplier: "Shopify Import",
            unitCost: 0,
            sellingPrice: 0,
            currentStock: 0,
            reorderLevel: 10,
            description: "Automatically added from Shopify import",
          });
        }
        toast.success(
          `Added ${shopifyImportData.stats.unknownSkus.length} new SKUs to inventory`
        );
      }

      // Create inventory items from Shopify data
      const inventoryItems = shopifyImportData.rows.map((row) => ({
        productName: row.title,
        baseSku: row.variantSku,
        category: row.productType || "Imported",
        supplier: row.vendor || "Shopify Import",
        unitCost: row.costPerItem || 0,
        sellingPrice: row.variantPrice || 0,
        currentStock: row.variantInventoryQuantity || 0,
        reorderLevel: 10,
        description: row.bodyHtml || `Imported from Shopify - ${row.title}`,
        location: "Shopify Import",
        tags: row.tags || "",
        imageUrl: row.imageSrc || "",
        weight: row.variantGrams || 0,
        barcode: row.variantBarcode || "",
        published: row.published === "TRUE",
        seoTitle: row.seoTitle || "",
        seoDescription: row.seoDescription || "",
        googleProductCategory: row.googleProductCategory || "",
        googleGender: row.googleGender || "",
        googleAgeGroup: row.googleAgeGroup || "",
        googleMpn: row.googleMpn || "",
        googleCondition: row.googleCondition || "",
        googleCustomProduct: row.googleCustomProduct || "",
        googleCustomLabel0: row.googleCustomLabel0 || "",
        googleCustomLabel1: row.googleCustomLabel1 || "",
        googleCustomLabel2: row.googleCustomLabel2 || "",
        googleCustomLabel3: row.googleCustomLabel3 || "",
        googleCustomLabel4: row.googleCustomLabel4 || "",
        variantImage: row.variantImage || "",
        variantWeightUnit: row.variantWeightUnit || "",
        variantTaxCode: row.variantTaxCode || "",
        status:
          (row.variantInventoryQuantity || 0) > 0 ? "in-stock" : "out-of-stock",
      }));

      // Create inventory items in batches
      const batchSize = 10;
      for (let i = 0; i < inventoryItems.length; i += batchSize) {
        const batch = inventoryItems.slice(i, i + batchSize);
        await Promise.all(batch.map((item) => inventoryAPI.create(item)));
      }

      toast.success(
        `Successfully imported ${inventoryItems.length} Shopify products!`
      );
      setShowShopifyConfirmation(false);
      setShopifyImportData(null);

      // Reload imported products
      await loadImportedShopifyProducts();
    } catch (error: any) {
      console.error("Shopify import error:", error);
      toast.error(error.message || "Failed to process Shopify import");
    } finally {
      setIsProcessingShopify(false);
    }
  };

  // Load imported Shopify products
  const loadImportedShopifyProducts = async () => {
    setIsLoadingShopifyProducts(true);
    try {
      const brandId = getBrandId();
      // For now, we'll just show a success message since we're importing directly to inventory
      // In the future, we could create a separate Shopify import tracking system
      setImportedShopifyProducts([]);
    } catch (error: any) {
      console.error("Error loading Shopify products:", error);
      toast.error("Failed to load Shopify products");
    } finally {
      setIsLoadingShopifyProducts(false);
    }
  };

  // Process Shopify Orders Import
  const processShopifyOrdersImport = async () => {
    if (!shopifyOrderImportData) return;

    setIsProcessingShopifyOrders(true);
    try {
      const brandId = getBrandId();

      // Create revenue entries from Shopify orders
      const revenueItems = shopifyOrderImportData.rows.map((order) => ({
        name: `Order ${order.name}`,
        amount: order.total,
        source: "Shopify",
        category: "Sales",
        date: order.createdAt
          ? new Date(order.createdAt).toISOString()
          : new Date().toISOString(),
        metadata: {
          orderName: order.name,
          email: order.email,
          financialStatus: order.financialStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          currency: order.currency,
          subtotal: order.subtotal,
          shipping: order.shipping,
          tax: order.tax,
          discountCode: order.discountCode,
          discountAmount: order.discountAmount,
          shippingMethod: order.shippingMethod,
          tags: order.tags,
          note: order.note,
          orderNumber: order.orderNumber,
          totalLineItemsQuantity: order.totalLineItemsQuantity,
        },
      }));

      // Create revenue entries in batches
      const batchSize = 10;
      for (let i = 0; i < revenueItems.length; i += batchSize) {
        const batch = revenueItems.slice(i, i + batchSize);
        await Promise.all(batch.map((item) => revenuesAPI.create(item)));
      }

      toast.success(t("orders.messages.ordersImported"));
      setShowShopifyOrderConfirmation(false);
      setShopifyOrderImportData(null);

      // Reload imported orders
      await loadImportedShopifyOrders();
    } catch (error: any) {
      console.error("Shopify orders import error:", error);
      toast.error(error.message || t("orders.messages.failedToImport"));
    } finally {
      setIsProcessingShopifyOrders(false);
    }
  };

  // Load imported Shopify orders
  const loadImportedShopifyOrders = async () => {
    setIsLoadingShopifyOrders(true);
    try {
      const brandId = getBrandId();
      // For now, we'll just show a success message since we're importing directly to revenue
      // In the future, we could create a separate Shopify orders import tracking system
      setImportedShopifyOrders([]);
    } catch (error: any) {
      console.error("Error loading Shopify orders:", error);
      toast.error(t("orders.messages.failedToLoadOrders"));
    } finally {
      setIsLoadingShopifyOrders(false);
    }
  };

  // Process Shipblu Import
  const processShipbluImport = async () => {
    if (!shipbluImportData) return;

    setIsProcessing(true);
    try {
      const brandId = getBrandId();

      // Create order tracking entries from Shipblu data
      const orderTrackingItems = shipbluImportData.rows.map((row) => ({
        trackingNumber: row.trackingNumber,
        pickupDate: row.pickupDate,
        customerName: row.customerName,
        customerPhone: row.customerPhone,
        customerZone: row.customerZone,
        customerCity: row.customerCity,
        codEstimatedDate: row.codEstimatedDate,
        source: "Shipblu",
        description: `Order tracking from Shipblu - ${row.trackingNumber}`,
        date: new Date(),
        metadata: {
          trackingNumber: row.trackingNumber,
          pickupDate: row.pickupDate,
          customerName: row.customerName,
          customerPhone: row.customerPhone,
          customerZone: row.customerZone,
          customerCity: row.customerCity,
          codEstimatedDate: row.codEstimatedDate,
          status: row.status,
        },
      }));

      // Create order tracking entries in batches
      const batchSize = 10;
      for (let i = 0; i < orderTrackingItems.length; i += batchSize) {
        const batch = orderTrackingItems.slice(i, i + batchSize);
        // For now, we'll just log the data since we don't have a specific order tracking API
        // In the future, this could be integrated with a proper order tracking system
        console.log("Shipblu batch:", batch);
      }

      toast.success(
        `Successfully imported ${orderTrackingItems.length} order tracking records from Shipblu`
      );
      setShowShipbluConfirmation(false);
      setShipbluImportData(null);

      // Reload imported orders
      await loadImportedShipbluOrders();
    } catch (error: any) {
      console.error("Shipblu import error:", error);
      toast.error(error.message || "Failed to process Shipblu import");
    } finally {
      setIsProcessing(false);
    }
  };

  // Load imported Shipblu orders
  const loadImportedShipbluOrders = async () => {
    try {
      const brandId = getBrandId();
      // For now, we'll just show a success message since we're importing directly to order tracking
      // In the future, we could create a separate Shipblu import tracking system
      console.log("Shipblu orders imported successfully");
    } catch (error: any) {
      console.error("Error loading Shipblu orders:", error);
      toast.error("Failed to load Shipblu orders");
    }
  };

  return (
    <motion.div
      className={`p-6 space-y-6 ${isRTL ? "rtl" : "ltr"} ${
        !hasSectionAccess("orders") ? "relative" : ""
      }`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("orders.title")}
          </h1>
          <p className="text-gray-600 mt-2">{t("orders.subtitle")}</p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (value === "shopify" && !hasIntegrationAccess("shopify")) {
            setUpgradeFeature("Shopify Integration");
            setShowUpgradeModal(true);
            return;
          }
          if (value === "bosta" && !hasIntegrationAccess("bosta")) {
            setUpgradeFeature("Bosta Integration");
            setShowUpgradeModal(true);
            return;
          }
          if (value === "shipblu" && !hasIntegrationAccess("shipblu")) {
            setUpgradeFeature("Shipblu Integration");
            setShowUpgradeModal(true);
            return;
          }
          setActiveTab(value);
        }}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="manual">Manual Orders</TabsTrigger>
          <TabsTrigger value="shopify">Shopify</TabsTrigger>
          <TabsTrigger value="bosta">Bosta</TabsTrigger>
          <TabsTrigger value="shipblu">Shipblu</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <ManualOrdersTab />
        </TabsContent>

        <TabsContent value="shopify" className="space-y-6 relative">
          <div
            className={`${
              !hasIntegrationAccess("shopify")
                ? "blur-sm pointer-events-none"
                : ""
            }`}
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    {t("orders.import.shopifyOrdersImport")}
                  </CardTitle>
                  <CardDescription>
                    {t("orders.import.shopifyOrdersDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* File Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragEnter={handleShopifyOrdersDrag}
                      onDragLeave={handleShopifyOrdersDrag}
                      onDragOver={handleShopifyOrdersDrag}
                      onDrop={handleShopifyOrdersDrop}
                    >
                      <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t("orders.import.uploadShopifyOrders")}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {t("orders.import.dragDropOrders")}
                      </p>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleShopifyOrdersFileInputChange}
                          className="hidden"
                          id="shopify-file-input"
                        />
                        <Button
                          onClick={() =>
                            document
                              .getElementById("shopify-file-input")
                              ?.click()
                          }
                          disabled={isUploadingShopifyOrders}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isUploadingShopifyOrders ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              {t("orders.import.processing")}
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              {t("orders.import.selectFile")}
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Supported format: CSV (.csv)
                      </p>
                    </div>

                    {/* Expected Fields Info */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Expected Shopify Fields:
                      </h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>
                          <strong>Required:</strong> Handle, Title, Variant SKU
                        </p>
                        <p>
                          <strong>Optional:</strong> Vendor, Product Type,
                          Variant Price, Variant Inventory Quantity, Cost per
                          item, and more...
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                          The system will automatically map all available
                          Shopify export fields to your inventory.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          {!hasIntegrationAccess("shopify") && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
              <div className="text-center p-8">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Growth Plan Required
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {getLockedFeatureMessage("Shopify Integration")}
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setUpgradeFeature("Shopify Integration");
                    setShowUpgradeModal(true);
                  }}
                >
                  Upgrade to Growth (299 EGP/month)
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bosta" className="space-y-6 relative">
          <div
            className={`${
              !hasIntegrationAccess("bosta")
                ? "blur-sm pointer-events-none"
                : ""
            }`}
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Bosta Integration
                  </CardTitle>
                  <CardDescription>
                    Import your Bosta delivery data from Excel sheets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* File Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Upload Bosta Order Sheet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Drag and drop your Excel file here, or click to browse
                      </p>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileInputChange}
                          className="hidden"
                          id="file-upload"
                          disabled={isUploading}
                        />
                        <Label htmlFor="file-upload" asChild>
                          <Button
                            disabled={isUploading}
                            className="cursor-pointer"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {isUploading ? "Processing..." : "Choose File"}
                          </Button>
                        </Label>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Supports .xlsx and .xls files
                      </p>
                    </div>

                    {/* Required Fields Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Required Excel Columns:
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>
                          • <strong>Tracking Number</strong> - Unique shipment
                          identifier
                        </li>
                        <li>
                          • <strong>Delivery State</strong> - Status (delivered,
                          returned, in progress, etc.)
                        </li>
                        <li>
                          • <strong>COD Amount</strong> - Cash on delivery
                          amount in EGP
                        </li>
                      </ul>
                      <p className="text-sm text-blue-700 mt-2">
                        Optional columns: SKU, Business Reference Number,
                        Description, Consignee Name, etc.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Filters and Search */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    Filters & Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by tracking number, customer, SKU, city..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button onClick={handleSearch} disabled={isLoadingOrders}>
                        Search
                      </Button>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear
                      </Button>
                    </div>

                    {/* Filter Row 1 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs">Status</Label>
                        <Select
                          value={statusFilter}
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                            <SelectItem value="in-progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="out-for-delivery">
                              Out for Delivery
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Date From</Label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Date To</Label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Sort By</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="createdAt">
                              Import Date
                            </SelectItem>
                            <SelectItem value="expectedCash">Amount</SelectItem>
                            <SelectItem value="totalOrders">
                              Order Count
                            </SelectItem>
                            <SelectItem value="deliveryRate">
                              Delivery Rate
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Filter Row 2 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs">Min Amount (EGP)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={minAmount}
                          onChange={(e) => setMinAmount(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Max Amount (EGP)</Label>
                        <Input
                          type="number"
                          placeholder="10000"
                          value={maxAmount}
                          onChange={(e) => setMaxAmount(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">City</Label>
                        <Input
                          placeholder="Enter city"
                          value={cityFilter}
                          onChange={(e) => setCityFilter(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Customer</Label>
                        <Input
                          placeholder="Enter customer name"
                          value={customerFilter}
                          onChange={(e) => setCustomerFilter(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Imported Orders View */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-600" />
                        Imported Orders ({totalItems})
                      </CardTitle>
                      <CardDescription>
                        View and manage your imported Bosta orders
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadImportedOrders()}
                        disabled={isLoadingOrders}
                      >
                        {isLoadingOrders ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          "Refresh"
                        )}
                      </Button>
                      {selectedShipments.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBulkActions(!showBulkActions)}
                        >
                          Bulk Actions ({selectedShipments.length})
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Bulk Actions Bar */}
                  {showBulkActions && selectedShipments.length > 0 && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-blue-900">
                            {selectedShipments.length} shipments selected
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setBulkActionType("delete")}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setBulkActionType("status")}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Update Status
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setBulkActionType("edit");
                                setShowBulkEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Fields
                            </Button>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedShipments([]);
                            setShowBulkActions(false);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {isLoadingOrders ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">
                        Loading imported orders...
                      </p>
                    </div>
                  ) : importedOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Imported Orders
                      </h3>
                      <p className="text-gray-600">
                        Import your first Bosta order sheet to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Select All Checkbox */}
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Checkbox
                          checked={
                            selectedShipments.length > 0 &&
                            selectedShipments.length ===
                              importedOrders.flatMap(
                                (importRecord) =>
                                  importRecord.shipments?.map(
                                    (shipment: any) => shipment.id
                                  ) || []
                              ).length
                          }
                          onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm text-gray-600">
                          Select All Shipments
                        </span>
                      </div>

                      {importedOrders.map((importRecord) => (
                        <Card
                          key={importRecord.id}
                          className="border-l-4 border-l-blue-500"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {importRecord.fileName}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Imported on{" "}
                                  {new Date(
                                    importRecord.createdAt
                                  ).toLocaleDateString()}
                                </p>
                                <div className="flex gap-4 mt-2 text-sm">
                                  <span className="text-blue-600">
                                    {importRecord.totalOrders} orders
                                  </span>
                                  <span className="text-green-600">
                                    {importRecord.delivered} delivered
                                  </span>
                                  <span className="text-red-600">
                                    {importRecord.returned} returned
                                  </span>
                                  <span className="text-gray-600">
                                    {importRecord.expectedCash.toLocaleString()}{" "}
                                    EGP expected
                                  </span>
                                </div>

                                {/* Individual Shipment Checkboxes */}
                                {importRecord.shipments &&
                                  importRecord.shipments.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                      <p className="text-xs text-gray-500 font-medium">
                                        Shipments:
                                      </p>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                        {importRecord.shipments
                                          .slice(0, 4)
                                          .map((shipment: any) => (
                                            <div
                                              key={shipment.id}
                                              className="flex items-center gap-2 text-xs"
                                            >
                                              <Checkbox
                                                checked={selectedShipments.includes(
                                                  shipment.id
                                                )}
                                                onCheckedChange={(checked) =>
                                                  handleShipmentSelect(
                                                    shipment.id,
                                                    checked === true
                                                  )
                                                }
                                              />
                                              <span className="font-mono">
                                                {shipment.trackingNumber}
                                              </span>
                                              <Badge
                                                variant={
                                                  shipment.deliveryState ===
                                                  "delivered"
                                                    ? "default"
                                                    : shipment.deliveryState ===
                                                      "returned"
                                                    ? "destructive"
                                                    : "secondary"
                                                }
                                                className="text-xs"
                                              >
                                                {shipment.deliveryState}
                                              </Badge>
                                              <span className="text-gray-500">
                                                {shipment.codAmount} EGP
                                              </span>
                                            </div>
                                          ))}
                                        {importRecord.shipments.length > 4 && (
                                          <div className="text-xs text-gray-500">
                                            +{importRecord.shipments.length - 4}{" "}
                                            more shipments
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    loadImportDetails(importRecord.id)
                                  }
                                >
                                  View Details
                                </Button>
                                {importRecord.revenues &&
                                  importRecord.revenues.length > 0 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={async () => {
                                        const groupedRevenue =
                                          await loadGroupedRevenue();
                                        const group = groupedRevenue.find(
                                          (g: any) =>
                                            g.import.id === importRecord.id
                                        );
                                        if (group) {
                                          setSelectedRevenueGroup(group);
                                          setShowRevenueModal(true);
                                        }
                                      }}
                                    >
                                      View Revenue (
                                      {importRecord.revenues.length})
                                    </Button>
                                  )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, totalItems)} of{" "}
                        {totalItems} results
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadImportedOrders(currentPage - 1)}
                          disabled={currentPage === 1 || isLoadingOrders}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadImportedOrders(currentPage + 1)}
                          disabled={
                            currentPage === totalPages || isLoadingOrders
                          }
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
          {!hasIntegrationAccess("bosta") && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
              <div className="text-center p-8">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Truck className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Growth Plan Required
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {getLockedFeatureMessage("Bosta Integration")}
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setUpgradeFeature("Bosta Integration");
                    setShowUpgradeModal(true);
                  }}
                >
                  Upgrade to Growth (299 EGP/month)
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="shipblu" className="space-y-6 relative">
          <div
            className={`${
              !hasIntegrationAccess("shipblu")
                ? "blur-sm pointer-events-none"
                : ""
            }`}
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-purple-600" />
                    Shipblu Integration
                  </CardTitle>
                  <CardDescription>
                    Import your Shipblu order tracking data from Excel sheets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* File Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragEnter={handleShipbluDrag}
                      onDragLeave={handleShipbluDrag}
                      onDragOver={handleShipbluDrag}
                      onDrop={handleShipbluDrop}
                    >
                      <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Upload Shipblu Order Sheet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Drag and drop your Excel file here, or click to browse
                      </p>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleShipbluFileInputChange}
                          className="hidden"
                          id="shipblu-file-upload"
                          disabled={isUploadingShipblu}
                        />
                        <Label htmlFor="shipblu-file-upload" asChild>
                          <Button
                            disabled={isUploadingShipblu}
                            className="cursor-pointer bg-purple-600 hover:bg-purple-700"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {isUploadingShipblu
                              ? "Processing..."
                              : "Choose File"}
                          </Button>
                        </Label>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Supports .xlsx and .xls files
                      </p>
                    </div>

                    {/* Required Fields Info */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">
                        Required Excel Columns:
                      </h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>
                          • <strong>Tracking Number</strong> - Unique shipment
                          identifier
                        </li>
                        <li>
                          • <strong>Pickup Date</strong> - Date when order was
                          picked up
                        </li>
                        <li>
                          • <strong>Customer Name</strong> - Customer's full
                          name
                        </li>
                        <li>
                          • <strong>Customer Phone</strong> - Customer's phone
                          number
                        </li>
                        <li>
                          • <strong>Customer Zone</strong> - Delivery zone/area
                        </li>
                        <li>
                          • <strong>Customer City</strong> - Customer's city
                        </li>
                        <li>
                          • <strong>CoD Estimated Date</strong> - Estimated
                          delivery date
                        </li>
                        <li>
                          • <strong>Status</strong> - Current order status
                        </li>
                      </ul>
                      <p className="text-sm text-purple-700 mt-2">
                        The system will automatically map all available Shipblu
                        fields to your order tracking system.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          {!hasIntegrationAccess("shipblu") && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
              <div className="text-center p-8">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Truck className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Growth Plan Required
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {getLockedFeatureMessage("Shipblu Integration")}
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setUpgradeFeature("Shipblu Integration");
                    setShowUpgradeModal(true);
                  }}
                >
                  Upgrade to Growth (299 EGP/month)
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Duplicate Detection Modal */}
      <Dialog open={showDuplicateModal} onOpenChange={setShowDuplicateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Duplicate Orders Detected
            </DialogTitle>
            <DialogDescription>
              We found {duplicateData?.duplicateCount} orders that already exist
              in your system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">
                Duplicate Summary:
              </h4>
              <div className="text-sm text-yellow-800">
                <p>• {duplicateData?.duplicateCount} duplicate orders found</p>
                <p>
                  • {duplicateData?.totalCount - duplicateData?.duplicateCount}{" "}
                  new orders to import
                </p>
                <p>• Duplicates will be skipped if you proceed</p>
              </div>
            </div>

            {duplicateData?.duplicates &&
              duplicateData.duplicates.length > 0 && (
                <div className="max-h-60 overflow-y-auto">
                  <h4 className="font-medium mb-2">Duplicate Orders:</h4>
                  <div className="space-y-2">
                    {duplicateData.duplicates
                      .slice(0, 10)
                      .map((duplicate: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                        >
                          <span className="font-mono">
                            {duplicate.trackingNumber}
                          </span>
                          <Badge variant="secondary">
                            {duplicate.deliveryState}
                          </Badge>
                          <span>{duplicate.codAmount} EGP</span>
                        </div>
                      ))}
                    {duplicateData.duplicates.length > 10 && (
                      <p className="text-sm text-gray-500 text-center">
                        ... and {duplicateData.duplicates.length - 10} more
                      </p>
                    )}
                  </div>
                </div>
              )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDuplicateModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleDuplicateImport} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Skip Duplicates & Import"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Modal */}
      <Dialog open={showBulkEditModal} onOpenChange={setShowBulkEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Edit Shipments</DialogTitle>
            <DialogDescription>
              Edit common fields for {selectedShipments.length} selected
              shipments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="consigneeName">Customer Name</Label>
              <Input
                id="consigneeName"
                value={bulkEditData.consigneeName || ""}
                onChange={(e) =>
                  setBulkEditData({
                    ...bulkEditData,
                    consigneeName: e.target.value,
                  })
                }
                placeholder="Leave empty to keep unchanged"
              />
            </div>
            <div>
              <Label htmlFor="consigneePhone">Phone Number</Label>
              <Input
                id="consigneePhone"
                value={bulkEditData.consigneePhone || ""}
                onChange={(e) =>
                  setBulkEditData({
                    ...bulkEditData,
                    consigneePhone: e.target.value,
                  })
                }
                placeholder="Leave empty to keep unchanged"
              />
            </div>
            <div>
              <Label htmlFor="dropOffCity">City</Label>
              <Input
                id="dropOffCity"
                value={bulkEditData.dropOffCity || ""}
                onChange={(e) =>
                  setBulkEditData({
                    ...bulkEditData,
                    dropOffCity: e.target.value,
                  })
                }
                placeholder="Leave empty to keep unchanged"
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={bulkEditData.sku || ""}
                onChange={(e) =>
                  setBulkEditData({ ...bulkEditData, sku: e.target.value })
                }
                placeholder="Leave empty to keep unchanged"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowBulkEditModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkEdit}>
              Update {selectedShipments.length} Shipments
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Status Update Modal */}
      {bulkActionType === "status" && (
        <Dialog
          open={bulkActionType === "status"}
          onOpenChange={() => setBulkActionType("")}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Status</DialogTitle>
              <DialogDescription>
                Update status for {selectedShipments.length} selected shipments.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>New Status</Label>
                <Select
                  onValueChange={(value) => handleBulkStatusUpdate(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="out-for-delivery">
                      Out for Delivery
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setBulkActionType("")}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Delete Confirmation */}
      {bulkActionType === "delete" && (
        <Dialog
          open={bulkActionType === "delete"}
          onOpenChange={() => setBulkActionType("")}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Confirm Delete
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedShipments.length}{" "}
                shipments? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setBulkActionType("")}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBulkDelete}>
                Delete {selectedShipments.length} Shipments
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Confirm Bosta Import</DialogTitle>
            <DialogDescription>
              Review the parsed data and choose your import options
            </DialogDescription>
          </DialogHeader>

          {importData && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-xl font-bold">
                          {importData.stats.totalOrders}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Expected Cash</p>
                        <p className="text-xl font-bold">
                          {importData.stats.expectedCash.toLocaleString()} EGP
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Delivered</p>
                        <p className="text-xl font-bold">
                          {importData.stats.delivered}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Returned</p>
                        <p className="text-xl font-bold">
                          {importData.stats.returned}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rates */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Delivery Rate</p>
                        <p className="text-xl font-bold">
                          {importData.stats.deliveryRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Return Rate</p>
                        <p className="text-xl font-bold">
                          {importData.stats.returnRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Unknown SKUs Warning */}
              {importData.stats.unknownSkus.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-orange-900">
                          Unknown SKUs Found (
                          {importData.stats.unknownSkus.length})
                        </h4>
                        <p className="text-sm text-orange-800 mt-1">
                          The following SKUs were not found in your inventory:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {importData.stats.unknownSkus
                            .slice(0, 10)
                            .map((sku, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-orange-800"
                              >
                                {sku}
                              </Badge>
                            ))}
                          {importData.stats.unknownSkus.length > 10 && (
                            <Badge
                              variant="outline"
                              className="text-orange-800"
                            >
                              +{importData.stats.unknownSkus.length - 10} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Import Options */}
              <div className="space-y-4">
                <h4 className="font-medium">Import Options</h4>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-revenue"
                    checked={createRevenue}
                    onCheckedChange={(checked) =>
                      setCreateRevenue(checked === true)
                    }
                  />
                  <Label htmlFor="create-revenue">
                    Create revenue entries for delivered orders (
                    {importData.stats.delivered} orders)
                  </Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button onClick={processImport} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Import Data"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Shipblu Confirmation Modal */}
      <Dialog
        open={showShipbluConfirmation}
        onOpenChange={setShowShipbluConfirmation}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Confirm Shipblu Import</DialogTitle>
            <DialogDescription>
              Review the parsed order tracking data and choose your import
              options
            </DialogDescription>
          </DialogHeader>

          {shipbluImportData && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-xl font-bold">
                          {shipbluImportData.stats.totalOrders}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Valid Orders</p>
                        <p className="text-xl font-bold">
                          {shipbluImportData.stats.validOrders}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Invalid Orders</p>
                        <p className="text-xl font-bold">
                          {shipbluImportData.stats.invalidOrders}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-600">Duplicates</p>
                        <p className="text-xl font-bold">
                          {
                            shipbluImportData.validation
                              .duplicateTrackingNumbers.length
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Preview Table */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Order Data Preview</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-900">
                            Tracking Number
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-900">
                            Customer Name
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-900">
                            Phone
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-900">
                            City
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-900">
                            Zone
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-900">
                            Pickup Date
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-900">
                            CoD Estimated Date
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-900">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {shipbluImportData.rows
                          .slice(0, 10)
                          .map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900 font-medium">
                                {row.trackingNumber}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {row.customerName}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {row.customerPhone}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {row.customerCity}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {row.customerZone}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {row.pickupDate}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {row.codEstimatedDate}
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  variant={
                                    row.status
                                      .toLowerCase()
                                      .includes("delivered")
                                      ? "default"
                                      : row.status
                                          .toLowerCase()
                                          .includes("pending")
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {row.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {shipbluImportData.rows.length > 10 && (
                    <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600">
                      Showing first 10 of {shipbluImportData.rows.length} orders
                    </div>
                  )}
                </div>
              </div>

              {/* Import Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Import Options</h3>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-900">
                      Import Information
                    </span>
                  </div>
                  <p className="text-sm text-purple-800">
                    This will import {shipbluImportData.stats.validOrders} valid
                    order tracking records to your system. Duplicate tracking
                    numbers will be skipped automatically.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowShipbluConfirmation(false);
                    setActiveTab("shipblu");
                  }}
                >
                  ← Back to Upload
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowShipbluConfirmation(false);
                      setShipbluImportData(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={processShipbluImport}
                    disabled={isProcessing}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isProcessing ? "Processing..." : "Import Orders"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revenue Group Modal */}
      <Dialog open={showRevenueModal} onOpenChange={setShowRevenueModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Bosta Revenue Group</DialogTitle>
            <DialogDescription>
              Manage individual revenue entries from this import
            </DialogDescription>
          </DialogHeader>

          {selectedRevenueGroup && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Group Summary - Compact */}
              <Card className="flex-shrink-0 mb-4">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {selectedRevenueGroup.import.fileName}
                      </h4>
                      <p className="text-xs text-gray-600">
                        Imported on{" "}
                        {new Date(
                          selectedRevenueGroup.import.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {selectedRevenueGroup.totalAmount.toLocaleString()} EGP
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedRevenueGroup.revenues.length} entries
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Revenue Entries - Scrollable */}
              <div className="flex-1 min-h-0">
                <h4 className="font-medium text-sm mb-3">Revenue Entries</h4>
                <div className="overflow-y-auto max-h-[50vh] space-y-2">
                  {selectedRevenueGroup.revenues.map((revenue: any) => (
                    <Card
                      key={revenue.id}
                      className="border-l-4 border-l-green-500"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 text-sm truncate">
                              {revenue.name}
                            </h5>
                            <div className="flex gap-4 text-xs text-gray-600">
                              {revenue.bostaShipment?.trackingNumber && (
                                <span>
                                  Tracking:{" "}
                                  {revenue.bostaShipment.trackingNumber}
                                </span>
                              )}
                              <span>
                                Date:{" "}
                                {new Date(revenue.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-sm font-semibold text-green-600 whitespace-nowrap">
                              {revenue.amount.toLocaleString()} EGP
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteRevenueEntry(revenue.id)}
                              className="text-red-600 hover:text-red-700 h-7 px-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Action Buttons - Fixed at bottom */}
              <div className="flex justify-end pt-4 border-t flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRevenueModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Import Details</DialogTitle>
            <DialogDescription>
              Detailed view of the imported Bosta order data
            </DialogDescription>
          </DialogHeader>

          {selectedImport && (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              {/* Import Summary - Compact */}
              <Card className="flex-shrink-0 mb-4">
                <CardContent className="p-3">
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">
                        {selectedImport.totalOrders}
                      </p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">
                        {selectedImport.delivered}
                      </p>
                      <p className="text-xs text-gray-600">Delivered</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">
                        {selectedImport.returned}
                      </p>
                      <p className="text-xs text-gray-600">Returned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">
                        {selectedImport.expectedCash.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Cash (EGP)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-orange-600">
                        {selectedImport.deliveryRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">Delivery Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-red-600">
                        {selectedImport.returnRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">Return Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipments Table - Compact and Scrollable */}
              <Card className="flex-1 min-h-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Shipment Details</CardTitle>
                  <CardDescription className="text-xs">
                    Individual shipment records from this import
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-auto max-h-[40vh]">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-white border-b">
                        <tr>
                          <th className="text-left p-2 font-medium">
                            Tracking #
                          </th>
                          <th className="text-left p-2 font-medium">Status</th>
                          <th className="text-left p-2 font-medium">Amount</th>
                          <th className="text-left p-2 font-medium">SKU</th>
                          <th className="text-left p-2 font-medium">
                            Customer
                          </th>
                          <th className="text-left p-2 font-medium">City</th>
                          <th className="text-left p-2 font-medium">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedImport.shipments?.map((shipment: any) => (
                          <tr
                            key={shipment.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-2 font-mono">
                              {shipment.trackingNumber}
                            </td>
                            <td className="p-2">
                              <Badge
                                variant={
                                  shipment.deliveryState === "delivered"
                                    ? "default"
                                    : shipment.deliveryState === "returned"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {shipment.deliveryState}
                              </Badge>
                            </td>
                            <td className="p-2">
                              {shipment.codAmount.toLocaleString()} EGP
                            </td>
                            <td className="p-2 truncate max-w-[100px]">
                              {shipment.sku ||
                                shipment.businessReference ||
                                "N/A"}
                            </td>
                            <td className="p-2 truncate max-w-[100px]">
                              {shipment.consigneeName || "N/A"}
                            </td>
                            <td className="p-2 truncate max-w-[80px]">
                              {shipment.dropOffCity || "N/A"}
                            </td>
                            <td className="p-2">
                              {shipment.revenueCreated ? (
                                <Badge
                                  variant="default"
                                  className="bg-green-100 text-green-800 text-xs"
                                >
                                  <CheckCircle className="h-2 w-2 mr-1" />
                                  Created
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Not Created
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Summary - Compact */}
              {selectedImport.revenues &&
                selectedImport.revenues.length > 0 && (
                  <Card className="flex-shrink-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Revenue Entries</CardTitle>
                      <CardDescription className="text-xs">
                        Revenue entries created from this import
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="space-y-2 max-h-[20vh] overflow-y-auto">
                        {selectedImport.revenues.map((revenue: any) => (
                          <div
                            key={revenue.id}
                            className="flex items-center justify-between p-2 bg-green-50 rounded text-sm"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">
                                {revenue.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {new Date(revenue.date).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="font-semibold text-green-600 ml-2">
                              {revenue.amount.toLocaleString()} EGP
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Action Buttons - Fixed at bottom */}
              <div className="flex justify-end pt-4 border-t flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Shopify Import Confirmation Modal */}
      <Dialog
        open={showShopifyConfirmation}
        onOpenChange={setShowShopifyConfirmation}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Confirm Shopify Import</DialogTitle>
            <DialogDescription>
              Review the parsed data and choose your import options
            </DialogDescription>
          </DialogHeader>

          {shopifyImportData && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Products</p>
                        <p className="text-xl font-bold">
                          {shopifyImportData.stats.totalProducts}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Variants</p>
                        <p className="text-xl font-bold">
                          {shopifyImportData.stats.totalVariants}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-xl font-bold">
                          ${shopifyImportData.stats.totalValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">In Stock</p>
                        <p className="text-xl font-bold">
                          {shopifyImportData.stats.inStock}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Out of Stock</p>
                        <p className="text-xl font-bold">
                          {shopifyImportData.stats.outOfStock}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Low Stock</p>
                        <p className="text-xl font-bold">
                          {shopifyImportData.stats.lowStock}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Warnings */}
              {shopifyImportData.stats.unknownSkus.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        Unknown SKUs Found
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        {shopifyImportData.stats.unknownSkus.length} SKUs are
                        not in your current inventory.
                      </p>
                      <div className="mt-2">
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={addMissingShopifySkus}
                            onCheckedChange={(checked) =>
                              setAddMissingShopifySkus(checked === true)
                            }
                          />
                          <span className="text-sm text-yellow-800">
                            Automatically add missing SKUs to inventory
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {shopifyImportData.stats.duplicateSkus.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">
                        Duplicate SKUs Found
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        {shopifyImportData.stats.duplicateSkus.length} SKUs
                        appear multiple times in the file.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowShopifyConfirmation(false)}
                  disabled={isProcessingShopify}
                >
                  Cancel
                </Button>
                <Button
                  onClick={processShopifyImport}
                  disabled={isProcessingShopify}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessingShopify ? "Processing..." : "Import Products"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Shopify Orders Import Confirmation Modal */}
      <Dialog
        open={showShopifyOrderConfirmation}
        onOpenChange={setShowShopifyOrderConfirmation}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("orders.import.confirmImport")}</DialogTitle>
            <DialogDescription>
              {t("orders.import.reviewData")}
            </DialogDescription>
          </DialogHeader>

          {shopifyOrderImportData && (
            <div className="space-y-4">
              {/* Compact Import Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {shopifyOrderImportData.stats.totalOrders}
                  </div>
                  <div className="text-xs text-gray-600">Total Orders</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    ${shopifyOrderImportData.stats.totalRevenue.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {shopifyOrderImportData.stats.uniqueCustomers}
                  </div>
                  <div className="text-xs text-gray-600">Customers</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">
                    ${shopifyOrderImportData.stats.averageOrderValue.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">Avg Order</div>
                </div>
              </div>

              {/* Compact Sample Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-3">Sample Orders</h4>
                <div className="space-y-2">
                  {shopifyOrderImportData.rows
                    .slice(0, 3)
                    .map((order, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <span className="font-medium">{order.name}</span>
                          <span className="text-gray-500 ml-2">
                            ({order.email})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            ${order.total.toFixed(0)}
                          </span>
                          <Badge
                            variant={
                              order.financialStatus === "paid"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {order.financialStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  {shopifyOrderImportData.rows.length > 3 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      ... and {shopifyOrderImportData.rows.length - 3} more
                      orders
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowShopifyOrderConfirmation(false)}
                  disabled={isProcessingShopifyOrders}
                >
                  {t("orders.import.cancel")}
                </Button>
                <Button
                  onClick={processShopifyOrdersImport}
                  disabled={isProcessingShopifyOrders}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessingShopifyOrders
                    ? t("orders.import.processingImport")
                    : t("orders.import.importOrders")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Growth Plan Required
            </DialogTitle>
            <DialogDescription>
              Upgrade to access {upgradeFeature}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Unlock {upgradeFeature}
              </h3>
              <p className="text-gray-600 mb-6">
                {getLockedFeatureMessage(upgradeFeature)}
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  299 EGP/month
                </div>
                <div className="text-sm text-gray-600">Growth Plan</div>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    // TODO: Implement upgrade flow
                    setShowUpgradeModal(false);
                  }}
                >
                  Upgrade Now
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blur overlay for locked sections - only for Free plan users */}
      {subscription?.isFreePlan && !hasSectionAccess("orders") && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg border max-w-md">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              🔒 Section Locked
            </h3>
            <p className="text-gray-600 mb-4">
              {getSectionLockMessage("orders")}
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {getUpgradePrice()}
              </div>
              <div className="text-sm text-gray-600">
                {getUpgradePlan()} Plan
              </div>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                if (subscription?.isFreePlan) {
                  testUpgradeToGrowth();
                } else if (subscription?.plan.name.toLowerCase() === "growth") {
                  testUpgradeToScale();
                } else {
                  window.location.href = "/pricing";
                }
              }}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              🔒 Action Locked
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-gray-600 text-base">
                {getSectionLockMessage("orders")}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {getUpgradePrice()}
              </div>
              <div className="text-sm text-gray-600">
                {getUpgradePlan()} Plan
              </div>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  if (subscription?.isFreePlan) {
                    testUpgradeToGrowth();
                    setShowUpgradeModal(false);
                  } else if (
                    subscription?.plan.name.toLowerCase() === "growth"
                  ) {
                    testUpgradeToScale();
                    setShowUpgradeModal(false);
                  } else {
                    window.location.href = "/pricing";
                  }
                }}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowUpgradeModal(false)}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
