import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MobileLayout from "./components/MobileLayout";
import NotificationCenter from "./components/NotificationCenter";
import Dashboard from "./pages/Dashboard";
import Bills from "./pages/Bills";
import Upload from "./pages/Upload";
import Claims from "./pages/Claims";
import Messages from "./pages/Messages";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PaymentMethods from "./pages/PaymentMethods";
import HelpSupport from "./pages/HelpSupport";
import TermsPolicies from "./pages/TermsPolicies";
import PrivacySecurity from "./pages/PrivacySecurity";
import Guidelines from "./pages/Guidelines";
import Notifications from "./pages/Notifications";
import Partners from "./pages/Partners";
import { useAuthStore } from "./lib/store";
import { API_ENDPOINTS } from "./config/api";

// Simple auth guard - allow demo access in development
const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, user, login, logout } = useAuthStore();
  const [demoLoaded, setDemoLoaded] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const isOnboarded = localStorage.getItem("claimEase_onboarded");

  // Initialize demo login if needed (development only)
  useEffect(() => {
    if (!demoLoaded) {
      // Only enable demo login in development
      const isDevelopment = import.meta.env.MODE === 'development' || !import.meta.env.PROD;
      
      if (isDevelopment && !isAuthenticated && !user) {
        // Try to authenticate with backend demo user
        fetch(API_ENDPOINTS.AUTH_LOGIN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: import.meta.env.VITE_DEMO_EMAIL,
            password: import.meta.env.VITE_DEMO_PASSWORD,
          }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Auth failed: ${res.status} ${res.statusText}`);
            }
            return res.json();
          })
          .then((data) => {
            if (data.user && data.token) {
              login(data.user, data.token);
            } else {
              logout();
              setAuthError("Invalid credentials received for demo login.");
              console.error("Demo login partial response:", data);
            }
          })
          .catch((err) => {
            console.error("Failed to auto-login:", err);
            setAuthError("Failed to connect to backend. Please refresh the page.");
          })
          .finally(() => setDemoLoaded(true));
      } else {
        setDemoLoaded(true);
      }
    }
  }, [demoLoaded, isAuthenticated, user, login]);

  // Allow access if authenticated
  if (isAuthenticated) {
    return children;
  }

  // If auth error occurred, show error and redirect to login
  if (demoLoaded && authError) {
    return <Navigate to="/onboarding" replace />;
  }

  // If not authenticated but onboarded, redirect to login
  if (isOnboarded && demoLoaded && !isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
  }

  // If not authenticated and not onboarded, go to onboarding
  if (!isOnboarded && demoLoaded) {
    return <Navigate to="/onboarding" replace />;
  }

  // While loading, show a loading screen
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600 font-medium">Loading ClaimEase...</p>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <NotificationCenter />
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Navigate to="/onboarding" replace />} />
        <Route path="/" element={<RequireAuth><MobileLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="bills" element={<Bills />} />
          <Route path="upload" element={<Upload />} />
          <Route path="claims" element={<Claims />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
          <Route path="help" element={<HelpSupport />} />
          <Route path="terms" element={<TermsPolicies />} />
          <Route path="privacy" element={<PrivacySecurity />} />
          <Route path="guidelines" element={<Guidelines />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="partners" element={<Partners />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
