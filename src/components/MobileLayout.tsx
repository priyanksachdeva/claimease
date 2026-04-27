import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Home, IndianRupee, PlusCircle, ShieldCheck, MessageSquare, User } from "lucide-react";
import { motion } from "motion/react";

export default function MobileLayout() {
  return (
    <div className="flex justify-center h-[100dvh] bg-gray-100 overflow-hidden">
      {/* Mobile Device Container */}
      <div className="w-full max-w-md bg-slate-50 h-[100dvh] shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
          <Outlet />
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="absolute bottom-0 w-full bg-white px-6 py-2.5 flex justify-between items-center z-[100] rounded-t-[24px] shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
          <NavItem to="/" icon={<Home size={22} />} activeIcon={<Home size={22} fill="currentColor" />} label="Home" />
          <NavItem to="/bills" icon={<IndianRupee size={22} />} activeIcon={<IndianRupee size={22} strokeWidth={2.5} />} label="Bills" />
          
          {/* Floating Action Button for Upload */}
          <div className="relative -top-7 mx-2">
            <NavLink to="/upload" aria-label="Upload Bill">
              {({ isActive }) => (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(13,139,149,0.3)] text-white border-[4px] border-[#F6F9F9] ${isActive ? 'bg-[#0a6d75]' : 'bg-[#0D8B95]'}`}
                >
                  <PlusCircle size={28} strokeWidth={2.5} />
                </motion.div>
              )}
            </NavLink>
          </div>

          <NavItem to="/claims" icon={<ShieldCheck size={22} />} activeIcon={<ShieldCheck size={22} strokeWidth={2.5} />} label="Claims" />
          <NavItem to="/profile" icon={<User size={22} />} activeIcon={<User size={22} strokeWidth={2.5} />} label="Profile" />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ to, icon, activeIcon, label }: { to: string; icon: React.ReactNode; activeIcon: React.ReactNode; label: string }) {
  return (
    <NavLink to={to} className="flex flex-col items-center justify-center pt-1 pb-1 w-12">
      {({ isActive }) => (
        <>
          <div className={`mb-1 transition-colors ${isActive ? 'text-[#0D8B95]' : 'text-slate-400'}`}>
            {isActive ? activeIcon : icon}
          </div>
          <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[#0D8B95]' : 'text-slate-400'}`}>{label}</span>
        </>
      )}
    </NavLink>
  );
}
