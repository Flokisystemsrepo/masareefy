import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  BarChart3,
  Activity,
  Settings,
  Shield,
  Lock,
  AlertTriangle,
  Eye,
  MessageSquare,
} from "lucide-react";

const AdminSidebar: React.FC = () => {
  const navItems = [
    {
      to: "/admin/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      exact: true,
    },
    {
      to: "/admin/dashboard/users",
      icon: Users,
      label: "Users",
    },
    {
      to: "/admin/dashboard/brands",
      icon: Building2,
      label: "Brands",
    },
    {
      to: "/admin/dashboard/subscriptions",
      icon: CreditCard,
      label: "Subscriptions",
    },
    {
      to: "/admin/dashboard/analytics",
      icon: BarChart3,
      label: "Analytics",
    },
    {
      to: "/admin/dashboard/tickets",
      icon: MessageSquare,
      label: "Support Tickets",
    },
    {
      to: "/admin/dashboard/system-health",
      icon: Activity,
      label: "System Health",
    },
    {
      to: "/admin/dashboard/security",
      icon: Shield,
      label: "Security Center",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-40 pt-16">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Admin Portal</span>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
