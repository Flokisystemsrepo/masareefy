// API Service for all financial features
const API_BASE_URL = "http://localhost:3001/api";

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem("token");

// Rate limiting mechanism
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // Increased to 100 requests per minute to prevent auth issues

// Bulk import mode tracking
let bulkImportMode = false;
let bulkImportStartTime = 0;
const BULK_IMPORT_DURATION = 300000; // 5 minutes for bulk import mode

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

// Subscription-specific rate limiting
const subscriptionRateLimit = new Map<
  string,
  { count: number; resetTime: number }
>();
const SUBSCRIPTION_RATE_LIMIT_WINDOW = 30000; // 30 seconds (increased)
const MAX_SUBSCRIPTION_REQUESTS_PER_WINDOW = 10; // Max 10 subscription requests per 30 seconds (increased)

// Bulk import mode functions
export const enableBulkImportMode = () => {
  bulkImportMode = true;
  bulkImportStartTime = Date.now();
  // Clear existing rate limits to start fresh
  rateLimitMap.clear();
  console.log("Bulk import mode enabled for 5 minutes - rate limits cleared");
};

export const disableBulkImportMode = () => {
  bulkImportMode = false;
  console.log("Bulk import mode disabled");
};

const checkRateLimit = (endpoint: string): boolean => {
  const now = Date.now();
  const key = endpoint.split("?")[0]; // Remove query params for rate limiting

  // Check if bulk import mode has expired
  if (bulkImportMode && now - bulkImportStartTime > BULK_IMPORT_DURATION) {
    bulkImportMode = false;
    console.log("Bulk import mode expired");
  }

  // Special handling for authentication and usage endpoints - be more permissive
  const isAuthEndpoint = key.includes("/auth/");
  const isUsageEndpoint = key.includes("/usage");
  const isInventoryBulkOperation = key.includes("/inventory");

  // If in bulk import mode, disable rate limiting for inventory operations
  if (bulkImportMode && isInventoryBulkOperation) {
    console.log(
      "Bulk import mode active - skipping rate limit for inventory operations"
    );
    return true; // Skip rate limiting entirely during bulk import
  }

  // Be very permissive with auth and usage endpoints to prevent logout issues
  if (isAuthEndpoint || isUsageEndpoint) {
    console.log(`Allowing ${key} - critical for auth stability`);
    return true;
  }

  // Use much higher limits for inventory operations (bulk imports)
  let maxRequests = isInventoryBulkOperation ? 200 : MAX_REQUESTS_PER_WINDOW;

  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (current.count >= maxRequests) {
    console.warn(
      `Rate limit exceeded for ${key}. Please wait ${Math.ceil(
        (current.resetTime - now) / 1000
      )} seconds.`
    );
    return false;
  }

  current.count++;
  return true;
};

const checkSubscriptionRateLimit = (endpoint: string): boolean => {
  if (!endpoint.includes("/subscription/")) {
    return true; // Not a subscription endpoint, use regular rate limiting
  }

  // Be more permissive with subscription endpoints to prevent auth issues
  const now = Date.now();
  const key = "subscription"; // Use a single key for all subscription requests

  const current = subscriptionRateLimit.get(key);

  if (!current || now > current.resetTime) {
    // Reset or initialize
    subscriptionRateLimit.set(key, {
      count: 1,
      resetTime: now + SUBSCRIPTION_RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (current.count >= MAX_SUBSCRIPTION_REQUESTS_PER_WINDOW) {
    console.warn(
      `Subscription rate limit exceeded. Please wait ${Math.ceil(
        (current.resetTime - now) / 1000
      )} seconds.`
    );
    // Don't block subscription requests - just warn
    console.log("Allowing subscription request despite rate limit to prevent auth issues");
    return true; // Allow anyway to prevent logout
  }

  current.count++;
  return true;
};

// Helper function for API calls with better error handling and token refresh
const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
) => {
  // Check rate limit (subscription-specific for subscription endpoints)
  if (!checkSubscriptionRateLimit(endpoint) || !checkRateLimit(endpoint)) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }

  // Check for duplicate requests
  const requestKey = `${endpoint}-${JSON.stringify(options)}`;
  if (pendingRequests.has(requestKey)) {
    console.log(`Deduplicating request to ${endpoint}`);
    return pendingRequests.get(requestKey);
  }

  const token = getAuthToken();

  // Create the request promise and store it for deduplication
  const requestPromise = (async () => {
    console.log(`API: Making request to ${endpoint}`, {
      hasToken: !!token,
      method: options.method || "GET",
      retryCount,
    });

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const isDeleteOperation = options.method === "DELETE";
    const timeoutDuration = isDeleteOperation ? 10000 : 30000; // 10 seconds for delete, 30 for others
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      clearTimeout(timeoutId);

      console.log(`API: Response for ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API: Error response for ${endpoint}:`, errorData);

        // Handle authentication errors with token refresh
        if (response.status === 401 && retryCount === 0) {
          console.log("Attempting token refresh...");
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
              const refreshResponse = await fetch(
                `${API_BASE_URL}/auth/refresh-token`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ refreshToken }),
                }
              );

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData.success) {
                  // Update stored tokens
                  localStorage.setItem("token", refreshData.data.token);
                  localStorage.setItem(
                    "refreshToken",
                    refreshData.data.refreshToken
                  );
                  console.log(
                    "Token refreshed successfully, retrying request..."
                  );

                  // Retry the original request with new token
                  return apiCall(endpoint, options, retryCount + 1);
                }
              }
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }

          // If refresh failed or no refresh token, logout
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("isAuthenticated");
          window.location.href = "/login";
          throw new Error("Authentication failed. Please login again.");
        }

        // Handle rate limiting
        if (response.status === 429) {
          console.error("Rate limit exceeded, stopping retries");
          throw new Error(
            "Too many requests. Please wait a moment and try again."
          );
        }

        throw new Error(
          errorData.message ||
            errorData.error ||
            `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log(`API: Success response for ${endpoint}:`, data);
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        console.error(`API: Request timeout for ${endpoint}`);
        throw new Error("Request timeout. Please try again.");
      }

      console.error(`API: Network error for ${endpoint}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  })();

  // Store the promise for deduplication
  pendingRequests.set(requestKey, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    // Clean up the pending request
    pendingRequests.delete(requestKey);
  }
};

// Get brand ID from localStorage
const getBrandId = () => {
  const brandId = localStorage.getItem("brandId");
  if (!brandId) {
    throw new Error("Brand ID not found. Please login again.");
  }
  return brandId;
};

// ===== AUTHENTICATION API =====
export const authAPI = {
  // Login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Login failed");
    }

    return data.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Token refresh failed");
    }

    return data.data;
  },

  // Register (multi-step)
  registerStep1: async (planId: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/step1-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Plan validation failed");
    }

    return data.data;
  },

  registerStep2: async (email: string, firstName: string, lastName: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/step2-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, lastName }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "User details validation failed");
    }

    return data.data;
  },

  registerStep3: async (brandName: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/step3-brand`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandName, password }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Brand details validation failed");
    }

    return data.data;
  },

  registerComplete: async (registrationData: {
    planId: string;
    email: string;
    firstName: string;
    lastName: string;
    brandName: string;
    password: string;
    paymentMethod: string;
  }) => {
    const response = await fetch(
      `${API_BASE_URL}/auth/register/step4-complete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Registration failed");
    }

    return data.data;
  },

  // Google OAuth
  googleSignUp: async (idToken: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/google/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Google sign up failed");
    }

    return data.data;
  },

  googleLogin: async (idToken: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/google/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Google login failed");
    }

    return data.data;
  },

  processPayment: async (subscriptionId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/auth/register/process-payment/${subscriptionId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Payment processing failed");
    }

    return data.data;
  },

  // Get profile
  getProfile: async () => {
    console.log("API: Calling getProfile...");
    const response = await apiCall("/auth/profile");
    console.log("API: getProfile raw response:", response);

    if (!response.success) {
      console.error("API: getProfile failed:", response.error);
      throw new Error(response.error || "Failed to get profile");
    }

    console.log("API: getProfile success, returning data:", response.data);
    return response.data;
  },

  // Update profile
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => {
    return apiCall("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return apiCall("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Logout
  logout: async (refreshToken?: string) => {
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.warn("Logout API call failed:", error);
      }
    }

    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("companyName");
    localStorage.removeItem("brandId");
    localStorage.removeItem("userId");
  },
};

// ===== SUBSCRIPTION API =====
export const subscriptionAPI = {
  // Get all plans
  getPlans: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/plans`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch plans");
      }
      return data.data;
    } catch (error) {
      console.error("Error fetching plans:", error);
      throw error;
    }
  },

  // Get plan by ID
  getPlanById: async (planId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/subscription/plans/${planId}`
    );
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch plan");
    }
    return data.data;
  },

  // Get user's subscription
  getMySubscription: async () => {
    return apiCall("/subscription/my-subscription");
  },

  // Create subscription
  createSubscription: async (data: {
    planId: string;
    paymentMethod?: string;
  }) => {
    return apiCall("/subscription/subscribe", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update subscription
  updateSubscription: async (subscriptionId: string, data: any) => {
    return apiCall(`/subscription/subscriptions/${subscriptionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string) => {
    return apiCall(`/subscription/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
    });
  },

  // Process payment
  processPayment: async (subscriptionId: string) => {
    return apiCall(
      `/subscription/subscriptions/${subscriptionId}/process-payment`,
      {
        method: "POST",
      }
    );
  },

  // Get subscription invoices
  getInvoices: async (subscriptionId: string) => {
    return apiCall(`/subscription/subscriptions/${subscriptionId}/invoices`);
  },

  // Check trial status
  getTrialStatus: async () => {
    return apiCall("/subscription/trial-status");
  },
};

// ===== RECEIVABLES API =====
export const receivablesAPI = {
  // Get all receivables
  getAll: async (filters?: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await apiCall(
      `/financial/brands/${brandId}/receivables?${params}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch receivables");
    }
    return response.data;
  },

  // Get single receivable
  getById: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/receivables/${id}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch receivable");
    }
    return response.data;
  },

  // Create receivable
  create: async (data: {
    entityName: string;
    amount: number;
    dueDate: string;
    description?: string;
    invoiceNumber?: string;
    receiptUrl?: string;
  }) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/receivables`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to create receivable");
    }
    return response.data;
  },

  // Update receivable
  update: async (
    id: string,
    data: {
      entityName?: string;
      amount?: number;
      dueDate?: string;
      status?: "current" | "overdue" | "critical" | "paid";
      description?: string;
      invoiceNumber?: string;
      receiptUrl?: string;
    }
  ) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/receivables/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to update receivable");
    }
    return response.data;
  },

  // Delete receivable
  delete: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/receivables/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to delete receivable");
    }
    return response.data;
  },
};

// ===== PAYABLES API =====
export const payablesAPI = {
  // Get all payables
  getAll: async (filters?: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await apiCall(
      `/financial/brands/${brandId}/payables?${params}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch payables");
    }
    return response.data;
  },

  // Get single payable
  getById: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/payables/${id}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch payable");
    }
    return response.data;
  },

  // Create payable
  create: async (data: {
    entityName: string;
    amount: number;
    dueDate: string;
    description?: string;
    invoiceNumber?: string;
    receiptUrl?: string;
  }) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/payables`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to create payable");
    }
    return response.data;
  },

  // Update payable
  update: async (
    id: string,
    data: {
      entityName?: string;
      amount?: number;
      dueDate?: string;
      status?: "current" | "overdue" | "critical" | "paid";
      description?: string;
      invoiceNumber?: string;
      receiptUrl?: string;
    }
  ) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/payables/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to update payable");
    }
    return response.data;
  },

  // Delete payable
  delete: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/payables/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to delete payable");
    }
    return response.data;
  },
};

// ===== REVENUES API =====
export const revenuesAPI = {
  // Get all revenues
  getAll: async (filters?: {
    search?: string;
    page?: number;
    limit?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.category) params.append("category", filters.category);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await apiCall(
      `/financial/brands/${brandId}/revenues?${params}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch revenues");
    }
    return response.data;
  },

  // Get single revenue
  getById: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/revenues/${id}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch revenue");
    }
    return response.data;
  },

  // Create revenue
  create: async (data: {
    name: string;
    amount: number;
    category: string;
    date: string;
    source: string;
    receiptUrl?: string;
  }) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/revenues`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to create revenue");
    }
    return response.data;
  },

  // Update revenue
  update: async (
    id: string,
    data: {
      name?: string;
      amount?: number;
      category?: string;
      date?: string;
      source?: string;
      receiptUrl?: string;
    }
  ) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/revenues/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to update revenue");
    }
    return response.data;
  },

  // Delete revenue
  delete: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/revenues/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to delete revenue");
    }
    return response.data;
  },
};

// ===== COSTS API =====
export const costsAPI = {
  // Get all costs
  getAll: async (filters?: {
    search?: string;
    page?: number;
    limit?: number;
    category?: string;
    costType?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.category) params.append("category", filters.category);
    if (filters?.costType) params.append("costType", filters.costType);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await apiCall(
      `/financial/brands/${brandId}/costs?${params}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch costs");
    }
    return response.data;
  },

  // Get single cost
  getById: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/costs/${id}`);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch cost");
    }
    return response.data;
  },

  // Create cost
  create: async (data: {
    name: string;
    amount: number;
    category: string;
    costType: "fixed" | "variable";
    date: string;
    vendor: string;
    receiptUrl?: string;
  }) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/costs`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to create cost");
    }
    return response.data;
  },

  // Update cost
  update: async (
    id: string,
    data: {
      name?: string;
      amount?: number;
      category?: string;
      costType?: "fixed" | "variable";
      date?: string;
      vendor?: string;
      receiptUrl?: string;
    }
  ) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/costs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to update cost");
    }
    return response.data;
  },

  // Delete cost
  delete: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/costs/${id}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to delete cost");
    }
    return response.data;
  },
};

// ===== TRANSFERS API =====
export const transfersAPI = {
  // Get all transfers
  getAll: async (filters?: {
    type?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();

    if (filters?.type) params.append("type", filters.type);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await apiCall(
      `/financial/brands/${brandId}/transfers?${params}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch transfers");
    }
    return response.data;
  },

  // Get single transfer
  getById: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/transfers/${id}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch transfer");
    }
    return response.data;
  },

  // Create transfer
  create: async (data: {
    type: "customer" | "inventory";
    fromLocation?: string;
    toLocation: string;
    quantity: number;
    description?: string;
    transferDate: string;
  }) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/transfers`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to create transfer");
    }
    return response.data;
  },

  // Update transfer
  update: async (
    id: string,
    data: {
      type?: "customer" | "inventory";
      fromLocation?: string;
      toLocation?: string;
      quantity?: number;
      description?: string;
      transferDate?: string;
    }
  ) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/transfers/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to update transfer");
    }
    return response.data;
  },

  // Delete transfer
  delete: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/transfers/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to delete transfer");
    }
    return response.data;
  },
};

// ===== INVENTORY API =====
export const inventoryAPI = {
  // Get all inventory items
  getAll: async (filters?: {
    search?: string;
    category?: string;
    supplier?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.supplier) params.append("supplier", filters.supplier);
    if (filters?.location) params.append("location", filters.location);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await apiCall(
      `/financial/brands/${brandId}/inventory?${params}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch inventory items");
    }
    return response.data;
  },

  // Get single inventory item
  getById: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/inventory/${id}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch inventory item");
    }
    return response.data;
  },

  // Create inventory item
  create: async (data: {
    productName: string;
    baseSku: string;
    category: string;
    supplier: string;
    unitCost: number;
    sellingPrice: number;
    currentStock: number;
    reorderLevel: number;
    description?: string;
    location?: string;
    sizes?: string[];
    colors?: string[];
  }) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/inventory`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to create inventory item");
    }
    return response.data;
  },

  // Update inventory item
  update: async (
    id: string,
    data: {
      productName?: string;
      baseSku?: string;
      category?: string;
      supplier?: string;
      unitCost?: number;
      sellingPrice?: number;
      currentStock?: number;
      reorderLevel?: number;
      description?: string;
      location?: string;
      sizes?: string[];
      colors?: string[];
    }
  ) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/inventory/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to update inventory item");
    }
    return response.data;
  },

  // Delete inventory item
  delete: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/inventory/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to delete inventory item");
    }
    return response.data;
  },
};

// ===== PROJECT TARGETS API =====
export const projectTargetsAPI = {
  // Get all project targets
  getAll: async (filters?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await apiCall(
      `/financial/brands/${brandId}/project-targets?${params}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch project targets");
    }
    return response.data;
  },

  // Get single project target
  getById: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/project-targets/${id}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch project target");
    }
    return response.data;
  },

  // Create project target
  create: async (data: {
    name: string;
    goal: string;
    targetPieces: number;
    currentPieces: number;
    category: string;
    deadline?: string;
    status: string;
  }) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/project-targets`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to create project target");
    }
    return response.data;
  },

  // Update project target
  update: async (
    id: string,
    data: {
      name?: string;
      goal?: string;
      targetPieces?: number;
      currentPieces?: number;
      category?: string;
      deadline?: string;
      status?: string;
    }
  ) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/project-targets/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to update project target");
    }
    return response.data;
  },

  // Delete project target
  delete: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/project-targets/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to delete project target");
    }
    return response.data;
  },
};

// ===== FINANCIAL METRICS API =====
export const metricsAPI = {
  // Get financial metrics
  getFinancialMetrics: async (dateRange?: string) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();
    if (dateRange) params.append("dateRange", dateRange);

    const response = await apiCall(
      `/financial/brands/${brandId}/metrics?${params}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch financial metrics");
    }
    return response.data;
  },

  // Get revenue metrics
  getRevenueMetrics: async (dateRange?: string) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();
    if (dateRange) params.append("dateRange", dateRange);

    const response = await apiCall(
      `/financial/brands/${brandId}/revenue-metrics?${params}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch revenue metrics");
    }
    return response.data;
  },

  // Get cost metrics
  getCostMetrics: async (dateRange?: string) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();
    if (dateRange) params.append("dateRange", dateRange);

    const response = await apiCall(
      `/financial/brands/${brandId}/cost-metrics?${params}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch cost metrics");
    }
    return response.data;
  },

  // Get inventory metrics
  getInventoryMetrics: async () => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/inventory-metrics`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch inventory metrics");
    }
    return response.data;
  },

  // Get transfer metrics
  getTransferMetrics: async () => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/transfer-metrics`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch transfer metrics");
    }
    return response.data;
  },

  // Get project target metrics
  getProjectTargetMetrics: async () => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/project-target-metrics`
    );
    if (!response.success) {
      throw new Error(
        response.error || "Failed to fetch project target metrics"
      );
    }
    return response.data;
  },

  // Get task metrics
  getTaskMetrics: async () => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/task-metrics`);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch task metrics");
    }
    return response.data;
  },
};

// ===== TEAM API =====
export const teamAPI = {
  // Get all team members
  getAll: async (filters?: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.role) params.append("role", filters.role);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await apiCall(
      `/financial/brands/${brandId}/team?${params}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch team members");
    }
    return response.data;
  },

  // Get single team member
  getById: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/team/${id}`);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch team member");
    }
    return response.data;
  },

  // Create team member
  create: async (data: {
    name: string;
    email: string;
    role: string;
    permissions: string[];
  }) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/team`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to create team member");
    }
    return response.data;
  },

  // Update team member
  update: async (
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: string;
      permissions?: string[];
    }
  ) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/team/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to update team member");
    }
    return response.data;
  },

  // Delete team member
  delete: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/team/${id}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to delete team member");
    }
    return response.data;
  },
};

// ===== WALLET API =====
export const walletAPI = {
  // Get all wallets
  getAll: async () => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/wallets`);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch wallets");
    }
    return response.data;
  },

  // Get single wallet
  getById: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/wallets/${id}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch wallet");
    }
    return response.data;
  },

  // Create wallet
  create: async (data: {
    name: string;
    balance: number;
    type: string;
    currency: string;
    color: string;
  }) => {
    const brandId = getBrandId();
    console.log("Wallet API - Creating wallet:", { brandId, data });
    const response = await apiCall(`/financial/brands/${brandId}/wallets`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    console.log("Wallet API - Response:", response);
    if (!response.success) {
      throw new Error(response.error || "Failed to create wallet");
    }
    return response.data;
  },

  // Update wallet
  update: async (
    id: string,
    data: {
      name?: string;
      balance?: number;
      type?: string;
      currency?: string;
      color?: string;
    }
  ) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/wallets/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to update wallet");
    }
    return response.data;
  },

  // Delete wallet
  delete: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/wallets/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to delete wallet");
    }
    return response.data;
  },

  // Get wallet transactions
  getTransactions: async (walletId: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/wallets/${walletId}/transactions`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch wallet transactions");
    }
    return response.data;
  },

  // Create transaction
  createTransaction: async (data: {
    type: "credit" | "debit" | "transfer";
    amount: number;
    description: string;
    fromWalletId?: string;
    toWalletId?: string;
    category?: string;
    countAsRevenue?: boolean;
    countAsCost?: boolean;
  }) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/wallets/transactions`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to create transaction");
    }
    return response.data;
  },

  // Get all transactions for all wallets
  getAllTransactions: async (filters?: {
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();

    if (filters?.type) params.append("type", filters.type);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await apiCall(
      `/financial/brands/${brandId}/transactions?${params}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch transactions");
    }
    return response.data;
  },

  // Get transaction by ID
  getTransactionById: async (transactionId: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/wallets/transactions/${transactionId}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch transaction");
    }
    return response.data;
  },

  // Update transaction
  updateTransaction: async (
    transactionId: string,
    data: {
      description?: string;
      category?: string;
      status?: "completed" | "pending" | "failed";
    }
  ) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/wallets/transactions/${transactionId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to update transaction");
    }
    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (transactionId: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/financial/brands/${brandId}/wallets/transactions/${transactionId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to delete transaction");
    }
    return response.data;
  },
};

// ===== CATEGORIES API =====
export const categoriesAPI = {
  // Get all categories
  getAll: async (type?: string) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();
    if (type) params.append("type", type);

    const response = await apiCall(`/brands/${brandId}/categories?${params}`);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch categories");
    }
    return response.data;
  },

  // Get used categories (for dropdown)
  getUsed: async (type: string) => {
    const brandId = getBrandId();
    const response = await apiCall(
      `/brands/${brandId}/categories/used?type=${type}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch used categories");
    }
    return response.data;
  },

  // Get single category
  getById: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(`/brands/${brandId}/categories/${id}`);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch category");
    }
    return response.data;
  },

  // Create category
  create: async (data: { name: string; color: string; type: string }) => {
    const brandId = getBrandId();
    const response = await apiCall(`/brands/${brandId}/categories`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to create category");
    }
    return response.data;
  },

  // Update category
  update: async (
    id: string,
    data: {
      name?: string;
      color?: string;
    }
  ) => {
    const brandId = getBrandId();
    const response = await apiCall(`/brands/${brandId}/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to update category");
    }
    return response.data;
  },

  // Delete category
  delete: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(`/brands/${brandId}/categories/${id}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to delete category");
    }
    return response.data;
  },
};

// ===== TASKS API =====
export const tasksAPI = {
  // Get all tasks
  getAll: async (filters?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const brandId = getBrandId();
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    console.log("Getting tasks for brand:", brandId);
    console.log("Filters:", filters);

    const response = await apiCall(
      `/financial/brands/${brandId}/tasks?${params}`
    );

    console.log("Get tasks response:", response);

    if (!response.success) {
      throw new Error(response.error || "Failed to fetch tasks");
    }
    return response.data;
  },

  // Get single task
  getById: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/tasks/${id}`);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch task");
    }
    return response.data;
  },

  // Create task
  create: async (data: {
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    dueDate?: string;
    assignedTo?: string;
    category?: string;
  }) => {
    const brandId = getBrandId();
    console.log("Creating task with data:", data);
    console.log("Brand ID:", brandId);

    const response = await apiCall(`/financial/brands/${brandId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    console.log("Task creation response:", response);

    if (!response.success) {
      throw new Error(response.error || "Failed to create task");
    }
    return response.data;
  },

  // Update task
  update: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      priority?: "low" | "medium" | "high";
      status?: "pending" | "in-progress" | "completed";
      dueDate?: string;
      assignedTo?: string;
      category?: string;
    }
  ) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to update task");
    }
    return response.data;
  },

  // Delete task
  delete: async (id: string) => {
    const brandId = getBrandId();
    const response = await apiCall(`/financial/brands/${brandId}/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to delete task");
    }
    return response.data;
  },
};

// ===== BRAND SETTINGS API =====
export const brandSettingsAPI = {
  get: async (brandId: string) => {
    const response = await apiCall(`/brands/${brandId}/settings`);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch brand settings");
    }
    return response.data;
  },

  update: async (brandId: string, settings: any) => {
    const response = await apiCall(`/brands/${brandId}/settings`, {
      method: "PUT",
      body: JSON.stringify(settings),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to update brand settings");
    }
    return response.data;
  },

  updateLogo: async (brandId: string, logoUrl: string) => {
    const response = await apiCall(`/brands/${brandId}/logo`, {
      method: "PUT",
      body: JSON.stringify({ logoUrl }),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to update brand logo");
    }
    return response.data;
  },

  reset: async (brandId: string) => {
    const response = await apiCall(`/brands/${brandId}/settings/reset`, {
      method: "POST",
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to reset brand settings");
    }
    return response.data;
  },
};

// ===== USER SETTINGS API =====
export const userSettingsAPI = {
  getProfile: async () => {
    const response = await apiCall(`/user/profile`);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch user profile");
    }
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await apiCall(`/user/profile`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to update user profile");
    }
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiCall(`/user/password`, {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to change password");
    }
    return response.data;
  },

  updateProfilePicture: async (pictureUrl: string) => {
    const response = await apiCall(`/user/picture`, {
      method: "PUT",
      body: JSON.stringify({ pictureUrl }),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to update profile picture");
    }
    return response.data;
  },

  deleteAccount: async (password: string) => {
    const response = await apiCall(`/user/account`, {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to delete account");
    }
    return response.data;
  },
};

// ===== BOSTA IMPORT API =====
export const bostaImportAPI = {
  // Create new import
  createImport: async (brandId: string, data: any) => {
    const response = await apiCall(`/bosta/${brandId}/imports`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to create import");
    }
    return response.data;
  },

  // Get imports for a brand
  getImports: async (
    brandId: string,
    params?: { page?: number; limit?: number }
  ) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await apiCall(
      `/bosta/${brandId}/imports?${queryParams.toString()}`
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to get imports");
    }
    return response.data;
  },

  // Get specific import
  getImportById: async (importId: string) => {
    const response = await apiCall(`/bosta/imports/${importId}`);
    if (!response.success) {
      throw new Error(response.error || "Failed to get import");
    }
    return response.data;
  },

  // Create revenue from shipments
  createRevenueFromShipments: async (
    brandId: string,
    importId: string,
    shipmentIds: string[]
  ) => {
    const response = await apiCall(
      `/bosta/${brandId}/imports/${importId}/revenue`,
      {
        method: "POST",
        body: JSON.stringify({ shipmentIds }),
      }
    );
    if (!response.success) {
      throw new Error(
        response.error || "Failed to create revenue from shipments"
      );
    }
    return response.data;
  },

  // Delete revenue from shipment
  deleteRevenueFromShipment: async (revenueId: string) => {
    const response = await apiCall(`/bosta/revenue/${revenueId}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to delete revenue");
    }
    return response.data;
  },

  // Get grouped Bosta revenue
  getGroupedBostaRevenue: async (brandId: string) => {
    const response = await apiCall(`/bosta/${brandId}/revenue/grouped`);
    if (!response.success) {
      throw new Error(response.error || "Failed to get grouped Bosta revenue");
    }
    return response.data;
  },

  // Check for duplicates before import
  checkDuplicates: async (brandId: string, shipments: any[]) => {
    const response = await apiCall(`/bosta/${brandId}/check-duplicates`, {
      method: "POST",
      body: JSON.stringify({ shipments }),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to check duplicates");
    }
    return response.data;
  },

  // Bulk delete shipments
  bulkDeleteShipments: async (shipmentIds: string[]) => {
    const response = await apiCall(`/bosta/bulk/delete`, {
      method: "POST",
      body: JSON.stringify({ shipmentIds }),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to delete shipments");
    }
    return response.data;
  },

  // Bulk update shipment status
  bulkUpdateShipmentStatus: async (
    shipmentIds: string[],
    newStatus: string
  ) => {
    const response = await apiCall(`/bosta/bulk/update-status`, {
      method: "POST",
      body: JSON.stringify({ shipmentIds, newStatus }),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to update shipment status");
    }
    return response.data;
  },

  // Bulk edit shipments
  bulkEditShipments: async (shipmentIds: string[], updates: any) => {
    const response = await apiCall(`/bosta/bulk/edit`, {
      method: "POST",
      body: JSON.stringify({ shipmentIds, updates }),
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to edit shipments");
    }
    return response.data;
  },
};

// Generic API client for usage tracking
export const api = {
  get: async (endpoint: string) => {
    const response = await apiCall(endpoint, { method: "GET" });
    return response;
  },
  post: async (endpoint: string, data?: any) => {
    const response = await apiCall(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  },
  put: async (endpoint: string, data?: any) => {
    const response = await apiCall(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  },
  delete: async (endpoint: string) => {
    const response = await apiCall(endpoint, { method: "DELETE" });
    return response;
  },
};
