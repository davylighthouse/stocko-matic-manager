
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import StockManagement from "./pages/StockManagement";
import Upload from "./pages/Upload";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import StockChecks from "./pages/StockChecks";
import Sales from "./pages/Sales";
import RawData from "./pages/RawData";
import Settings from "./pages/Settings";
import Profitability from "./pages/Profitability";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="stock" element={<StockManagement />} />
              <Route path="stock-checks" element={<StockChecks />} />
              <Route path="sales" element={<Sales />} />
              <Route path="raw-data" element={<RawData />} />
              <Route path="profitability" element={<Profitability />} />
              <Route path="upload" element={<Upload />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
