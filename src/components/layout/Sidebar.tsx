
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Users, 
  BarChart3, 
  ShoppingCart,
  ChevronLeft,
  Bell,
  User,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  brandId: string;
  currentPath: string;
}

const navigationGroups = [
  {
    label: 'OVERVIEW',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/brand/:id', key: 'dashboard' }
    ]
  },
  {
    label: 'FINANCIAL',
    items: [
      { icon: DollarSign, label: 'Revenues', path: '/brand/:id/revenues', key: 'revenues' },
      { icon: FileText, label: 'Costs', path: '/brand/:id/costs', key: 'costs' },
      { icon: Wallet, label: 'Wallet', path: '/brand/:id/wallet', key: 'wallet' },
      { icon: ArrowLeftRight, label: 'Transfers', path: '/brand/:id/transfers', key: 'transfers' },
      { icon: BarChart3, label: 'Receivables/Payables', path: '/brand/:id/receivables-payables', key: 'receivables' }
    ]
  },
  {
    label: 'OPERATIONS',
    items: [
      { icon: Target, label: 'Project Targets', path: '/brand/:id/project-targets', key: 'targets' },
      { icon: Package, label: 'Inventory', path: '/brand/:id/inventory', key: 'inventory' },
      { icon: Trophy, label: 'Best Sellers', path: '/brand/:id/best-sellers', key: 'bestsellers' }
    ]
  },
  {
    label: 'CREATIVE',
    items: [
      { icon: Palette, label: 'Creative Drafts', path: '/brand/:id/creative-drafts', key: 'creative' }
    ]
  },
  {
    label: 'INTEGRATIONS',
    items: [
      { icon: ShoppingCart, label: 'Shopify Integration', path: '/brand/:id/shopify-integration', key: 'shopify' }
    ]
  },
  {
    label: 'MANAGEMENT',
    items: [
      { icon: Target, label: 'Tasks', path: '/brand/:id/tasks', key: 'tasks' },
      { icon: Users, label: 'Team', path: '/brand/:id/team', key: 'team' }
    ]
  },
  {
    label: 'ANALYSIS',
    items: [
      { icon: BarChart3, label: 'Reports', path: '/brand/:id/reports', key: 'reports' }
    ]
  },
  {
    label: 'SETTINGS',
    items: [
      { icon: Settings, label: 'Settings', path: '/brand/:id/settings', key: 'settings' }
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ brandId, currentPath }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (itemKey: string) => {
    return currentPath.includes(itemKey) || (itemKey === 'dashboard' && currentPath === `/brand/${brandId}`);
  };

  const getItemPath = (path: string) => {
    return path.replace(':id', brandId);
  };

  return (
    <motion.div
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-gray-900">Masareefy</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 h-8 w-8"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.label} className="mb-6">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  className="px-4 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {group.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-1 px-2">
              {group.items.map((item, itemIndex) => {
                const active = isActive(item.key);
                return (
                  <motion.a
                    key={item.key}
                    href={getItemPath(item.path)}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                      active 
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onMouseEnter={() => setHoveredItem(item.key)}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className={cn(
                      "flex-shrink-0 h-5 w-5",
                      active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                    )} />
                    
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          className="ml-3"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && hoveredItem === item.key && (
                      <motion.div
                        className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        {item.label}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 border-r-4 border-r-gray-900 border-y-4 border-y-transparent" />
                      </motion.div>
                    )}

                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.a>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                  <p className="text-xs text-gray-500 truncate">john@example.com</p>
                </div>
                <Bell className="h-4 w-4 text-gray-400" />
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
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
              <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 h-8 w-8 text-red-600">
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
