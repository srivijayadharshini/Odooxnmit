import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ToastContainer } from "@/components/ui";
import AppLayout from "@/layouts/AppLayout";

// Pages
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import HRDashboard from "@/pages/HRDashboard";
import Profile from "@/pages/Profile";
import Attendance from "@/pages/Attendance";
import HRAttendance from "@/pages/HRAttendance";
import Leave from "@/pages/Leave";
import LeaveApproval from "@/pages/LeaveApproval";
import Payroll from "@/pages/Payroll";
import PayrollManagement from "@/pages/PayrollManagement";
import Employees from "@/pages/Employees";
import EmployeeDetail from "@/pages/EmployeeDetail";
import Notifications from "@/pages/Notifications";
import Reports from "@/pages/Reports";
import Documents from "@/pages/Documents";
import Settings from "@/pages/Settings";

function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-slide">{children}</div>;
}

function ProtectedRoute({ children, hrOnly = false }: { children: React.ReactNode; hrOnly?: boolean }) {
  const { isAuthenticated, isHR } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (hrOnly && !isHR) return <Navigate to="/dashboard" replace />;
  return <AppLayout><PageTransition>{children}</PageTransition></AppLayout>;
}

function RoleBasedDashboard() {
  const { isHR } = useAuth();
  return isHR ? <HRDashboard /> : <Dashboard />;
}

function RoleBasedAttendance() {
  const { isHR } = useAuth();
  return isHR ? <HRAttendance /> : <Attendance />;
}

function RoleBasedLeave() {
  const { isHR } = useAuth();
  return isHR ? <LeaveApproval /> : <Leave />;
}

function RoleBasedPayroll() {
  const { isHR } = useAuth();
  return isHR ? <PayrollManagement /> : <Payroll />;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
      <Route path="/signup" element={<AuthRedirect><Signup /></AuthRedirect>} />

      <Route path="/dashboard" element={<ProtectedRoute><RoleBasedDashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><RoleBasedAttendance /></ProtectedRoute>} />
      <Route path="/leave" element={<ProtectedRoute><RoleBasedLeave /></ProtectedRoute>} />
      <Route path="/payroll" element={<ProtectedRoute><RoleBasedPayroll /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* HR / Admin only */}
      <Route path="/employees" element={<ProtectedRoute hrOnly><Employees /></ProtectedRoute>} />
      <Route path="/employees/:id" element={<ProtectedRoute hrOnly><EmployeeDetail /></ProtectedRoute>} />
      <Route path="/employees/:id/edit" element={<ProtectedRoute hrOnly><EmployeeDetail /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute hrOnly><Reports /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
          <ToastContainer />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
