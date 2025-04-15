
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEffect } from "react";
import { initializeApp } from "@/utils/supabase/realtime";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import NewReport from "./pages/NewReport";
import Incidents from "./pages/Incidents";
import NewIncident from "./pages/NewIncident";
import Workers from "./pages/Workers";
import NewWorker from "./pages/NewWorker";
import Equipment from "./pages/Equipment";
import Analytics from "./pages/Analytics";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: true,
      retry: 1
    }
  }
});

const App = () => {
  // Initialize app with realtime capabilities
  useEffect(() => {
    initializeApp().then(() => {
      console.log("App initialized with realtime capabilities");
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/reports/new" element={
                <ProtectedRoute>
                  <NewReport />
                </ProtectedRoute>
              } />
              <Route path="/incidents" element={
                <ProtectedRoute>
                  <Incidents />
                </ProtectedRoute>
              } />
              <Route path="/incidents/new" element={
                <ProtectedRoute>
                  <NewIncident />
                </ProtectedRoute>
              } />
              
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="/workers" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Workers />
                </ProtectedRoute>
              } />
              <Route path="/workers/new" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <NewWorker />
                </ProtectedRoute>
              } />
              <Route path="/equipment" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Equipment />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Settings />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
