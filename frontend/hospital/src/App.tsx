import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore, useNotificationStore } from "./lib/store";
import { apiClient } from "./lib/api";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationCenter from "./components/NotificationCenter";
import Messages from "./pages/Messages";

export default function HospitalApp() {
  const { user, token, setUser, setToken } = useAuthStore();
  const { notifications } = useNotificationStore();

  // Load user from API on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token && !user) {
        try {
          const currentUser = await apiClient.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          // Token is invalid, clear it
          setToken(null);
          setUser(null);
        }
      }
    };

    loadUser();
  }, [token, user, setUser, setToken]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="hospital">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute requiredRole="hospital">
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              user && token ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Notification Center */}
        <NotificationCenter />
      </div>
    </BrowserRouter>
  );
}
