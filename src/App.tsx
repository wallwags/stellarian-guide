import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Dreams from "./pages/Dreams";
import Rituals from "./pages/Rituals";
import Map from "./pages/Map";
import Profile from "./pages/Profile";
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
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* App Routes with AppShell */}
          <Route path="/home" element={<AppShell><Home /></AppShell>} />
          <Route path="/dreams" element={<AppShell><Dreams /></AppShell>} />
          <Route path="/rituals" element={<AppShell><Rituals /></AppShell>} />
          <Route path="/map" element={<AppShell><Map /></AppShell>} />
          <Route path="/profile" element={<AppShell><Profile /></AppShell>} />
          
          {/* Redirect old dashboard to home */}
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
