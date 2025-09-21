import React, { useState } from "react";
import { Bell, X, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useTrial } from "../contexts/TrialContext";

export const TrialNotifications: React.FC = () => {
  const { notifications, markNotificationAsRead } = useTrial();
  const [isOpen, setIsOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const hasUnread = unreadNotifications.length > 0;

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "trial_ending":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "trial_expired":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "downgrade_notice":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "trial_ending":
        return "border-orange-200 bg-orange-50";
      case "trial_expired":
        return "border-red-200 bg-red-50";
      case "downgrade_notice":
        return "border-red-200 bg-red-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">
              {unreadNotifications.length > 9
                ? "9+"
                : unreadNotifications.length}
            </span>
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Trial Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 last:border-b-0 ${
                    !notification.isRead
                      ? getNotificationColor(notification.type)
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          !notification.isRead ? "font-medium" : "font-normal"
                        } text-gray-900`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.sentAt).toLocaleDateString()} at{" "}
                        {new Date(notification.sentAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {hasUnread && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  unreadNotifications.forEach((n) => handleMarkAsRead(n.id));
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
