import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../services/api";

interface TrialStatus {
  subscription: {
    id: string;
    status: string;
    plan: {
      id: string;
      name: string;
      priceMonthly: number;
    };
  };
  isTrialActive: boolean;
  daysRemaining: number;
  trialEnd: string | null;
  plan: {
    id: string;
    name: string;
    priceMonthly: number;
  };
}

interface TrialNotification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  sentAt: string;
  createdAt: string;
}

interface TrialContextType {
  trialStatus: TrialStatus | null;
  notifications: TrialNotification[];
  isLoading: boolean;
  error: string | null;
  refreshTrialStatus: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  showTrialExpirationModal: boolean;
  setShowTrialExpirationModal: (show: boolean) => void;
}

const TrialContext = createContext<TrialContextType | undefined>(undefined);

export const useTrial = () => {
  const context = useContext(TrialContext);
  if (context === undefined) {
    throw new Error("useTrial must be used within a TrialProvider");
  }
  return context;
};

interface TrialProviderProps {
  children: ReactNode;
}

export const TrialProvider: React.FC<TrialProviderProps> = ({ children }) => {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [notifications, setNotifications] = useState<TrialNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrialExpirationModal, setShowTrialExpirationModal] =
    useState(false);

  const fetchTrialStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get("/trial/status");
      if (response.data.success) {
        setTrialStatus(response.data.data);

        // Show modal if trial is expiring soon (1 day or less) or has expired
        if (
          response.data.data?.isTrialActive &&
          response.data.data?.daysRemaining <= 1
        ) {
          setShowTrialExpirationModal(true);
        }

        // Also show modal if user was just downgraded (check notifications)
        const notificationsResponse = await api.get("/trial/notifications");
        if (notificationsResponse.data.success) {
          const unreadNotifications = notificationsResponse.data.data.filter(
            (n: any) => !n.isRead && n.type === "trial_expired"
          );
          if (unreadNotifications.length > 0) {
            setShowTrialExpirationModal(true);
          }
        }
      }
    } catch (err: any) {
      console.error("Error fetching trial status:", err);
      setError(err.response?.data?.error || "Failed to fetch trial status");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/trial/notifications");
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching trial notifications:", err);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/trial/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
    }
  };

  const refreshTrialStatus = async () => {
    await Promise.all([fetchTrialStatus(), fetchNotifications()]);
  };

  useEffect(() => {
    // Check if user is authenticated before fetching trial status
    const token = localStorage.getItem("token");
    if (token) {
      refreshTrialStatus();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Check trial status every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem("token")) {
        fetchTrialStatus();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const value: TrialContextType = {
    trialStatus,
    notifications,
    isLoading,
    error,
    refreshTrialStatus,
    markNotificationAsRead,
    showTrialExpirationModal,
    setShowTrialExpirationModal,
  };

  return (
    <TrialContext.Provider value={value}>{children}</TrialContext.Provider>
  );
};
