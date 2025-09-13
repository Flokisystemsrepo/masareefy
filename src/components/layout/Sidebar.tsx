import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  DollarSign,
  Wallet,
  ArrowLeftRight,
  FileText,
  Package,
  Target,
  Trophy,
  Palette,
  Settings,
  BarChart3,
  ShoppingCart,
  ChevronLeft,
  Bell,
  User,
  LogOut,
  MessageSquare,
  MessageCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface SidebarProps {
  brandId: string;
  currentPath: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

const getNavigationGroups = (t: (key: string) => string) => [
  {
    label: "Overview",
    items: [
      {
        icon: LayoutDashboard,
        label: t("sidebar.navigation.dashboard"),
        path: "/brand/:id",
        key: "dashboard",
      },
    ],
  },
  {
    label: "Financial",
    items: [
      {
        icon: DollarSign,
        label: t("sidebar.navigation.revenues"),
        path: "/brand/:id/revenues",
        key: "revenues",
      },
      {
        icon: FileText,
        label: t("sidebar.navigation.costs"),
        path: "/brand/:id/costs",
        key: "costs",
      },
      {
        icon: BarChart3,
        label: t("sidebar.navigation.receivablesPayables"),
        path: "/brand/:id/receivables-payables",
        key: "receivables",
      },
      {
        icon: Wallet,
        label: t("sidebar.navigation.wallet"),
        path: "/brand/:id/wallet",
        key: "wallet",
      },
      {
        icon: ArrowLeftRight,
        label: t("sidebar.navigation.transfers"),
        path: "/brand/:id/transfers",
        key: "transfers",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        icon: Package,
        label: t("sidebar.navigation.inventory"),
        path: "/brand/:id/inventory",
        key: "inventory",
      },
      {
        icon: ShoppingCart,
        label: t("sidebar.navigation.orders"),
        path: "/brand/:id/orders",
        key: "orders",
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        icon: Target,
        label: t("sidebar.navigation.tasks"),
        path: "/brand/:id/tasks",
        key: "tasks",
      },
      {
        icon: MessageSquare,
        label: "Support Center",
        path: null,
        key: "support-center",
        isGroup: true,
        children: [
          {
            icon: MessageSquare,
            label: "Support Requests",
            path: "/brand/:id/support",
            key: "support",
          },
          {
            icon: MessageCircle,
            label: "My Tickets",
            path: "/brand/:id/my-tickets",
            key: "my-tickets",
          },
        ],
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        icon: BarChart3,
        label: t("sidebar.navigation.reports"),
        path: "/brand/:id/reports",
        key: "reports",
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        icon: Settings,
        label: t("sidebar.navigation.settings"),
        path: "/brand/:id/settings",
        key: "settings",
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  brandId,
  currentPath,
  onCollapseChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );
  const { logout, user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const isActive = useCallback(
    (itemKey: string) => {
      return (
        currentPath.includes(itemKey) ||
        (itemKey === "dashboard" && currentPath === `/brand/${brandId}`)
      );
    },
    [currentPath, brandId]
  );

  const getItemPath = useCallback(
    (path: string) => {
      return path.replace(":id", brandId);
    },
    [brandId]
  );

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(getItemPath(path));
    },
    [navigate, getItemPath]
  );

  const toggleSection = useCallback((sectionKey: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  }, []);

  const isSectionCollapsed = useCallback(
    (sectionKey: string) => {
      return collapsedSections.has(sectionKey);
    },
    [collapsedSections]
  );

  const navigationGroups = getNavigationGroups(t);

  return (
    <motion.div
      className={cn(
        "fixed top-0 h-screen bg-[#106df9] border-r border-[#106df9] z-40 flex flex-col",
        isCollapsed ? "w-16" : "w-64",
        isRTL ? "right-0" : "left-0"
      )}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex items-center justify-between">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#106df9] font-bold text-sm">P</span>
              </div>
              <span className="text-white font-semibold text-lg">
                {user?.companyName || "Pulse"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsCollapsed(!isCollapsed);
            onCollapseChange?.(!isCollapsed);
          }}
          className="text-white hover:bg-white/10"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.label} className="mb-4">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  className="px-4 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    {group.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1 px-2">
              {group.items.map((item, itemIndex) => {
                const active = isActive(item.key);
                const isGroupItem = item.isGroup;
                const isCollapsedSection = isSectionCollapsed(item.key);

                if (isGroupItem) {
                  return (
                    <div key={item.key}>
                      {/* Group Header */}
                      <motion.div
                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ${"text-white hover:bg-white/10"}`}
                        onClick={() => toggleSection(item.key)}
                        whileHover={{ x: 1 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.div
                              animate={{ rotate: isCollapsedSection ? 0 : 90 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Group Children */}
                      <AnimatePresence>
                        {!isCollapsedSection &&
                          !isCollapsed &&
                          item.children && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-6 space-y-1 mt-1">
                                {item.children.map((child) => {
                                  const childActive = isActive(child.key);
                                  return (
                                    <motion.div
                                      key={child.key}
                                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                                        childActive
                                          ? "bg-white text-[#106df9] shadow-md"
                                          : "text-white hover:bg-white/10"
                                      }`}
                                      onClick={() =>
                                        handleNavigation(child.path)
                                      }
                                      whileHover={{ x: 1 }}
                                      whileTap={{ scale: 0.99 }}
                                    >
                                      <child.icon className="h-4 w-4" />
                                      <span className="font-medium text-sm">
                                        {child.label}
                                      </span>
                                      {childActive && (
                                        <motion.div
                                          className="absolute right-2 w-2 h-2 bg-[#106df9] rounded-full"
                                          layoutId="activeIndicator"
                                          transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 25,
                                          }}
                                        />
                                      )}
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>
                  );
                }

                // Regular navigation item
                return (
                  <motion.div
                    key={item.key}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                      active
                        ? "bg-white text-[#106df9] shadow-md"
                        : "text-white hover:bg-white/10"
                    }`}
                    onClick={() => handleNavigation(item.path)}
                    whileHover={{ x: 1 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {active && (
                      <motion.div
                        className="absolute right-2 w-2 h-2 bg-[#106df9] rounded-full"
                        layoutId="activeIndicator"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Language Switcher */}
      <div className="px-4 py-2 border-t border-white/20">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LanguageSwitcher variant="sidebar" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Profile */}
      <div className="border-t border-white/20 p-4">
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {user?.email}
                  </p>
                </div>
                <Bell className="h-4 w-4 text-white/60" />
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white hover:text-white hover:bg-white/10"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("sidebar.user.signOut")}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              className="flex flex-col space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8 text-white hover:bg-white/10"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8 text-white hover:bg-white/10"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Sidebar;
