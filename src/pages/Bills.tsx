import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, Microscope, Pill, Stethoscope, FileText, ChevronRight, X, Download, Receipt, AlertCircle, Clock } from "lucide-react";

export default function Bills() {
  const [bills, setBills] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [isFullScreenReceipt, setIsFullScreenReceipt] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(data => setBills(data.bills));
  }, []);

  const categories = ["All", "Lab", "Medicine", "Consultation"];
  
  const filteredBills = filter === "All" 
    ? bills 
    : bills.filter(b => b.category === filter);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 pt-12 space-y-6 pb-24"
    >
      <header>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Bill Wallet</h1>
        <p className="text-sm text-slate-500">Manage and track your medical expenses.</p>
      </header>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search bills..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
        <button className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
          <Filter size={18} />
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === cat 
                ? 'bg-teal-700 text-white shadow-md shadow-teal-900/10' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {filteredBills.map((bill: any, i: number) => (
          <motion.div 
            key={bill.id}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-10px" }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
            onClick={() => setSelectedBill(bill)}
            className={`p-4 rounded-2xl flex items-center justify-between shadow-sm border cursor-pointer hover:border-teal-100 active:scale-[0.98] transition-all relative overflow-hidden ${
              bill.status === 'Action Required' ? 'bg-rose-50/30 border-rose-100' :
              bill.status === 'Pending' ? 'bg-amber-50/30 border-amber-100' :
              'bg-white border-slate-100'
            }`}
          >
            {/* Subtle left border highlight */}
            {(bill.status === 'Action Required' || bill.status === 'Pending') && (
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                bill.status === 'Action Required' ? 'bg-rose-400' : 'bg-amber-400'
              }`} />
            )}
            
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                bill.category === 'Lab' ? 'bg-blue-50 text-blue-600' :
                bill.category === 'Medicine' ? 'bg-purple-50 text-purple-600' :
                'bg-emerald-50 text-emerald-600'
              }`}>
                {bill.category === 'Lab' ? <Microscope size={24} /> :
                 bill.category === 'Medicine' ? <Pill size={24} /> :
                 <Stethoscope size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-medium text-slate-800 text-sm">{bill.title}</h4>
                  {bill.status === 'Action Required' && <AlertCircle size={14} className="text-rose-500" />}
                  {bill.status === 'Pending' && <Clock size={14} className="text-amber-500" />}
                </div>
                <p className="text-xs text-slate-500">{new Date(bill.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </motion.div>
        ))}
        {filteredBills.length === 0 && (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No bills found</p>
            <p className="text-sm text-slate-400 mt-1">Try changing the category filter.</p>
          </div>
        )}
      </div>

      {/* Bill Details Modal / Bottom Sheet */}
      <AnimatePresence>
        {selectedBill && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelectedBill(null)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 pb-safe shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center">
                    <Receipt size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Bill Details</h3>
                </div>
                <button 
                  onClick={() => setSelectedBill(null)} 
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="text-center pb-6 border-b border-slate-100 border-dashed">
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">₹{selectedBill.amount.toLocaleString('en-IN')}</h2>
                  <p className="text-slate-500 text-sm">{selectedBill.title}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-slate-50 border border-slate-100">
                    <span className={`w-2 h-2 rounded-full ${
                      selectedBill.status === 'Approved' ? 'bg-emerald-500' :
                      selectedBill.status === 'Pending' ? 'bg-amber-500' :
                      'bg-rose-500'
                    }`}></span>
                    <span className={
                      selectedBill.status === 'Approved' ? 'text-emerald-700' :
                      selectedBill.status === 'Pending' ? 'text-amber-700' :
                      'text-rose-700'
                    }>{selectedBill.status}</span>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-4">
                  <DetailRow label="Date" value={new Date(selectedBill.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                  <DetailRow label="Bill ID" value={`#${selectedBill.id.toUpperCase()}-2026`} />
                  <DetailRow label="Category" value={selectedBill.category} />
                  <DetailRow label="Hospital/Clinic" value="Apollo Hospitals" />
                  
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <DetailRow label="Subtotal" value={`₹${(selectedBill.amount * 0.82).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                    <DetailRow label="GST (18%)" value={`₹${(selectedBill.amount * 0.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800 border-dashed">
                      <span className="font-semibold text-slate-800">Total</span>
                      <span className="font-bold text-slate-800">₹{selectedBill.amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Receipt Image */}
                {selectedBill.receiptUrl && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Attached Receipt</h4>
                    <div 
                      className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative aspect-[3/4] max-h-64 mx-auto cursor-pointer group"
                      onClick={() => setIsFullScreenReceipt(true)}
                    >
                      {selectedBill.receiptUrl.toLowerCase().includes('.pdf') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                          <FileText size={48} className="text-rose-400" />
                          <span className="text-sm font-medium">PDF Document</span>
                          <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">Tap to view</span>
                        </div>
                      ) : (
                        <>
                          <img 
                            src={selectedBill.receiptUrl} 
                            alt="Bill Receipt" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">Tap to expand</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button className="flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors">
                    <Download size={18} /> Download
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-900/10 transition-colors">
                    Track Claim
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Receipt Modal */}
      <AnimatePresence>
        {isFullScreenReceipt && selectedBill?.receiptUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex flex-col"
          >
            <div className="flex justify-between items-center p-4 text-white">
              <h3 className="font-medium truncate pr-4">{selectedBill.title} Receipt</h3>
              <button 
                onClick={() => setIsFullScreenReceipt(false)}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden relative p-4 flex items-center justify-center">
              {selectedBill.receiptUrl.toLowerCase().includes('.pdf') ? (
                <iframe 
                  src={selectedBill.receiptUrl} 
                  className="w-full h-full rounded-xl bg-white"
                  title="PDF Receipt"
                />
              ) : (
                <img 
                  src={selectedBill.receiptUrl} 
                  alt="Full screen receipt" 
                  className="max-w-full max-h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
