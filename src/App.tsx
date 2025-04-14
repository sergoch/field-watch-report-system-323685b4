import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import NewReport from "./pages/NewReport";
import Incidents from "./pages/Incidents";
import NewIncident from "./pages/NewIncident";
import Workers from "./pages/Workers";
import Equipment from "./pages/Equipment";
import Analytics from "./pages/Analytics";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected routes for both engineers and admins */}
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
            
            {/* Admin-only routes */}
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div>Users Management (to be implemented)</div>
              </ProtectedRoute>
            } />
            <Route path="/workers" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Workers />
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
                <div>Settings (to be implemented)</div>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
