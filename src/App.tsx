import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MobileLayout from "./components/MobileLayout";
import Dashboard from "./pages/Dashboard";
import Bills from "./pages/Bills";
import Upload from "./pages/Upload";
import Claims from "./pages/Claims";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";

// Temporary placeholder components for other routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full pt-20">
    <h1 className="text-2xl font-bold text-slate-400">{title}</h1>
  </div>
);

// Simple auth guard
const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const isOnboarded = localStorage.getItem("claimEase_onboarded");
  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<RequireAuth><MobileLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="bills" element={<Bills />} />
          <Route path="upload" element={<Upload />} />
          <Route path="claims" element={<Claims />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
