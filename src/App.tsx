import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import Stays from "./pages/Stays";
import TransportPage from "./pages/TransportPage";
import Weather from "./pages/Weather";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ManageDestinations from "./pages/admin/ManageDestinations";
import ManageHotels from "./pages/admin/ManageHotels";
import ManageRestaurants from "./pages/admin/ManageRestaurants";
import ManageTransport from "./pages/admin/ManageTransport";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/stays" element={<Stays />} />
            <Route path="/transport" element={<TransportPage />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/admin" element={<AdminLogin />} />
          </Route>
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="destinations" element={<ManageDestinations />} />
            <Route path="hotels" element={<ManageHotels />} />
            <Route path="restaurants" element={<ManageRestaurants />} />
            <Route path="transport" element={<ManageTransport />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
