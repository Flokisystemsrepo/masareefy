import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTrial } from "@/contexts/TrialContext";
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
  Edit2,
  Check,
  X,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { TrialNotifications } from "@/components/TrialNotifications";
import { brandSettingsAPI } from "@/services/api";

interface SidebarProps {
  brandId: string;
  currentPath: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

const getNavigationGroups = (
  t: (key: string) => string,
  hasSectionAccess: (key: string) => boolean
) => [
  {
    label: "Overview",
    items: [
      {
        icon: LayoutDashboard,
        label: t("sidebar.navigation.dashboard"),
        path: "/brand/:id",
        key: "dashboard",
        hasAccess: hasSectionAccess("dashboard"),
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
        hasAccess: hasSectionAccess("revenues"),
      },
      {
        icon: FileText,
        label: t("sidebar.navigation.costs"),
        path: "/brand/:id/costs",
        key: "costs",
        hasAccess: hasSectionAccess("costs"),
      },
      {
        icon: BarChart3,
        label: t("sidebar.navigation.receivablesPayables"),
        path: "/brand/:id/receivables-payables",
        key: "receivables",
        hasAccess: hasSectionAccess("receivables"),
      },
      {
        icon: Wallet,
        label: t("sidebar.navigation.wallet"),
        path: "/brand/:id/wallet",
        key: "wallet",
        hasAccess: hasSectionAccess("wallet"),
      },
      {
        icon: ArrowLeftRight,
        label: t("sidebar.navigation.transfers"),
        path: "/brand/:id/transfers",
        key: "transfers",
        hasAccess: hasSectionAccess("transfers"),
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
        hasAccess: hasSectionAccess("inventory"),
      },
      {
        icon: ShoppingCart,
        label: t("sidebar.navigation.orders"),
        path: "/brand/:id/orders",
        key: "orders",
        hasAccess: hasSectionAccess("orders"),
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
        hasAccess: hasSectionAccess("tasks"),
      },
      {
        icon: MessageSquare,
        label: t("sidebar.navigation.supportCenter"),
        path: null,
        key: "support-center",
        isGroup: true,
        hasAccess:
          hasSectionAccess("support") || hasSectionAccess("my-tickets"),
        children: [
          {
            icon: MessageSquare,
            label: t("sidebar.navigation.supportRequests"),
            path: "/brand/:id/support",
            key: "support",
            hasAccess: hasSectionAccess("support"),
          },
          {
            icon: MessageCircle,
            label: t("sidebar.navigation.myTickets"),
            path: "/brand/:id/my-tickets",
            key: "my-tickets",
            hasAccess: hasSectionAccess("my-tickets"),
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
        hasAccess: hasSectionAccess("reports"),
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
        hasAccess: hasSectionAccess("settings"),
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
  const [isEditingBrandName, setIsEditingBrandName] = useState(false);
  const [editingBrandName, setEditingBrandName] = useState("");
  const [isHoveringBrandName, setIsHoveringBrandName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { logout, user } = useAuth();
  const { t, isRTL } = useLanguage();
  const { hasSectionAccess, getSectionLockMessage, subscription } =
    useSubscription();
  const { trialStatus } = useTrial();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const navigationGroups = getNavigationGroups(t, hasSectionAccess);

  const handleStartEditing = () => {
    setEditingBrandName(user?.companyName || "Pulse");
    setIsEditingBrandName(true);
  };

  const handleCancelEditing = () => {
    setIsEditingBrandName(false);
    setEditingBrandName("");
  };

  const handleSaveBrandName = async () => {
    if (!editingBrandName.trim()) {
      toast({
        title: "Error",
        description: "Brand name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      await brandSettingsAPI.update(brandId, {
        brandName: editingBrandName.trim(),
      });

      // Update the user context with the new brand name
      // This will trigger a re-render with the new name
      toast({
        title: "Success",
        description: "Brand name updated successfully!",
      });

      setIsEditingBrandName(false);
      setEditingBrandName("");

      // Force a page refresh to update the user context
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update brand name",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveBrandName();
    } else if (e.key === "Escape") {
      handleCancelEditing();
    }
  };

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
              <div
                className="flex items-center space-x-2 group"
                onMouseEnter={() => setIsHoveringBrandName(true)}
                onMouseLeave={() => setIsHoveringBrandName(false)}
              >
                {isEditingBrandName ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={editingBrandName}
                      onChange={(e) => setEditingBrandName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="h-8 text-white bg-white/20 border-white/30 text-sm font-semibold placeholder-white/70"
                      placeholder="Brand name"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSaveBrandName}
                      disabled={isSaving}
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                    >
                      {isSaving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEditing}
                      disabled={isSaving}
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold text-lg">
                      {user?.companyName || "Pulse"}
                    </span>
                    {/* Trial Counter */}
                    {trialStatus?.isTrialActive &&
                      trialStatus.daysRemaining > 0 && (
                        <div
                          className={`rounded-full px-2 py-1 cursor-help ${
                            trialStatus.daysRemaining <= 1
                              ? "bg-red-500/20 border border-red-400/30"
                              : "bg-orange-500/20 border border-orange-400/30"
                          }`}
                          title={`${trialStatus.plan.name} trial expires ${
                            trialStatus.trialEnd
                              ? new Date(
                                  trialStatus.trialEnd
                                ).toLocaleDateString()
                              : "soon"
                          }. Upgrade to continue using premium features.`}
                        >
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span
                              className={`text-xs font-medium ${
                                trialStatus.daysRemaining <= 1
                                  ? "text-red-300"
                                  : "text-orange-300"
                              }`}
                            >
                              {trialStatus.daysRemaining}{" "}
                              {trialStatus.daysRemaining === 1 ? "day" : "days"}{" "}
                              left
                            </span>
                          </div>
                        </div>
                      )}
                    <AnimatePresence>
                      {isHoveringBrandName && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleStartEditing}
                            className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
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
        {navigationGroups.map((group, groupIndex) => {
          // Show all groups - locked items will be displayed as clickable

          return (
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
                                animate={{
                                  rotate: isCollapsedSection ? 0 : 90,
                                }}
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
                                    const hasAccess = child.hasAccess !== false;

                                    if (!hasAccess) {
                                      return (
                                        <Link
                                          key={child.key}
                                          to={
                                            child.path?.replace(
                                              ":id",
                                              brandId
                                            ) || "#"
                                          }
                                          className="block"
                                        >
                                          <motion.div
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer opacity-80 hover:opacity-100 hover:bg-white/10 transition-all duration-150 text-white"
                                            title={getSectionLockMessage(
                                              child.key
                                            )}
                                            whileHover={{ x: 1 }}
                                          >
                                            <child.icon className="h-4 w-4" />
                                            <span className="font-medium text-sm">
                                              {child.label}
                                            </span>
                                            <span className="text-xs text-yellow-300 ml-auto">
                                              🔒
                                            </span>
                                          </motion.div>
                                        </Link>
                                      );
                                    }

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
                  const hasAccess = item.hasAccess !== false;

                  if (!hasAccess) {
                    return (
                      <Link
                        key={item.key}
                        to={item.path?.replace(":id", brandId) || "#"}
                        className="block"
                      >
                        <motion.div
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer opacity-80 hover:opacity-100 hover:bg-white/10 transition-all duration-150 text-white"
                          title={getSectionLockMessage(item.key)}
                          whileHover={{ x: 1 }}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                          <span className="text-xs text-yellow-300 ml-auto">
                            🔒
                          </span>
                        </motion.div>
                      </Link>
                    );
                  }

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
          );
        })}
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
                <TrialNotifications />
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
              <TrialNotifications />
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
