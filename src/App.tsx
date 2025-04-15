
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
import Regions from "@/pages/Regions"; // Added Regions import
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
            <Route path="/reports/new" element={<ReportDetail />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/incidents/new" element={<NewIncident />} />
            <Route path="/incidents/:id" element={<IncidentDetail />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin Only Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/regions" element={<Regions />} /> {/* Added Regions route */}
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
