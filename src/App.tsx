import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SafeAuthProvider } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { AdminProvider } from "./contexts/AdminContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import "./utils/clearAuthState"; // Import to make emergency function available
import Landing from "./pages/Landing";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import OnboardingPage from "./pages/Onboarding";
import SuccessPage from "./pages/brand/Success";
import BrandLayout from "./components/layout/BrandLayout";
import Dashboard from "./pages/brand/Dashboard";
import Revenues from "./pages/brand/Revenues";
import Costs from "./pages/brand/Costs";
import WalletPage from "./pages/brand/Wallet";
import TransfersPage from "./pages/brand/Transfers";
import ReceivablesPayablesPage from "./pages/brand/ReceivablesPayables";
import InventoryPage from "./pages/brand/Inventory";
import BestSellersPage from "./pages/brand/BestSellers";
import OrdersPage from "./pages/brand/Integrations";
import TasksPage from "./pages/brand/Tasks";
import ReportsPage from "./pages/brand/Reports";
import SettingsPage from "./pages/brand/Settings";
import SubscriptionPage from "./pages/brand/Subscription";
import Support from "./pages/Support";
import UserTickets from "./pages/UserTickets";
import NotFound from "./pages/NotFound";

// Admin imports
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSystemHealth from "./pages/admin/AdminSystemHealth";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminLayout from "./components/admin/AdminLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId="in@a">
        <LanguageProvider>
          <SafeAuthProvider>
            <SubscriptionProvider>
              <AdminProvider>
                <TooltipProvider>
                  <BrowserRouter>
                    <Routes>
                      {/* Regular user routes */}
                      <Route path="/" element={<Landing />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/onboarding" element={<OnboardingPage />} />
                      <Route path="/success" element={<SuccessPage />} />
                      <Route path="/support" element={<Support />} />
                      <Route
                        path="/brand/:brandId"
                        element={
                          <ProtectedRoute>
                            <BrandLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<Dashboard />} />
                        <Route path="revenues" element={<Revenues />} />
                        <Route path="costs" element={<Costs />} />
                        <Route path="wallet" element={<WalletPage />} />
                        <Route path="transfers" element={<TransfersPage />} />
                        <Route
                          path="receivables-payables"
                          element={<ReceivablesPayablesPage />}
                        />
                        <Route path="inventory" element={<InventoryPage />} />
                        <Route
                          path="best-sellers"
                          element={<BestSellersPage />}
                        />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="tasks" element={<TasksPage />} />
                        <Route path="support" element={<Support />} />
                        <Route path="my-tickets" element={<UserTickets />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route
                          path="subscription"
                          element={<SubscriptionPage />}
                        />
                      </Route>

                      {/* Admin routes */}
                      <Route path="/admin" element={<AdminLogin />} />
                      <Route
                        path="/admin/dashboard"
                        element={
                          <AdminProtectedRoute>
                            <AdminLayout />
                          </AdminProtectedRoute>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="brands" element={<AdminBrands />} />
                        <Route
                          path="subscriptions"
                          element={<AdminSubscriptions />}
                        />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route
                          path="system-health"
                          element={<AdminSystemHealth />}
                        />
                        <Route path="security" element={<AdminSecurity />} />
                        <Route path="tickets" element={<AdminTickets />} />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </AdminProvider>
            </SubscriptionProvider>
          </SafeAuthProvider>
        </LanguageProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
