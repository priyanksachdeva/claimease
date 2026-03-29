import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Home, IndianRupee, PlusCircle, ShieldCheck, User } from "lucide-react";
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
        <nav className="absolute bottom-0 w-full bg-white border-t border-slate-200 px-6 py-3 pb-safe flex justify-between items-center z-[100] rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
          <NavItem to="/" icon={<Home size={24} />} label="Home" />
          <NavItem to="/bills" icon={<IndianRupee size={24} />} label="Bills" />
          
          {/* Floating Action Button for Upload */}
          <div className="relative -top-6">
            <NavLink to="/upload">
              {({ isActive }) => (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white ${isActive ? 'bg-teal-700' : 'bg-teal-600'}`}
                >
                  <PlusCircle size={28} />
                </motion.div>
              )}
            </NavLink>
          </div>

          <NavItem to="/claims" icon={<ShieldCheck size={24} />} label="Claims" />
          <NavItem to="/profile" icon={<User size={24} />} label="Profile" />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}>
      {({ isActive }) => (
        <>
          <div className="relative">
            {icon}
            {isActive && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute -bottom-2 left-1/2 w-1 h-1 bg-teal-600 rounded-full -translate-x-1/2"
              />
            )}
          </div>
          <span className="text-[10px] font-medium">{label}</span>
        </>
      )}
    </NavLink>
  );
}
