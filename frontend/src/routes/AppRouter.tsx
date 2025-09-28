// src/routes/AppRouter.tsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import JobDetails from "../pages/JobDetails";
import ApplyJob from "../pages/ApplyJob";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../pages/adminDashboard"; 
import { useAuth } from "../context/useAuth";
import MainLayout from "../layouts/mainLayout";

const AppRouter: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Remove loading check since 'loading' is not available

  return (
    <Routes>
      {/* Routes with Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/apply/:id"
          element={
            user ? (
              <ApplyJob />
            ) : (
              <Navigate to={`/login?redirect=${location.pathname}`} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            user && user.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to={`/login?redirect=${location.pathname}`} />
            )
          }
        />
      </Route>

      {/* Routes WITHOUT Navbar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRouter;
