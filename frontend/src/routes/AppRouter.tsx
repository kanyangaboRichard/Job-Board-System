import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

import Dashboard from "../pages/Dashboard";
import JobDetails from "../pages/JobDetails";
import ApplyJob from "../pages/ApplyJob";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../pages/AdminDashboard";
import ApplicationPage from "../pages/ApplicationPage";
import MyApplicationPage from "../pages/MyApplicationPage";
import UserManagement from "../pages/UserManagement";
import MainLayout from "../layouts/MainLayout";

/* --------------------------
 ✅ Protected Route (for users)
---------------------------*/
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!token) {
    // Not logged in → redirect to login page
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return <>{children}</>;
};

/* --------------------------
 ✅ Admin-only Route
---------------------------*/
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  // Wait for Redux user to load
  if (!user) {
    return <p className="text-center mt-4 text-muted">Checking admin access...</p>;
  }

  // Deny non-admin users
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/* --------------------------
 ✅ Main Router
---------------------------*/
const AppRouter: React.FC = () => (
  <Routes>
    {/* Shared layout (includes Navbar) */}
    <Route element={<MainLayout />}>
      {/* Public routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/jobs/:id" element={<JobDetails />} />

      {/* Protected routes (user must be logged in) */}
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

      {/* ✅ Admin routes (secure and stable) */}
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
    </Route>

    {/* Auth routes (no Navbar) */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Fallback (invalid URLs) */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRouter;
