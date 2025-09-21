import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "@/services/api";
import { clearAllAuthData, isRateLimitError } from "@/utils/authUtils";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  name?: string;
  companyName?: string;
  brandId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error("useAuth hook called outside of AuthProvider context");
    // Return a fallback context instead of throwing
    return {
      user: null,
      isAuthenticated: false,
      login: async () => {
        throw new Error(
          "Authentication service unavailable - please refresh the page"
        );
      },
      register: async () => {
        throw new Error(
          "Registration service unavailable - please refresh the page"
        );
      },
      logout: async () => {
        clearAllAuthData();
      },
      loading: false,
      error: "Authentication service unavailable",
      clearError: () => {},
      refreshToken: async () => {
        throw new Error("Token refresh unavailable");
      },
    };
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [authFailureCount, setAuthFailureCount] = useState(0);
  const [lastAuthCheck, setLastAuthCheck] = useState<number>(0);
  const [isAuthDisabled, setIsAuthDisabled] = useState(false);

  // Check authentication status on mount with debounce
  useEffect(() => {
    // Only run auth check if we're in the browser
    if (typeof window !== "undefined") {
      const timer = setTimeout(() => {
        checkAuthStatus().catch((error) => {
          console.error("Auth check failed during initialization:", error);
          setLoading(false);
        });
      }, 500); // Increased delay to prevent rapid calls

      return () => clearTimeout(timer);
    } else {
      // If not in browser (SSR), just set loading to false
      setLoading(false);
    }
  }, []); // Empty dependency array to run only once

  // Set up automatic token refresh
  useEffect(() => {
    if (user) {
      // Refresh token every 14 days (before it expires)
      const refreshInterval = setInterval(() => {
        refreshToken();
      }, 14 * 24 * 60 * 60 * 1000); // 14 days

      return () => clearInterval(refreshInterval);
    }
  }, [user]);

  const checkAuthStatus = async () => {
    const now = Date.now();

    // Check if auth is disabled due to too many failures
    if (isAuthDisabled) {
      console.log("Auth is disabled due to too many failures");
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth) {
      console.log("Auth check already in progress, skipping");
      return;
    }

    // Rate limiting: don't check more than once every 2 seconds
    if (now - lastAuthCheck < 2000) {
      console.log("Auth check rate limited, skipping");
      return;
    }

    // Circuit breaker: if too many failures, disable auth completely
    if (authFailureCount >= 10) {
      // Increased threshold to prevent premature lockout
      console.warn("Too many auth failures, disabling auth system");
      clearAllAuthData();
      setUser(null);
      setLoading(false);
      setIsAuthDisabled(true);
      return;
    }

    try {
      setIsCheckingAuth(true);

      // Check if localStorage is available (for SSR compatibility)
      if (typeof window === "undefined" || !window.localStorage) {
        console.log("localStorage not available, skipping auth check");
        setLoading(false);
        return;
      }
      const token = localStorage.getItem("token");
      const storedRefreshToken = localStorage.getItem("refreshToken");
      const brandId = localStorage.getItem("brandId");
      const userEmail = localStorage.getItem("userEmail");
      const userName = localStorage.getItem("userName");
      const companyName = localStorage.getItem("companyName");
      const userId = localStorage.getItem("userId");

      console.log("AuthContext: Checking auth status", {
        hasToken: !!token,
        hasRefreshToken: !!storedRefreshToken,
        brandId,
        userEmail,
        userId,
      });

      if (token && brandId && userEmail) {
        // Verify token is still valid by calling profile endpoint
        try {
          console.log("AuthContext: Calling getProfile API...");
          const profileData = await authAPI.getProfile();
          console.log("AuthContext: Profile API response:", profileData);

          const userData: User = {
            id: userId || profileData.user.id,
            email: userEmail,
            firstName: profileData.user.firstName,
            lastName: profileData.user.lastName,
            phoneNumber: profileData.user.phoneNumber,
            name:
              userName ||
              `${profileData.user.firstName} ${profileData.user.lastName}`,
            companyName: companyName || profileData.brand.name,
            brandId,
          };

          console.log("AuthContext: Setting user data:", userData);
          setUser(userData);
          setAuthFailureCount(0); // Reset failure count on success

          // Trigger subscription refresh after successful auth check
          setTimeout(() => {
            if (
              typeof window !== "undefined" &&
              (window as any).triggerSubscriptionRefresh
            ) {
              console.log("Triggering subscription refresh after auth check");
              (window as any).triggerSubscriptionRefresh();
            }
          }, 100); // Small delay to ensure localStorage is updated
        } catch (error: any) {
          console.error("AuthContext: Profile API failed:", error);

          // Check if it's a rate limit error
          if (isRateLimitError(error)) {
            console.warn(
              "Rate limit exceeded, will retry but not clearing auth"
            );
            // Don't clear auth data on rate limit - just wait and retry
            setLoading(false);
            return; // Don't increment failure count for rate limits
          }

          // Token is invalid, try to refresh only once
          if (storedRefreshToken) {
            try {
              console.log("AuthContext: Attempting token refresh...");
              await refreshToken();
            } catch (refreshError: any) {
              // Refresh failed, clear storage
              console.warn("Token refresh failed, clearing authentication");
              if (isRateLimitError(refreshError)) {
                console.warn("Rate limit on refresh, will retry later");
                setLoading(false);
                return; // Don't clear auth on rate limit
              }
              await logout();
              setAuthFailureCount((prev) => prev + 1);
            }
          } else {
            // No refresh token, clear storage
            console.warn("No refresh token, clearing authentication");
            await logout();
            setAuthFailureCount((prev) => prev + 1);
          }
        }
      } else {
        console.log(
          "AuthContext: Missing required auth data, not authenticated"
        );
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error checking auth status:", error);
      if (isRateLimitError(error)) {
        console.warn("Rate limit in checkAuthStatus, will retry later");
        // Don't clear auth on rate limit errors
      }
    } finally {
      setIsCheckingAuth(false);
      setLoading(false);
      setLastAuthCheck(Date.now());
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const data = await authAPI.refreshToken(refreshToken);
      const { user, brand, token, refreshToken: newRefreshToken } = data;

      // Update stored tokens
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", newRefreshToken);

      // Update user data
      const userData: User = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        companyName: brand.name,
        brandId: brand.id,
      };

      setUser(userData);

      // Trigger subscription refresh after successful token refresh
      setTimeout(() => {
        if (
          typeof window !== "undefined" &&
          (window as any).triggerSubscriptionRefresh
        ) {
          console.log("Triggering subscription refresh after token refresh");
          (window as any).triggerSubscriptionRefresh();
        }
      }, 100); // Small delay to ensure localStorage is updated
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authAPI.login(email, password);
      const { user, brand, token, refreshToken } = data;

      // Store user data in localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", `${user.firstName} ${user.lastName}`);
      localStorage.setItem("companyName", brand.name);
      localStorage.setItem("brandId", brand.id);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      const userData: User = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        companyName: brand.name,
        brandId: brand.id,
      };

      setUser(userData);

      // Trigger subscription refresh after successful login
      setTimeout(() => {
        if (
          typeof window !== "undefined" &&
          (window as any).triggerSubscriptionRefresh
        ) {
          console.log("Triggering subscription refresh after login");
          (window as any).triggerSubscriptionRefresh();
        }
      }, 100); // Small delay to ensure localStorage is updated
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    // This function is no longer needed as registration is handled by the multi-step flow
    // The completeRegistration function in Register.tsx handles the real backend registration
    throw new Error(
      "Registration should be done through the multi-step registration flow"
    );
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.warn("Logout API call failed, but clearing local storage");
    } finally {
      // Clear all stored data using utility
      clearAllAuthData();
      setUser(null);
      setError(null);

      // Trigger subscription refresh to clear subscription data
      setTimeout(() => {
        if (
          typeof window !== "undefined" &&
          (window as any).triggerSubscriptionRefresh
        ) {
          console.log("Triggering subscription refresh after logout");
          (window as any).triggerSubscriptionRefresh();
        }
      }, 100); // Small delay to ensure localStorage is cleared
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Manual reset function for debugging
  const resetAuthSystem = () => {
    console.log("Manually resetting auth system");
    setIsAuthDisabled(false);
    setAuthFailureCount(0);
    setLastAuthCheck(0);
    setIsCheckingAuth(false);
    setError(null);
  };

  // Make reset function available globally for debugging
  if (typeof window !== "undefined") {
    (window as any).resetAuthSystem = resetAuthSystem;
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
    error,
    clearError,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Safe AuthProvider wrapper that handles initialization errors
export const SafeAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  try {
    return <AuthProvider>{children}</AuthProvider>;
  } catch (error) {
    console.error("AuthProvider initialization error:", error);

    // Provide a fallback context value
    const fallbackValue: AuthContextType = {
      user: null,
      isAuthenticated: false,
      login: async () => {
        throw new Error("Authentication service unavailable");
      },
      register: async () => {
        throw new Error("Registration service unavailable");
      },
      logout: async () => {
        clearAllAuthData();
      },
      loading: false,
      error: "Authentication service unavailable",
      clearError: () => {},
      refreshToken: async () => {
        throw new Error("Token refresh unavailable");
      },
    };

    return (
      <AuthContext.Provider value={fallbackValue}>
        {children}
      </AuthContext.Provider>
    );
  }
};
