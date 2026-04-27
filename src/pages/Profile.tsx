import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Edit2,
  CreditCard,
  FileText,
  Award,
  Activity,
  Building2
} from "lucide-react";
import { useAuthStore, useNotificationStore } from "../lib/store";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [claimCount, setClaimCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [insurance, setInsurance] = useState<any>(null);
  const [hospital, setHospital] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch all data in parallel
        const [profileRes, claimsRes, orgsRes] = await Promise.all([
          fetch(API_ENDPOINTS.AUTH_ME, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(API_ENDPOINTS.CLAIMS_MY, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(API_ENDPOINTS.ORGANIZATIONS, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        // Process profile
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUserProfile(profile);
        }

        // Process claims
        if (claimsRes.ok) {
          const claims = await claimsRes.json();
          setClaimCount(claims.length);
          setPendingCount(claims.filter((c: any) => c.status === "submitted" || c.status === "pending").length);
        }

        // Process organizations
        const savedInsurance = localStorage.getItem("claimEase_selectedInsurance");
        const savedHospital = localStorage.getItem("claimEase_selectedHospital");

        if (savedInsurance) {
          setInsurance(JSON.parse(savedInsurance));
        } else if (orgsRes.ok) {
          const orgsData = await orgsRes.json();
          const orgsArray = Array.isArray(orgsData) ? orgsData : (orgsData.organizations || []);
          const insuranceOrg = orgsArray.find((org: any) => org.type === "insurance");
          setInsurance(insuranceOrg);
        }

        if (savedHospital) {
          setHospital(JSON.parse(savedHospital));
        } else if (orgsRes.ok) {
          const orgsData = await orgsRes.json();
          const orgsArray = Array.isArray(orgsData) ? orgsData : (orgsData.organizations || []);
          const hospitalOrg = orgsArray.find((org: any) => org.type === "hospital");
          setHospital(hospitalOrg);
        }
      } catch (error) {
        console.error("Failed to fetch profile data", error);
        addNotification("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, addNotification]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "Loading...";
  const displayEmail = userProfile?.email || "user@example.com";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F9F9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D8B95] mx-auto mb-4"></div>
          <p className="text-slate-500 text-[14px] font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: <Bell size={20} className="text-amber-500" />, label: "Notifications", bg: "bg-amber-50", route: "/notifications" },
    { icon: <Shield size={20} className="text-emerald-500" />, label: "Privacy & Security", bg: "bg-emerald-50", route: "/privacy" },
    { icon: <Building2 size={20} className="text-blue-500" />, label: "Our Partners", bg: "bg-blue-50", route: "/partners" },
    { icon: <FileText size={20} className="text-purple-500" />, label: "Terms & Policies", bg: "bg-purple-50", route: "/terms" },
    { icon: <HelpCircle size={20} className="text-[#0D8B95]" />, label: "Help & Support", bg: "bg-[#E6F5F4]", route: "/help" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-28 min-h-full bg-[#F6F9F9] relative"
    >
      {/* Hero Background */}
      <div className="absolute top-0 left-0 right-0 h-56 bg-gradient-to-br from-[#0A7A83] via-[#0D8B95] to-[#0B6B73] rounded-b-[36px] overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/8 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full blur-2xl -ml-8 -mb-8" />
      </div>

      <div className="relative z-10 px-5 pt-10">
        {/* Header */}
        <header className="flex justify-between items-center text-white mb-10">
          <h1 className="text-[22px] font-bold tracking-tight">Profile</h1>
          <button onClick={() => navigate("/settings")} className="w-10 h-10 bg-white/15 backdrop-blur-md border border-white/15 rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-colors">
            <Settings size={19} strokeWidth={2} />
          </button>
        </header>

        {/* User Info Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-100/80 relative"
        >
          {/* Avatar - overlapping the card top */}
          <div className="flex flex-col items-center -mt-14 mb-3">
            <div className="relative">
              <div className="w-[88px] h-[88px] bg-[#E6F5F4] rounded-full flex items-center justify-center border-[4px] border-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.email || "default"}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute -bottom-0.5 -right-0.5 w-[28px] h-[28px] bg-[#0D8B95] text-white rounded-full flex items-center justify-center border-[2.5px] border-white shadow-sm hover:bg-[#0A7A83] transition-colors">
                <Edit2 size={12} strokeWidth={2.5} />
              </button>
            </div>
            <h2 className="text-[20px] font-extrabold text-[#0B2239] mt-2.5 tracking-tight">{displayName}</h2>
            <p className="text-[13px] text-slate-400 font-medium">{displayEmail}</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-slate-100">
            <div className="flex flex-col items-center justify-center py-2.5 px-3 bg-[#FAFAFA] rounded-[16px]">
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                <Award size={14} strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Claims</span>
              </div>
              <span className="text-[13px] font-bold text-[#0B2239]">{claimCount} Processed</span>
            </div>
            <div className="flex flex-col items-center justify-center py-2.5 px-3 bg-[#FAFAFA] rounded-[16px]">
              <div className="flex items-center gap-1.5 text-[#0D8B95] mb-1">
                <Activity size={14} strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Pending</span>
              </div>
              <span className="text-[13px] font-bold text-[#0B2239]">{pendingCount} Active</span>
            </div>
          </div>
        </motion.div>

        {/* Insurance & Hospital Details */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Insurance Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-[#1E293B] rounded-[20px] p-4 text-white relative overflow-hidden min-h-[140px]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.12em] mb-1">Insurance Provider</p>
                <h3 className="text-[15px] font-bold leading-tight tracking-tight">{insurance?.name || "Not Selected"}</h3>
              </div>
              {insurance && (
                <div className="bg-white/8 px-3 py-2 rounded-[12px] mt-3">
                  <p className="text-slate-400 text-[8px] font-bold uppercase tracking-[0.12em] mb-0.5">Status</p>
                  <p className={`font-semibold text-[12px] ${insurance.isActive !== false ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {insurance.isActive !== false ? "Active" : "Inactive"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Hospital Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1E3A5F] rounded-[20px] p-4 text-white relative overflow-hidden min-h-[140px]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <p className="text-blue-300 text-[9px] font-bold uppercase tracking-[0.12em] mb-1">Associated Hospital</p>
                <h3 className="text-[15px] font-bold leading-tight tracking-tight">{hospital?.name || "Not Selected"}</h3>
              </div>
              {hospital && (
                <div className="bg-white/8 px-3 py-2 rounded-[12px] mt-3">
                  <p className="text-blue-300 text-[8px] font-bold uppercase tracking-[0.12em] mb-0.5">Status</p>
                  <p className={`font-semibold text-[12px] ${hospital.isActive !== false ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {hospital.isActive !== false ? "Connected" : "Disconnected"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Menu Options */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-[22px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80 overflow-hidden mt-5"
        >
          {menuItems.map((item, index) => (
            <button 
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 active:bg-slate-100/60 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-slate-50' : ''
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-[38px] h-[38px] rounded-[12px] flex items-center justify-center ${item.bg}`}>
                  {item.icon}
                </div>
                <span className="font-semibold text-[#0B2239] text-[14px]">{item.label}</span>
              </div>
              <ChevronRight size={17} className="text-slate-300" strokeWidth={2.5} />
            </button>
          ))}
        </motion.div>

        {/* Logout Button */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <button 
            onClick={handleLogout}
            className="w-full bg-white border border-rose-100 text-rose-500 rounded-[18px] py-3.5 font-bold text-[15px] flex items-center justify-center gap-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:bg-rose-50/50 active:bg-rose-50 transition-colors"
          >
            <LogOut size={19} strokeWidth={2.5} />
            Log Out
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
