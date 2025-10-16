import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

// 📄 Pages
import Dashboard from "../pages/Dashboard";
import JobDetails from "../pages/JobDetails";
import ApplyJob from "../pages/ApplyJob";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../pages/adminDashboard";
import ApplicationPage from "../pages/ApplicationPage";
import MyApplicationPage from "../pages/MyApplicationPage";
import UserManagement from "../pages/UserManagement";
import AdminStats from "../pages/AdminStats";
import AdminMonthlyReport from "../pages/AdminReports";
import MainLayout from "../layouts/mainLayout";


// Protected Route (for normal logged-in users)

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return <>{children}</>;
};


//Admin-only Route

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (!user) {
    return <p className="text-center mt-4 text-muted">Checking admin access...</p>;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};


// Main Router

const AppRouter: React.FC = () => (
  <Routes>
    {/* Shared layout (includes Navbar, Footer, etc.) */}
    <Route element={<MainLayout />}>
      {/*  Public routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/jobs/:id" element={<JobDetails />} />

      {/* User-protected routes */}
      <Route
        path="/apply/:id"
        element={
          <ProtectedRoute>
            <ApplyJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <MyApplicationPage />
          </ProtectedRoute>
        }
      />

      {/*Admin-only routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <AdminRoute>
            <ApplicationPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/stats"
        element={
          <AdminRoute>
            <AdminStats />
          </AdminRoute>
        }
      />

      {/*New Monthly Report Route */}
      <Route
        path="/admin/report"
        element={
          <AdminRoute>
            <AdminMonthlyReport />
          </AdminRoute>
        }
      />
    </Route>

    {/* Auth routes (no layout) */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Fallback route */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRouter;
