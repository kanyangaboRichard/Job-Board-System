// src/routes/AppRouter.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import JobDetails from "../pages/JobDetails";
import ApplyJob from "../pages/ApplyJob";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../pages/AdminDashboard";
import { useAuth } from "../context/useAuth";

const AppRouter: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/jobs/:id" element={<JobDetails />} />

      {/* Protected: applying for jobs */}
      <Route
        path="/apply/:id"
        element={user ? <ApplyJob /> : <Navigate to="/login" />}
      />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin-only */}
      <Route
        path="/admin"
        element={
          user && user.role === "admin" ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRouter;
