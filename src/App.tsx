
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "@/pages/Dashboard";
import Equipment from "@/pages/Equipment";
import Workers from "@/pages/Workers";
import Reports from "@/pages/Reports";
import ReportDetail from "@/pages/ReportDetail";
import Incidents from "@/pages/Incidents";
import NewIncident from "@/pages/NewIncident";
import IncidentDetail from "@/pages/IncidentDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Regions from "@/pages/Regions";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import Unauthorized from "@/pages/Unauthorized";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="workers" element={<Workers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          <Route path="reports/new" element={<ReportDetail />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/new" element={<NewIncident />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
          <Route path="profile" element={<Profile />} />
          
          {/* Admin Only Routes */}
          <Route element={<AdminRoute />}>
            <Route path="regions" element={<Regions />} />
            <Route path="settings" element={<Settings />} />
            <Route path="users" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
