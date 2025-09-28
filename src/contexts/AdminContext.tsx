import React, { createContext, useContext, useState, useEffect } from "react";

interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}

interface AdminContextType {
  admin: Admin | null;
  adminToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setAdminToken(token);
    if (token) {
      verifyAdminToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyAdminToken = async (token: string) => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/auth/verify",
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
          setAdmin(data.admin);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("adminToken");
        }
      } else {
        localStorage.removeItem("adminToken");
      }
    } catch (error) {
      console.error("Admin token verification error:", error);
      localStorage.removeItem("adminToken");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8080/api/admin/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            ipAddress: "unknown", // Will be set by server
            userAgent: navigator.userAgent,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          localStorage.setItem("adminToken", data.token);
          setAdminToken(data.token);
          setAdmin(data.admin);
          setIsAuthenticated(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      // Call logout API
      fetch("http://localhost:8080/api/admin/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }).catch((error) => {
        console.error("Logout API error:", error);
      });
    }

    localStorage.removeItem("adminToken");
    setAdminToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (permission: string): boolean => {
    return admin?.permissions.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    return admin?.role === role || false;
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        adminToken,
        login,
        logout,
        isAuthenticated,
        hasPermission,
        hasRole,
        loading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
