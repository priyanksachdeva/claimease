import React from "react";
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
  Activity
} from "lucide-react";

export default function Profile() {
  const menuItems = [
    { icon: <Bell size={20} className="text-amber-500" />, label: "Notifications", bg: "bg-amber-50" },
    { icon: <Shield size={20} className="text-emerald-500" />, label: "Privacy & Security", bg: "bg-emerald-50" },
    { icon: <CreditCard size={20} className="text-blue-500" />, label: "Payment Methods", bg: "bg-blue-50" },
    { icon: <FileText size={20} className="text-purple-500" />, label: "Terms & Policies", bg: "bg-purple-50" },
    { icon: <HelpCircle size={20} className="text-teal-500" />, label: "Help & Support", bg: "bg-teal-50" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 min-h-full bg-slate-50 relative"
    >
      {/* Hero Background */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 rounded-b-[2.5rem] shadow-lg overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl -ml-10 -mb-10" />
      </div>

      <div className="relative z-10 p-6 pt-12 space-y-6">
        <header className="flex justify-between items-center text-white mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <button className="w-10 h-10 bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-white/30 transition-colors">
            <Settings size={20} />
          </button>
        </header>

        {/* User Info Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative mt-4"
        >
          <div className="flex flex-col items-center -mt-16 mb-4">
            <div className="relative">
              <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/userprofile/200/200" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-teal-700 transition-colors">
                <Edit2 size={14} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-3">Priyank Sachdeva</h2>
            <p className="text-sm text-slate-500 font-medium">sachdevapriyank1@gmail.com</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                <Award size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Status</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">Premium</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-1.5 text-teal-600 mb-1">
                <Activity size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Claims</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">12 Processed</span>
            </div>
          </div>
        </motion.div>

        {/* Insurance Details */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active Policy</p>
                <h3 className="text-xl font-bold tracking-wide">HealthShield Pro</h3>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Shield size={20} className="text-teal-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Policy Number</p>
                <p className="font-mono font-medium text-sm">POL-8492-771</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Valid Upto</p>
                <p className="font-medium text-sm">Dec 2027</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Menu Options */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden"
        >
          {menuItems.map((item, index) => (
            <button 
              key={item.label}
              className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-slate-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg}`}>
                  {item.icon}
                </div>
                <span className="font-semibold text-slate-700 text-sm">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          ))}
        </motion.div>

        {/* Logout Button */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button 
            onClick={() => {
              localStorage.removeItem("claimEase_onboarded");
              window.location.href = "/onboarding";
            }}
            className="w-full bg-white border border-rose-100 text-rose-600 rounded-[2rem] p-4 font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-rose-50 transition-colors"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
