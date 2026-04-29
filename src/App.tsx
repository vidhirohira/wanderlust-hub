import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import Stays from "./pages/Stays";
import TransportPage from "./pages/TransportPage";
import Weather from "./pages/Weather";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import PlanTour from "./pages/PlanTour";
import SearchPage from "./pages/SearchPage";
import ManagerLayout from "./pages/manager/ManagerLayout";
import Overview from "./pages/manager/Overview";
import Analytics from "./pages/manager/Analytics";
import ScrapeManager from "./pages/manager/ScrapeManager";
import ManagerUsers from "./pages/manager/ManagerUsers";
import Crud from "./pages/manager/Crud";
import NotFound from "./pages/NotFound.tsx";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/stays" element={<Stays />} />
              <Route path="/transport" element={<TransportPage />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/plan-tour" element={<PlanTour />} />
            </Route>
            <Route path="/admin" element={<Navigate to="/auth" replace />} />
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<Overview />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="scrape" element={<ScrapeManager />} />
              <Route path="users" element={<ManagerUsers />} />
              <Route path="crud" element={<Crud />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
