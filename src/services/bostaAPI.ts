import { apiCall } from "./api";

// Bosta API Configuration
const BOSTA_API_BASE_URL = "https://api.bosta.co";
const BOSTA_API_VERSION = "v2";

// Types for Bosta API
export interface BostaShipment {
  id: string;
  trackingNumber: string;
  status: BostaShipmentStatus;
  codAmount: number;
  deliveryFees: number;
  totalFees: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: BostaAddress;
  businessReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  returnedAt?: string;
  returnReason?: string;
}

export interface BostaAddress {
  firstLine: string;
  secondLine?: string;
  city: string;
  zone: string;
  country: string;
}

export type BostaShipmentStatus =
  | "pending"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "cancelled"
  | "exception";

export interface BostaTrackingEvent {
  status: BostaShipmentStatus;
  timestamp: string;
  location?: string;
  notes?: string;
}

export interface BostaWebhookPayload {
  event: "shipment_status_changed" | "shipment_created" | "shipment_updated";
  shipment: BostaShipment;
  trackingNumber: string;
  timestamp: string;
}

export interface BostaStats {
  totalShipments: number;
  delivered: number;
  returned: number;
  inProgress: number;
  returnRate: number;
  deliveryRate: number;
  totalCodAmount: number;
  totalFees: number;
  averageDeliveryTime: number;
}

export interface BostaApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface BostaPaginationParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: BostaShipmentStatus;
}

export interface BostaPaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Bosta API Service Class
class BostaAPIService {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = `${BOSTA_API_BASE_URL}/${BOSTA_API_VERSION}`;
  }

  // Get headers for API requests
  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
    };
  }

  // Make API request with error handling
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BostaApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error("Bosta API Error:", error);
      return {
        success: false,
        data: null as any,
        message: error.message || "Unknown error occurred",
        errors: [error.message],
      };
    }
  }

  // Get all shipments with pagination and filters
  async getShipments(
    params: BostaPaginationParams = {}
  ): Promise<BostaApiResponse<BostaPaginationResponse<BostaShipment>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.status) queryParams.append("status", params.status);

    const endpoint = `/shipments${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return this.makeRequest<BostaPaginationResponse<BostaShipment>>(endpoint);
  }

  // Get specific shipment by tracking number
  async getShipment(
    trackingNumber: string
  ): Promise<BostaApiResponse<BostaShipment>> {
    const endpoint = `/shipments/${trackingNumber}`;
    return this.makeRequest<BostaShipment>(endpoint);
  }

  // Get shipment tracking history
  async getShipmentTracking(
    trackingNumber: string
  ): Promise<BostaApiResponse<BostaTrackingEvent[]>> {
    const endpoint = `/shipments/${trackingNumber}/track`;
    return this.makeRequest<BostaTrackingEvent[]>(endpoint);
  }

  // Create new shipment
  async createShipment(
    shipmentData: Partial<BostaShipment>
  ): Promise<BostaApiResponse<BostaShipment>> {
    const endpoint = "/shipments";
    return this.makeRequest<BostaShipment>(endpoint, {
      method: "POST",
      body: JSON.stringify(shipmentData),
    });
  }

  // Update shipment
  async updateShipment(
    trackingNumber: string,
    updateData: Partial<BostaShipment>
  ): Promise<BostaApiResponse<BostaShipment>> {
    const endpoint = `/shipments/${trackingNumber}`;
    return this.makeRequest<BostaShipment>(endpoint, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  // Calculate statistics from shipments
  calculateStats(shipments: BostaShipment[]): BostaStats {
    const totalShipments = shipments.length;
    const delivered = shipments.filter((s) => s.status === "delivered").length;
    const returned = shipments.filter((s) => s.status === "returned").length;
    const inProgress = shipments.filter((s) =>
      ["pending", "picked_up", "in_transit", "out_for_delivery"].includes(
        s.status
      )
    ).length;

    const returnRate =
      totalShipments > 0 ? (returned / totalShipments) * 100 : 0;
    const deliveryRate =
      totalShipments > 0 ? (delivered / totalShipments) * 100 : 0;

    const totalCodAmount = shipments.reduce(
      (sum, s) => sum + (s.codAmount || 0),
      0
    );
    const totalFees = shipments.reduce((sum, s) => sum + (s.totalFees || 0), 0);

    // Calculate average delivery time (simplified)
    const deliveredShipments = shipments.filter(
      (s) => s.status === "delivered" && s.deliveredAt
    );
    const averageDeliveryTime =
      deliveredShipments.length > 0
        ? deliveredShipments.reduce((sum, s) => {
            const created = new Date(s.createdAt);
            const delivered = new Date(s.deliveredAt!);
            return (
              sum +
              (delivered.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
            ); // days
          }, 0) / deliveredShipments.length
        : 0;

    return {
      totalShipments,
      delivered,
      returned,
      inProgress,
      returnRate,
      deliveryRate,
      totalCodAmount,
      totalFees,
      averageDeliveryTime,
    };
  }

  // Test API connection
  async testConnection(): Promise<BostaApiResponse<boolean>> {
    try {
      const response = await this.getShipments({ limit: 1 });
      return {
        success: response.success,
        data: response.success,
        message: response.success ? "Connection successful" : response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        data: false,
        message: error.message || "Connection failed",
      };
    }
  }
}

// Create singleton instance
let bostaAPIInstance: BostaAPIService | null = null;

export const getBostaAPI = (apiKey?: string): BostaAPIService => {
  if (!bostaAPIInstance && apiKey) {
    bostaAPIInstance = new BostaAPIService(apiKey);
  }

  if (!bostaAPIInstance) {
    throw new Error("Bosta API not initialized. Please provide an API key.");
  }

  return bostaAPIInstance;
};

export const initializeBostaAPI = (apiKey: string): BostaAPIService => {
  bostaAPIInstance = new BostaAPIService(apiKey);
  return bostaAPIInstance;
};

// Export the service class for direct instantiation
export { BostaAPIService };

