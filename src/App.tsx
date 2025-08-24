
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import BrandLayout from "./components/layout/BrandLayout";
import Dashboard from "./pages/brand/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/brand/:brandId" element={<BrandLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="revenues" element={<div className="p-6">Revenues Page</div>} />
            <Route path="costs" element={<div className="p-6">Costs Page</div>} />
            <Route path="wallet" element={<div className="p-6">Wallet Page</div>} />
            <Route path="transfers" element={<div className="p-6">Transfers Page</div>} />
            <Route path="receivables-payables" element={<div className="p-6">Receivables/Payables Page</div>} />
            <Route path="project-targets" element={<div className="p-6">Project Targets Page</div>} />
            <Route path="inventory" element={<div className="p-6">Inventory Page</div>} />
            <Route path="best-sellers" element={<div className="p-6">Best Sellers Page</div>} />
            <Route path="creative-drafts" element={<div className="p-6">Creative Drafts Page</div>} />
            <Route path="shopify-integration" element={<div className="p-6">Shopify Integration Page</div>} />
            <Route path="tasks" element={<div className="p-6">Tasks Page</div>} />
            <Route path="team" element={<div className="p-6">Team Page</div>} />
            <Route path="reports" element={<div className="p-6">Reports Page</div>} />
            <Route path="settings" element={<div className="p-6">Settings Page</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
