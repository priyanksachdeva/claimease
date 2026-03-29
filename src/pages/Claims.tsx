import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Clock, CheckCircle2, FileText, ChevronRight } from "lucide-react";

export default function Claims() {
  const [claims, setClaims] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(data => setClaims(data.claims));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 pt-12 pb-24 space-y-6"
    >
      <header>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Claims Tracker</h1>
        <p className="text-sm text-slate-500">Monitor your insurance claim status in real-time.</p>
      </header>

      <div className="space-y-5">
        {claims.map((claim: any, i: number) => (
          <motion.div 
            key={claim.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 relative overflow-hidden"
          >
            {/* Top Section */}
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                  <ShieldCheck size={24} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base leading-tight mb-1">{claim.title}</h3>
                  <p className="text-xs font-medium text-slate-400">ID: #{claim.id.toUpperCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800 text-lg tracking-tight">₹{claim.totalAmount.toLocaleString('en-IN')}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-full mt-1">
                  <Clock size={10} strokeWidth={3} /> {claim.status}
                </span>
              </div>
            </div>

            {/* Vertical Timeline */}
            <div className="bg-slate-50 rounded-2xl p-5 relative z-10">
              <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                
                <TimelineItem 
                  title="Bill Submitted" 
                  date="Mar 24, 2026" 
                  status="completed" 
                  icon={<FileText size={12} strokeWidth={3} />} 
                />
                <TimelineItem 
                  title="Hospital Verification" 
                  date="Mar 25, 2026" 
                  status="completed" 
                  icon={<CheckCircle2 size={12} strokeWidth={3} />} 
                />
                <TimelineItem 
                  title="Insurance Processing" 
                  date="In Progress" 
                  status="current" 
                  icon={<Clock size={12} strokeWidth={3} />} 
                />
                <TimelineItem 
                  title="Final Approval" 
                  date="Pending" 
                  status="pending" 
                  icon={<ShieldCheck size={12} strokeWidth={3} />} 
                  isLast
                />
              </div>
            </div>
            
            <button className="w-full mt-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
              View Claim Details <ChevronRight size={16} />
            </button>
          </motion.div>
        ))}

        {/* Mock Completed Claim */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 opacity-75"
        >
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-tight mb-1">February Lab Tests</h3>
                <p className="text-xs font-medium text-slate-400">ID: #C02938</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800 text-lg tracking-tight">₹12,000</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full mt-1">
                <CheckCircle2 size={10} strokeWidth={3} /> Approved
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

function TimelineItem({ title, date, status, icon, isLast = false }: { title: string, date: string, status: 'completed' | 'current' | 'pending', icon: React.ReactNode, isLast?: boolean }) {
  return (
    <div className={`relative flex items-start group ${isLast ? '' : 'pb-6'}`}>
      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white z-10 shrink-0 mt-0.5 ${
        status === 'completed' ? 'border-teal-500 text-teal-500' :
        status === 'current' ? 'border-amber-500 text-amber-500 ring-4 ring-amber-100' :
        'border-slate-200 text-slate-300'
      }`}>
        {icon}
      </div>
      <div className="pl-4 flex-1">
        <h4 className={`text-sm font-bold ${status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>{title}</h4>
        <span className={`text-xs font-medium ${status === 'pending' ? 'text-slate-300' : status === 'current' ? 'text-amber-600' : 'text-slate-500'}`}>{date}</span>
      </div>
    </div>
  );
}
