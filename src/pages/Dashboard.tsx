import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Bell, ShieldAlert, Activity, Pill, FileText, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  const coveragePercent = Math.round((data.user.usedCoverage / data.user.totalCoverage) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 pt-12 space-y-8 pb-24"
    >
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-slate-500">Good morning,</p>
          <h1 className="text-2xl font-bold text-slate-800">{data.user.name}</h1>
        </div>
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 relative">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      {/* Insurance Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-6 text-white shadow-xl shadow-teal-900/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-teal-100 text-sm font-medium mb-1">Health Coverage</p>
            <p className="font-mono text-xs text-teal-200 bg-teal-900/30 px-2 py-1 rounded-md inline-block">
              {data.user.policyNumber}
            </p>
          </div>
          <ShieldAlert className="text-teal-200 opacity-80" size={28} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-light tracking-tight">
              <span className="text-teal-200 text-xl">₹</span>
              {(data.user.totalCoverage - data.user.usedCoverage).toLocaleString('en-IN')}
            </h2>
            <p className="text-teal-100 text-sm">Remaining</p>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-teal-900/40 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${coveragePercent}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-teal-300 rounded-full"
            />
          </div>
          <p className="text-xs text-teal-200 text-right">{coveragePercent}% used</p>
        </div>
      </motion.div>

      {/* Active Claim Status */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Active Claim</h3>
        {data.claims.map((claim: any) => (
          <div key={claim.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">{claim.title}</h4>
                  <p className="text-xs text-slate-500">ID: #{claim.id.toUpperCase()}</p>
                </div>
              </div>
              <span className="text-amber-600 text-sm font-medium bg-amber-50 px-3 py-1 rounded-full">
                {claim.status}
              </span>
            </div>
            
            <div className="relative pt-2">
              <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-2 px-1">
                <span>Submitted</span>
                <span>Hospital</span>
                <span>Insurance</span>
                <span>Approved</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${claim.progress}%` }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Bills */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Recent Bills</h3>
          <button className="text-teal-600 text-sm font-medium flex items-center">
            View All <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="space-y-3">
          {data.bills.slice(0, 3).map((bill: any, i: number) => (
            <motion.div 
              key={bill.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-50"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  bill.category === 'Lab' ? 'bg-blue-50 text-blue-600' :
                  bill.category === 'Medicine' ? 'bg-purple-50 text-purple-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {bill.category === 'Lab' ? <Activity size={24} /> :
                   bill.category === 'Medicine' ? <Pill size={24} /> :
                   <FileText size={24} />}
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 text-sm">{bill.title}</h4>
                  <p className="text-xs text-slate-500">{new Date(bill.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-800">₹{bill.amount.toLocaleString('en-IN')}</p>
                <p className={`text-[10px] font-medium uppercase tracking-wider ${
                  bill.status === 'Approved' ? 'text-emerald-500' :
                  bill.status === 'Pending' ? 'text-amber-500' :
                  'text-rose-500'
                }`}>
                  {bill.status}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
